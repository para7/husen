import { Button, Container, Stack, Title } from "@mantine/core";
import { Text } from "@mantine/core";
import type { Route } from "./+types/index";
import SignOutButton from "~/lib/SignOutButton";

export default function Index({ loaderData }: Route.ComponentProps) {
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
			<SignOutButton />
		</Container>
	);
}
