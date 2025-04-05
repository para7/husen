import { Button, Container, Stack, Title } from "@mantine/core";
import { Text } from "@mantine/core";
import type { Route } from "./+types/index";
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
			<Text>Home</Text>
		</Container>
	);
}
