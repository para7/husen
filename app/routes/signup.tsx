import {
	Button,
	Container,
	Paper,
	Stack,
	TextInput,
	Title,
} from "@mantine/core";
import { Form } from "react-router";
import SignOutButton from "~/lib/SignOutButton";

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
