export default function SignOutButton() {
	return (
		<>
			{/* <form action="/api/auth/signout" method="post">
				<button type="submit">サインアウト</button>
			</form> */}
			<div>
				<a href="/api/auth/signout">サインアウト</a>
			</div>
		</>
	);
}
