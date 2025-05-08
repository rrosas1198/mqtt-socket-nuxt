import { readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolveCwd } from "../utils/path.util.mjs";

/**
 * @typedef     {object} PackageJSON
 * @property    {string} name - Name
 * @property    {string} version - Version
 */

/**
 * @typedef     {object} PackageJSONVersion
 * @property    {number} major -
 * @property    {number} minor -
 * @property    {number} patch -
 * @property    {boolean} build -
 * @property    {number} buildVersion -
 * @property    {string|null} environment -
 */

/** @type {PackageJSON} */
let packageJson;

/** @return {Promise<PackageJSON>} */
export async function getPackageJson() {
    if (!packageJson) {
        const path = resolveCwd("package.json");
        const file = await readFile(path).then((result) => result.toString());
        packageJson = JSON.parse(file);
    }
    return packageJson;
}

/** @return {PackageJSON} */
export function getSyncPackageJson() {
    if (!packageJson) {
        const path = resolveCwd("package.json");
        const file = readFileSync(path, { encoding: "utf8" });
        packageJson = JSON.parse(file);
    }
    return packageJson;
}

/**
 * @param {PackageJSON} packageJson - Parsed package
 * @param {string} version - New version
 */
export async function writePackageJson(packageJson, version) {
    const path = resolveCwd("package.json");
    const newPackage = Object.assign(packageJson, { version });
    const parsedPackage = JSON.stringify(newPackage, null, 4);
    await writeFile(path, `${parsedPackage}\n`, { encoding: "utf-8" });
}

/**
 * @param {string} version - Parsed version
 * @return {Version}
 */
export function parseVersion(version) {
    const pattern = /^(\d+)\.(\d+)\.(\d+)(?:-(\w+)-(\d+))?(?:-(\w+))?/;
    const [major, minor, patch, build, buildV, env] = (
        version.match(pattern) || []
    ).slice(1);

    return {
        major: Number.parseInt(major, 10) || 0,
        minor: Number.parseInt(minor, 10) || 0,
        patch: Number.parseInt(patch, 10) || 0,
        build: !!build,
        buildVersion: Number.parseInt(buildV, 10) || 0,
        environment: env
    };
}

/**
 * @param {PackageJSONVersion} version - Parsed version
 */
export function toStringVersion(version) {
    const _version = [version.major, version.minor, version.patch];
    const _modifier = [
        version.build ? "build" : null,
        version.build ? version.buildVersion : null
    ];
    return [_version.join("."), ..._modifier].filter(Boolean).join("-");
    // return [_version.join("."), ..._modifier, version.environment].filter(Boolean).join("-");
}
