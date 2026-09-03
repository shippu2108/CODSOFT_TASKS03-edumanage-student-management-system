"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [classes, setClasses] = useState<ClassItem[]>([]);

  // Attendance state
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [attendanceMessage, setAttendanceMessage] = useState("");

  // Exam + Results state
  const [examForm, setExamForm] = useState({ name: "", classId: "", date: "" });
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [resultRows, setResultRows] = useState<ResultRow[]>([]);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as any)?.role !== "TEACHER") {
      router.push("/login");
    }
  }, [status, session, router]);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
    fetch("/api/exams")
      .then((res) => res.json())
      .then(setExams);
  }, []);

  // Attendance logic
  const loadAttendance = async () => {
    if (!selectedClass || !selectedDate) return;
    const res = await fetch(
      `/api/attendance?classId=${selectedClass}&date=${selectedDate}`
    );
    setAttendanceRows(await res.json());
    setAttendanceMessage("");
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedClass, selectedDate]);

  const setAttendanceStatus = (studentId: string, newStatus: string) => {
    setAttendanceRows((prev) =>
      prev.map((r) =>
        r.studentId === studentId ? { ...r, status: newStatus } : r
      )
    );
  };

  const handleSaveAttendance = async () => {
    const records = attendanceRows.map((r) => ({
      studentId: r.studentId,
      status: r.status ?? "ABSENT",
    }));

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, records }),
    });

    setAttendanceMessage(
      res.ok ? "Attendance saved successfully!" : "Failed to save attendance."
    );
  };

  // Exam logic
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(examForm),
    });
    if (res.ok) {
      setExamForm({ name: "", classId: "", date: "" });
      const updated = await fetch("/api/exams").then((r) => r.json());
      setExams(updated);
    }
  };

  // Results logic
  const loadResults = async () => {
    if (!selectedExam) return;
    const res = await fetch(`/api/results?examId=${selectedExam}`);
    setResultRows(await res.json());
    setResultMessage("");
  };

  useEffect(() => {
    loadResults();
  }, [selectedExam]);

  const setMarks = (studentId: string, marks: string) => {
    setResultRows((prev) =>
      prev.map((r) =>
        r.studentId === studentId ? { ...r, marks: Number(marks) } : r
      )
    );
  };

  const handleSaveResults = async () => {
    const records = resultRows.map((r) => ({
      studentId: r.studentId,
      marks: r.marks ?? 0,
      maxMarks: r.maxMarks,
    }));

    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId: selectedExam, records }),
    });

    setResultMessage(
      res.ok ? "Results saved successfully!" : "Failed to save results."
    );
  };

  if (status === "loading") return <p className="p-8 text-gray-600">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome, {session?.user?.name}!</p>

      {/* ATTENDANCE SECTION */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800">Mark Attendance</h2>

        <div className="mt-4 flex flex-wrap gap-4">
          <select
            className="rounded border p-2 text-gray-900"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.section}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="rounded border p-2 text-gray-900"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {attendanceMessage && (
          <p className="mt-3 text-sm text-green-600">{attendanceMessage}</p>
        )}

        {attendanceRows.length > 0 && (
          <div className="mt-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">Roll No</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows.map((r) => (
                  <tr key={r.studentId} className="border-b">
                    <td className="py-2 text-gray-800">{r.rollNumber}</td>
                    <td className="py-2 text-gray-800">{r.name}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAttendanceStatus(r.studentId, "PRESENT")}
                          className={`rounded px-3 py-1 text-sm ${
                            r.status === "PRESENT"
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttendanceStatus(r.studentId, "ABSENT")}
                          className={`rounded px-3 py-1 text-sm ${
                            r.status === "ABSENT"
                              ? "bg-red-600 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={handleSaveAttendance}
              className="mt-4 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Save Attendance
            </button>
          </div>
        )}
      </div>

      {/* EXAM CREATION SECTION */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800">Create Exam</h2>

        <form onSubmit={handleCreateExam} className="mt-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Exam Name (e.g. Mid Term)"
            className="rounded border p-2 text-gray-900 placeholder-gray-500"
            value={examForm.name}
            onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
            required
          />
          <select
            className="rounded border p-2 text-gray-900"
            value={examForm.classId}
            onChange={(e) => setExamForm({ ...examForm, classId: e.target.value })}
            required
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.section}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="rounded border p-2 text-gray-900"
            value={examForm.date}
            onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
            required
          />
          <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Create Exam
          </button>
        </form>
      </div>

      {/* RESULTS ENTRY SECTION */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800">Enter Marks</h2>

        <select
          className="mt-4 rounded border p-2 text-gray-900"
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
        >
          <option value="">Select Exam</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name} — {new Date(ex.date).toLocaleDateString()}
            </option>
          ))}
        </select>

        {resultMessage && (
          <p className="mt-3 text-sm text-green-600">{resultMessage}</p>
        )}

        {resultRows.length > 0 && (
          <div className="mt-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">Roll No</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Marks</th>
                </tr>
              </thead>
              <tbody>
                {resultRows.map((r) => (
                  <tr key={r.studentId} className="border-b">
                    <td className="py-2 text-gray-800">{r.rollNumber}</td>
                    <td className="py-2 text-gray-800">{r.name}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        className="w-20 rounded border p-1 text-gray-900"
                        value={r.marks ?? ""}
                        onChange={(e) => setMarks(r.studentId, e.target.value)}
                        max={r.maxMarks}
                        min={0}
                      />{" "}
                      / {r.maxMarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={handleSaveResults}
              className="mt-4 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Save Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}