"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, Award, Wallet, CalendarClock } from "lucide-react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";

type StudentData = {
  rollNumber: string;
  class: { name: string; section: string };
  attendancePercent: number;
  totalDays: number;
  presentDays: number;
  results: { examName: string; examDate: string; marks: number; maxMarks: number }[];
  fees: { id: string; amount: number; dueDate: string; paid: boolean }[];
};

type LeaveItem = {
  id: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
  adminRemark: string | null;
};

const navItems = [
  { label: "Attendance", href: "#attendance", icon: ClipboardCheck },
  { label: "Results", href: "#results", icon: Award },
  { label: "Fees", href: "#fees", icon: Wallet },
  { label: "Leave", href: "#leave", icon: CalendarClock },
];

const inputClass =
  "rounded-md border border-[#D8D4C8] bg-white p-2.5 text-sm text-[#1B2A4A] placeholder-[#9CA3AF] outline-none focus:border-[#0F1C33] focus:ring-1 focus:ring-[#0F1C33]";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<StudentData | null>(null);

  const [leaveForm, setLeaveForm] = useState({ fromDate: "", toDate: "", reason: "" });
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [leaveMessage, setLeaveMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && (session?.user as any)?.role !== "STUDENT") {
      router.push("/login");
    }
  }, [status, session, router]);

  const loadLeaves = async () => {
    const res = await fetch("/api/leave-requests");
    setLeaves(await res.json());
  };

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "STUDENT") {
      fetch("/api/student-data")
        .then(function (res) {
          return res.json();
        })
        .then(setData);
      loadLeaves();
    }
  }, [status, session]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveMessage("");
    const res = await fetch("/api/leave-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leaveForm),
    });
    if (res.ok) {
      setLeaveForm({ fromDate: "", toDate: "", reason: "" });
      setLeaveMessage("Leave request submitted.");
      loadLeaves();
    } else {
      setLeaveMessage("Failed to submit leave request.");
    }
  };

  if (status === "loading" || !session || !data) {
    return <p className="p-8 text-[#6B7280]">Loading...</p>;
  }

  return (
    <AppShell role="Student" userName={session.user?.name ?? ""} navItems={navItems}>
      <p className="mb-6 text-sm text-[#6B7280]">
        {data.class?.name} — Section {data.class?.section} · Roll no. {data.rollNumber}
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Attendance" id="attendance" accent="#3A5A8C">
          <p className="text-4xl font-semibold text-[#1B2A4A] [font-family:var(--font-serif)]">
            {data.attendancePercent}%
          </p>
          <p className="mt-2 text-sm text-[#6B7280]">
            Present {data.presentDays} of {data.totalDays} days
          </p>
        </Card>

        <Card title="Exam results" id="results" accent="#C9A227">
          {data.results.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No results yet.</p>
          ) : (
            <ul className="divide-y divide-[#E4E1D8]">
              {data.results.map(function (r, i) {
                return (
                  <li key={i} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-[#1B2A4A]">{r.examName}</span>
                    <span className="font-medium text-[#1B2A4A]">
                      {r.marks}/{r.maxMarks}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Fees" id="fees" accent="#3A5A8C">
          {data.fees.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No fee records.</p>
          ) : (
            <ul className="divide-y divide-[#E4E1D8]">
              {data.fees.map(function (f) {
                return (
                  <li key={f.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-[#1B2A4A]">
                      ₹{f.amount} · Due {new Date(f.dueDate).toLocaleDateString()}
                    </span>
                    <span
                      className={
                        f.paid
                          ? "rounded-full px-2.5 py-1 text-xs font-medium bg-[#E9F3EE] text-[#2F7D5D]"
                          : "rounded-full px-2.5 py-1 text-xs font-medium bg-[#FBEAE8] text-[#B4453A]"
                      }
                    >
                      {f.paid ? "Paid" : "Unpaid"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Apply for leave" id="leave" accent="#C9A227">
          <form onSubmit={handleApplyLeave} className="flex flex-wrap gap-3">
            <input
              type="date"
              className={inputClass}
              value={leaveForm.fromDate}
              onChange={function (e) {
                setLeaveForm({ ...leaveForm, fromDate: e.target.value });
              }}
              required
            />
            <input
              type="date"
              className={inputClass}
              value={leaveForm.toDate}
              onChange={function (e) {
                setLeaveForm({ ...leaveForm, toDate: e.target.value });
              }}
              required
            />
            <input
              type="text"
              placeholder="Reason"
              className={inputClass + " min-w-[220px] flex-1"}
              value={leaveForm.reason}
              onChange={function (e) {
                setLeaveForm({ ...leaveForm, reason: e.target.value });
              }}
              required
            />
            <button className="rounded-md bg-[#0F1C33] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B2A4A]">
              Submit request
            </button>
          </form>

          {leaveMessage && (
            <p className="mt-3 text-sm text-[#2F7D5D]">{leaveMessage}</p>
          )}

          {leaves.length > 0 && (
            <ul className="mt-6 divide-y divide-[#E4E1D8]">
              {leaves.map(function (l) {
                return (
                  <li key={l.id} className="py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#1B2A4A]">
                        {new Date(l.fromDate).toLocaleDateString()} —{" "}
                        {new Date(l.toDate).toLocaleDateString()}
                      </span>
                      <span
                        className={
                          l.status === "APPROVED"
                            ? "rounded-full px-2.5 py-1 text-xs font-medium bg-[#E9F3EE] text-[#2F7D5D]"
                            : l.status === "REJECTED"
                            ? "rounded-full px-2.5 py-1 text-xs font-medium bg-[#FBEAE8] text-[#B4453A]"
                            : "rounded-full px-2.5 py-1 text-xs font-medium bg-[#FDF6E3] text-[#B08900]"
                        }
                      >
                        {l.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[#6B7280]">{l.reason}</p>
                    {l.status === "REJECTED" && l.adminRemark && (
                      <p className="mt-1 text-xs text-[#B4453A]">
                        Remark: {l.adminRemark}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}