import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get students of an exam's class with their existing marks (if any)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const examId = searchParams.get("examId");

  if (!examId) {
    return NextResponse.json({ error: "examId is required" }, { status: 400 });
  }

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  const students = await prisma.student.findMany({
    where: { classId: exam.classId },
    include: { user: true },
    orderBy: { rollNumber: "asc" },
  });

  const results = await prisma.result.findMany({
    where: { examId, studentId: { in: students.map((s) => s.id) } },
  });

  const data = students.map((s) => {
    const r = results.find((res) => res.studentId === s.id);
    return {
      studentId: s.id,
      name: s.user.name,
      rollNumber: s.rollNumber,
      marks: r?.marks ?? null,
      maxMarks: r?.maxMarks ?? 100,
    };
  });

  return NextResponse.json(data);
}

// Save/update marks for multiple students at once
export async function POST(req: Request) {
  try {
    const { examId, records } = await req.json();
    // records = [{ studentId, marks, maxMarks }, ...]

    if (!examId || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "examId and records are required" },
        { status: 400 }
      );
    }

    await Promise.all(
      records.map(
        (r: { studentId: string; marks: number; maxMarks: number }) =>
          prisma.result.upsert({
            where: {
              studentId_examId: {
                studentId: r.studentId,
                examId,
              },
            },
            update: { marks: r.marks, maxMarks: r.maxMarks },
            create: {
              studentId: r.studentId,
              examId,
              marks: r.marks,
              maxMarks: r.maxMarks,
            },
          })
      )
    );

    return NextResponse.json({ message: "Results saved" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}