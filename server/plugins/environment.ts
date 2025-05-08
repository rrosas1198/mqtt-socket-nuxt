import { defineNitroPlugin } from "#imports";
import { ConfigService } from "../services/config";

export default defineNitroPlugin(() => {
    const configService = ConfigService.asGlobalInstance();
    configService.load();
});
