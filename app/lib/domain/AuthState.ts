import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { redirect } from "react-router";
import type { HonoContext } from "server";
import { TableUsers } from "server/db/schema";
import {
	type InferInput,
	type InferOutput,
	literal,
	object,
	string,
	union,
} from "valibot";

const UnAuthed = object({
	state: literal("unauthed"),
});

const Registering = object({
	state: literal("registering"),
	oauth: object({
		email: string(),
	}),
});

const Authed = object({
	state: literal("authed"),
	// google 認証情報
	oauth: object({
		email: string(),
	}),
	// ユーザーテーブルの情報
	user: object({
		uuid: string(),
		email: string(),
		user_name: string(),
		user_id: string(),
	}),
});

const AuthStateSchema = union([UnAuthed, Registering, Authed]);

export type AuthStateType = InferInput<typeof AuthStateSchema>;

/**
 * ユーザーの認証状態を判定する
 */
export const AuthState = async (
	context: HonoContext,
): Promise<AuthStateType> => {
	const authUser = context.get("authUser");
	const email = authUser.session.user?.email;

	if (!email) {
		return { state: "unauthed" };
	}

	const db = drizzle(context.env.DB);

	// 登録されたメールアドレスがあるか確認する
	const result = await db
		.select()
		.from(TableUsers)
		.where(eq(TableUsers.email, email));

	const user = result[0];

	if (user === undefined) {
		return {
			state: "registering",
			oauth: { email },
		};
	}

	return {
		state: "authed",
		oauth: { email },
		user: {
			uuid: user.uuid,
			email: user.email,
			user_name: user.user_name,
			user_id: user.user_id,
		},
	};
};

/**
 * ユーザーの認証状態を取得する
 *
 * 未認証だった場合はルートにリダイレクトする(が、hono側が先に判定されるのでありえない)
 */
export const GetAuthRemix = async (
	context: HonoContext,
): Promise<InferOutput<typeof Authed>> => {
	const state = await AuthState(context);

	if (state.state !== "authed") {
		// @ts-expect-error
		return redirect("/");
	}

	return state;
};
