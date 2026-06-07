const RSS_FEEDS = [
	{
		id: 'usda-grains',
		url: 'https://www.usda.gov/rss/grains.xml',
		label: 'USDA Grains',
	},
	{
		id: 'fao-grains',
		url: 'https://www.fao.org/news/rss/grain.xml',
		label: 'FAO Grains',
	},
	{
		id: 'minagro-ukraine',
		url: 'https://minagro.gov.ua/rss/news',
		label: 'Мінагрополітики України',
	},
];

async function fetchRss(url: string, signal: AbortSignal): Promise<string> {
	const res = await fetch(url, { signal });
	if (!res.ok) {
		console.warn(`RSS fetch failed: ${url} returned ${res.status}`);
		return '';
	}
	const xml = await res.text();
	const items: string[] = [];
	const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
	let itemMatch: RegExpExecArray | null;
	while ((itemMatch = itemRegex.exec(xml)) !== null) {
		const itemXml = itemMatch[1];
		const title = itemXml.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] ?? '';
		const link = itemXml.match(/<link[^>]*>(.*?)<\/link>/i)?.[1] ?? '';
		const description = itemXml.match(/<description[^>]*>(.*?)<\/description>/i)?.[1] ?? '';
		const cleanDesc = description.replace(/<[^>]*>/g, '').slice(0, 300);
		if (title) {
			items.push(`${title}\n${link}\n${cleanDesc}`);
		}
	}
	return items.slice(0, 5).join('\n---\n');
}

export async function searchNews(query: string, lang: 'en' | 'bg' = 'en'): Promise<string[]> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 10000);
	try {
		const results = await Promise.all(
			RSS_FEEDS.map(async (feed) => {
				try {
					const content = await fetchRss(feed.url, controller.signal);
					if (!content) return null;
					const lowerQuery = query.toLowerCase();
					const lines = content.split('\n');
					const relevant = lines.filter(
						(line) => line.toLowerCase().includes(lowerQuery) || line.toLowerCase().includes('grain'),
					);
					if (relevant.length === 0) return null;
					return `[${feed.label}]\n${relevant.slice(0, 6).join('\n')}`;
				} catch (e) {
					console.warn(`RSS feed ${feed.id} failed:`, e);
					return null;
				}
			}),
		);
		const filtered = results.filter((r): r is string => r !== null);
		if (filtered.length === 0) {
			filtered.push(
				lang === 'en'
					? `No news found for "${query}" from monitored feeds. Try broader keywords.`
					: `Няма новини за "${query}" от наблюдаваните източници.`,
			);
		}
		return filtered;
	} finally {
		clearTimeout(timer);
	}
}
