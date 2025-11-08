import { createBrowserRouter } from "react-router-dom";
import AllSessions from "./pages/AllSessions";
import OneSession from "./pages/OneSession";
import UpdateSession from "./pages/sessions/UpdateSession";
import CreateSession from "./pages/sessions/CreateSession";
import { getAllSessions, getSessionById } from "./api/sessionApi";
import { queryClient } from "./queryClient";
import SearchSession from "./pages/sessions/SearchSession";
import FillFeedback from "./pages/rarf/FillFeedback";
import ViewSessionFeedback from "./pages/rarf/ViewSessionFeedback";
import ViewSession from "./pages/sessions/ViewSession";
import CreateUser from "./pages/users/CreateUser";
import SearchUser from "./pages/users/SearchUser";
import UpdateUser from "./pages/users/UpdateUser";
import ViewUser from "./pages/users/ViewUser";
import { displayUser } from "./api/userApi";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/SignUp";
import ChangePassword from "./pages/auth/ChangePassword";
import AuthChecker from "./pages/auth/AuthChecker";
import AuthDashboard from "./pages/auth/Dashboard";
import AuthTestInterface from "./pages/auth/AuthTestInterface";
import Dashboard from "./pages/analytics/Dashboard"

const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/signup',
        element: <Signup />
    },
    {
        path: '/change-password',
        element: <ChangePassword />
    },
    {
        path: '/auth-check',
        element: <AuthChecker />
    },
    {
        path: '/dashboard',
        element: <AuthDashboard />
    },
    {
        path: '/auth/test',
        element: <AuthTestInterface />
    },
    {
        path: '/users/create',
        element: <CreateUser />,
    },
    {
        path: '/users/search',
        element: <SearchUser />,
    },
    {
        path: '/users/edit',
        element: <UpdateUser />,
    },
    {
        path: '/users/view/:id',
        element: <ViewUser />,
        loader: async ({ params }) => {
            const id = params.id;
            if (!id) throw new Error("No username");
            return await queryClient.ensureQueryData({
            queryKey: ["user", id],
            queryFn: () => displayUser(id, id),
            staleTime: 1000 * 60 * 5, // optional
        });
        },
    },
    {
        path: '/analytics',
        element: <Dashboard />
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
    {
        path: "/sessions/:id/view",
        element: <ViewSession />,
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
    {
        path: "/sessions/create",
        element: <CreateSession />,
    },
    {
        path: "/sessions/search",
        element: <SearchSession />,
    },
    {
        path: "/sessions/update/:id",
        element: <UpdateSession />,
        loader: async ({ params }) => {
            const id = params.id;
            if (!id) throw new Error("No session id provided");
            return await queryClient.ensureQueryData({
            queryKey: ["session", id],
            queryFn: () => getSessionById(id),
            staleTime: 1000 * 60 * 5,
            });
        },
    },
    {
        path: "/feedback/:sessionId/fill",
        element: <FillFeedback />
    },
    {
        path: "/feedback/:sessionId/view",
        element: <ViewSessionFeedback />
    },
]);

export default router;