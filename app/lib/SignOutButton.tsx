import { useState } from "react";

export default function SignOutButton() {
	return (
		<>
			{/* <form action="/api/auth/signout" method="post">
				<button type="submit">サインアウト</button>
			</form> */}
			<a href="/api/auth/signout">サインアウト</a>
		</>
	);
}
