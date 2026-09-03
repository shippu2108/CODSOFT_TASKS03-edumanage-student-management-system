"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, BookOpen, FileEdit, CalendarClock } from "lucide-react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";

type ClassItem = { id: string; name: string; section: string };
type AttendanceRow = {
  studentId: string;
  name: string;
  rollNumber: string;
  status: string | null;
};
type ExamItem = { id: string; name: string; date: string; classId: string };
type ResultRow = {
  studentId: string;
  name: string;
  rollNumber: string;
  marks: number | null;
  maxMarks: number;
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
  { label: "Create exam", href: "#create-exam", icon: BookOpen },
  { label: "Enter marks", href: "#marks", icon: FileEdit },
  { label: "Leave", href: "#leave", icon: CalendarClock },
];

const inputClass =
  "rounded-md border border-[#D8D4C8] bg-white p-2.5 text-sm text-[#1B2A4A] placeholder-[#9CA3AF] outline-none focus:border-[#0F1C33] focus:ring-1 focus:ring-[#0F1C33]";

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [attendanceMessage, setAttendanceMessage] = useState("");

  const [examForm, setExamForm] = useState({ name: "", classId: "", date: "" });
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [resultRows, setResultRows] = useState<ResultRow[]>([]);
  const [resultMessage, setResultMessage] = useState("");

  const [leaveForm, setLeaveForm] = useState({ fromDate: "", toDate: "", reason: "" });
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [leaveMessage, setLeaveMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && (session?.user as any)?.role !== "TEACHER") {
      router.push("/login");
    }
  }, [status, session, router]);

  const loadLeaves = async () => {
    const res = await fetch("/api/leave-requests");
    setLeaves(await res.json());
  };

  useEffect(() => {
    fetch("/api/classes")
      .then(function (res) {
        return res.json();
      })
      .then(setClasses);

    fetch("/api/exams")
      .then(function (res) {
        return res.json();
      })
      .then(setExams);

    loadLeaves();
  }, []);

  const loadAttendance = async () => {
    if (!selectedClass || !selectedDate) return;
    const url = "/api/attendance?classId=" + selectedClass + "&date=" + selectedDate;
    const res = await fetch(url);
    const rows = await res.json();
    setAttendanceRows(rows);
    setAttendanceMessage("");
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedClass, selectedDate]);

  const setAttendanceStatus = (studentId: string, newStatus: string) => {
    setAttendanceRows(function (prev) {
      return prev.map(function (r) {
        if (r.studentId === studentId) {
          return { ...r, status: newStatus };
        }
        return r;
      });
    });
  };

  const handleSaveAttendance = async () => {
    const records = attendanceRows.map(function (r) {
      return {
        studentId: r.studentId,
        status: r.status ?? "ABSENT",
      };
    });

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, records: records }),
    });

    if (res.ok) {
      setAttendanceMessage("Attendance saved successfully.");
    } else {
      setAttendanceMessage("Failed to save attendance.");
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(examForm),
    });
    if (res.ok) {
      setExamForm({ name: "", classId: "", date: "" });
      const updatedRes = await fetch("/api/exams");
      const updated = await updatedRes.json();
      setExams(updated);
    }
  };

  const loadResults = async () => {
    if (!selectedExam) return;
    const url = "/api/results?examId=" + selectedExam;
    const res = await fetch(url);
    const rows = await res.json();
    setResultRows(rows);
    setResultMessage("");
  };

  useEffect(() => {
    loadResults();
  }, [selectedExam]);

  const setMarks = (studentId: string, marksValue: string) => {
    setResultRows(function (prev) {
      return prev.map(function (r) {
        if (r.studentId === studentId) {
          return { ...r, marks: Number(marksValue) };
        }
        return r;
      });
    });
  };

  const handleSaveResults = async () => {
    const records = resultRows.map(function (r) {
      return {
        studentId: r.studentId,
        marks: r.marks ?? 0,
        maxMarks: r.maxMarks,
      };
    });

    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId: selectedExam, records: records }),
    });

    if (res.ok) {
      setResultMessage("Results saved successfully.");
    } else {
      setResultMessage("Failed to save results.");
    }
  };

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

  if (status === "loading" || !session) {
    return <p className="p-8 text-[#6B7280]">Loading...</p>;
  }

  return (
    <AppShell role="Teacher" userName={session.user?.name ?? ""} navItems={navItems}>
      <div className="space-y-6">
        <Card title="Mark attendance" id="attendance" accent="#3A5A8C">
          <div className="flex flex-wrap gap-3">
            <select
              className={inputClass}
              value={selectedClass}
              onChange={function (e) {
                setSelectedClass(e.target.value);
              }}
            >
              <option value="">Select class</option>
              {classes.map(function (c) {
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.section}
                  </option>
                );
              })}
            </select>
            <input
              type="date"
              className={inputClass}
              value={selectedDate}
              onChange={function (e) {
                setSelectedDate(e.target.value);
              }}
            />
          </div>

          {attendanceMessage && (
            <p className="mt-3 text-sm text-[#2F7D5D]">{attendanceMessage}</p>
          )}

          {attendanceRows.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E4E1D8] text-left text-[#6B7280]">
                    <th className="py-2 pr-4 font-medium">Roll no</th>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map(function (r) {
                    return (
                      <tr key={r.studentId} className="border-b border-[#E4E1D8]">
                        <td className="py-2 pr-4 text-[#1B2A4A]">{r.rollNumber}</td>
                        <td className="py-2 pr-4 text-[#1B2A4A]">{r.name}</td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={function () {
                                setAttendanceStatus(r.studentId, "PRESENT");
                              }}
                              className={
                                r.status === "PRESENT"
                                  ? "rounded-full px-3 py-1 text-xs font-medium bg-[#2F7D5D] text-white"
                                  : "rounded-full px-3 py-1 text-xs font-medium bg-[#F1F0EB] text-[#6B7280]"
                              }
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={function () {
                                setAttendanceStatus(r.studentId, "ABSENT");
                              }}
                              className={
                                r.status === "ABSENT"
                                  ? "rounded-full px-3 py-1 text-xs font-medium bg-[#B4453A] text-white"
                                  : "rounded-full px-3 py-1 text-xs font-medium bg-[#F1F0EB] text-[#6B7280]"
                              }
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <button
                onClick={handleSaveAttendance}
                className="mt-4 rounded-md bg-[#0F1C33] px-6 py-2 text-sm font-medium text-white hover:bg-[#1B2A4A]"
              >
                Save attendance
              </button>
            </div>
          )}
        </Card>

        <Card title="Create exam" id="create-exam" accent="#C9A227">
          <form onSubmit={handleCreateExam} className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Exam name (e.g. Mid Term)"
              className={inputClass}
              value={examForm.name}
              onChange={function (e) {
                setExamForm({ ...examForm, name: e.target.value });
              }}
              required
            />
            <select
              className={inputClass}
              value={examForm.classId}
              onChange={function (e) {
                setExamForm({ ...examForm, classId: e.target.value });
              }}
              required
            >
              <option value="">Select class</option>
              {classes.map(function (c) {
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.section}
                  </option>
                );
              })}
            </select>
            <input
              type="date"
              className={inputClass}
              value={examForm.date}
              onChange={function (e) {
                setExamForm({ ...examForm, date: e.target.value });
              }}
              required
            />
            <button className="rounded-md bg-[#0F1C33] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B2A4A]">
              Create exam
            </button>
          </form>
        </Card>

        <Card title="Enter marks" id="marks" accent="#3A5A8C">
          <select
            className={inputClass}
            value={selectedExam}
            onChange={function (e) {
              setSelectedExam(e.target.value);
            }}
          >
            <option value="">Select exam</option>
            {exams.map(function (ex) {
              return (
                <option key={ex.id} value={ex.id}>
                  {ex.name} — {new Date(ex.date).toLocaleDateString()}
                </option>
              );
            })}
          </select>

          {resultMessage && (
            <p className="mt-3 text-sm text-[#2F7D5D]">{resultMessage}</p>
          )}

          {resultRows.length > 0 && (
            <div className="mt-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E4E1D8] text-left text-[#6B7280]">
                    <th className="py-2 pr-4 font-medium">Roll no</th>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 font-medium">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {resultRows.map(function (r) {
                    return (
                      <tr key={r.studentId} className="border-b border-[#E4E1D8]">
                        <td className="py-2 pr-4 text-[#1B2A4A]">{r.rollNumber}</td>
                        <td className="py-2 pr-4 text-[#1B2A4A]">{r.name}</td>
                        <td className="py-2 text-[#1B2A4A]">
                          <input
                            type="number"
                            className="w-20 rounded-md border border-[#D8D4C8] p-1.5 text-sm outline-none focus:border-[#0F1C33]"
                            value={r.marks ?? ""}
                            onChange={function (e) {
                              setMarks(r.studentId, e.target.value);
                            }}
                            max={r.maxMarks}
                            min={0}
                          />{" "}
                          / {r.maxMarks}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <button
                onClick={handleSaveResults}
                className="mt-4 rounded-md bg-[#0F1C33] px-6 py-2 text-sm font-medium text-white hover:bg-[#1B2A4A]"
              >
                Save results
              </button>
            </div>
          )}
        </Card>

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