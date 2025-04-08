import { useForm } from "@conform-to/react";
import { getFormProps, getInputProps } from "@conform-to/react";
import {
	Alert,
	Button,
	Container,
	Paper,
	Stack,
	TextInput,
	Title,
} from "@mantine/core";
import { parseWithValibot } from "conform-to-valibot";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Form, redirect, useActionData } from "react-router";
import { TableUsers } from "server/db/schema";
import * as v from "valibot";
import SignOutButton from "~/components/SignOutButton";
import type { Route } from "./+types/signup";
// import { IconAlertCircle } from "@tabler/icons-react";

const schema = v.object({
	userId: v.pipe(
		v.string("ユーザーIDは必須です"),
		v.minLength(3, "ユーザーIDは3文字以上で入力してください"),
		v.maxLength(64, "ユーザーIDは64文字以下で入力してください"),
	),
	username: v.pipe(
		v.string("ユーザー名は必須です"),
		v.minLength(1, "ユーザー名は1文字以上で入力してください"),
		v.maxLength(64, "ユーザー名は64文字以下で入力してください"),
	),
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
	const { userId, username } = submission.value;
	console.log({ userId, username });

	const authUser = context.hono.context.get("authUser");
	const email = authUser.session.user?.email;

	if (!email) {
		return submission.reply({
			formErrors: [
				"内部エラー: Google 認証からメールアドレスが取得できませんでした",
			],
		});
	}

	// ここでユーザー登録処理を行う
	const db = drizzle(context.cloudflare.env.DB);
	const result = await db.insert(TableUsers).values({
		user_id: userId,
		user_name: username,
		email: email,
	});

	console.log({ result });

	return submission.reply({});
};

export const loader = async ({ context }: Route.LoaderArgs) => {
	const db = drizzle(context.cloudflare.env.DB);
	const email = context.hono.context.get("authUser").session.user?.email;

	if (!email) {
		return {};
	}

	const result = await db
		.select()
		.from(TableUsers)
		.where(eq(TableUsers.email, email));

	// ユーザーデータがあったらホームにリダイレクト
	if (result.length > 0) {
		return redirect("/home");
	}

	return { result };
};

export default function SignUp() {
	const lastResult = useActionData<typeof action>();
	const [form, { userId, username }] = useForm({
		// 前回のサブミット結果を同期
		lastResult,

		// クライアント側でもバリデーションロジックを再利用
		onValidate({ formData }) {
			return parseWithValibot(formData, { schema });
		},

		// フォームのバリデーションタイミングを設定
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	});

	console.log(form.errors);

	return (
		<>
			<Container size={420} my={40}>
				<Title ta="center" order={1}>
					ユーザー登録
				</Title>

				<Paper withBorder shadow="md" p={30} mt={30} radius="md">
					<Form method="post" {...getFormProps(form)}>
						<Stack>
							{form.errors && form.errors.length > 0 && (
								<Alert
									// icon={<IconAlertCircle size="1rem" />}
									// title="エラー"
									color="red"
									variant="light"
								>
									{form.errors.map((error) => (
										<div key={`form-error-${error}`}>{error}</div>
									))}
								</Alert>
							)}

							<TextInput
								label="ユーザーID"
								{...getInputProps(userId, { type: "text" })}
								placeholder="your-user-id"
								required
								error={userId.errors}
							/>

							<TextInput
								label="ユーザー名"
								{...getInputProps(username, { type: "text" })}
								placeholder="Yamada Taro"
								required
								error={username.errors}
							/>

							<Button variant="gradient" type="submit" fullWidth mt="xl">
								登録する
							</Button>
						</Stack>
					</Form>
				</Paper>
				<Stack align="center" mt="xl">
					<SignOutButton text="登録をやめる" />
				</Stack>
			</Container>
		</>
	);
}
