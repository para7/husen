import Google from "@auth/core/providers/google";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { drizzle } from "drizzle-orm/d1";
import { type Context, Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { url } from "valibot";
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
		// callbacks: {
		// 	// signIn: async () => {
		// 	// 	console.log("signIn function called");
		// 	// 	return "http://localhost:3000/signup";
		// 	// },
		// },
	})),
);

app.use("/api/auth/*", authHandler());

const unauthedRoutes = ["/", "/about"];

// すべてのルートで認証情報を取得するが、unauthedRoutesでは認証を必須としない
app.use("*", async (c, next) => {
	try {
		// 認証を試みる
		await verifyAuth()(c, next);
	} catch (e) {
		console.warn("catch!");
		// unauthedRoutesの場合は認証エラーを無視して次へ進む
		if (unauthedRoutes.includes(c.req.path)) {
			await next();
		} else {
			// 認証が必要なルートではエラーを再スロー
			throw e;
		}
	}
});

// 認証状態を見て振り分ける
app.use("*", async (c, next) => {
	const p = c.req.path;

	try {
		const state = await AuthState(c);
		console.log({ state, time: new Date().toISOString() });

		if (state.state === "registering" && p !== "/signup") {
			return c.redirect("/signup");
		}

		if (state.state === "unauthed") {
			return c.redirect("/api/auth/signin");
		}

		return await next();
	} catch (e) {
		await next();
	}
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

	return c.json({
		message: "Hello",
		var: c.env.MY_VAR,
	});
});

export default app;
