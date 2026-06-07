import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { StyleSheet, Text } from "react-native";
import { LangToggle } from "../../components/LangToggle";
import { useLanguage } from "../../context/LanguageContext";
import { strings } from "../../lib/strings";
import { theme } from "../../lib/theme";

function TabIcon({ glyph, color }: { glyph: string; color: ColorValue }) {
	return (
		<Text style={[styles.tabGlyph, { color }]} accessibilityElementsHidden>
			{glyph}
		</Text>
	);
}

export default function TabsLayout() {
	const { locale } = useLanguage();
	const s = strings(locale);

	return (
		<Tabs
			screenOptions={{
				headerStyle: { backgroundColor: theme.bg },
				headerShadowVisible: false,
				headerTintColor: theme.forest,
				headerTitleStyle: { fontWeight: "700", fontSize: 17 },
				headerRight: () => <LangToggle />,
				tabBarActiveTintColor: theme.forest,
				tabBarInactiveTintColor: theme.muted,
				tabBarStyle: {
					backgroundColor: theme.bg,
					borderTopColor: theme.border,
				},
				tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: s.dashboard.tabTitle,
					tabBarLabel: s.dashboard.tabTitle,
					tabBarIcon: ({ color }) => <TabIcon glyph="⌂" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="tutor"
				options={{
					title: s.tutor.header,
					tabBarLabel: s.tutor.tabTitle,
					tabBarIcon: ({ color }) => <TabIcon glyph="💬" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="academy"
				options={{
					title: s.academy.header,
					tabBarLabel: s.academy.header,
					tabBarIcon: ({ color }) => <TabIcon glyph="▤" color={color} />,
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	tabGlyph: {
		fontSize: 20,
		lineHeight: 24,
		textAlign: "center",
	},
});
