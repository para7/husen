import { Avatar, Button, Group, Paper, Text, Title } from "@mantine/core";

type ProfileProps = {
	user: {
		uuid: string;
		user_id: string;
		user_name: string;
	};
};

export default function Profile({ user }: ProfileProps) {
	return (
		<Paper withBorder mb="md">
			<div
				style={{
					height: "120px",
					backgroundColor: "#1DA1F2",
					backgroundImage: "linear-gradient(120deg, #1DA1F2, #0D8DD6)",
					borderRadius: "4px 4px 0 0",
				}}
			/>
			<div style={{ padding: "0 16px" }}>
				<Group justify="space-between" align="flex-end" mt="-40px" mb="md">
					<Avatar
						size={80}
						radius={80}
						color="blue"
						style={{ border: "4px solid white" }}
					>
						{user.user_name[0]}
					</Avatar>
					<Button variant="outline" radius="xl" size="sm" disabled>
						編集
					</Button>
				</Group>

				<Title order={4}>{user.user_name}</Title>
				<Text c="dimmed" size="sm" mb="xs">
					@{user.user_id}
				</Text>

				<Text size="sm" mb="md">
					動作試験中
				</Text>
			</div>
		</Paper>
	);
}
