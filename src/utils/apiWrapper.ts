// utils/apiWrapper.ts
import { parseAPIError } from "../utils/apiError";

export async function handleAPI<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        throw parseAPIError(err);
    }
}
