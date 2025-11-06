import api from "./axiosRarf";
import { handleAPI } from "../utils/apiWrapper";
import type { PageResponse, Rarf, RegistrationRequest, FillFeedbackRequest, Stats } from "../types";

export const getRarfCount = () => handleAPI(async () => {
    const { data } = await api.get<number>("/choroid/rarf/count");
    return data;
});

export const getAllRarfs = () => handleAPI(async () => {
    const { data } = await api.get<Rarf[]>("/choroid/rarf");
    return data;
});

export const getBySessionIdPaginated = (id: string) => handleAPI(async () => {
    const { data } = await api.get<PageResponse<Rarf>>(`/choroid/rarf/session/${id}`);
    return data;
});

export const getBySessionId = (id: string) => handleAPI(async () => {
    const { data } = await api.get<Rarf[]>(`/choroid/rarf/session/${id}/all`);
    return data;
});

export const getByUserIdPaginated = (id: string) => handleAPI(async () => {
    const { data } = await api.get<PageResponse<Rarf>>(`/choroid/rarf/user/${id}`);
    return data;
});

export const getByUserId = (id: string) => handleAPI(async () => {
    const { data } = await api.get<Rarf[]>(`/choroid/rarf/user/${id}/all`);
    return data;
});

export const getBySessionIdAndUserId = (sessionId: string, userId: string) => handleAPI(async () => {
    const { data } = await api.get<Rarf>(`/choroid/rarf/session/${sessionId}/user/${userId}`);
    return data;
});

export const getRegisteredCountBySessionId = (id: string) => handleAPI(async () => {
    const { data } = await api.get<number>(`/choroid/rarf/session/${id}/registeredCount`);
    return data;
});

export const getAttendedCountBySessionId = (id: string) => handleAPI(async () => {
    const { data } = await api.get<number>(`/choroid/rarf/session/${id}/attendedCount`);
    return data;
});

export const getRegisteredCountByUserId = (id: string) => handleAPI(async () => {
    const { data } = await api.get<number>(`/choroid/rarf/user/${id}/registeredCount`);
    return data;
});

export const getAttendedCountByUserId = (id: string) => handleAPI(async () => {
    const { data } = await api.get<number>(`/choroid/rarf/user/${id}/attendedCount`);
    return data;
});

export const getStatsBySessionId = (id: string) => handleAPI(async () => {
    const { data } = await api.get<Stats>(`/choroid/rarf/session/${id}/stats`);
    return data;
});

export const getStats = () => handleAPI(async () => {
    const { data } = await api.get<Stats[]>("/choroid/rarf/session/stats");
    return data;
});

export const register = (body: RegistrationRequest) => handleAPI(async () => {
    const { data } = await api.post<Rarf>("/choroid/rarf/register", body);
    return data;
});

export const fillFeedback = (sessionId: string, userId: string, body: FillFeedbackRequest) => handleAPI(async () => {
    const { data } = await api.patch<Rarf>(`/choroid/rarf/session/${sessionId}/user/${userId}`, body);
    return data;
});

export const deleteRarf = (sessionId: string, userId: string) => handleAPI(async () => {
    await api.delete(`/choroid/rarf/session/${sessionId}/user/${userId}`);
});