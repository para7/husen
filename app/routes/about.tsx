import {
	Anchor,
	Box,
	Container,
	Divider,
	Group,
	List,
	Paper,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
	useMantineTheme,
} from "@mantine/core";
import {
	IconArrowLeft,
	IconPencil,
	IconHistory,
	IconInfoCircle,
	IconNotes,
	IconSticker,
} from "@tabler/icons-react";
import styles from "../styles/about.module.css";
import ColorModeSwitch from "~/components/ColorModeSwitch";

export const meta = () => {
	return [
		{ title: "Husenについて | マイクロブログサービス" },
		{
			name: "description",
			content: "Husenはタグを自由に付け替えできるマイクロブログです。",
		},
	];
};

export default function About() {
	const theme = useMantineTheme();
	const { colorScheme } = useMantineColorScheme();
	const isDark = colorScheme === "dark";

	// 色の設定（ダークモード対応）
	const titleColor = isDark ? theme.colors.blue[4] : theme.colors.blue[7];
	const highlightColor = isDark ? theme.colors.blue[4] : theme.colors.blue[7];
	const accentColor = isDark ? "yellow" : "orange";

	return (
		<div className={styles.aboutContainer}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "20px",
				}}
			>
				<Anchor href="/" className={styles.backLink || ""}>
					<IconArrowLeft size={16} />
					<span>トップページに戻る</span>
				</Anchor>
				<ColorModeSwitch />
			</div>

			<header className={styles.header}>
				<Title order={1} size="h1" fw={800} mb="xs">
					Husen
					<Text component="span" c={isDark ? "blue.4" : "blue"}>
						について
					</Text>
				</Title>
				<Text size="lg" c="dimmed">
					タグを自由に付け替えて整理できるマイクロブログサービス
				</Text>
			</header>

			<Paper className={`${styles.section} ${styles.motivation}`} withBorder>
				<Title order={2} className={styles.sectionTitle || ""} c={titleColor}>
					モチベーション
				</Title>

				<Box my="xl">
					<Group gap="md" align="flex-start">
						<ThemeIcon size="lg" radius="md" variant="light" color="blue">
							<IconPencil size={20} />
						</ThemeIcon>
						<div>
							<Text fw={600} mb={5}>
								Twitter のように手軽に書きたい
							</Text>
							<Text c="dimmed" className={styles.description || ""}>
								思いついたことを気負わずに書き流せる
							</Text>
						</div>
					</Group>

					<Divider my="lg" variant="dotted" />

					<Group gap="md" align="flex-start">
						<ThemeIcon size="lg" radius="md" variant="light" color="cyan">
							<IconHistory size={20} />
						</ThemeIcon>
						<div>
							<Text fw={600} mb={5}>
								過去の投稿を自由に振り返りたい
							</Text>
							<Text c="dimmed" className={styles.description || ""}>
								タグ別で、無制限に過去の投稿を閲覧できる
							</Text>
						</div>
					</Group>

					<Divider my="lg" variant="dotted" />

					<Group gap="md" align="flex-start">
						<ThemeIcon size="lg" radius="md" variant="light" color="indigo">
							<IconNotes size={20} />
						</ThemeIcon>
						<div>
							<Text fw={600} mb={5}>
								書き下し投稿を、後から整理出来るようにしたい
							</Text>
							<Text c="dimmed" className={styles.description || ""}>
								投稿時は考えずに書いたものを、後から情報として整えることができる
							</Text>
						</div>
					</Group>
				</Box>

				<Text size="lg" mt="md" fw={500}>
					これらを叶えるために自作しているマイクロブログです。
				</Text>
			</Paper>

			<Paper className={`${styles.section} ${styles.nameOrigin}`} withBorder>
				<Title order={2} className={styles.sectionTitle || ""} c={titleColor}>
					名前の由来
				</Title>

				<Group gap="lg" align="flex-start">
					<ThemeIcon size="xl" radius="xl" color={isDark ? "blue.4" : "blue"}>
						<IconSticker size={24} />
					</ThemeIcon>

					<Box>
						<Text className={styles.description || ""} mb="md">
							タグを自由自在に付け替え出来るところが、このブログの特徴です。
						</Text>
						<Text className={styles.description || ""}>
							そのイメージが
							<Text span fw={700} c={highlightColor}>
								付箋をぺたぺた貼り替える様子
							</Text>
							と近いので、
							<Text span fw={700} c={highlightColor}>
								Husen(付箋)
							</Text>
							という名前をつけました。
						</Text>
					</Box>
				</Group>
			</Paper>

			<Paper className={`${styles.section} ${styles.development}`} withBorder>
				<Title order={2} className={styles.sectionTitle || ""} c={titleColor}>
					開発について
				</Title>

				<Group gap="lg" align="flex-start">
					<ThemeIcon
						size="xl"
						radius="xl"
						color={isDark ? "blue.4" : "blue"}
						variant="light"
					>
						<IconInfoCircle size={24} />
					</ThemeIcon>

					<Box>
						<Text className={styles.description || ""} mb="md">
							本プロジェクトは、現在
							<Text span fw={700} c={accentColor}>
								アルファ版
							</Text>
							です。
						</Text>
						<Text className={styles.description || ""} mb="md">
							予告なくデータ削除・サービス停止する場合がございます。
						</Text>
						<Text className={styles.description || ""} fw={500}>
							自己責任でのご利用をお願いいたします。
						</Text>
					</Box>
				</Group>
			</Paper>
		</div>
	);
}
