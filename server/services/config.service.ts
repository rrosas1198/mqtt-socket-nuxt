import { env } from "node:process";

export class ConfigService {
    static #_instance: ConfigService;

    static asGlobalInstance() {
        if (!ConfigService.#_instance) {
            ConfigService.#_instance = new ConfigService();
        }
        return ConfigService.#_instance;
    }

    private constructor() {
        //
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
        return (env[key] as T | undefined) ?? defaultValue;
    }
}
