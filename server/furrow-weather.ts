// Open-Meteo API — free, no API key required
// Docs: https://open-meteo.com/en/docs

interface RegionCoord {
	lat: number;
	lon: number;
	name: string;
}

const REGIONS: Record<string, RegionCoord> = {
	'black sea': { lat: 46.5, lon: 31.0, name: 'Black Sea (Ukraine/Russia)' },
	'ukraine': { lat: 49.0, lon: 31.0, name: 'Ukraine' },
	'russia': { lat: 52.0, lon: 39.0, name: 'Russia (Central Black Earth)' },
	'us plains': { lat: 41.0, lon: -99.0, name: 'US Great Plains' },
	'brazil': { lat: -15.0, lon: -50.0, name: 'Brazil (Cerrado)' },
	'argentina': { lat: -35.0, lon: -61.0, name: 'Argentina Pampas' },
	'europe': { lat: 50.0, lon: 10.0, name: 'Western Europe' },
	'australia': { lat: -32.0, lon: 148.0, name: 'Eastern Australia' },
	'india': { lat: 22.0, lon: 78.0, name: 'India' },
	'china': { lat: 35.0, lon: 113.0, name: 'China (North China Plain)' },
};

interface OpenMeteoDaily {
	time: string[];
	temperature_2m_max: number[];
	temperature_2m_min: number[];
	precipitation_sum: number[];
	soil_moisture_0_to_1cm?: number[];
	soil_moisture_1_to_3cm?: number[];
}

interface OpenMeteoResponse {
	daily?: OpenMeteoDaily;
}

async function openMeteoForecast(lat: number, lon: number, signal: AbortSignal): Promise<OpenMeteoResponse> {
	const params = new URLSearchParams({
		latitude: String(lat),
		longitude: String(lon),
		daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm',
		timezone: 'auto',
		forecast_days: '7',
	});
	const url = `https://api.open-meteo.com/v1/forecast?${params}`;
	const res = await fetch(url, { signal });
	if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);
	const data = (await res.json()) as OpenMeteoResponse;
	return data;
}

export async function getWeatherForecast(
	region: string,
	lang: 'en' | 'bg' = 'en',
): Promise<{ ok: boolean; summary: string }> {
	const lowerRegion = region.toLowerCase().trim();
	let coord: RegionCoord | undefined;

	// Try exact match first
	coord = REGIONS[lowerRegion];
	if (!coord) {
		// Try partial match
		const match = Object.entries(REGIONS).find(([key]) => lowerRegion.includes(key) || key.includes(lowerRegion));
		if (match) coord = match[1];
	}

	if (!coord) {
		const available = Object.keys(REGIONS).join(', ');
		return {
			ok: false,
			summary:
				lang === 'en'
					? `Unknown region "${region}". Available: ${available}`
					: `Непознат регион "${region}". Достъпни: ${available}`,
		};
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 10000);
	try {
		const data = await openMeteoForecast(coord.lat, coord.lon, controller.signal);
		const daily = data.daily;
		if (!daily || !daily.time?.length) {
			return { ok: false, summary: 'No forecast data available.' };
		}
		const lines: string[] = [
			lang === 'en' ? `Weather for ${coord.name}` : `Време за ${coord.name}`,
			'',
		];
		for (let i = 0; i < Math.min(7, daily.time.length); i++) {
			const date = daily.time[i];
			const tMax = daily.temperature_2m_max[i];
			const tMin = daily.temperature_2m_min[i];
			const precip = daily.precipitation_sum[i];
			const soil0 = daily.soil_moisture_0_to_1cm?.[i];
			lines.push(
				`${date}: ${tMin}°C..${tMax}°C, ${precip}mm rain` +
					(soil0 !== undefined ? `, soil moisture 0-1cm: ${(soil0 * 100).toFixed(1)}%` : ''),
			);
		}
		return { ok: true, summary: lines.join('\n') };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		return { ok: false, summary: `Weather fetch failed: ${msg}` };
	} finally {
		clearTimeout(timer);
	}
}
