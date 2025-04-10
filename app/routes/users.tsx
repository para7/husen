import {
	Container,
	Table,
	Title,
	Text,
	Stack,
	Button,
	Card,
	Group,
	Paper,
} from "@mantine/core";
import { drizzle } from "drizzle-orm/d1";
import { TableUsers } from "server/db/schema";
import { useLoaderData } from "react-router";
import ColorModeSwitch from "~/components/ColorModeSwitch";
import type { Route } from "./+types/users";
import Header from "~/components/Header";
import { GetAuthRemix } from "~/lib/domain/AuthState";

export const loader = async ({ context }: Route.LoaderArgs) => {
	const db = drizzle(context.cloudflare.env.DB);

	const state = await GetAuthRemix(context.hono.context);

	// 全ユーザーデータを取得
	const users = await db
		.select({
			uuid: TableUsers.uuid,
			email: TableUsers.email,
			user_name: TableUsers.user_name,
			user_id: TableUsers.user_id,
			profile: TableUsers.profile,
			created_at: TableUsers.created_at,
		})
		.from(TableUsers)
		.orderBy(TableUsers.created_at);

	return { users, user: state.user };
};

export default function UsersPage() {
	const { users, user } = useLoaderData<typeof loader>();

	return (
		<Container size="md" p={0}>
			<Header user={user} title="ユーザーリスト" />

			<Paper
				shadow="xs"
				p="md"
				withBorder
				style={{
					position: "sticky",
					top: 0,
					zIndex: 100,
				}}
			>
				<Stack>
					<Group justify="center">
						<Button component="a" href="/" variant="light" fullWidth>
							ホームに戻る
						</Button>
					</Group>

					<Stack gap="lg">
						<Stack>
							{users.map((user) => (
								<Card key={user.uuid} shadow="sm" padding="lg">
									<Group>
										<Text>{user.user_name}</Text>
										{/* <Button
										size="xs"
										variant="light"
										component="a"
										href={`/users/${user.uuid}`}
									>
										詳細
									</Button> */}
										<Text size="sm" c="dimmed">
											@{user.user_id}
										</Text>
										<Text size="sm" c="dimmed">
											{new Date(user.created_at).toLocaleDateString("ja-JP")}
										</Text>
									</Group>
									<Text size="sm">
										{user.profile.length > 30
											? `${user.profile.slice(0, 30)}...`
											: user.profile}
									</Text>
								</Card>
							))}
						</Stack>
					</Stack>
				</Stack>
			</Paper>
		</Container>
	);
}
