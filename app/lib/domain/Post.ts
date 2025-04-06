import { drizzle } from "drizzle-orm/d1";
import { HonoContext } from "server";
import { TablePosts } from "server/db/schema";

type Post = {
	content: string;
	tags: string[];
};

export const CreatePost = async (d1: D1Database, post: Post) => {
	const db = drizzle(d1);

	await db.insert(TablePosts).values(post);
};
