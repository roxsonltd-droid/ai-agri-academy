import { useCallback, useMemo, useRef, useState } from "react";
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { postTutorChat } from "../../lib/api";
import { strings } from "../../lib/strings";
import { theme } from "../../lib/theme";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export default function TutorScreen() {
	const { locale } = useLanguage();
	const s = strings(locale);
	const t = s.tutor;
	const { token, email, ready } = useAuth();
	const [input, setInput] = useState("");
	const [busy, setBusy] = useState(false);
	const [messages, setMessages] = useState<Msg[]>([]);
	const threadId = useRef(`mobile_${email ?? "guest"}_${Date.now().toString(36)}`);
	const userId = email ?? "mobile_guest";

	const chips = useMemo(() => [t.chip1, t.chip2, t.chip3], [t.chip1, t.chip2, t.chip3]);

	const send = useCallback(
		async (text: string) => {
			const q = text.trim();
			if (!q || busy || !ready) return;
			setBusy(true);
			const userMsg: Msg = { id: `u_${Date.now()}`, role: "user", text: q };
			setMessages((m) => [...m, userMsg]);
			setInput("");
			try {
				const data = await postTutorChat(token, {
					question: q,
					userId,
					threadId: threadId.current,
					mode: "general",
				});
				const answer = typeof data.answer === "string" ? data.answer : "";
				if (!answer.trim()) {
					setMessages((m) => [
						...m,
						{
							id: `a_${Date.now()}`,
							role: "assistant",
							text: `${t.errorPrefix}: ${data.error ?? "empty"}`,
						},
					]);
				} else {
					setMessages((m) => [...m, { id: `a_${Date.now()}`, role: "assistant", text: answer }]);
				}
			} catch (e) {
				const msg = e instanceof Error ? e.message : "error";
				setMessages((m) => [...m, { id: `a_${Date.now()}`, role: "assistant", text: `${t.errorPrefix}: ${msg}` }]);
			} finally {
				setBusy(false);
			}
		},
		[busy, ready, token, userId, t.errorPrefix],
	);

	return (
		<KeyboardAvoidingView
			style={styles.flex}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
		>
			{messages.length === 0 ? (
				<View style={styles.emptyWrap}>
					<Text style={styles.empty}>{t.empty}</Text>
					<Text style={styles.suggestLabel}>{t.suggestions}</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
						{chips.map((c) => (
							<Pressable key={c} style={({ pressed }) => [styles.chip, pressed && styles.pressed]} onPress={() => void send(c)}>
								<Text style={styles.chipText}>{c}</Text>
							</Pressable>
						))}
					</ScrollView>
				</View>
			) : (
				<FlatList
					style={styles.listFlex}
					data={messages}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.list}
					renderItem={({ item }) => (
						<View style={[styles.bubbleWrap, item.role === "user" ? styles.bubbleUser : styles.bubbleAi]}>
							<Text
								style={[
									styles.bubbleRole,
									item.role === "assistant" && styles.bubbleRoleAi,
								]}
							>
								{item.role === "user" ? (locale === "bg" ? "Ти" : "You") : "Tutor"}
							</Text>
							<Text style={[styles.bubbleText, item.role === "assistant" && styles.bubbleTextAi]}>{item.text}</Text>
						</View>
					)}
				/>
			)}
			<View style={styles.composer}>
				<TextInput
					style={styles.input}
					value={input}
					onChangeText={setInput}
					placeholder={t.placeholder}
					placeholderTextColor={theme.muted}
					multiline
					maxLength={2000}
					editable={!busy && ready}
				/>
				<Pressable
					style={({ pressed }) => [styles.send, (pressed || busy) && styles.sendDisabled]}
					onPress={() => void send(input)}
					disabled={busy || !ready}
				>
					<Text style={styles.sendLabel}>{busy ? t.sending : t.send}</Text>
				</Pressable>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	flex: { flex: 1, backgroundColor: theme.bg },
	listFlex: { flex: 1 },
	emptyWrap: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
	empty: { fontSize: 15, lineHeight: 22, color: theme.muted2 },
	suggestLabel: { marginTop: 16, fontSize: 13, fontWeight: "700", color: theme.ink },
	chipsRow: { gap: 8, paddingVertical: 12, paddingRight: 20 },
	chip: {
		maxWidth: 280,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 12,
		backgroundColor: theme.bgCard,
		borderWidth: 1,
		borderColor: theme.border,
	},
	chipText: { fontSize: 13, lineHeight: 18, color: theme.ink },
	list: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 8, gap: 10 },
	bubbleWrap: {
		maxWidth: "92%",
		padding: 12,
		borderRadius: 14,
		marginBottom: 8,
	},
	bubbleUser: { alignSelf: "flex-end", backgroundColor: theme.forest },
	bubbleAi: { alignSelf: "flex-start", backgroundColor: theme.bgCard, borderWidth: 1, borderColor: theme.border },
	bubbleRole: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.85)", marginBottom: 4 },
	bubbleRoleAi: { color: theme.forest },
	bubbleText: { fontSize: 15, lineHeight: 22, color: "#fff" },
	bubbleTextAi: { color: theme.ink },
	composer: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderTopWidth: 1,
		borderTopColor: theme.border,
		backgroundColor: theme.bg,
	},
	input: {
		flex: 1,
		minHeight: 44,
		maxHeight: 120,
		borderWidth: 1,
		borderColor: theme.border,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
		color: theme.ink,
		backgroundColor: theme.bgCard,
	},
	send: {
		backgroundColor: theme.forest,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
	},
	sendDisabled: { opacity: 0.65 },
	sendLabel: { color: "#fff", fontWeight: "800", fontSize: 14 },
	pressed: { opacity: 0.88 },
});
