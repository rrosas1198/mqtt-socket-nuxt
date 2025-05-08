import { resolve } from "node:path";
import { cwd } from "node:process";

export function resolveCwd(...segments: string[]) {
    return resolve(cwd(), ...segments);
}
