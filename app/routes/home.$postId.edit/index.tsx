import { useForm } from "@conform-to/react";
import { getFormProps, getInputProps } from "@conform-to/react";
import {
	Alert,
	Button,
	Group,
	Modal,
	Stack,
	Text,
	TextInput,
	Textarea,
} from "@mantine/core";
import { parseWithValibot } from "conform-to-valibot";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { useEffect, useState } from "react";
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigate,
	redirect,
} from "react-router";
import { TablePosts, TableTags } from "server/db/schema";
import * as v from "valibot";
import { AuthState } from "~/lib/domain/AuthState";
import type { Route } from "./+types/index";

const maxLength = 500;

// 編集用のスキーマを定義
const editSchema = v.object({
	content: v.pipe(v.string(), v.maxLength(maxLength)),
	tags: v.optional(v.string()),
	_action: v.literal("edit"),
});

export const action = async ({
	request,
	context,
	params,
}: Route.ActionArgs) => {
	const formData = await request.formData();
	const submission = await parseWithValibot(formData, {
		schema: editSchema,
	});

	// バリデーションエラーがある場合はクライアントに返す
	if (submission.status !== "success") {
		return redirect("/home");
	}

	// バリデーション成功時の処理
	const { content, tags } = submission.value;
	const postId = params.postId;
	const state = await AuthState(context.hono.context);

	if (state.state !== "authed") {
		return redirect("/home");
	}

	const db = drizzle(context.cloudflare.env.DB);
	const currentDate = new Date().toISOString();

	// 投稿を更新（自分の投稿のみ編集可能）
	await db
		.update(TablePosts)
		.set({
			content: content,
			updated_at: currentDate,
		})
		.where(
			and(eq(TablePosts.uuid, postId), eq(TablePosts.user_id, state.user.uuid)),
		);

	// 既存のタグを削除
	await db.delete(TableTags).where(eq(TableTags.post_id, postId));

	// 新しいタグを保存
	if (tags && tags.trim().length > 0) {
		// スペースで区切ってタグを配列に変換（空白や重複を除去）
		const tagArray = [
			...new Set(tags.split(/\s+/).filter((tag) => tag.trim().length > 0)),
		];

		// 各タグをデータベースに保存
		if (tagArray.length > 0) {
			await Promise.all(
				tagArray.map((tagText) =>
					db.insert(TableTags).values({
						post_id: postId,
						user_id: state.user.uuid,
						tag_text: tagText,
						order_date: currentDate,
					}),
				),
			);
		}
	}

	// 更新後にホームページにリダイレクト
	return redirect("/home");
};

export const loader = async ({ context, params }: Route.LoaderArgs) => {
	const db = drizzle(context.cloudflare.env.DB);
	const state = await AuthState(context.hono.context);
	const postId = params.postId;

	if (state.state !== "authed") {
		return redirect("/home");
	}

	// 投稿を取得
	const post = await db
		.select()
		.from(TablePosts)
		.where(
			and(eq(TablePosts.uuid, postId), eq(TablePosts.user_id, state.user.uuid)),
		)
		.then((posts) => posts[0] || null);

	if (!post) {
		return redirect("/home");
	}

	// 投稿のタグを取得
	const tags = await db
		.select({ tag_text: TableTags.tag_text })
		.from(TableTags)
		.where(eq(TableTags.post_id, postId))
		.orderBy(TableTags.order_date);

	return {
		post,
		tags: tags.map((t) => t.tag_text),
	};
};

export default function EditPost() {
	const { post, tags } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const [opened, setOpened] = useState(true);

	const [form, { content, tags: tagsInput }] = useForm({
		onValidate({ formData }) {
			return parseWithValibot(formData, { schema: editSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	});

	// モーダルを閉じたときにホームページに戻る
	const handleClose = () => {
		setOpened(false);
		navigate("/home");
	};

	if (!post) {
		return null;
	}

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title="投稿を編集"
			size="lg"
			centered
		>
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
							error={content?.value && content.value.length > maxLength}
							defaultValue={post.content}
						/>
						<Text
							size="sm"
							c={
								content?.value && content.value.length > maxLength
									? "red"
									: "dimmed"
							}
							style={{ position: "absolute", bottom: 8, right: 8 }}
						>
							{content?.value?.length || post.content.length}/{maxLength}
						</Text>
					</div>

					<TextInput
						placeholder="タグをスペースで区切って入力"
						{...getInputProps(tagsInput, { type: "text" })}
						leftSection={<Text size="sm">#</Text>}
						description="スペースで区切って複数のタグを入力できます"
						defaultValue={tags.join(" ")}
					/>

					<Group justify="space-between">
						<Button variant="outline" onClick={handleClose}>
							キャンセル
						</Button>
						<input type="hidden" name="_action" value="edit" />
						<Button
							type="submit"
							disabled={
								!content?.value ||
								content.value.length === 0 ||
								content.value.length > maxLength
							}
						>
							更新する
						</Button>
					</Group>
				</Stack>
			</Form>
		</Modal>
	);
}
