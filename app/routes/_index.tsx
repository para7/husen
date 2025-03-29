import { drizzle } from "drizzle-orm/d1";
import type { Route } from "./+types/_index";
import { usersTable } from "server/db/schema";

export const loader = async (args: Route.LoaderArgs) => {
	const extra = args.context.extra;
	const cloudflare = args.context.cloudflare;
	const myVarInVariables = args.context.hono.context.get("MY_VAR_IN_VARIABLES");
	const isWaitUntilDefined = !!cloudflare.ctx.waitUntil;

	const db = drizzle(cloudflare.env.DB);
	const result = await db.select().from(usersTable);

	return { cloudflare, extra, myVarInVariables, isWaitUntilDefined, result };
};

export default function Index({ loaderData }: Route.ComponentProps) {
	const { cloudflare, extra, myVarInVariables, isWaitUntilDefined, result } =
		loaderData;
	return (
		<div>
			<h1>React Router and Hono</h1>
			<h2>Var is {cloudflare.env.MY_VAR}</h2>
			<h3>
				{cloudflare.cf ? "cf," : ""}
				{cloudflare.ctx ? "ctx," : ""}
				{cloudflare.caches ? "caches are available" : ""}
			</h3>
			<h4>Extra is {extra}</h4>
			<h5>Var in Variables is {myVarInVariables}</h5>
			<h6>waitUntil is {isWaitUntilDefined ? "defined" : "not defined"}</h6>
			<pre>{JSON.stringify(result, null, 2)}</pre>
		</div>
	);
}
