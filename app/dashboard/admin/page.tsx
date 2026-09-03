"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Users, GraduationCap, Wallet, CalendarClock } from "lucide-react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";

type ClassItem = { id: string; name: string; section: string };
type StudentItem = {
  id: string;
  rollNumber: string;
  user: { name: string; email: string };
  class: { name: string; section: string };
};
type TeacherItem = {
  id: string;
  subject: string;
  user: { name: string; email: string };
};
type FeeItem = {
  id: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  student: { rollNumber: string; user: { name: string } };
};
type LeaveItem = {
  id: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
  adminRemark: string | null;
  user: { name: string; role: string };
};

const navItems = [
  { label: "Classes", href: "#classes", icon: LayoutGrid },
  { label: "Students", href: "#students", icon: GraduationCap },
  { label: "Teachers", href: "#teachers", icon: Users },
  { label: "Fees", href: "#fees", icon: Wallet },
  { label: "Leave requests", href: "#leaves", icon: CalendarClock },
];

const inputClass =
  "w-full rounded-md border border-[#D8D4C8] bg-white p-2.5 text-sm text-[#1B2A4A] placeholder-[#9CA3AF] outline-none focus:border-[#0F1C33] focus:ring-1 focus:ring-[#0F1C33]";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);

  const [classForm, setClassForm] = useState({ name: "", section: "" });
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    classId: "",
  });
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
  });
  const [feeForm, setFeeForm] = useState({ studentId: "", amount: "", dueDate: "" });

  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.push("/login");
    }
  }, [status, session, router]);

  const fetchAll = async () => {
    const classesRes = await fetch("/api/classes");
    const studentsRes = await fetch("/api/students");
    const teachersRes = await fetch("/api/teachers");
    const feesRes = await fetch("/api/fees");
    const leavesRes = await fetch("/api/leave-requests");

    setClasses(await classesRes.json());
    setStudents(await studentsRes.json());
    setTeachers(await teachersRes.json());
    setFees(await feesRes.json());
    setLeaves(await leavesRes.json());
  };

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "ADMIN") {
      fetchAll();
    }
  }, [status, session]);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(classForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setClassForm({ name: "", section: "" });
    fetchAll();
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setStudentForm({ name: "", email: "", password: "", rollNumber: "", classId: "" });
    fetchAll();
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teacherForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setTeacherForm({ name: "", email: "", password: "", subject: "" });
    fetchAll();
  };

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/fees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feeForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setFeeForm({ studentId: "", amount: "", dueDate: "" });
    fetchAll();
  };

  const handleMarkPaid = async (feeId: string) => {
    await fetch("/api/fees/" + feeId, { method: "PATCH" });
    fetchAll();
  };

  const handleApproveLeave = async (leaveId: string) => {
    await fetch("/api/leave-requests/" + leaveId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    fetchAll();
  };

  const handleRejectLeave = async (leaveId: string) => {
    const remark = window.prompt("Reason for rejection:");
    if (remark === null) return;
    await fetch("/api/leave-requests/" + leaveId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED", adminRemark: remark }),
    });
    fetchAll();
  };

  if (status === "loading" || !session) {
    return <p className="p-8 text-[#6B7280]">Loading...</p>;
  }

  return (
    <AppShell role="Administrator" userName={session.user?.name ?? ""} navItems={navItems}>
      {error && (
        <p className="mb-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[#E4E1D8] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
            Students
          </p>
          <p className="mt-1 text-3xl font-semibold text-[#1B2A4A] [font-family:var(--font-serif)]">
            {students.length}
          </p>
        </div>
        <div className="rounded-lg border border-[#E4E1D8] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
            Teachers
          </p>
          <p className="mt-1 text-3xl font-semibold text-[#1B2A4A] [font-family:var(--font-serif)]">
            {teachers.length}
          </p>
        </div>
        <div className="rounded-lg border border-[#E4E1D8] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
            Classes
          </p>
          <p className="mt-1 text-3xl font-semibold text-[#1B2A4A] [font-family:var(--font-serif)]">
            {classes.length}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Classes" id="classes" accent="#C9A227">
          <form onSubmit={handleAddClass} className="space-y-3">
            <input
              type="text"
              placeholder="Class name"
              className={inputClass}
              value={classForm.name}
              onChange={function (e) {
                setClassForm({ ...classForm, name: e.target.value });
              }}
              required
            />
            <input
              type="text"
              placeholder="Section"
              className={inputClass}
              value={classForm.section}
              onChange={function (e) {
                setClassForm({ ...classForm, section: e.target.value });
              }}
              required
            />
            <button className="w-full rounded-md bg-[#0F1C33] py-2 text-sm font-medium text-white hover:bg-[#1B2A4A]">
              Add class
            </button>
          </form>
          <ul className="mt-4 divide-y divide-[#E4E1D8]">
            {classes.map(function (c) {
              return (
                <li key={c.id} className="py-2 text-sm text-[#1B2A4A]">
                  {c.name} <span className="text-[#6B7280]">— Section {c.section}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Students" id="students" accent="#3A5A8C">
          <form onSubmit={handleAddStudent} className="space-y-3">
            <input
              type="text"
              placeholder="Full name"
              className={inputClass}
              value={studentForm.name}
              onChange={function (e) {
                setStudentForm({ ...studentForm, name: e.target.value });
              }}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className={inputClass}
              value={studentForm.email}
              onChange={function (e) {
                setStudentForm({ ...studentForm, email: e.target.value });
              }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className={inputClass}
              value={studentForm.password}
              onChange={function (e) {
                setStudentForm({ ...studentForm, password: e.target.value });
              }}
              required
            />
            <input
              type="text"
              placeholder="Roll number"
              className={inputClass}
              value={studentForm.rollNumber}
              onChange={function (e) {
                setStudentForm({ ...studentForm, rollNumber: e.target.value });
              }}
              required
            />
            <select
              className={inputClass}
              value={studentForm.classId}
              onChange={function (e) {
                setStudentForm({ ...studentForm, classId: e.target.value });
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
            <button className="w-full rounded-md bg-[#0F1C33] py-2 text-sm font-medium text-white hover:bg-[#1B2A4A]">
              Add student
            </button>
          </form>
          <ul className="mt-4 max-h-56 divide-y divide-[#E4E1D8] overflow-y-auto">
            {students.map(function (s) {
              return (
                <li key={s.id} className="py-2 text-sm text-[#1B2A4A]">
                  {s.user.name}{" "}
                  <span className="text-[#6B7280]">
                    ({s.rollNumber}) — {s.class.name} {s.class.section}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Teachers" id="teachers" accent="#C9A227">
          <form onSubmit={handleAddTeacher} className="space-y-3">
            <input
              type="text"
              placeholder="Full name"
              className={inputClass}
              value={teacherForm.name}
              onChange={function (e) {
                setTeacherForm({ ...teacherForm, name: e.target.value });
              }}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className={inputClass}
              value={teacherForm.email}
              onChange={function (e) {
                setTeacherForm({ ...teacherForm, email: e.target.value });
              }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className={inputClass}
              value={teacherForm.password}
              onChange={function (e) {
                setTeacherForm({ ...teacherForm, password: e.target.value });
              }}
              required
            />
            <input
              type="text"
              placeholder="Subject"
              className={inputClass}
              value={teacherForm.subject}
              onChange={function (e) {
                setTeacherForm({ ...teacherForm, subject: e.target.value });
              }}
              required
            />
            <button className="w-full rounded-md bg-[#0F1C33] py-2 text-sm font-medium text-white hover:bg-[#1B2A4A]">
              Add teacher
            </button>
          </form>
          <ul className="mt-4 divide-y divide-[#E4E1D8]">
            {teachers.map(function (t) {
              return (
                <li key={t.id} className="py-2 text-sm text-[#1B2A4A]">
                  {t.user.name} <span className="text-[#6B7280]">— {t.subject}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Fees management" id="fees" accent="#3A5A8C">
          <form onSubmit={handleAddFee} className="flex flex-wrap gap-3">
            <select
              className={inputClass + " max-w-xs"}
              value={feeForm.studentId}
              onChange={function (e) {
                setFeeForm({ ...feeForm, studentId: e.target.value });
              }}
              required
            >
              <option value="">Select student</option>
              {students.map(function (s) {
                return (
                  <option key={s.id} value={s.id}>
                    {s.user.name} ({s.rollNumber})
                  </option>
                );
              })}
            </select>
            <input
              type="number"
              placeholder="Amount"
              className={inputClass + " max-w-[140px]"}
              value={feeForm.amount}
              onChange={function (e) {
                setFeeForm({ ...feeForm, amount: e.target.value });
              }}
              required
            />
            <input
              type="date"
              className={inputClass + " max-w-[170px]"}
              value={feeForm.dueDate}
              onChange={function (e) {
                setFeeForm({ ...feeForm, dueDate: e.target.value });
              }}
              required
            />
            <button className="rounded-md bg-[#0F1C33] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B2A4A]">
              Add fee
            </button>
          </form>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E4E1D8] text-left text-[#6B7280]">
                  <th className="py-2 pr-4 font-medium">Student</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Due date</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(function (f) {
                  return (
                    <tr key={f.id} className="border-b border-[#E4E1D8]">
                      <td className="py-2 pr-4 text-[#1B2A4A]">
                        {f.student.user.name} ({f.student.rollNumber})
                      </td>
                      <td className="py-2 pr-4 text-[#1B2A4A]">₹{f.amount}</td>
                      <td className="py-2 pr-4 text-[#1B2A4A]">
                        {new Date(f.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={
                            f.paid
                              ? "rounded-full px-2.5 py-1 text-xs font-medium bg-[#E9F3EE] text-[#2F7D5D]"
                              : "rounded-full px-2.5 py-1 text-xs font-medium bg-[#FBEAE8] text-[#B4453A]"
                          }
                        >
                          {f.paid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="py-2">
                        {!f.paid && (
                          <button
                            onClick={function () {
                              handleMarkPaid(f.id);
                            }}
                            className="rounded-md bg-[#2F7D5D] px-3 py-1 text-xs font-medium text-white hover:bg-[#26654B]"
                          >
                            Mark paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Leave requests" id="leaves" accent="#C9A227">
          {leaves.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No leave requests.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E4E1D8] text-left text-[#6B7280]">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Role</th>
                    <th className="py-2 pr-4 font-medium">From</th>
                    <th className="py-2 pr-4 font-medium">To</th>
                    <th className="py-2 pr-4 font-medium">Reason</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(function (l) {
                    return (
                      <tr key={l.id} className="border-b border-[#E4E1D8] align-top">
                        <td className="py-2 pr-4 text-[#1B2A4A]">{l.user.name}</td>
                        <td className="py-2 pr-4 text-[#6B7280]">{l.user.role}</td>
                        <td className="py-2 pr-4 text-[#1B2A4A]">
                          {new Date(l.fromDate).toLocaleDateString()}
                        </td>
                        <td className="py-2 pr-4 text-[#1B2A4A]">
                          {new Date(l.toDate).toLocaleDateString()}
                        </td>
                        <td className="py-2 pr-4 text-[#1B2A4A]">
                          {l.reason}
                          {l.status === "REJECTED" && l.adminRemark && (
                            <p className="mt-1 text-xs text-[#B4453A]">
                              Remark: {l.adminRemark}
                            </p>
                          )}
                        </td>
                        <td className="py-2 pr-4">
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
                        </td>
                        <td className="py-2">
                          {l.status === "PENDING" && (
                            <div className="flex gap-2">
                              <button
                                onClick={function () {
                                  handleApproveLeave(l.id);
                                }}
                                className="rounded-md bg-[#2F7D5D] px-3 py-1 text-xs font-medium text-white hover:bg-[#26654B]"
                              >
                                Approve
                              </button>
                              <button
                                onClick={function () {
                                  handleRejectLeave(l.id);
                                }}
                                className="rounded-md bg-[#B4453A] px-3 py-1 text-xs font-medium text-white hover:bg-[#963A31]"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}