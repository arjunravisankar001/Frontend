// src/components/Navbar.tsx
export default function Navbar() {
  return (
    <header className="w-full bg-gh-card border-b border-gh-border p-4 flex justify-between items-center">
      <h1 className="text-gh-accent font-bold text-lg">Choroid</h1>
      <div className="flex gap-4">
        <button className="text-gh-text hover:text-gh-accent">Profile</button>
        <button className="text-gh-text hover:text-gh-accent">Settings</button>
      </div>
    </header>
  );
};