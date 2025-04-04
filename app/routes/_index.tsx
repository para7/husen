import { Button, Container, Stack, Title } from "@mantine/core";
import SignOutButton from "app/lib/SignOutButton";
import { drizzle } from "drizzle-orm/d1";
import { usersTable } from "server/db/schema";
import type { Route } from "./+types/_index";
export const loader = async (args: Route.LoaderArgs) => {
	// const extra = args.context.extra;
	// const cloudflare = args.context.cloudflare;
	// const myVarInVariables = args.context.hono.context.get("MY_VAR_IN_VARIABLES");
	// const isWaitUntilDefined = !!cloudflare.ctx.waitUntil;

	// const db = drizzle(cloudflare.env.DB);
	// const result = await db.select().from(usersTable);

	// console.dir(args.context);
	// console.dir(args.context.hono);
	// console.dir(args.context.hono.context.get("authUser"));

	return {};
	// return { cloudflare, extra, myVarInVariables, isWaitUntilDefined, result };
};

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
			<Stack align="center" gap="xl">
				<Stack align="center" gap="xs">
					<Title order={1} m={0}>
						Husen
					</Title>
					<div>付箋</div>
				</Stack>

				<Button component="a" href="/signup" variant="filled" color="blue">
					はじめる
				</Button>
			</Stack>
		</Container>
	);
}
