import api from "./axiosInstance";
import { handleAPI } from "../utils/apiWrapper";
import type { User, SearchQueryUser } from "../types";

export const displayUser = (accessorUsername: string, queryUsername: string) => handleAPI(async () => {
    const { data } = await api.get<User>(`/users/api/${accessorUsername}/view/${queryUsername}`);
    return data;
});

export const updateProfile = (accessorUsername: string, body: User) => handleAPI(async () => {
    const { data } = await api.put<User>(`/users/api/${accessorUsername}/edit`, body);
    return data;
});

export const createProfile = (body: User) => handleAPI(async () => {
    const { data } = await api.post<User>(`/users/api/create`, body);
    return data;
});

export const searchUser = (accessorUsername: string, body: SearchQueryUser) => handleAPI(async () => {
    const { data } = await api.post<User[]>(`/users/api/${accessorUsername}/search`, body);
    return data;
});

export const getTeachList = () => handleAPI(async () => {
    const { data } = await api.get<string[]>("/users/api/topicstoteachlist");
    return data;
});

export const getLearnList = () => handleAPI(async () => {
    const { data } = await api.get<string[]>("/users/api/topicstolearnlist");
    return data;
});

export const checkUsernameHasProfile = (username: string) => handleAPI(async () => {
    const { data } = await api.get<boolean>(`/users/api/checkusername/${username}`);
    return data;
});

export const findEmailGivenUsername = (username: string) => handleAPI(async () => {
    const { data } = await api.get<string>(`/users/api/findemail/${username}`);
    return data;
});

export const listAllUserIds = () => handleAPI(async () => {
    const { data } = await api.get<string[]>("/users/api/listallusers");
    return data;
});