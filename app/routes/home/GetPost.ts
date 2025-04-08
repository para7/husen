import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { TablePosts, TableTags } from "server/db/schema";
import type { Route } from "./+types/route";

// 投稿の型を定義
type PostType = typeof TablePosts.$inferSelect;

/**
 * ユーザーの投稿を取得する（タグなし）
 */
export const GetUserPosts = async (
	context: Route.LoaderArgs["context"],
	userId: string,
) => {
	const db = drizzle(context.cloudflare.env.DB);

	// 全ての投稿とそのタグを一度に取得
	const result = await db
		.select({
			post: TablePosts,
			tag_text: TableTags.tag_text,
		})
		.from(TablePosts)
		.leftJoin(TableTags, eq(TablePosts.uuid, TableTags.post_id))
		.where(eq(TablePosts.user_id, userId))
		.orderBy(desc(TablePosts.order_date));

	// 結果を投稿ごとにグループ化
	const postMap = new Map<string, { post: PostType; tags: string[] }>();

	for (const row of result) {
		if (!postMap.has(row.post.uuid)) {
			postMap.set(row.post.uuid, {
				post: row.post,
				tags: row.tag_text ? [row.tag_text] : [],
			});
		} else if (row.tag_text) {
			postMap.get(row.post.uuid)?.tags.push(row.tag_text);
		}
	}

	const postsWithTags = Array.from(postMap.values()).map((item) => ({
		...item.post,
		tags: item.tags,
	}));

	return postsWithTags;
};

/**
 * ユーザーの投稿をタグで検索して取得する
 */
export const GetUserTagsWithPost = async (
	context: Route.LoaderArgs["context"],
	userId: string,
	searchTags: string[],
) => {
	const db = drizzle(context.cloudflare.env.DB);

	// まず、各タグを含む投稿IDを取得
	const matchingPostIds = await db
		.select({
			post_id: TableTags.post_id,
		})
		.from(TableTags)
		.where(
			and(
				eq(TableTags.user_id, userId),
				inArray(TableTags.tag_text, searchTags),
			),
		)
		.groupBy(TableTags.post_id)
		.having(() => sql`count(*) >= ${searchTags.length}`);

	if (matchingPostIds.length === 0) {
		return [];
	}

	// 一致した投稿とそのタグを一度に取得
	const result = await db
		.select({
			post: TablePosts,
			tag_text: TableTags.tag_text,
		})
		.from(TablePosts)
		.leftJoin(TableTags, eq(TablePosts.uuid, TableTags.post_id))
		.where(
			and(
				eq(TablePosts.user_id, userId),
				inArray(
					TablePosts.uuid,
					matchingPostIds.map((p) => p.post_id),
				),
			),
		)
		.orderBy(desc(TablePosts.order_date));

	// 結果を投稿ごとにグループ化
	const postMap = new Map<string, { post: PostType; tags: string[] }>();

	for (const row of result) {
		if (!postMap.has(row.post.uuid)) {
			postMap.set(row.post.uuid, {
				post: row.post,
				tags: row.tag_text ? [row.tag_text] : [],
			});
		} else if (row.tag_text) {
			postMap.get(row.post.uuid)?.tags.push(row.tag_text);
		}
	}

	const postsWithTags = Array.from(postMap.values()).map((item) => ({
		...item.post,
		tags: item.tags,
	}));

	return postsWithTags;
};
