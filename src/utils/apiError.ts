import { AxiosError } from "axios";

export interface APIError {
    status: number;
    error?: string;
    message: string;
    details?: any;
};

/**
 * Converts an AxiosError into a simpler, consistent APIError.
 */

export function parseAPIError(err: unknown): APIError {
    if (err && (err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError<any>;
        return {
            status: axiosErr.response?.status || 0,
            error: 
                axiosErr.response?.data?.error ||
                "Unknown",
            message:
                axiosErr.response?.data?.message ||
                axiosErr.message ||
                "Unknown error",
            details: axiosErr.response?.data?.details,
        };
    }
    return {
        status: 0,
        message: (err as Error)?.message || "Unknown error",
    };
}