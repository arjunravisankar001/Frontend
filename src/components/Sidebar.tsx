// src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded hover:text-gh-accent ${isActive ? 'text-gh-accent font-semibold' : 'text-gh-text/80'}`;

  return (
    <aside className="w-64 bg-gh-card border-r border-gh-border p-4 flex flex-col gap-2">
      <NavLink to="/" className={linkClass}>Home</NavLink>
      <NavLink to="/about" className={linkClass}>About</NavLink>
      <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
    </aside>
  );
};