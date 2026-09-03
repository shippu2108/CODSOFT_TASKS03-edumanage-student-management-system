import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      class: true,
      attendance: true,
      results: { include: { exam: true } },
      fees: true,
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student record not found" }, { status: 404 });
  }

  const totalDays = student.attendance.length;
  const presentDays = student.attendance.filter((a) => a.status === "PRESENT").length;
  const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return NextResponse.json({
    name: student.user ? undefined : undefined,
    rollNumber: student.rollNumber,
    class: student.class,
    attendancePercent,
    totalDays,
    presentDays,
    results: student.results.map((r) => ({
      examName: r.exam.name,
      examDate: r.exam.date,
      marks: r.marks,
      maxMarks: r.maxMarks,
    })),
    fees: student.fees.map((f) => ({
      id: f.id,
      amount: f.amount,
      dueDate: f.dueDate,
      paid: f.paid,
    })),
  });
}