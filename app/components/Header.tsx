import { Avatar, Group, Paper, Title } from "@mantine/core";
import SignOutButton from "~/components/SignOutButton";
import ColorModeSwitch from "~/components/ColorModeSwitch";

type HeaderProps = {
	user: {
		user_name: string;
	};
};

export default function Header({ user }: HeaderProps) {
	return (
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
			<Group justify="space-between">
				<Group>
					<Avatar radius="xl" size={32} color="blue">
						{user.user_name[0]}
					</Avatar>
					<Title order={4}>ホーム</Title>
				</Group>
				<Group>
					<ColorModeSwitch />
					<SignOutButton />
				</Group>
			</Group>
		</Paper>
	);
}
