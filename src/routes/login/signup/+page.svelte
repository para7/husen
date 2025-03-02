<script lang="ts">
	import { PAGES } from '$lib/routes/ROUTES';
	import Textfield from '$lib/components/form/input/textfield.svelte';
	import Button from '$lib/components/material/button/button.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;

	const { form, errors, enhance, submitting } = superForm(data.form, {
		onResult: ({ result }) => {
			if (result.type === 'success') {
				goto(PAGES['/profile/[userid]']({ userid: $form.id }));
			}
		}
	});
</script>

<div class="container">
	<h1>Husen</h1>
	<h2>Signup</h2>

	<form method="post" use:enhance>
		<div class="container">
			<p class="line">
				<label class="textlabel" for="id">ID</label>
				<Textfield id="id" name="id" bind:value={$form.id} error={$errors.id?.[0]} />
				{#if $errors.id}
					<span class="error">{$errors.id[0]}</span>
				{/if}
			</p>

			<p class="line">
				<label class="textlabel" for="username">Username</label>
				<Textfield
					id="username"
					name="username"
					bind:value={$form.username}
					error={$errors.username?.[0]}
				/>
				{#if $errors.username}
					<span class="error">{$errors.username[0]}</span>
				{/if}
			</p>

			<p class="line">
				<label class="textlabel" for="password">Password</label>
				<Textfield
					id="password"
					name="password"
					type="password"
					bind:value={$form.password}
					error={$errors.password?.[0]}
				/>
				{#if $errors.password}
					<span class="error">{$errors.password[0]}</span>
				{/if}
			</p>

			<p class="line">
				<label class="textlabel" for="confirmPassword">Confirm Password</label>
				<Textfield
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					bind:value={$form.confirmPassword}
					error={$errors.confirmPassword?.[0]}
				/>
				{#if $errors.confirmPassword}
					<span class="error">{$errors.confirmPassword[0]}</span>
				{/if}
			</p>

			<Button variant="outlined" type="submit">
				{#if $submitting}
					Loading...
				{:else}
					Register
				{/if}
			</Button>
		</div>
	</form>

	<div>
		<a href={PAGES['/login']}>ログインへ戻る</a>
	</div>

	<p class="notice">
		本プロジェクトは試作版です。<br />
		予告なくデータ削除・サービス停止する場合がございます。<br />
		あらかじめご了承ください。
	</p>
</div>

<style>
	h1 {
		text-align: center;
	}

	.red {
		color: var(--hu-color-text-red);
	}

	label {
		display: block;
	}

	.line {
		display: flex;
		flex-direction: column;
	}

	.notice {
		width: 80%;
	}

	.container {
		display: flex;
		flex-direction: column;
		gap: 1em;
		width: 100%;
		align-items: center;
	}

	.error {
		color: var(--hu-color-text-red);
		margin: 0;
	}
</style>
