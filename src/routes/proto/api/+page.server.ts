import { honoClient } from '$lib/hono/honoClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (/*{ params }*/) => {
	const data = await honoClient.api.hello.$get();

	return {
		post: {
			content: await data.json()
		}
	};
};
