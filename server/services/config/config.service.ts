import { parse } from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import { env } from "node:process";
import { resolveCwd } from "~~/server/utils/resolve.util";

const ENVIRONMENT_NAME = env.NODE_ENV || "development";
const ENVIRONMENT_PATHS = ["environments/default.env", `environments/${ENVIRONMENT_NAME}.env`];

export class ConfigService {
    static #_instance: ConfigService;

    #_loaded: boolean = false;

    static asGlobalInstance() {
        if (!ConfigService.#_instance) {
            ConfigService.#_instance = new ConfigService();
        }
        return ConfigService.#_instance;
    }

    private constructor() {
        //
    }

    load() {
        if (!this.#_loaded) {
            this.#_bindInProcess();
        }
        this.#_loaded = true;
    }

    get<T extends string | number>(key: string): T | undefined {
        return env[key] as T | undefined;
    }

    getOrFail<T extends string | number>(key: string): T {
        const value = env[key] as T | undefined;
        if (value === undefined) {
            throw new Error(`Environment variable ${key} is not set`);
        }
        return value;
    }

    getOrDefault<T extends string | number>(key: string, defaultValue: T): T {
        return (Reflect.get(env, key) as T | undefined) ?? defaultValue;
    }

    #_bindInProcess() {
        const variables = this.#_loadVariables(ENVIRONMENT_PATHS);
        const keys = Object.keys(variables).filter((key) => !(key in env));

        for (const key of keys) {
            env[key] = variables[key];
        }
    }

    #_loadVariables(paths: string[]) {
        const variables = {} as ReturnType<typeof parse>;

        const absolutePaths = paths.map((path) => resolveCwd(path)).filter((path) => existsSync(path));

        for (const filepath of absolutePaths) {
            const parsed = parse(readFileSync(filepath));
            Object.assign(variables, parsed);
        }

        return variables;
    }
}
