import { useForm } from "@conform-to/react";
import { getFormProps, getInputProps } from "@conform-to/react";
import {
	Alert,
	Button,
	Group,
	Modal,
	Stack,
	Text,
	Textarea,
} from "@mantine/core";
import { parseWithValibot } from "conform-to-valibot";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { useState } from "react";
import { Form, redirect, useLoaderData, useNavigate } from "react-router";
import { TableUsers } from "server/db/schema";
import * as v from "valibot";
import { AuthState } from "~/lib/domain/AuthState";
import type { Route } from "./+types/route";

const maxLength = 200;

// プロフィール編集用のスキーマを定義
const profileEditSchema = v.object({
	profile: v.pipe(v.string(), v.maxLength(maxLength)),
	_action: v.literal("edit_profile"),
});

export const action = async ({ request, context }: Route.ActionArgs) => {
	const formData = await request.formData();
	const submission = await parseWithValibot(formData, {
		schema: profileEditSchema,
	});

	// バリデーションエラーがある場合はクライアントに返す
	if (submission.status !== "success") {
		return submission.reply();
	}

	// バリデーション成功時の処理
	const { profile } = submission.value;
	const state = await AuthState(context.hono.context);

	if (state.state !== "authed") {
		return redirect("/home");
	}

	const db = drizzle(context.cloudflare.env.DB);
	const currentDate = new Date().toISOString();

	// プロフィールを更新
	await db
		.update(TableUsers)
		.set({
			profile: profile,
			updated_at: currentDate,
		})
		.where(eq(TableUsers.uuid, state.user.uuid));

	// 更新後にホームページにリダイレクト
	return redirect("/home");
};

export const loader = async ({ context }: Route.LoaderArgs) => {
	const db = drizzle(context.cloudflare.env.DB);
	const state = await AuthState(context.hono.context);

	if (state.state !== "authed") {
		return redirect("/home");
	}

	// ユーザー情報を取得
	const user = await db
		.select()
		.from(TableUsers)
		.where(eq(TableUsers.uuid, state.user.uuid))
		.then((users) => users[0] || null);

	if (!user) {
		return redirect("/home");
	}

	return { user };
};

export default function EditProfile() {
	const { user } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const [opened, setOpened] = useState(true);

	const [form, { profile }] = useForm({
		onValidate({ formData }) {
			return parseWithValibot(formData, { schema: profileEditSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		defaultValue: {
			profile: user.profile,
		},
	});

	// モーダルを閉じたときにホームページに戻る
	const handleClose = () => {
		setOpened(false);
		navigate("/home");
	};

	if (!user) {
		return null;
	}

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title="プロフィールを編集"
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
							placeholder="自己紹介（200文字以内）"
							minRows={3}
							maxRows={8}
							{...getInputProps(profile, { type: "text" })}
							error={profile?.value && profile.value.length > maxLength}
							defaultValue={user.profile}
						/>
						<Text
							size="sm"
							c={
								profile?.value && profile.value.length > maxLength
									? "red"
									: "dimmed"
							}
							style={{ position: "absolute", bottom: 8, right: 8 }}
						>
							{profile?.value?.length || user.profile.length}/{maxLength}
						</Text>
					</div>

					<Group justify="space-between">
						<Button variant="outline" onClick={handleClose}>
							キャンセル
						</Button>
						<input type="hidden" name="_action" value="edit_profile" />
						<Button
							type="submit"
							disabled={!profile?.value || profile.value.length > maxLength}
						>
							更新する
						</Button>
					</Group>
				</Stack>
			</Form>
		</Modal>
	);
}
