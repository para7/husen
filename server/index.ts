import Google from "@auth/core/providers/google";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { drizzle } from "drizzle-orm/d1";
// server/index.ts
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { usersTable } from "./db/schema";

const app = new Hono<{
	Bindings: {
		MY_VAR: string;
		DB: D1Database;
	};
	Variables: {
		MY_VAR_IN_VARIABLES: string;
	};
}>();

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
// app.use("*", verifyAuth());

app.use("*", async (c, next) => {
	const authUser = c.get("authUser");

	console.log("authUser", authUser);

	await next();
});

app.onError((err, c) => {
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

	const writeResult = await db.insert(usersTable).values({
		name: "John Doe",
		age: Math.floor(Math.random() * 100),
	});
	const result = await db.select().from(usersTable);

	return c.json({
		message: "Hello",
		var: c.env.MY_VAR,
		users: result,
	});
});

export default app;
