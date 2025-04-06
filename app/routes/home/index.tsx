import { useForm } from "@conform-to/react";
import { getFormProps, getInputProps } from "@conform-to/react";
import {
	Alert,
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
	Textarea,
	Title,
} from "@mantine/core";
import { parseWithValibot } from "conform-to-valibot";
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Form, useActionData } from "react-router";
import { TablePosts, TableUsers } from "server/db/schema";
import * as v from "valibot";
import SignOutButton from "~/lib/SignOutButton";
import { AuthState, GetAuthRemix } from "~/lib/domain/AuthState";
import type { Route } from "./+types/index";

const maxLength = 5;

const schema = v.object({
	content: v.pipe(v.string(), v.maxLength(maxLength)),
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
	const { content } = submission.value;
	const state = await GetAuthRemix(context.hono.context);
	state;

	const db = drizzle(context.cloudflare.env.DB);

	// 投稿を作成
	await db.insert(TablePosts).values({
		user_id: state.user.uuid,
		content: content,
		order_date: new Date().toISOString(),
	});

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

	return { posts, user: state.user };
};

export default function Index({ loaderData }: Route.ComponentProps) {
	const lastResult = useActionData<typeof action>();
	const [form, { content }] = useForm({
		lastResult,
		onValidate({ formData }) {
			return parseWithValibot(formData, { schema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	});

	const { posts, user } = loaderData;

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
					<Form method="post" {...getFormProps(form)}>
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
								</div>
							</Group>
						</Paper>
					))}
				</Stack>
			</div>
		</Container>
	);
}
