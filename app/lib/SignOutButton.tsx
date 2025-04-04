import { Button } from "@mantine/core";

type SignOutButtonProps = {
	text?: string;
};

export default function SignOutButton({
	text = "サインアウト",
}: SignOutButtonProps) {
	return (
		<>
			{/* <form action="/api/auth/signout" method="post">
				<button type="submit">サインアウト</button>
			</form> */}
			<div>
				<Button component="a" variant="outline" href="/api/auth/signout">
					{text}
				</Button>
			</div>
		</>
	);
}
