import api from "./axiosInstance";
import { handleAPI } from "../utils/apiWrapper";
import type { AuthResponse, LoginRequest, SignupRequest, UpdatePasswordRequest, ValidationResponse, GenericResponse, Health } from "../types";

export const login = (body: LoginRequest) => handleAPI(async () => {
    const { data } = await api.post<AuthResponse>("/api/auth/login", body);
    return data;
});

export const signup = (body: SignupRequest) => handleAPI(async () => {
    const { data } = await api.post<GenericResponse>("/api/auth/signup", body);
    return data;
});

export const validateToken = (token: string) => handleAPI(async () => {
    const { data } = await api.post<ValidationResponse>("/api/auth/validate", { token });
    return data;
});

export const updatePassword = (body: UpdatePasswordRequest) => handleAPI(async () => {
    const { data } = await api.post<GenericResponse>("/api/auth/update-password", body);
    return data;
});

export const getHealth = () => handleAPI(async () => {
    const { data } = await api.get<Health>("/api/auth/health");
    return data;
});