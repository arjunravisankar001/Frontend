import { createBrowserRouter } from "react-router-dom";
import AllSessions from "./pages/AllSessions";
import OneSession from "./pages/OneSession";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import { getAllSessions, getSessionById } from "./api/sessionApi";
import { queryClient } from "./queryClient";

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
        { path: "/", element: <Home /> }
        ],
    },
    {
        path: "/sessions",
        element: <AllSessions />,
        loader: async () => {
            // If data is cached and fresh, React Query won't refetch
            return await queryClient.ensureQueryData({
                queryKey: ["sessions"],
                queryFn: getAllSessions,
                staleTime: 1000 * 60 * 5, // optional, cache for 5 minutes
            });
        },
    },
    {
        path: "/sessions/:id",
        element: <OneSession />,
        loader: async ({ params }) => {
            const id = params.id;
            if (!id) throw new Error("No session id");
            return await queryClient.ensureQueryData({
            queryKey: ["session", id],
            queryFn: () => getSessionById(id),
            staleTime: 1000 * 60 * 5, // optional
        });
        },
    },
]);

export default router;