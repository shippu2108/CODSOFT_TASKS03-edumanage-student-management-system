import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  const teachers = await prisma.teacher.findMany({
    include: { user: true },
  });
  return NextResponse.json(teachers);
}

export async function POST(req: Request) {
  try {
    const { name, email, password, subject } = await req.json();

    if (!name || !email || !password || !subject) {
      return NextResponse.json(
        { error: "Saari fields zaroori hain" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Ye email pehle se registered hai" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await prisma.teacher.create({
      data: {
        subject,
        user: {
          create: {
            name,
            email,
            password: hashedPassword,
            role: "TEACHER",
          },
        },
      },
      include: { user: true },
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat ho gaya" }, { status: 500 });
  }
}