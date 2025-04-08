import { Button, Group, Paper, Stack, Text, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Form } from "react-router";

type SearchFormProps = {
	searchTags?: string[];
};

export default function SearchForm({ searchTags = [] }: SearchFormProps) {
	const [searchParams] = useSearchParams();
	const [searchText, setSearchText] = useState<string>("");

	// URLの検索パラメータが変更されたら入力欄を更新
	useEffect(() => {
		const searchParam = searchParams.get("search") || "";
		setSearchText(searchParam);
	}, [searchParams]);

	const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	return (
		<Paper withBorder p="md" mb="md">
			<Form method="get">
				<Stack>
					<Group align="flex-end">
						<TextInput
							name="search"
							placeholder="タグで検索"
							value={searchText}
							onChange={handleTextChange}
							leftSection={<Text size="sm">#</Text>}
							description="スペースで区切って複数のタグを検索（AND検索）"
							style={{ flexGrow: 1 }}
						/>
						<Button type="submit">検索</Button>
					</Group>
					{searchTags.length > 0 && (
						<Text size="sm" c="dimmed">
							検索中: {searchTags.map((tag) => `#${tag}`).join(" ")}
						</Text>
					)}
				</Stack>
			</Form>
		</Paper>
	);
}
