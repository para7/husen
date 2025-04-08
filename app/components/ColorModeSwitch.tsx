import {
	ActionIcon,
	useMantineColorScheme,
	useComputedColorScheme,
} from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

import { IconAdjustments } from "@tabler/icons-react";

export default function ColorModeSwitch() {
	const { setColorScheme } = useMantineColorScheme();
	const computedColorScheme = useComputedColorScheme("light");

	const toggleColorScheme = () => {
		const nextColorScheme = computedColorScheme === "dark" ? "light" : "dark";
		setColorScheme(nextColorScheme);
	};

	return (
		<>
			<ActionIcon
				onClick={toggleColorScheme}
				variant="outline"
				size="lg"
				radius="md"
				aria-label="カラーモードを切り替える"
				// color="blue"
			>
				{computedColorScheme === "dark" ? (
					<IconSun stroke={1.5} />
				) : (
					<IconMoon stroke={1.5} />
				)}
			</ActionIcon>
		</>
	);
}
