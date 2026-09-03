"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push("/login");
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-[#0F1C33] p-12 text-white md:flex">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-[#C9A227]" />
          <span className="text-xl font-semibold [font-family:var(--font-serif)]">
            EduManage
          </span>
        </div>

        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight [font-family:var(--font-serif)]">
            Built for administrators, teachers, and students alike.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-white/60">
            Create an account to get started with your role-specific
            dashboard.
          </p>
        </div>

        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} EduManage
        </p>
      </div>

      <div className="flex items-center justify-center bg-[#FAFAF7] p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-[#1B2A4A] [font-family:var(--font-serif)]">
            Create your account
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Fill in your details below.
          </p>

          {error && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1B2A4A]">
                Full name
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-[#D8D4C8] bg-white p-2.5 text-[#1B2A4A] placeholder-[#9CA3AF] outline-none focus:border-[#0F1C33] focus:ring-1 focus:ring-[#0F1C33]"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B2A4A]">
                Email
              </label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border border-[#D8D4C8] bg-white p-2.5 text-[#1B2A4A] placeholder-[#9CA3AF] outline-none focus:border-[#0F1C33] focus:ring-1 focus:ring-[#0F1C33]"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B2A4A]">
                Password
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border border-[#D8D4C8] bg-white p-2.5 text-[#1B2A4A] placeholder-[#9CA3AF] outline-none focus:border-[#0F1C33] focus:ring-1 focus:ring-[#0F1C33]"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B2A4A]">
                Role
              </label>
              <select
                className="mt-1 w-full rounded-md border border-[#D8D4C8] bg-white p-2.5 text-[#1B2A4A] outline-none focus:border-[#0F1C33] focus:ring-1 focus:ring-[#0F1C33]"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#0F1C33] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B2A4A] disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-[#6B7280]">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-[#0F1C33] hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}