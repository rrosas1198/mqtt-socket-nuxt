import { consola } from "consola";
import type { MqttClient as MqttLibClient, OnMessageCallback, VoidCallback } from "mqtt";
import { connect } from "mqtt";
import { ulid } from "ulid";
import { ConfigService } from "../config";

export class MqttClient {
    static #_instance: MqttClient;

    #_client: MqttLibClient | null = null;

    readonly #_logger = consola.withTag("MqttClient");
    readonly #_handlers = new Map<string, Set<VoidCallback>>();
    readonly #_topicHandlers = new Map<string, Set<OnMessageCallback>>();
    readonly #_configService: ConfigService = ConfigService.asGlobalInstance();

    static asGlobalInstance() {
        if (!MqttClient.#_instance) {
            MqttClient.#_instance = new MqttClient();
        }
        return MqttClient.#_instance;
    }

    private constructor() {
        const options = this.#_getOptions();

        this.#_client = connect(options.url, options);

        this.#_client.on("connect", () => {
            this.#_logger.success("Connected to MQTT broker");

            const handlers = this.#_handlers.get("online");

            if (handlers) {
                for (const handler of handlers) {
                    handler();
                }
            }
        });

        this.#_client.on("message", (topic, payload, packet) => {
            if (!this.#_topicHandlers.has(topic)) return;

            const handlers = this.#_topicHandlers.get(topic)!;

            for (const handler of handlers) {
                handler(topic, payload, packet);
            }
        });

        this.#_client.on("error", (error) => {
            const code = (error as any).code || "UNKNOWN";

            if (code === "ECONNREFUSED") {
                this.#_logger.verbose("Connection refused. Check if the MQTT broker is running.");
            } else {
                this.#_logger.error("Unexpected error in MQTT client:", error.message);
            }
        });

        this.#_client.on("offline", () => {
            this.#_logger.warn("MQTT client is offline");

            const handlers = this.#_handlers.get("offline");

            if (handlers) {
                for (const handler of handlers) {
                    handler();
                }
            }
        });
    }

    subscribe(event: "online" | "offline", handler: VoidCallback) {
        if (!this.#_handlers.has(event)) {
            this.#_handlers.set(event, new Set());
        }
        this.#_handlers.get(event)?.add(handler);
    }

    unsubscribe(event: "online" | "offline", handler: VoidCallback) {
        if (!this.#_handlers.has(event)) return;
        this.#_handlers.get(event)?.delete(handler);
    }

    onTopic(topic: string, handler: OnMessageCallback): void {
        if (this.#_topicHandlers.has(topic)) {
            this.#_topicHandlers.get(topic)?.add(handler);
            return;
        }

        this.#_topicHandlers.set(topic, new Set([handler]));

        this.#_client?.subscribe(topic, (error) => {
            if (error) {
                this.#_logger.error(`Failed to subscribe to topic ${topic}:`);
                this.#_logger.error(error);
            } else {
                this.#_logger.verbose(`Subscribed to topic: ${topic}`);
            }
        });
    }

    offTopic(topic: string, handler?: OnMessageCallback): void {
        if (!this.#_topicHandlers.has(topic)) return;

        const handlers = this.#_topicHandlers.get(topic)!;

        if (handler) {
            handlers.delete(handler);
        }

        if (!handler || handlers.size <= 0) {
            this.#_client?.unsubscribe(topic, (error) => {
                if (error) {
                    this.#_logger.error(`Failed to unsubscribe from topic ${topic}:`);
                    this.#_logger.error(error);
                } else {
                    this.#_logger.verbose(`Unsubscribed from topic: ${topic}`);
                }
            });

            this.#_topicHandlers.delete(topic);
        }
    }

    #_getOptions() {
        const brokerUrl = this.#_configService.getOrDefault("MQTT_BROKER_URL", "mqtt://localhost:1883");
        const connectTimeout = this.#_configService.getOrDefault("MQTT_CONNECT_TIMEOUT", 4000);
        const reconnectPeriod = this.#_configService.getOrDefault("MQTT_RECONNECT_PERIOD", 1000);

        return {
            url: brokerUrl,
            clean: true,
            clientId: ulid(),
            connectTimeout,
            reconnectPeriod
        };
    }
}
