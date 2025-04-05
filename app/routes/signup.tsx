import {
	Button,
	Container,
	Paper,
	Stack,
	TextInput,
	Title,
} from "@mantine/core";
import { Form } from "react-router";
import * as v from "valibot";
import SignOutButton from "~/lib/SignOutButton";

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

export const action = async ({ request }: { request: Request }) => {
	const body = await request.formData();
	// const name = body.get("visitorsName");
	console.log(body);
	return { message: "Hello, " };
};

export default function SignUp() {
	return (
		<>
			<Container size={420} my={40}>
				<Title ta="center" order={1}>
					ユーザー登録
				</Title>

				<Paper withBorder shadow="md" p={30} mt={30} radius="md">
					<Form method="post">
						<Stack>
							<TextInput
								label="ユーザーID"
								name="userId"
								placeholder="your-user-id"
								required
							/>

							<TextInput
								label="ユーザー名"
								name="username"
								placeholder="Yamada Taro"
								required
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
