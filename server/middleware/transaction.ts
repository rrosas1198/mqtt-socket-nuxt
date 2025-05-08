import type { H3Event } from "h3";
import { defineEventHandler } from "h3";
import { ulid } from "ulid";

export default defineEventHandler((event: H3Event) => {
    const id = ulid();
    event.context.transactionId = id;
});
