/**
 * Syncs content/academy/courses (per-folder course.json) and Markdown to web public,
 * apps/web/src/content/academy.catalog.json, and apps/mobile/lib/academy.catalog.json.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_COURSES = path.join(ROOT, "content", "academy", "courses");
const WEB_LECTURES = path.join(ROOT, "apps", "web", "public", "lectures");
const WEB_SRC = path.join(ROOT, "apps", "web", "src", "content");
const MOBILE_LIB = path.join(ROOT, "apps", "mobile", "lib");

function loadCourses() {
	const dirs = fs
		.readdirSync(CONTENT_COURSES, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name)
		.sort();

	const courses = [];
	for (const dir of dirs) {
		const metaPath = path.join(CONTENT_COURSES, dir, "course.json");
		if (!fs.existsSync(metaPath)) {
			console.warn("[sync-academy] skip " + dir + " (no course.json)");
			continue;
		}
		const raw = fs.readFileSync(metaPath, "utf8");
		const c = JSON.parse(raw);
		if (c.slug !== dir) {
			console.warn("[sync-academy] folder " + dir + " slug=" + c.slug);
		}
		for (const lec of c.lectures) {
			const src = path.join(CONTENT_COURSES, dir, lec.filename);
			if (!fs.existsSync(src)) {
				throw new Error("Missing lecture file: " + src);
			}
			const dest = path.join(WEB_LECTURES, lec.file);
			fs.mkdirSync(path.dirname(dest), { recursive: true });
			fs.copyFileSync(src, dest);
		}
		courses.push(c);
	}
	return courses;
}

function main() {
	const courses = loadCourses();
	const catalog = {
		version: 1,
		generatedAt: new Date().toISOString(),
		courses,
	};
	const json = JSON.stringify(catalog, null, 2);
	fs.mkdirSync(WEB_SRC, { recursive: true });
	fs.mkdirSync(MOBILE_LIB, { recursive: true });
	fs.writeFileSync(path.join(WEB_SRC, "academy.catalog.json"), json);
	fs.writeFileSync(path.join(MOBILE_LIB, "academy.catalog.json"), json);
	console.log("[sync-academy] " + courses.length + " courses synced");
}

main();
