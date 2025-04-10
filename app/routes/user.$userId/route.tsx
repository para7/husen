import { Container, Group, Pagination, Stack, Text } from "@mantine/core";
import { parseWithValibot } from "conform-to-valibot";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Suspense, use } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Outlet, useActionData } from "react-router";
import { TablePosts, TableTags, TableUsers } from "server/db/schema";
import * as schemas from "server/db/schema";
import * as v from "valibot";
import Header from "~/components/Header";
import Post from "~/components/Post";
import PostForm from "~/components/PostForm";
import Profile from "~/components/Profile";
import SearchForm from "~/components/SearchForm";
import { AuthState, GetAuthRemix } from "~/lib/domain/AuthState";
import {
	DEFAULT_PAGE_SIZE,
	GetUserPosts,
	GetUserTagsWithPost,
} from "~/lib/driver/GetPost";
import { SplitTags } from "~/lib/validate/SplitTags";
import type { Route } from "./+types/route";

const maxLength = 500;

// 投稿の型を定義
type PostType = typeof TablePosts.$inferSelect & { tags: string[] };

// ページネーション型の定義
type PaginationType = {
	currentPage: number;
	totalPages: number;
	totalCount: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
};

// 結果型の定義
type PostResultType = {
	posts: PostType[];
	pagination: PaginationType;
};

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
		return { posts: [], user: null, pagination: null };
	}

	// URLから検索タグとページ番号を取得
	const url = new URL(request.url);
	const searchParam = url.searchParams.get("search") || "";
	const searchTags = SplitTags(searchParam);
	const pageParam = url.searchParams.get("page");
	const page = pageParam ? Number.parseInt(pageParam, 10) : 1;

	const db = drizzle(context.cloudflare.env.DB, { schema: schemas });
	const user = await db
		.select()
		.from(TableUsers)
		.where(eq(TableUsers.uuid, state.user.uuid));

	if (searchTags.length === 0) {
		// 検索タグがない場合は全ての投稿とそのタグを取得
		return {
			posts: GetUserPosts(context, state.user.uuid, page, DEFAULT_PAGE_SIZE),
			user: user[0],
			searchTags,
		};
	}

	return {
		posts: GetUserTagsWithPost(
			context,
			state.user.uuid,
			searchTags,
			page,
			DEFAULT_PAGE_SIZE,
		),
		user: user[0],
		searchTags,
	};
};

const Timeline: React.FC<{
	posts: Promise<PostResultType>;
	user: typeof TableUsers.$inferSelect;
	searchTags: string[];
	// pagination: PaginationType;
}> = ({ posts: _posts, user, searchTags }) => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	// 削除ボタンクリック時に対応する削除ページへ遷移
	const handleDeleteClick = (postId: string) => {
		navigate(`/home/${postId}/delete`);
	};

	// ページを変更する関数
	const handlePageChange = (newPage: number) => {
		// 現在のクエリパラメータを保持しながらページを更新
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set("page", newPage.toString());
		setSearchParams(newSearchParams);
	};

	const result = use(_posts);
	const { posts, pagination } = result;

	return (
		<Stack gap={0} mb="xl">
			{posts.map((post, index) => (
				<Post
					isEditable={false}
					key={post.uuid}
					post={post}
					tags={post.tags}
					user={user}
					index={index}
					totalPosts={posts.length}
					onDeleteClick={handleDeleteClick}
				/>
			))}

			{/* ページネーションコンポーネント - 常に表示 */}
			<Group justify="center" mt="md">
				<Pagination
					total={pagination?.totalPages || 1}
					value={pagination?.currentPage || 1}
					onChange={handlePageChange}
					withEdges
				/>
			</Group>
		</Stack>
	);
};

export default function Index({ loaderData }: Route.ComponentProps) {
	const navigate = useNavigate();
	const lastResult = useActionData<typeof action>();
	const [searchParams, setSearchParams] = useSearchParams();

	// 削除ボタンクリック時に対応する削除ページへ遷移
	const handleDeleteClick = (postId: string) => {
		navigate(`/home/${postId}/delete`);
	};

	// ページを変更する関数
	const handlePageChange = (newPage: number) => {
		// 現在のクエリパラメータを保持しながらページを更新
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set("page", newPage.toString());
		setSearchParams(newSearchParams);
	};

	const { posts, user, searchTags = [] } = loaderData;

	if (!user) {
		return null;
	}

	return (
		<Container size="md" p={0}>
			{/* ヘッダー部分 */}
			<Header user={user} title="ホーム" />

			{/* メインコンテンツ */}
			<div>
				{/* プロフィールセクション */}
				<Profile user={user} isEditable={false} />

				{/* 検索フォーム */}
				<SearchForm searchTags={searchTags} />

				<Suspense>
					{/* 投稿一覧 */}
					<Timeline
						posts={posts}
						user={user}
						searchTags={searchTags}
						// pagination={pagination}
					/>
				</Suspense>
			</div>
		</Container>
	);
}
