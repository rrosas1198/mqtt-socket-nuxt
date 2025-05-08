import { defineWebSocketHandler } from "h3";
import { logger } from "nuxt/kit";
import { MQTTService } from "../services/mqtt.service";

export default defineWebSocketHandler({
    open(peer) {
        const client = MQTTService.asGlobalInstance();

        client.subscribe("mqtt/topic");

        client.addListener(`${peer.id}_on_message`, (topic, message) => {
            if (topic !== "mqtt/topic") return;

            peer.send(`MQTT message: ${message.toString()}`);
            logger.info("[MQTT] Message received:", message.toString());
        });

        logger.info("[WebSocket] Connection opened");
    },
    // message(_peer, message) {
    //     logger.info("[WebSocket] Message from client:", message);
    // },
    close(peer) {
        const client = MQTTService.asGlobalInstance();
        client.removeListener(`${peer.id}_on_message`);
        logger.info("[WebSocket] Connection closed for peer:", peer.id);
    }
});
