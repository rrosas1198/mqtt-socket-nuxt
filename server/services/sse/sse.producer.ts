import type { ISseClient, ISseEvent } from "./sse.interface";

export class SseProducer<E extends ISseEvent<unknown, unknown>> {
    readonly #_clients = new Set<ISseClient>();

    hasClients() {
        return this.#_clients.size > 0;
    }

    register(client: ISseClient) {
        this.#_clients.add(client);
    }

    unregister(client: ISseClient) {
        this.#_clients.delete(client);
    }

    broadcast(event: E) {
        const payload = JSON.stringify(event);

        for (const client of this.#_clients) {
            client.send(`data: ${payload}\n\n`);
        }
    }
}
