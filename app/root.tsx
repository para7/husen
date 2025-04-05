import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { Links, Meta, Outlet, Scripts } from "react-router";

const theme = createTheme({
	/** Put your mantine theme override here */
});

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<ColorSchemeScript />
			</head>
			<body>
				<MantineProvider theme={theme} defaultColorScheme="auto">
					{children}
				</MantineProvider>
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
