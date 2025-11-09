import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createSession } from "../../api/sessionApi";
import type { CreateSessionRequest } from "../../types";
import { getUsernameFromToken, isTokenExpired } from "../../utils/jwtUtils";
import Layout from "../../components/Layout";

// Reusable TagsInput component
function TagsInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const tag = input.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
      setInput("");
    }
  };

  const handleRemove = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <div className="flex gap-2 mt-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Add a tag"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {tag}
            <button type="button" onClick={() => handleRemove(tag)}>
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CreateSession() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateSessionRequest>({
    creatorId: "",
    title: "",
    start: "",
    duration: 60,
    tags: [],
    meetingLink: "",
    resourcesLink: "",
  });

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve username from JWT when component mounts
    if (isTokenExpired()) {
      alert("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    const name = getUsernameFromToken();
    if (!name) {
      alert("Could not retrieve username from token. Please log in again.");
      navigate("/login");
      return;
    }

    setUsername(name);
    setForm((prev) => ({ ...prev, creatorId: name }));
  }, [navigate]);

  const mutation = useMutation({
    mutationFn: (data: CreateSessionRequest) => createSession(data),
    onSuccess: (newSession) => {
      navigate(`/sessions/${newSession.id}/view`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!form.creatorId || !form.title || !form.start || !form.duration || form.tags.length === 0) {
      alert("Please fill all required fields and add at least one tag.");
      return;
    }

    mutation.mutate(form);
  };

  const isLoading = mutation.status === "pending";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-center p-10">
          <h1 className="text-3xl font-semibold mb-2">Create Session</h1>
          <p className="opacity-90 text-lg">Fill out the details below</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Read-only Creator ID Display */}
          <div>
            <label className="font-semibold text-gray-700">Creator</label>
            <input
              type="text"
              value={username || "Loading..."}
              readOnly
              disabled
              className="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Title*</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Start (ISO date)*</label>
            <input
              type="datetime-local"
              name="start"
              value={form.start}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Duration (minutes)*</label>
            <input
              type="number"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              min={1}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Tags*</label>
            <TagsInput
              tags={form.tags}
              onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Meeting Link*</label>
            <input
              type="url"
              name="meetingLink"
              value={form.meetingLink}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Resources Link*</label>
            <input
              type="url"
              name="resourcesLink"
              value={form.resourcesLink}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition transform hover:-translate-y-0.5 w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Session"}
          </button>
        </form>
      </div>
    </Layout>
  );
};
