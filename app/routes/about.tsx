import {
	Anchor,
	Box,
	Container,
	List,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { Link } from "react-router";

// export const meta: MetaFunction = () => {
// 	return [
// 		{ title: "About Me" },
// 		{ name: "description", content: "私についてのページです" },
// 	];
// };

export default function About() {
	return (
		<Container size="lg" py="xl">
			<Stack>
				<a href="/">トップページに戻る</a>
				<Title order={1}>Husenについて</Title>

				<Stack>
					<Title order={2} mb="md">
						モチベーション
					</Title>
					<Stack>
						<List spacing="sm" ml="md">
							<List.Item>Twitter ぐらい手軽に書きたい</List.Item>
							<List.Item>過去の投稿を自由に振り返りたい</List.Item>
							<List.Item>
								書き下し投稿を、後から整理出来るようにしたい
							</List.Item>
						</List>
						を叶えるために自作しているマイクロブログです。
					</Stack>
				</Stack>

				<Stack>
					<Title order={2} mb="md">
						名前の由来
					</Title>
					<Text>
						タグを自由自在に付け替え出来るところが、このブログの特徴です。
					</Text>
					<Text>
						そのイメージが付箋をぺたぺた貼り替える様子と近いので、Husen(付箋)という名前をつけました。
					</Text>
				</Stack>

				<Stack>
					<Title order={2} mb="md">
						開発について
					</Title>
					<Text>本プロジェクトは、現在アルファ版です。</Text>
					<Text>予告なくデータ削除・サービス停止する場合がございます。</Text>
					<Text>自己責任でのご利用をお願いいたします。</Text>
				</Stack>
			</Stack>
		</Container>
	);
}
