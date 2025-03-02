<script lang="ts">
	import { honoClient } from '$lib/hono/honoClient';
	import type { PageData } from './$types';
	import { svelte_client_fetch } from '$lib/utilities/svelte/svelte-fetch';

	export let data: PageData;

	let vali = svelte_client_fetch(() => {
		return honoClient.api.validate
			.$post({ json: { id: 'id' } })
			.then(async (x) => {
				if (x.ok) {
					const sss = await x.json();
					console.log(sss);
					return sss;
				} else {
					console.error(x);
					return { ...x, status: x.status, json: await x.json().catch((e) => String(e)) };
				}
			})
			.catch(async (e) => {
				console.error(e);
			});
	});
</script>

<div>【data】</div>
<div class="pre">{JSON.stringify(data, null, '\t')}</div>

{#await vali}
	<p>fetching...</p>
{:then res}
	<div>【vali】</div>
	<div class="pre">{JSON.stringify(res, null, '\t')}</div>
{:catch e}
	<div>error</div>
	<pre>{e}</pre>
{/await}

<style>
	.pre {
		white-space: pre;
		margin: 1em;
		padding: 0.5em;
		background-color: var(--gray-3);
	}
</style>
