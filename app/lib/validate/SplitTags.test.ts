import { describe, expect, it } from "vitest";
import { SplitTags } from "./SplitTags";

describe("SplitTags", () => {
	it("空の文字列を渡すと空の配列を返す", () => {
		expect(SplitTags("")).toEqual([]);
	});

	it("undefined を渡すと空の配列を返す", () => {
		expect(SplitTags(undefined as unknown as string)).toEqual([]);
	});

	it("空白のみの文字列を渡すと空の配列を返す", () => {
		expect(SplitTags("   ")).toEqual([]);
	});

	it("単一のタグを正しく処理する", () => {
		expect(SplitTags("タグ")).toEqual(["タグ"]);
	});

	it("複数のタグを正しく処理する", () => {
		expect(SplitTags("タグ1 タグ2 タグ3")).toEqual(["タグ1", "タグ2", "タグ3"]);
	});

	it("タブや改行などの空白文字を正しく処理する", () => {
		expect(SplitTags("タグ1\tタグ2\nタグ3")).toEqual([
			"タグ1",
			"タグ2",
			"タグ3",
		]);
	});

	it("連続した空白を正しく処理する", () => {
		expect(SplitTags("タグ1  タグ2    タグ3")).toEqual([
			"タグ1",
			"タグ2",
			"タグ3",
		]);
	});

	it("前後の空白を正しく処理する", () => {
		expect(SplitTags("  タグ1 タグ2 タグ3  ")).toEqual([
			"タグ1",
			"タグ2",
			"タグ3",
		]);
	});

	it("空のタグは除外する", () => {
		expect(SplitTags("タグ1  タグ2  ")).toEqual(["タグ1", "タグ2"]);
	});

	it("重複したタグは1つだけ残す", () => {
		expect(SplitTags("タグ1 タグ2 タグ1 タグ3 タグ2")).toEqual([
			"タグ1",
			"タグ2",
			"タグ3",
		]);
	});

	it("大小文字を区別する", () => {
		expect(SplitTags("Tag tag TAG")).toEqual(["Tag", "tag", "TAG"]);
	});

	it("記号を含むタグを正しく処理する", () => {
		expect(SplitTags("タグ! タグ@ タグ#")).toEqual(["タグ!", "タグ@", "タグ#"]);
	});

	it("全角空白を正しく処理する", () => {
		expect(SplitTags("タグ1　タグ2　タグ3")).toEqual([
			"タグ1",
			"タグ2",
			"タグ3",
		]);
	});

	it("全角空白と半角空白が混在する場合を正しく処理する", () => {
		expect(SplitTags("タグ1 タグ2　タグ3")).toEqual([
			"タグ1",
			"タグ2",
			"タグ3",
		]);
	});

	it("連続した全角空白を正しく処理する", () => {
		expect(SplitTags("タグ1　　タグ2　　　タグ3")).toEqual([
			"タグ1",
			"タグ2",
			"タグ3",
		]);
	});
});
