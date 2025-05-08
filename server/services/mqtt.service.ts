import type { IClientOptions, MqttClient, OnMessageCallback } from "mqtt";
import { connect } from "mqtt";
import { logger } from "nuxt/kit";
import { ConfigService } from "./config.service";

export class MQTTService {
    static #_instance: MQTTService;

    #_client: MqttClient | null = null;
    #_topics: Set<string> = new Set();
    #_listeners: Map<string, OnMessageCallback> = new Map();

    readonly #_logger = logger.withTag("MQTTService");
    readonly #_configService: ConfigService = ConfigService.asGlobalInstance();

    static asGlobalInstance() {
        if (!MQTTService.#_instance) {
            MQTTService.#_instance = new MQTTService();
        }
        return MQTTService.#_instance;
    }

    private constructor() {
        const brokerUrl = this.#_configService.getOrDefault(
            "MQTT_BROKER_URL",
            "mqtt://localhost:1883"
        );
        this.#_client = connect(brokerUrl, this.#_getOptions());
    }

    subscribe(topic: string): void {
        if (this.#_topics.has(topic)) return;

        const client = this.#_getClient();

        client.subscribe(topic, (error) => {
            if (error) {
                this.#_logger.error(`Failed to subscribe to topic ${topic}:`);
                this.#_logger.error(error);
            } else {
                this.#_topics.add(topic);
                this.#_logger.info(`Subscribed to topic: ${topic}`);
            }
        });
    }

    // unsubscribe(topic: string): void {
    //     if (!this.#_topics.has(topic)) return;

    //     const client = this.#_getClient();

    //     client.unsubscribe(topic, (error) => {
    //         if (error) {
    //             this.#_logger.error(`Failed to unsubscribe from topic ${topic}:`);
    //             this.#_logger.error(error);
    //         } else {
    //             this.#_topics.delete(topic);
    //             this.#_logger.info(`Unsubscribed from topic: ${topic}`);
    //         }
    //     });
    // }

    addListener(id: string, handler: OnMessageCallback): void {
        const client = this.#_getClient();
        client.on("message", handler);
        this.#_listeners.set(id, handler);
    }

    removeListener(id: string): void {
        if (!this.#_listeners.has(id)) return;
        const handler = this.#_listeners.get(id)!;
        this.#_listeners.delete(id);

        const client = this.#_getClient();
        client.removeListener("message", handler);
    }

    #_getClient(): MqttClient {
        if (!this.#_client) {
            throw new Error("MQTT client is not initialized");
        }
        return this.#_client;
    }

    #_getOptions(): IClientOptions {
        const connectTimeout = this.#_configService.getOrDefault("MQTT_CONNECT_TIMEOUT", 4000);
        const reconnectPeriod = this.#_configService.getOrDefault("MQTT_RECONNECT_PERIOD", 1000);

        return {
            clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
            clean: true,
            username: "mqtt",
            password: "mqtt",
            connectTimeout,
            reconnectPeriod
        };
    }
}
