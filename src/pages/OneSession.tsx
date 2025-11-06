import { useLoaderData } from "react-router-dom";
import type { Session } from "../types";
import { useQuery } from "@tanstack/react-query";
import { getSessionById } from "../api/sessionApi";

export default function OneSession() {
    const loaderData = useLoaderData() as Session;

    const { data: session } = useQuery<Session>({
        queryKey: ["session", loaderData.id],
        queryFn: () => getSessionById(loaderData.id),
        initialData: loaderData, //uses loader data first
        staleTime: 1000*60*5, //cache for 5 minutes
    });

    return (
        <div>
            <h1>{session.title}</h1>
            <p>Creator: {session.creatorId}</p>
            <p>Start: {session.start.toLocaleString()}</p>
            <p>Duration: {session.duration}</p>
            <p>Tags: {session.tags}</p>
            <a href={session.meetingLink}>Join Meeting</a>
            <a href={session.resourcesLink}>Link to Session Resources</a>
        </div>
    );
};