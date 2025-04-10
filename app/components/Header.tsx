import { Avatar, Group, Paper, Title } from "@mantine/core";
import ColorModeSwitch from "~/components/ColorModeSwitch";
import SignOutButton from "~/components/SignOutButton";

type HeaderProps = {
	user: {
		user_name: string;
	};
	title: string;
};

export default function Header({ user, title }: HeaderProps) {
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
					<Title order={4}>{title}</Title>
				</Group>
				<Group>
					<ColorModeSwitch />
					<SignOutButton />
				</Group>
			</Group>
		</Paper>
	);
}
