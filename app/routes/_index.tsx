import { Button, Container, Stack, Title } from "@mantine/core";
import { Text } from "@mantine/core";
import type { Route } from "./+types/_index";
import { drizzle } from "drizzle-orm/d1";
import { redirect } from "react-router";
import { TableUsers } from "server/db/schema";
import { eq } from "drizzle-orm";

export const loader = async ({ context }: Route.LoaderArgs) => {
	const db = drizzle(context.cloudflare.env.DB);
	const email = context.hono.context.get("authUser")?.session.user?.email;

	if (!email) {
		return {};
	}

	const result = await db
		.select()
		.from(TableUsers)
		.where(eq(TableUsers.email, email));

	// ユーザーデータがあったらホームにリダイレクト
	if (result.length > 0) {
		return redirect("/home");
	}

	return { result };
};
// export const loader = async (args: Route.LoaderArgs) => {
// 	// const extra = args.context.extra;
// 	// const cloudflare = args.context.cloudflare;
// 	// const myVarInVariables = args.context.hono.context.get("MY_VAR_IN_VARIABLES");
// 	// const isWaitUntilDefined = !!cloudflare.ctx.waitUntil;

// 	// const db = drizzle(cloudflare.env.DB);
// 	// const result = await db.select().from(usersTable);

// 	// console.dir(args.context);
// 	// console.dir(args.context.hono);
// 	// console.dir(args.context.hono.context.get("authUser"));

// 	return {};
// 	// return { cloudflare, extra, myVarInVariables, isWaitUntilDefined, result };
// };

export default function Index({ loaderData }: Route.ComponentProps) {
	// const { cloudflare, extra, myVarInVariables, isWaitUntilDefined, result } =
	// loaderData;
	return (
		<Container
			size="xs"
			style={{
				display: "flex",
				minHeight: "100vh",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Stack>
				<Stack align="center" gap="xl">
					<Stack align="center" gap="xs">
						<Title order={1} m={0}>
							Husen
						</Title>
						<Text>付箋</Text>
						<Text>後から張り替え自由のマイクロブログ</Text>
					</Stack>

					<Button component="a" href="/signup" variant="gradient">
						はじめる
					</Button>
				</Stack>

				<Button component="a" href="/about" variant="transparent">
					Husen とは？
				</Button>
			</Stack>
		</Container>
	);
}
