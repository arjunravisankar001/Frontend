// src/components/Layout.tsx
import { Outlet, useNavigation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import LoadingIndicator from "./LoadingIndicator";
import { useGlobalLoading } from "../utils/loadingManager";

export default function Layout() {
  const navigation = useNavigation();
  const isLoading = useGlobalLoading(navigation.state === "loading");

  return (
    <div className="flex min-h-screen bg-gh-bg text-gh-text font-sans">
      <LoadingIndicator isLoading={isLoading} />

      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};