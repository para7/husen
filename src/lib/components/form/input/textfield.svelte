<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		customProp?: boolean;
	} & HTMLInputAttributes;

	let { value = $bindable(''), ...props } = $props();
</script>

<input bind:value {...props} />

<style>
	input {
		/* material design の filled 風デザイン */
		background-color: inherit;
		border: 1px solid #000;
		border-radius: var(--size-03);
		padding: 8px;
		width: 100%;
		color: var(--color-text);
	}
</style>
