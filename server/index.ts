import Google from "@auth/core/providers/google";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
// server/index.ts
import { type Context, Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { usersTable } from "./db/schema";
import { eq, lt, gte, ne } from "drizzle-orm";
import { AuthState } from "~/lib/domain/AuthState";

type HonoContextVars = {
	Bindings: {
		MY_VAR: string;
		DB: D1Database;
	};
	Variables: {
		MY_VAR_IN_VARIABLES: string;
	};
};

const app = new Hono<HonoContextVars>();
export type HonoContext = Context<HonoContextVars, "*">;

app.use(async (c, next) => {
	c.set("MY_VAR_IN_VARIABLES", "My variable set in c.set");
	await next();
	c.header("X-Powered-By", "React Router and Hono");
});

app.use(
	"*",
	initAuthConfig((c) => ({
		secret: c.env.AUTH_SECRET,
		providers: [Google],
	})),
);

app.use("/api/auth/*", authHandler());

// ルートページ以外で認証を必須にする
app.use("*", async (c, next) => {
	if (c.req.path === "/") {
		await next();
		return;
	}
	await verifyAuth()(c, next);
});

app.use("*", async (c, next) => {
	if (c.req.path === "/") {
		await next();
		return;
	}

	const state = await AuthState(c);
	console.log({ state });

	// const authUser = c.get("authUser");
	// console.log("authUser", authUser);

	// const email = authUser.;

	// // email が データベースにあるか確認する。
	// // データベースになければ /signup にリダイレクトする。

	// const db = drizzle(c.env.DB);
	// const result = await db
	// 	.select()
	// 	.from(usersTable)
	// 	.where(eq(usersTable.email, email));

	// console.log("result", result);

	// const result = await db
	// 	.select()
	// 	.from(usersTable)
	// 	.where(sql`${usersTable.email} = ${email}`);

	// if (result.length === 0) {
	// 	return c.redirect("/signup");
	// }

	await next();
});

app.onError((err, c) => {
	console.error("", err);
	if (err instanceof HTTPException && err.status === 401) {
		return c.redirect("/api/auth/signin");
	}

	return c.text("Other Error", 500);
});

app.get("/api/get-auth", async (c) => {
	const auth = c.get("authUser");

	return c.text(`Hello, ${auth.session.user?.name}`);
});

app.get("/api/test", async (c) => {
	const db = drizzle(c.env.DB);
	// const writeResult = await db.insert(usersTable).values({
	// 	user_name: "John Doe",
	// 	email: "john@example.com",
	// 	user_id: crypto.randomUUID(),
	// 	uuid: crypto.randomUUID(),
	// });
	// const result = await db.select().from(usersTable);

	return c.json({
		message: "Hello",
		var: c.env.MY_VAR,
	});
});

export default app;
