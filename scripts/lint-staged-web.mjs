/**
 * Runs ESLint (apps/web) on staged paths under apps/web/.
 * Invoked by lint-staged; paths may be POSIX or Windows.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webRoot = path.join(root, "apps", "web");
const raw = process.argv.slice(2);
const underWeb = raw
	.map((f) => f.replace(/\\/g, "/"))
	.filter((f) => f.startsWith("apps/web/") || f.startsWith("apps/web\\"));

if (underWeb.length === 0) process.exit(0);

const rel = underWeb.map((f) => {
	const abs = path.resolve(root, f);
	return path.relative(webRoot, abs).replace(/\\/g, "/");
});

const result = spawnSync("npx", ["eslint", "--max-warnings", "0", "--fix", ...rel], {
	cwd: webRoot,
	stdio: "inherit",
	shell: process.platform === "win32",
	env: process.env,
});

process.exit(result.status ?? 1);
