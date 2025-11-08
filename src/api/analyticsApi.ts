import api from "./axiosInstance";
import { handleAPI } from "../utils/apiWrapper";

export const getAverageRating = (queryUsername: string) => handleAPI(async () => {
    const { data } = await api.get<number>(`/analytics/api/avgrating/${queryUsername}`);
    return data;
});

export const getAttendedCount = (queryUsername: string) => handleAPI(async () => {
    const { data } = await api.get<number>(`/analytics/api/countattended/${queryUsername}`);
    return data;
});

export const getConductedCount = (queryUsername: string) => handleAPI(async () => {
    const { data } = await api.get<number>(`/analytics/api/countconducted/${queryUsername}`);
    return data;
});

export const getAverageAttendance = (queryUsername: string) => handleAPI(async () => {
    const { data } = await api.get<number>(`/analytics/api/averageattendance/${queryUsername}`);
    return data;
});

export const getBestRatedSession = (queryUsername: string) => handleAPI(async () => {
    const { data } = await api.get<string>(`/analytics/api/bestratedsession/${queryUsername}`);
    return data;
});

export const getBestAttendedSession = (queryUsername: string) => handleAPI(async () => {
    const { data } = await api.get<string>(`/analytics/api/bestattendedsession/${queryUsername}`);
    return data;
});

export const getUniqueLearners = (queryUsername: string) => handleAPI(async () => {
    const { data } = await api.get<number>(`/analytics/api/countuniquelearners/${queryUsername}`);
    return data;
});

export const getRepeatLearners = (queryUsername: string) => handleAPI(async () => {
    const { data } = await api.get<number>(`/analytics/api/countrepeatlearners/${queryUsername}`);
    return data;
});

export const getTop3Instructors = () => handleAPI(async () => {
    const { data } = await api.get<string[]>("/analytics/api/top3instructors");
    return data;
});

export const getRatingHistogram = (queryUsername: string) => handleAPI(async () => {
    const { data } = await api.get<number[]>(`/analytics/api/ratinghistogram/${queryUsername}`);
    return data;
});

export const getAttendanceTimeline = (queryUsername: string) => handleAPI(async () => {
    const { data } = await api.get<number[]>(`/analytics/api/attendancetimeline/${queryUsername}`);
    return data;
});

export const getAllAnalytics = (username: string) => handleAPI(async () => {
    try {
        const results = await Promise.allSettled([
            getAverageRating(username),
            getAttendedCount(username),
            getConductedCount(username),
            getAverageAttendance(username),
            getBestRatedSession(username),
            getBestAttendedSession(username),
            getUniqueLearners(username),
            getRepeatLearners(username),
        ]);
        //Log which calls failed
        results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`API call ${index} failed:`, result.reason);
        }
      });
      return {
        avgRating: results[0].status === 'fulfilled' ? results[0].value : null,
        attendedCount: results[1].status === 'fulfilled' ? results[1].value : null,
        conductedCount: results[2].status === 'fulfilled' ? results[2].value : null,
        avgAttendance: results[3].status === 'fulfilled' ? results[3].value : null,
        bestRatedSession: results[4].status === 'fulfilled' ? results[4].value : null,
        bestAttendedSession: results[5].status === 'fulfilled' ? results[5].value : null,
        uniqueLearners: results[6].status === 'fulfilled' ? results[6].value : null,
        repeatLearners: results[7].status === 'fulfilled' ? results[7].value : null
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
});