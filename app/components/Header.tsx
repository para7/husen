import {
	ActionIcon,
	Avatar,
	Drawer,
	Group,
	NavLink,
	Paper,
	Stack,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	IconHome,
	IconLogout,
	IconMenu2,
	IconMoonStars,
	IconSun,
	IconUsers,
} from "@tabler/icons-react";
import { Link } from "react-router";
import ColorModeSwitch from "~/components/ColorModeSwitch";
import SignOutButton from "~/components/SignOutButton";

type HeaderProps = {
	user: {
		user_name: string;
	};
	title: string;
};

export default function Header({ user, title }: HeaderProps) {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<>
			<Drawer opened={opened} onClose={close} title="Husen ~付箋~" size="xs">
				<Stack h="100%" justify="space-between">
					<div>
						<NavLink
							component={Link}
							to="/home"
							label="ホーム"
							leftSection={<IconHome size="1rem" stroke={1.5} />}
							onClick={close}
						/>
						<NavLink
							component={Link}
							to="/users"
							label="ユーザー 一覧(仮)"
							leftSection={<IconUsers size="1rem" stroke={1.5} />}
							onClick={close}
						/>
						<NavLink
							component={"a"}
							href="/api/auth/signout"
							label="ログアウト"
							leftSection={<IconLogout size="1rem" stroke={1.5} />}
							onClick={close}
						/>
						{/* <a href="/api/auth/signout">
							<IconLogout /> サインアウト
						</a> */}
						{/* <SignOutButton variant="subtle" text="ログアウト" /> */}
					</div>
					<div>
						<Group justify="center" p="md">
							<ColorModeSwitch />
						</Group>
					</div>
				</Stack>
			</Drawer>

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
						<ActionIcon
							onClick={open}
							variant="subtle"
							size="lg"
							aria-label="メニューを開く"
						>
							<IconMenu2 size="1.5rem" stroke={1.5} />
						</ActionIcon>
						<Avatar radius="xl" size={32} color="blue">
							{user.user_name[0]}
						</Avatar>
						<Title order={4}>{title}</Title>
					</Group>
				</Group>
			</Paper>
		</>
	);
}
