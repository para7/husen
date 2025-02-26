import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import * as v from 'valibot';
import { valibot } from 'sveltekit-superforms/adapters';

const signupSchema = v.object({
	id: v.pipe(v.string(), v.email('有効なメールアドレスを入力してください')),
	password: v.pipe(v.string(), v.minLength(8, 'パスワードは8文字以上である必要があります'))
});

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
			// ここにデータベースへの書き込み処理を作成する
			// 例: await db.createUser(form.data);

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
