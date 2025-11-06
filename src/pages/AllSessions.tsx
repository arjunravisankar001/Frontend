// import { useLoaderData } from "react-router-dom";
import { Link } from "react-router-dom";
import type { Session } from "../types";
import { queryClient } from "../queryClient";
import { getAllSessions, getSessionById } from "../api/sessionApi";
import { useQuery } from "@tanstack/react-query";

export default function AllSessions() {
    const { data: sessions = [] } = useQuery<Session[]>({
        queryKey: ["sessions"],
        queryFn: () => getAllSessions(),
    });

    const prefetchSession = (id: string) => {
        // Only prefetch if not already cached individually
        if (!queryClient.getQueryData(["session", id])) {
            const sessionFromList = sessions.find((s) => s.id === id);
            if (sessionFromList) {
                // Cache directly from the list
                queryClient.setQueryData(["session", id], sessionFromList);
            } else {
                // Fallback: fetch from API
                queryClient.prefetchQuery({
                    queryKey: ["session", id],
                    queryFn: () => getSessionById(id),
                    staleTime: 1000 * 60 * 5,
                });
            }
        }
    };

    
    // if (!sessions) return <div>Loading...</div>;

    // return (
    // <div>
    //     <h1>Sessions</h1>
    //     <pre>{JSON.stringify(sessions, null, 2)}</pre>
    //     ...
    // </div>
    // );

    return (
        <div>
            <h1>Sessions</h1>
            <ul>
                {sessions.map((s) => (
                    <li key={s.id}>
                        <Link
                            to={`/sessions/${s.id}`}
                            onMouseEnter={() => prefetchSession(s.id)}
                            onFocus={() => prefetchSession(s.id)}
                        >
                            <div>Creator: {s.creatorId}</div>
                            <div>Title: {s.title}</div>
                            <div>Start: {s.start.toLocaleString()}</div>
                            <div>Tags: {s.tags.join(', ')}</div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};