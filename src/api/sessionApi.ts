import api from "./axiosSession";
import { handleAPI } from "../utils/apiWrapper";
import type { PageResponse, Session, CreateSessionRequest, SearchSessionRequest, UpdateSessionRequest } from "../types";

export const getSessionCount = () => handleAPI(async () => {
    const { data } = await api.get<number>("/choroid/sessions/count");
    return data;
});

export const getAllSessions = () => handleAPI(async () => {
    const { data } = await api.get<Session[]>("/choroid/sessions");
    return data;
});

export const getSessionById = (id: string) => handleAPI(async () => {
    const { data } = await api.get<Session>(`/choroid/sessions/${id}`);
    return data;
});

export const getTags = () => handleAPI(async () => {
    const { data } = await api.get<string[]>("/choroid/sessions/tags");
    return data;
});

export const createSession = (body: CreateSessionRequest) => handleAPI(async () => {
    const { data } = await api.post<Session>("/choroid/sessions", body);
    return data;
});

export const searchSessions = (body: SearchSessionRequest) => handleAPI(async () => {
    const { data } = await api.post<PageResponse<Session>>("/choroid/sessions/search", body);
    return data;
});

export const updateSession = (id: string, body: UpdateSessionRequest) => handleAPI(async () => {
    const { data } = await api.patch<Session>(`/choroid/sessions/${id}`, body);
    return data;
});

export const deleteSession = (id: string) => handleAPI(async () => {
    await api.delete(`/choroid/sessions/${id}`);
});