import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  try {
    const { name, section } = await req.json();

    if (!name || !section) {
      return NextResponse.json(
        { error: "Class name aur section zaroori hai" },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: { name, section },
    });

    return NextResponse.json(newClass);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kuch galat ho gaya" }, { status: 500 });
  }
}