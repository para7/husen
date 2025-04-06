import { useForm } from "@conform-to/react";
import { getFormProps, getInputProps } from "@conform-to/react";
import {
	Alert,
	Avatar,
	Badge,
	Button,
	Checkbox,
	Container,
	DefaultMantineColor,
	Divider,
	Group,
	Paper,
	Stack,
	Tabs,
	Text,
	TextInput,
	Textarea,
	Title,
} from "@mantine/core";
import { parseWithValibot } from "conform-to-valibot";
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Form, useActionData } from "react-router";
import { TablePosts, TableUsers, TableTags } from "server/db/schema";
import * as v from "valibot";
import SignOutButton from "~/lib/SignOutButton";
import { AuthState, GetAuthRemix } from "~/lib/domain/AuthState";
import type { Route } from "./+types/index";
import { useState, useEffect, useRef } from "react";

const maxLength = 500;

const schema = v.object({
	content: v.pipe(v.string(), v.maxLength(maxLength)),
	tags: v.optional(v.string()),
	keepTags: v.optional(v.boolean()),
});

export const action = async ({ request, context }: Route.ActionArgs) => {
	const formData = await request.formData();
	const submission = await parseWithValibot(formData, {
		schema,
	});

	// バリデーションエラーがある場合はクライアントに返す
	if (submission.status !== "success") {
		return submission.reply();
	}

	// バリデーション成功時の処理
	const { content, tags, keepTags } = submission.value;
	const state = await GetAuthRemix(context.hono.context);
	const db = drizzle(context.cloudflare.env.DB);
	const currentDate = new Date().toISOString();

	// 投稿を作成
	const result = await db
		.insert(TablePosts)
		.values({
			user_id: state.user.uuid,
			content: content,
			order_date: currentDate,
		})
		.returning();

	const newPost = result[0];

	// タグが入力されている場合は保存
	if (newPost && tags && tags.trim().length > 0) {
		// スペースで区切ってタグを配列に変換（空白や重複を除去）
		const tagArray = [
			...new Set(tags.split(/\s+/).filter((tag) => tag.trim().length > 0)),
		];

		// 各タグをデータベースに保存
		if (tagArray.length > 0) {
			await Promise.all(
				tagArray.map((tagText) =>
					db.insert(TableTags).values({
						post_id: newPost.uuid,
						user_id: state.user.uuid,
						tag_text: tagText,
						order_date: currentDate,
					}),
				),
			);
		}
	}

	return submission.reply({
		resetForm: true,
	});
};

export const loader = async ({ context }: Route.LoaderArgs) => {
	const db = drizzle(context.cloudflare.env.DB);
	const state = await AuthState(context.hono.context);

	if (state.state !== "authed") {
		return { posts: [], user: null };
	}

	// 投稿を取得
	const posts = await db
		.select()
		.from(TablePosts)
		.where(eq(TablePosts.user_id, state.user.uuid))
		.orderBy(desc(TablePosts.order_date));

	// 各投稿のタグを取得
	const postsWithTags = await Promise.all(
		posts.map(async (post) => {
			const tags = await db
				.select({ tag_text: TableTags.tag_text })
				.from(TableTags)
				.where(eq(TableTags.post_id, post.uuid))
				.orderBy(TableTags.order_date);

			return {
				...post,
				tags: tags.map((t) => t.tag_text),
			};
		}),
	);

	return { posts: postsWithTags, user: state.user };
};

