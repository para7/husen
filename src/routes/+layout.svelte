<script lang="ts">
	import '$lib/styles/tw-variables/_index.css';
	import '$lib/styles/theme.css';
	import '$lib/styles/global.css';
	import '$lib/styles/utilities.css';
	// import ThemeSwitch from "$lib/theme-switch.svelte";
</script>

<div class="base">
	<!-- <div class="toolbar">
		<ThemeSwitch></ThemeSwitch>
	</div> -->
	<div class="slot">
		<slot></slot>
	</div>
</div>

<style>
	.base {
		display: flex;

		height: 100%;
		/* background-color: blue; */
		flex-direction: row;
	}

	/* .toolbar {
		display: flex;
		justify-content: flex-end;
		flex-direction: column;

		padding: var(--size-02); */

	/* 右側だけボーダーを表示 */
	/* border-right: 1px solid var(--gray-8);
		height: 100%;
	} */

	.slot {
		flex: 1;
		overflow: auto;

		/* background-color: red; */
	}
</style>
