/**
 * 空白区切りの文字列からタグの配列を作成する関数
 * 空のタグと重複を除去します
 * 全角空白（　）と半角空白（ ）の両方に対応しています
 *
 * @param tagsString - 空白区切りのタグ文字列
 * @returns 一意なタグの配列
 */
export function SplitTags(tagsString: string): string[] {
	// 文字列が空の場合は空の配列を返す
	if (!tagsString || tagsString.trim().length === 0) {
		return [];
	}

	// 正規表現 \s+ は全ての空白文字（半角空白、タブ、改行、全角空白など）に一致
	// より明示的に全角空白を含める場合: /[\s\u3000]+/
	return [
		...new Set(
			tagsString.split(/[\s\u3000]+/).filter((tag) => tag.trim().length > 0),
		),
	];
}
