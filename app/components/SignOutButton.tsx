import { Button } from "@mantine/core";

type SignOutButtonProps = {
	text?: string;
	variant?: string;
};

export default function SignOutButton({
	text = "サインアウト",
	variant = "light",
}: SignOutButtonProps) {
	return (
		<>
			{/* <form action="/api/auth/signout" method="post">
				<button type="submit">サインアウト</button>
			</form> */}
			<div>
				<Button component="a" variant={variant} href="/api/auth/signout">
					{text}
				</Button>
			</div>
		</>
	);
}
