import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import * as v from 'valibot';
import { valibot } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/connection';
import { users, credentials } from '$lib/server/schema';
import { CreateUUID } from '$lib/acl/CreateUUID';
import { CreatePasswordHash } from '$lib/credential/CreatePasswordHash.js';

const signupSchema = v.pipe(
	v.object({
		username: v.pipe(v.string(), v.minLength(3, 'ユーザー名は3文字以上である必要があります')),
		id: v.pipe(v.string(), v.minLength(4, 'IDは4文字以上である必要があります')),
		password: v.pipe(v.string(), v.minLength(8, 'パスワードは8文字以上である必要があります')),
		confirmPassword: v.string()
	}),
	v.forward(
		v.partialCheck(
			[['password'], ['confirmPassword']],
			(input) => input.password === input.confirmPassword,
			'パスワードが一致しません'
		),
		['confirmPassword']
	)
);

export const load = async () => {
	// フォームの初期化
	const form = await superValidate(valibot(signupSchema));
	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, valibot(signupSchema));

		console.log(form);
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const userId = CreateUUID();
			const passwordHash = await CreatePasswordHash(form.data.password);

			await db.transaction(async (trx) => {
				await trx.insert(users).values({
					uuid: userId,
					user_id: form.data.id,
					username: form.data.username
				});
				await trx.insert(credentials).values({
					uuid: userId,
					password_hash: passwordHash
				});
			});

			return { form };
		} catch (e) {
			console.error(e);

			return fail(500, {
				form,
				error: 'ユーザー登録に失敗しました'
			});
		}
	}
};
