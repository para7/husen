import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { TablePosts, TableTags } from "server/db/schema";
import type { Route } from "../../routes/home/+types/route";

// 投稿の型を定義
type PostType = typeof TablePosts.$inferSelect;

// ページネーションのデフォルト値
export const DEFAULT_PAGE_SIZE = 20;

/**
 * ユーザーの投稿を取得する（タグなし）
 */
export const GetUserPosts = async (
	context: Route.LoaderArgs["context"],
	userId: string,
	page = 1,
	pageSize = DEFAULT_PAGE_SIZE,
) => {
	const db = drizzle(context.cloudflare.env.DB);

	// オフセット計算
	const offset = (page - 1) * pageSize;

	// 投稿の総数を取得
	const countResult = await db
		.select({ count: sql`count(*)` })
		.from(TablePosts)
		.where(eq(TablePosts.user_id, userId));

	const totalCount = countResult[0] ? Number(countResult[0].count) : 0;
	const totalPages = Math.ceil(totalCount / pageSize);

	// ページネーションを適用した投稿とそのタグを取得
	const result = await db
		.select({
			post: TablePosts,
			tag_text: TableTags.tag_text,
		})
		.from(TablePosts)
		.leftJoin(TableTags, eq(TablePosts.uuid, TableTags.post_id))
		.where(eq(TablePosts.user_id, userId))
		.orderBy(desc(TablePosts.order_date))
		.limit(pageSize)
		.offset(offset);

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

	return {
		posts: postsWithTags,
		pagination: {
			currentPage: page,
			totalPages,
			totalCount,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		},
	};
};

/**
 * ユーザーの投稿をタグで検索して取得する
 */
export const GetUserTagsWithPost = async (
	context: Route.LoaderArgs["context"],
	userId: string,
	searchTags: string[],
	page = 1,
	pageSize = DEFAULT_PAGE_SIZE,
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
		return {
			posts: [],
			pagination: {
				currentPage: page,
				totalPages: 0,
				totalCount: 0,
				hasNextPage: false,
				hasPrevPage: false,
			},
		};
	}

	// 一致した投稿の総数を取得
	const postIds = matchingPostIds.map((p) => p.post_id);
	const countResult = await db
		.select({ count: sql`count(*)` })
		.from(TablePosts)
		.where(
			and(eq(TablePosts.user_id, userId), inArray(TablePosts.uuid, postIds)),
		);

	const totalCount = countResult[0] ? Number(countResult[0].count) : 0;
	const totalPages = Math.ceil(totalCount / pageSize);
	const offset = (page - 1) * pageSize;

	// 一致した投稿とそのタグをページネーション適用して取得
	const result = await db
		.select({
			post: TablePosts,
			tag_text: TableTags.tag_text,
		})
		.from(TablePosts)
		.leftJoin(TableTags, eq(TablePosts.uuid, TableTags.post_id))
		.where(
			and(eq(TablePosts.user_id, userId), inArray(TablePosts.uuid, postIds)),
		)
		.orderBy(desc(TablePosts.order_date))
		.limit(pageSize)
		.offset(offset);

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

	return {
		posts: postsWithTags,
		pagination: {
			currentPage: page,
			totalPages,
			totalCount,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		},
	};
};
