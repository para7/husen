import { Container, Stack } from "@mantine/core";
import { parseWithValibot } from "conform-to-valibot";
import { drizzle } from "drizzle-orm/d1";
import { useNavigate, useParams } from "react-router";
import { Outlet, useActionData } from "react-router";
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
import { GetUserPosts, GetUserTagsWithPost } from "./GetPost";

const maxLength = 500;

// 投稿用のスキーマを定義
const postSchema = v.object({
	content: v.pipe(v.string(), v.maxLength(maxLength)),
	tags: v.optional(v.string()),
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
	const { content, tags } = submission.value;
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
	const state = await AuthState(context.hono.context);

	if (state.state !== "authed") {
		return { posts: [], user: null };
	}

	// URLから検索タグを取得
	const url = new URL(request.url);
	const searchParam = url.searchParams.get("search") || "";
	const searchTags = SplitTags(searchParam);

	let postsWithTags = [];

	if (searchTags.length === 0) {
		// 検索タグがない場合は全ての投稿とそのタグを取得
		postsWithTags = await GetUserPosts(context, state.user.uuid);
	} else {
		// 検索タグがある場合、タグに一致する投稿を取得
		postsWithTags = await GetUserTagsWithPost(
			context,
			state.user.uuid,
			searchTags,
		);

		// 投稿が見つからない場合
		if (postsWithTags.length === 0) {
			return { posts: [], user: state.user, searchTags };
		}
	}

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
