import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get students of a class with their attendance for a specific date
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const date = searchParams.get("date");

  if (!classId || !date) {
    return NextResponse.json(
      { error: "classId and date are required" },
      { status: 400 }
    );
  }

  const students = await prisma.student.findMany({
    where: { classId },
    include: { user: true },
    orderBy: { rollNumber: "asc" },
  });

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      date: new Date(date),
      studentId: { in: students.map((s) => s.id) },
    },
  });

  const result = students.map((s) => {
    const record = attendanceRecords.find((a) => a.studentId === s.id);
    return {
      studentId: s.id,
      name: s.user.name,
      rollNumber: s.rollNumber,
      status: record?.status ?? null,
    };
  });

  return NextResponse.json(result);
}

// Save attendance for multiple students at once
export async function POST(req: Request) {
  try {
    const { date, records } = await req.json();
    // records = [{ studentId, status }, ...]

    if (!date || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "date and records are required" },
        { status: 400 }
      );
    }

    const attendanceDate = new Date(date);

    await Promise.all(
      records.map((r: { studentId: string; status: string }) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: r.studentId,
              date: attendanceDate,
            },
          },
          update: { status: r.status },
          create: {
            studentId: r.studentId,
            date: attendanceDate,
            status: r.status,
          },
        })
      )
    );

    return NextResponse.json({ message: "Attendance saved" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}