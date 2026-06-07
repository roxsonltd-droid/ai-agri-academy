import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_KEY = "@agrinexus/mobile_farm_profile_v1";
const WELCOME_KEY = "@agrinexus/welcome_seen";

export type MobileFarmProfile = {
	cultures: string[];
	region: string;
	totalHa: number;
	experience: string;
	completedAt: string;
};

export async function getWelcomeSeen(): Promise<boolean> {
	const v = await AsyncStorage.getItem(WELCOME_KEY);
	return v === "1";
}

export async function setWelcomeSeen(): Promise<void> {
	await AsyncStorage.setItem(WELCOME_KEY, "1");
}

export async function getMobileFarmProfile(): Promise<MobileFarmProfile | null> {
	try {
		const raw = await AsyncStorage.getItem(PROFILE_KEY);
		if (!raw) return null;
		const j = JSON.parse(raw) as MobileFarmProfile;
		if (!j || !j.completedAt) return null;
		return j;
	} catch {
		return null;
	}
}

export async function isMobileOnboardingComplete(): Promise<boolean> {
	const p = await getMobileFarmProfile();
	return p !== null;
}

export async function saveMobileFarmProfile(data: {
	cultures: string[];
	region: string;
	totalHa: number;
	experience: string;
}): Promise<void> {
	const payload: MobileFarmProfile = {
		...data,
		completedAt: new Date().toISOString(),
	};
	await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(payload));
}

/** Clear saved farm profile (e.g. after sign-out / new sign-in on a shared device). */
export async function clearMobileFarmProfileStorage(): Promise<void> {
	await AsyncStorage.removeItem(PROFILE_KEY);
}

/** Dev / reset — clears welcome + profile (optional). */
export async function clearMobileOnboardingFlags(): Promise<void> {
	await AsyncStorage.multiRemove([WELCOME_KEY, PROFILE_KEY]);
}
