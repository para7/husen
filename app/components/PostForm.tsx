import {
	type SubmissionResult,
	getFormProps,
	getInputProps,
	useForm,
} from "@conform-to/react";
import {
	Alert,
	Button,
	Checkbox,
	Group,
	Paper,
	Stack,
	Text,
	TextInput,
	Textarea,
} from "@mantine/core";
import { parseWithValibot } from "conform-to-valibot";
import { useRef, useState } from "react";
import { Form } from "react-router";
import * as v from "valibot";

type PostFormProps = {
	lastResult: SubmissionResult<string[]> | null | undefined;
	maxLength: number;
	defaultSavedTags?: string;
	defaultKeepTags?: boolean;
};

// 投稿用のスキーマを定義
const postSchema = v.object({
	content: v.pipe(v.string(), v.maxLength(500)),
	tags: v.optional(v.string()),
	keepTags: v.optional(v.boolean()),
	_action: v.literal("post"),
});

export default function PostForm({
	lastResult,
	maxLength,
	defaultSavedTags = "",
	defaultKeepTags = false,
}: PostFormProps) {
	// タグと保持設定を管理するためのステート
	const [savedTags, setSavedTags] = useState<string>(defaultSavedTags);
	const [keepTagsState, setKeepTagsState] = useState<boolean>(defaultKeepTags);
	// 投稿が成功したかどうかを追跡するためのref
	const isSubmittedRef = useRef(false);

	const [form, { content, tags, keepTags }] = useForm({
		lastResult,
		onValidate({ formData }) {
			return parseWithValibot(formData, { schema: postSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	});

	// タグの値を保存
	const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (keepTagsState) {
			setSavedTags(e.target.value);
		}
	};

	// チェックボックスの状態を保存
	const handleKeepTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setKeepTagsState(e.target.checked);
	};

	// フォーム送信前にタグとチェックボックスの値を保存
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		const formData = new FormData(e.currentTarget);
		const currentTags = (formData.get("tags") as string) || "";
		const isKeepTags =
			formData.get("keepTags") === "on" || formData.get("keepTags") === "true";

		if (isKeepTags) {
			setSavedTags(currentTags);
			setKeepTagsState(true);
		} else {
			setSavedTags("");
			setKeepTagsState(false);
		}

		isSubmittedRef.current = true;
	};

	return (
		<Paper withBorder p="md" mb="md">
			<Form method="post" {...getFormProps(form)} onSubmit={handleSubmit}>
				<Stack>
					{form.errors && form.errors.length > 0 && (
						<Alert color="red" variant="light">
							{form.errors.map((error) => (
								<div key={`form-error-${error}`}>{error}</div>
							))}
						</Alert>
					)}

					<div style={{ position: "relative" }}>
						<Textarea
							placeholder="いまどうしてる？"
							minRows={3}
							maxRows={8}
							{...getInputProps(content, { type: "text" })}
							error={content?.value && content.value.length > maxLength}
						/>
						<Text
							size="sm"
							c={
								content?.value && content.value.length > maxLength
									? "red"
									: "dimmed"
							}
							style={{ position: "absolute", bottom: 8, right: 8 }}
						>
							{content?.value?.length || 0}/{maxLength}
						</Text>
					</div>

					<TextInput
						placeholder="タグ"
						{...getInputProps(tags, { type: "text" })}
						leftSection={<Text size="sm">#</Text>}
						description="スペースで区切って複数のタグを入力できます"
						defaultValue={keepTagsState ? savedTags : ""}
						onChange={handleTagsChange}
					/>

					<Group justify="space-between">
						<Checkbox
							{...getInputProps(keepTags, { type: "checkbox" })}
							label="タグを保持する"
							defaultChecked={keepTagsState}
							onChange={handleKeepTagsChange}
						/>

						<input type="hidden" name="_action" value="post" />
						<Button
							type="submit"
							disabled={
								!content?.value ||
								content.value.length === 0 ||
								content.value.length > maxLength
							}
						>
							投稿する
						</Button>
					</Group>
				</Stack>
			</Form>
		</Paper>
	);
}
