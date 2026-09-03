import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  const students = await prisma.student.findMany({
    include: { user: true, class: true },
    orderBy: { rollNumber: "asc" },
  });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  try {
    const { name, email, password, rollNumber, classId } = await req.json();

    if (!name || !email || !password || !rollNumber || !classId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await prisma.student.create({
      data: {
        rollNumber,
        class: {
          connect: { id: classId },
        },
        user: {
          create: {
            name,
            email,
            password: hashedPassword,
            role: "STUDENT",
          },
        },
      },
      include: { user: true, class: true },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}