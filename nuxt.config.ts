import { fileURLToPath } from "node:url";
import { getSyncPackageJson } from "./tools/utils/package.util.mjs";

const packageJson = getSyncPackageJson();

export default defineNuxtConfig({
    components: false,
    imports: { autoImport: false },
    compatibilityDate: "2024-11-01",
    devtools: { enabled: true },
    future: { compatibilityVersion: 4 },
    experimental: { watcher: "parcel" },
    alias: {
        src: fileURLToPath(new URL("./app", import.meta.url))
    },
    router: {
        options: {
            linkActiveClass: "link--active",
            linkExactActiveClass: "link--exact-active"
        }
    },
    runtimeConfig: {
        public: {
            version: packageJson.version
        }
    }
});
