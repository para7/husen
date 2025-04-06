import {
	Avatar,
	Button,
	Container,
	Divider,
	Group,
	Paper,
	Stack,
	Tabs,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import type { Route } from "./+types/index";
import SignOutButton from "~/lib/SignOutButton";
import {
	IconBell,
	IconBookmark,
	IconHeart,
	IconMessage,
	IconRepeat,
	IconSearch,
	IconSettings,
	IconUser,
} from "@tabler/icons-react";

export default function Index({ loaderData }: Route.ComponentProps) {
	// ダミーデータ
	const user = {
		uuid: "123456",
		email: "example@example.com",
		user_name: "山田太郎",
		user_id: "yamada_taro",
		created_at: "2023-01-01",
		updated_at: "2023-01-01",
	};

	const posts = [
		{
			uuid: "post1",
			user_id: user.uuid,
			content:
				"今日は良い天気ですね！新しいプロジェクトを始めました。#programming #新プロジェクト",
			created_at: "2023-05-10T10:00:00",
			updated_at: "2023-05-10T10:00:00",
			order_date: "2023-05-10T10:00:00",
		},
		{
			uuid: "post2",
			user_id: user.uuid,
			content: "美味しいランチを食べました！#ランチ #グルメ",
			created_at: "2023-05-09T13:00:00",
			updated_at: "2023-05-09T13:00:00",
			order_date: "2023-05-09T13:00:00",
		},
		{
			uuid: "post3",
			user_id: user.uuid,
			content: "新しい技術について勉強中。とても面白いです！#勉強 #テック",
			created_at: "2023-05-08T16:00:00",
			updated_at: "2023-05-08T16:00:00",
			order_date: "2023-05-08T16:00:00",
		},
	];

	return (
		<Container size="md" p={0}>
			{/* ヘッダー部分 */}
			<Paper
				shadow="xs"
				p="md"
				withBorder
				style={{
					position: "sticky",
					top: 0,
					zIndex: 100,
					backgroundColor: "white",
				}}
			>
				<Group justify="space-between">
					<Group>
						<Avatar radius="xl" size={40} color="blue">
							{user.user_name[0]}
						</Avatar>
						<Title order={4}>ホーム</Title>
					</Group>
					<Group>
						<IconSettings size={24} />
						<SignOutButton />
					</Group>
				</Group>
			</Paper>

			{/* メインコンテンツ */}
			<Group align="flex-start" wrap="nowrap">
				{/* サイドナビゲーション */}
				<Paper
					withBorder
					p="md"
					style={{
						width: "250px",
						height: "calc(100vh - 80px)",
						position: "sticky",
						top: "80px",
					}}
				>
					<Stack gap="xl">
						<Button
							leftSection={<IconUser size={20} />}
							variant="subtle"
							fullWidth
						>
							プロフィール
						</Button>
						<Button
							leftSection={<IconBookmark size={20} />}
							variant="subtle"
							fullWidth
						>
							ブックマーク
						</Button>
						<Button
							leftSection={<IconBell size={20} />}
							variant="subtle"
							fullWidth
						>
							通知
						</Button>
						<Button
							leftSection={<IconSettings size={20} />}
							variant="subtle"
							fullWidth
						>
							設定
						</Button>
					</Stack>
				</Paper>

				{/* メインコンテンツエリア */}
				<div style={{ flex: 1 }}>
					{/* プロフィールセクション */}
					<Paper withBorder mb="md">
						<div
							style={{
								height: "150px",
								backgroundColor: "#1DA1F2",
								backgroundImage: "linear-gradient(120deg, #1DA1F2, #0D8DD6)",
								borderRadius: "4px 4px 0 0",
							}}
						/>
						<div style={{ padding: "0 20px" }}>
							<Group
								justify="space-between"
								align="flex-end"
								mt="-50px"
								mb="md"
							>
								<Avatar
									size={100}
									radius={100}
									color="blue"
									style={{ border: "4px solid white" }}
								>
									{user.user_name[0]}
								</Avatar>
								<Button variant="outline" radius="xl">
									プロフィール編集
								</Button>
							</Group>

							<Title order={3}>{user.user_name}</Title>
							<Text c="dimmed" size="sm" mb="xs">
								@{user.user_id}
							</Text>

							<Text mb="md">
								Twitterのようなプロフィールページのサンプルです。実際のデータは接続していません。
							</Text>

							<Group gap="xl" mb="md">
								<Group gap={5}>
									<Text fw={700}>128</Text>
									<Text size="sm" c="dimmed">
										フォロー中
									</Text>
								</Group>
								<Group gap={5}>
									<Text fw={700}>354</Text>
									<Text size="sm" c="dimmed">
										フォロワー
									</Text>
								</Group>
							</Group>
						</div>

						<Tabs defaultValue="posts">
							<Tabs.List>
								<Tabs.Tab value="posts">投稿</Tabs.Tab>
								<Tabs.Tab value="replies">返信</Tabs.Tab>
								<Tabs.Tab value="media">メディア</Tabs.Tab>
								<Tabs.Tab value="likes">いいね</Tabs.Tab>
							</Tabs.List>
						</Tabs>
					</Paper>

					{/* 投稿入力エリア */}
					<Paper withBorder p="md" mb="md">
						<Group align="flex-start" wrap="nowrap">
							<Avatar radius="xl" size={40} color="blue">
								{user.user_name[0]}
							</Avatar>
							<Stack gap={10} style={{ width: "100%" }}>
								<TextInput
									placeholder="いまどうしてる？"
									variant="unstyled"
									size="lg"
								/>
								<Group justify="flex-end">
									<Button radius="xl">投稿する</Button>
								</Group>
							</Stack>
						</Group>
					</Paper>

					{/* 投稿一覧 */}
					<Stack gap={0}>
						{posts.map((post) => (
							<Paper key={post.uuid} withBorder p="md">
								<Group align="flex-start" wrap="nowrap">
									<Avatar radius="xl" size={40} color="blue">
										{user.user_name[0]}
									</Avatar>
									<div style={{ width: "100%" }}>
										<Group gap={5}>
											<Text fw={700}>{user.user_name}</Text>
											<Text size="sm" c="dimmed">
												@{user.user_id}
											</Text>
											<Text size="sm" c="dimmed">
												・
											</Text>
											<Text size="sm" c="dimmed">
												{new Date(post.created_at).toLocaleDateString("ja-JP")}
											</Text>
										</Group>
										<Text mt="xs">{post.content}</Text>

										<Group mt="md" justify="space-between">
											<Button
												variant="subtle"
												size="xs"
												leftSection={<IconMessage size={16} />}
												px={8}
											>
												12
											</Button>
											<Button
												variant="subtle"
												size="xs"
												leftSection={<IconRepeat size={16} />}
												px={8}
											>
												4
											</Button>
											<Button
												variant="subtle"
												size="xs"
												leftSection={<IconHeart size={16} />}
												px={8}
											>
												23
											</Button>
										</Group>
									</div>
								</Group>
							</Paper>
						))}
					</Stack>
				</div>

				{/* 右サイドバー */}
				<Paper
					withBorder
					p="md"
					style={{
						width: "300px",
						height: "calc(100vh - 80px)",
						position: "sticky",
						top: "80px",
					}}
				>
					<TextInput
						placeholder="検索"
						leftSection={<IconSearch size={14} />}
						radius="xl"
						mb="xl"
					/>

					<Paper withBorder p="md" radius="md" mb="xl">
						<Title order={5} mb="md">
							トレンド
						</Title>
						<Stack gap="xs">
							<div>
								<Text size="xs" c="dimmed">
									テクノロジー
								</Text>
								<Text fw={500}>#プログラミング</Text>
								<Text size="xs" c="dimmed">
									1.2万 件のツイート
								</Text>
							</div>
							<Divider my="xs" />
							<div>
								<Text size="xs" c="dimmed">
									トレンド
								</Text>
								<Text fw={500}>#新商品</Text>
								<Text size="xs" c="dimmed">
									8,532 件のツイート
								</Text>
							</div>
							<Divider my="xs" />
							<div>
								<Text size="xs" c="dimmed">
									エンタメ
								</Text>
								<Text fw={500}>#新作映画</Text>
								<Text size="xs" c="dimmed">
									4,218 件のツイート
								</Text>
							</div>
						</Stack>
					</Paper>

					<Paper withBorder p="md" radius="md">
						<Title order={5} mb="md">
							おすすめユーザー
						</Title>
						<Stack gap="md">
							{[1, 2, 3].map((i) => (
								<Group key={i} justify="space-between" wrap="nowrap">
									<Group wrap="nowrap">
										<Avatar
											radius="xl"
											size={40}
											color={
												["blue", "green", "purple"][i - 1] as
													| "blue"
													| "green"
													| "purple"
											}
										>
											U{i}
										</Avatar>
										<div>
											<Text size="sm" fw={500}>
												ユーザー{i}
											</Text>
											<Text size="xs" c="dimmed">
												@user{i}
											</Text>
										</div>
									</Group>
									<Button variant="outline" radius="xl" size="xs">
										フォロー
									</Button>
								</Group>
							))}
						</Stack>
					</Paper>
				</Paper>
			</Group>
		</Container>
	);
}
