import { consola } from "consola";
import type { IPublishPacket, OnMessageCallback } from "mqtt";
import { MqttClient } from "./mqtt.client";
import type { IMqttConsumerHandler } from "./mqtt.interface";

export class MqttConsumer<T = unknown> {
    readonly #_topic: string;
    readonly #_logger = consola.withTag("MqttConsumer");
    readonly #_client = MqttClient.asGlobalInstance();
    readonly #_handlers = new Map<string, OnMessageCallback>();

    constructor(topic: string) {
        this.#_topic = topic;
    }

    subscribe(id: string, handler: IMqttConsumerHandler<T>) {
        if (this.#_handlers.has(id)) return;

        const boundHandler = this.#_boundHandler(handler);
        this.#_handlers.set(id, boundHandler);
        this.#_client.onTopic(this.#_topic, boundHandler);
        this.#_logger.withTag(id).info(`Subscribed to topic ${this.#_topic}`);
    }

    unsubscribe(id: string) {
        if (!this.#_handlers.has(id)) return;

        const handler = this.#_handlers.get(id)!;
        this.#_client.offTopic(this.#_topic, handler);
        this.#_logger.withTag(id).info(`Unsubscribed from topic ${this.#_topic}`);
    }

    #_boundHandler(handler: IMqttConsumerHandler<T>): OnMessageCallback {
        return (topic: string, payload: Buffer, _packet: IPublishPacket) => {
            if (this.#_topic !== topic) return;
            handler(JSON.parse(payload.toString()));
        };
    }
}
