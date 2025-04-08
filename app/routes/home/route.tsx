import { Container, Stack } from "@mantine/core";
import { parseWithValibot } from "conform-to-valibot";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { useNavigate, useParams } from "react-router";
import {
	Outlet,
	useActionData,
	useSearchParams,
	useSubmit,
} from "react-router";
import { TablePosts, TableTags } from "server/db/schema";
import * as v from "valibot";
import Header from "~/components/Header";
import Post from "~/components/Post";
import PostForm from "~/components/PostForm";
import Profile from "~/components/Profile";
import SearchForm from "~/components/SearchForm";
import { AuthState, GetAuthRemix } from "~/lib/domain/AuthState";
import { SplitTags } from "~/lib/validate/SplitTags";
import type { Route } from "./+types/route";

const maxLength = 500;

// 投稿用のスキーマを定義
const postSchema = v.object({
	content: v.pipe(v.string(), v.maxLength(maxLength)),
	tags: v.optional(v.string()),
	keepTags: v.optional(v.boolean()),
	_action: v.literal("post"),
});

export const action = async ({ request, context }: Route.ActionArgs) => {
	const formData = await request.formData();
	const submission = await parseWithValibot(formData, {
		schema: postSchema,
	});

	// バリデーションエラーがある場合はクライアントに返す
	if (submission.status !== "success") {
		return submission.reply();
	}

	// バリデーション成功時の処理
	const { content, tags, keepTags } = submission.value;
	const state = await GetAuthRemix(context.hono.context);
	const db = drizzle(context.cloudflare.env.DB);
	const currentDate = new Date().toISOString();

	// 投稿を作成
	const result = await db
		.insert(TablePosts)
		.values({
			user_id: state.user.uuid,
			content: content,
			order_date: currentDate,
		})
		.returning();

	const newPost = result[0];

	// タグが入力されている場合は保存
	if (newPost && tags && tags.trim().length > 0) {
		// SplitTags関数を使用してタグ配列を取得
		const tagArray = SplitTags(tags);

		// 各タグをデータベースに保存
		if (tagArray.length > 0) {
			await Promise.all(
				tagArray.map((tagText) =>
					db.insert(TableTags).values({
						post_id: newPost.uuid,
						user_id: state.user.uuid,
						tag_text: tagText,
						order_date: currentDate,
					}),
				),
			);
		}
	}

	return submission.reply({
		resetForm: true,
	});
};

export const loader = async ({ request, context }: Route.LoaderArgs) => {
	const db = drizzle(context.cloudflare.env.DB);
	const state = await AuthState(context.hono.context);

	if (state.state !== "authed") {
		return { posts: [], user: null };
	}

	// URLから検索タグを取得
	const url = new URL(request.url);
	const searchParam = url.searchParams.get("search") || "";
	const searchTags = SplitTags(searchParam);

	// 投稿の型を定義
	type PostType = typeof TablePosts.$inferSelect;
	let posts: PostType[] = [];

	if (searchTags.length === 0) {
		// 検索タグがない場合は全ての投稿を取得
		posts = await db
			.select()
			.from(TablePosts)
			.where(eq(TablePosts.user_id, state.user.uuid))
			.orderBy(desc(TablePosts.order_date));
	} else {
		// 検索タグがある場合は、それらのタグを全て含む投稿のIDを取得
		// 結果の型を定義
		type RawQueryResult = { post_id: string; tag_count: unknown };
		interface TagCountResult {
			post_id: string;
			tag_count: number;
		}

		// SQLクエリを実行して結果を取得（明示的に型付け）
		const tagCountsQuery: RawQueryResult[] = await db
			.select({
				post_id: TableTags.post_id,
				tag_count: sql<unknown>`count(*)`,
			})
			.from(TableTags)
			.where(
				and(
					eq(TableTags.user_id, state.user.uuid),
					inArray(TableTags.tag_text, searchTags),
				),
			)
			.groupBy(TableTags.post_id);

		// クエリ結果を変換（数値型に明示的に変換）
		const tagCounts: TagCountResult[] = tagCountsQuery.map((item) => ({
			post_id: item.post_id,
			tag_count: Number(item.tag_count),
		}));

		// 全てのタグを含む投稿のIDを抽出（タグの数とカウントが一致するもの）
		const matchingPostIds = tagCounts
			.filter((item) => item.tag_count === searchTags.length)
			.map((item) => item.post_id);

		if (matchingPostIds.length === 0) {
			// 一致する投稿がない場合は空の配列を返す
			return { posts: [], user: state.user, searchTags };
		}

		// 抽出した投稿IDを使って投稿を取得
		posts = await db
			.select()
			.from(TablePosts)
			.where(
				and(
					eq(TablePosts.user_id, state.user.uuid),
					inArray(TablePosts.uuid, matchingPostIds),
				),
			)
			.orderBy(desc(TablePosts.order_date));
	}

	// 各投稿のタグを取得
	const postsWithTags = await Promise.all(
		posts.map(async (post) => {
			const tags = await db
				.select({ tag_text: TableTags.tag_text })
				.from(TableTags)
				.where(eq(TableTags.post_id, post.uuid))
				.orderBy(TableTags.order_date);

			return {
				...post,
				tags: tags.map((t) => t.tag_text),
			};
		}),
	);

	return { posts: postsWithTags, user: state.user, searchTags };
};

export default function Index({ loaderData }: Route.ComponentProps) {
	const { postId } = useParams();
	const navigate = useNavigate();
	const lastResult = useActionData<typeof action>();

	// 削除ボタンクリック時に対応する削除ページへ遷移
	const handleDeleteClick = (postId: string) => {
		navigate(`/home/${postId}/delete`);
	};

	const { posts, user, searchTags = [] } = loaderData;

	if (!user) {
		return null;
	}

	return (
		<Container size="md" p={0}>
			{/* ヘッダー部分 */}
			<Header user={user} />

			{/* Outletを追加してネストされたルートをレンダリング */}
			<Outlet />

			{/* メインコンテンツ */}
			<div>
				{/* プロフィールセクション */}
				<Profile user={user} />

				{/* 投稿フォーム */}
				<PostForm lastResult={lastResult} maxLength={maxLength} />

				{/* 検索フォーム */}
				<SearchForm searchTags={searchTags} />

				{/* 投稿一覧 */}
				<Stack gap={0}>
					{posts.map((post, index) => (
						<Post
							key={post.uuid}
							post={post}
							tags={post.tags}
							user={user}
							index={index}
							totalPosts={posts.length}
							onDeleteClick={handleDeleteClick}
						/>
					))}
				</Stack>
			</div>
		</Container>
	);
}