export default function Index({ loaderData }: Route.ComponentProps) {
	const lastResult = useActionData<typeof action>();
	// タグと保持設定を管理するためのステート
	const [savedTags, setSavedTags] = useState<string>("");
	const [keepTagsState, setKeepTagsState] = useState<boolean>(false);
	// 投稿が成功したかどうかを追跡するためのref
	const isSubmittedRef = useRef(false);

	const [form, { content, tags, keepTags }] = useForm({
		lastResult,
		onValidate({ formData }) {
			return parseWithValibot(formData, { schema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	});

	// タグの値を保存
	const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (keepTagsState) {
			setSavedTags(e.target.value);
		}
	};

	// チェックボックスの状態を保存
	const handleKeepTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setKeepTagsState(e.target.checked);
	};

	// フォーム送信前にタグとチェックボックスの値を保存
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		const formData = new FormData(e.currentTarget);
		const currentTags = (formData.get("tags") as string) || "";
		const isKeepTags =
			formData.get("keepTags") === "on" || formData.get("keepTags") === "true";

		if (isKeepTags) {
			setSavedTags(currentTags);
			setKeepTagsState(true);
		} else {
			setSavedTags("");
			setKeepTagsState(false);
		}

		isSubmittedRef.current = true;
	};

	const { posts, user } = loaderData;

	// タグの色を決定する関数
	const getTagColor = (tag: string) => {
		// タグごとに固定の色を割り当てる
		const tagColors: Record<string, string> = {
			日常: "blue",
			プログラミング: "green",
			趣味: "violet",
			旅行: "orange",
			仕事: "teal",
			学習: "red",
			技術: "indigo",
			音楽: "cyan",
			アート: "grape",
		};

		// 設定されたタグは固定色、それ以外はランダム
		if (tag in tagColors) {
			return tagColors[tag];
		}

		// ランダムな色（文字列をハッシュ化して固定の色にする）
		const hash = tag
			.split("")
			.reduce((acc, char) => acc + char.charCodeAt(0), 0);
		const defaultColors = ["blue", "green", "violet", "orange", "teal"];
		return defaultColors[Math.abs(hash) % defaultColors.length];
	};

	if (!user) {
		return null;
	}

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
				}}
			>
				<Group justify="space-between">
					<Group>
						<Avatar radius="xl" size={32} color="blue">
							{user.user_name[0]}
						</Avatar>
						<Title order={4}>ホーム</Title>
					</Group>
					<SignOutButton />
				</Group>
			</Paper>

			{/* メインコンテンツ */}
			<div>
				{/* プロフィールセクション */}
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

				{/* 投稿フォーム */}
				<Paper withBorder p="md" mb="md">
					<Form method="post" {...getFormProps(form)} onSubmit={handleSubmit}>
						<Stack>
							{form.errors && form.errors.length > 0 && (
								<Alert color="red" variant="light">
									{form.errors.map((error) => (
										<div key={`form-error-${error}`}>{error}</div>
									))}
								</Alert>
							)}

							<div style={{ position: "relative" }}>
								<Textarea
									placeholder="いまどうしてる？"
									minRows={3}
									maxRows={8}
									{...getInputProps(content, { type: "text" })}
									error={content.value && content.value.length > maxLength}
								/>
								<Text
									size="sm"
									c={
										content.value && content.value.length > maxLength
											? "red"
											: "dimmed"
									}
									style={{ position: "absolute", bottom: 8, right: 8 }}
								>
									{content.value?.length || 0}/{maxLength}
								</Text>
							</div>

							<TextInput
								placeholder="タグをスペースで区切って入力（例: 日常 プログラミング 趣味）"
								{...getInputProps(tags, { type: "text" })}
								leftSection={<Text size="sm">#</Text>}
								description="スペースで区切って複数のタグを入力できます"
								defaultValue={keepTagsState ? savedTags : ""}
								onChange={handleTagsChange}
							/>

							<Checkbox
								{...getInputProps(keepTags, { type: "checkbox" })}
								label="タグを保持する"
								defaultChecked={keepTagsState}
								onChange={handleKeepTagsChange}
							/>

							<Group justify="flex-end">
								<Button
									type="submit"
									variant="gradient"
									disabled={
										!content.value ||
										content.value.length === 0 ||
										content.value.length > maxLength
									}
								>
									投稿する
								</Button>
							</Group>
						</Stack>
					</Form>
				</Paper>

				{/* 投稿一覧 */}
				<Stack gap={0}>
					{posts.map((post, index) => (
						<Paper
							key={post.uuid}
							withBorder
							p="md"
							style={{
								borderBottom: index === posts.length - 1 ? undefined : "none",
							}}
						>
							<Group align="flex-start" wrap="nowrap">
								<Avatar radius="xl" size="md">
									{user.user_name[0]}
								</Avatar>
								<div style={{ flex: 1 }}>
									<Group gap={8} mb={4}>
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
									<Text size="sm" mb="xs">
										{post.content}
									</Text>
									{/* タグ表示エリア */}
									<Group gap={8} mb={8}>
										{post.tags && post.tags.length > 0
											? post.tags.map((tag, idx) => (
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
					))}
				</Stack>
			</div>
		</Container>
	);
}
