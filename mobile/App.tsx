import { StatusBar } from "expo-status-bar";
import { SafeAreaView, Text, View, StyleSheet } from "react-native";

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ?? "https://agro-academy-backend.onrender.com";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.box}>
        <Text style={styles.title}>AI Agro Academy</Text>
        <Text style={styles.sub}>React Native shell</Text>
        <Text style={styles.mono}>API: {apiUrl}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F9FC" },
  box: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: "#0A2540", marginBottom: 8 },
  sub: { fontSize: 15, color: "#425466", marginBottom: 16 },
  mono: { fontSize: 12, color: "#64748B" },
});
