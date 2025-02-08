import { randomUUID, type UUID } from "crypto";

export { type UUID } from "crypto";

export function uuid(): UUID {
    return randomUUID();
}