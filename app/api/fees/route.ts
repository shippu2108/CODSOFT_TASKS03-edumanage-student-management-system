import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  const fees = await prisma.fee.findMany({
    where: studentId ? { studentId } : undefined,
    include: { student: { include: { user: true } } },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(fees);
}

export async function POST(req: Request) {
  try {
    const { studentId, amount, dueDate } = await req.json();

    if (!studentId || !amount || !dueDate) {
      return NextResponse.json(
        { error: "studentId, amount and dueDate are required" },
        { status: 400 }
      );
    }

    const fee = await prisma.fee.create({
      data: {
        studentId,
        amount: Number(amount),
        dueDate: new Date(dueDate),
      },
      include: { student: { include: { user: true } } },
    });

    return NextResponse.json(fee);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}