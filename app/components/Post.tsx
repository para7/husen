import { ActionIcon, Avatar, Badge, Group, Paper, Text } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { Link } from "react-router";

type PostProps = {
	post: {
		uuid: string;
		content: string;
		created_at: string;
	};
	tags: string[];
	user: {
		uuid: string;
		user_id: string;
		user_name: string;
	};
	isEditable: boolean;
	index: number;
	totalPosts: number;
	onDeleteClick: (postId: string) => void;
};

export default function Post({
	post,
	tags,
	user,
	isEditable,
	index,
	totalPosts,
	onDeleteClick,
}: PostProps) {
	return (
		<Paper
			key={post.uuid}
			withBorder
			p="md"
			style={{
				borderBottom: index === totalPosts - 1 ? undefined : "none",
			}}
		>
			<Group align="flex-start" wrap="nowrap">
				<Avatar radius="xl" size="md">
					{user.user_name[0]}
				</Avatar>
				<div style={{ flex: 1 }}>
					<Group gap={8} mb={4} align="center" wrap="nowrap">
						<div style={{ flex: 1 }}>
							<Group gap={8} wrap="nowrap">
								<Text fw={500} size="sm">
									{user.user_name}
								</Text>
								<Text c="dimmed" size="sm">
									@{user.user_id}
								</Text>
								<Text c="dimmed" size="sm">
									・
								</Text>
								<Text c="dimmed" size="sm">
									{new Date(`${post.created_at}`).toLocaleString("sv-SE", {
										year: "numeric",
										month: "2-digit",
										day: "2-digit",
										hour: "2-digit",
										minute: "2-digit",
										hour12: false,
									})}
								</Text>
							</Group>
						</div>
						<Group gap={8}>
							{isEditable && (
								<Link to={`/home/${post.uuid}/edit`}>
									<ActionIcon
										color="blue"
										variant="subtle"
										size="sm"
										aria-label="編集"
									>
										<IconEdit size={16} stroke={1.5} />
									</ActionIcon>
								</Link>
							)}
							<ActionIcon
								color="red"
								variant="subtle"
								size="sm"
								onClick={() => onDeleteClick(post.uuid)}
								aria-label="削除"
							>
								<IconTrash size={16} stroke={1.5} />
							</ActionIcon>
						</Group>
					</Group>
					<Text size="sm" mb="xs" style={{ whiteSpace: "pre-wrap" }}>
						{post.content}
					</Text>
					{/* タグ表示エリア */}
					<Group gap={8} mb={8}>
						{tags && tags.length > 0
							? tags.sort().map((tag) => (
									<Badge
										key={tag}
										variant="light"
										color="blue"
										size="sm"
										radius="sm"
									>
										#{tag}
									</Badge>
								))
							: null}
					</Group>
				</div>
			</Group>
		</Paper>
	);
}
