// @ts-check
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {(...segments: string[]) => string} */
export const resolveCwd = (...segments) => {
    return resolve(__dirname, "../../", ...segments);
};
