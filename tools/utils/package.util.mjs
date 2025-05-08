import { readFileSync } from "node:fs";
import { resolveCwd } from "../utils/path.util.mjs";

/**
 * @typedef     {object} PackageJSON
 * @property    {string} name - Name
 * @property    {string} version - Version
 */

/** @type {PackageJSON} */
let packageJson;

/** @return {PackageJSON} */
export function getSyncPackageJson() {
    if (!packageJson) {
        const path = resolveCwd("package.json");
        const file = readFileSync(path, { encoding: "utf8" });
        packageJson = JSON.parse(file);
    }
    return packageJson;
}
