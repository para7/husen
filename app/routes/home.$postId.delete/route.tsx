import { useForm } from "@conform-to/react";
import { getFormProps } from "@conform-to/react";
import { Alert, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { parseWithValibot } from "conform-to-valibot";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { useEffect, useState } from "react";
import {
	Form,
	redirect,
	useActionData,
	useLoaderData,
	useNavigate,
} from "react-router";
import { TablePosts, TableTags } from "server/db/schema";
import * as v from "valibot";
import { AuthState } from "~/lib/domain/AuthState";
import type { Route } from "./+types/route";

// 削除用のスキーマを定義
const deleteSchema = v.object({
	_action: v.literal("delete"),
});

export const action = async ({
	request,
	context,
	params,
}: Route.ActionArgs) => {
	const formData = await request.formData();
	const submission = await parseWithValibot(formData, {
		schema: deleteSchema,
	});

	// バリデーションエラーがある場合はクライアントに返す
	if (submission.status !== "success") {
		return redirect("/home");
	}

	// バリデーション成功時の処理
	const postId = params.postId;
	const state = await AuthState(context.hono.context);

	if (state.state !== "authed") {
		return redirect("/home");
	}

	const db = drizzle(context.cloudflare.env.DB);

	// 関連するタグを先に削除（外部キー制約のため）
	await db.delete(TableTags).where(eq(TableTags.post_id, postId));

	// 投稿を削除（自分の投稿のみ削除可能）
	await db
		.delete(TablePosts)
		.where(
			and(eq(TablePosts.uuid, postId), eq(TablePosts.user_id, state.user.uuid)),
		);

	// 削除後にホームページにリダイレクト
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

	return {
		post,
	};
};

export default function DeletePost() {
	const { post } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const [opened, setOpened] = useState(true);

	const [form] = useForm({
		onValidate({ formData }) {
			return parseWithValibot(formData, { schema: deleteSchema });
		},
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
			title="投稿を削除"
			size="md"
			centered
		>
			<Form method="post" {...getFormProps(form)}>
				<Stack>
					<Text>
						この投稿を削除してもよろしいですか？この操作は取り消せません。
					</Text>
					<Text fw={500} style={{ whiteSpace: "pre-wrap" }}>
						{post.content}
					</Text>

					<Group justify="space-between">
						<Button variant="outline" onClick={handleClose}>
							キャンセル
						</Button>
						<input type="hidden" name="_action" value="delete" />
						<Button type="submit" color="red">
							削除する
						</Button>
					</Group>
				</Stack>
			</Form>
		</Modal>
	);
}
