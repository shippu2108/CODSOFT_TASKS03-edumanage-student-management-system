import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  const exams = await prisma.exam.findMany({
    where: classId ? { classId } : undefined,
    include: { class: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(exams);
}

export async function POST(req: Request) {
  try {
    const { name, classId, date } = await req.json();

    if (!name || !classId || !date) {
      return NextResponse.json(
        { error: "name, classId and date are required" },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        name,
        classId,
        date: new Date(date),
      },
      include: { class: true },
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}