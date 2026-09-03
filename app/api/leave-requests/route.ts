import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  if (role === "ADMIN") {
    const all = await prisma.leaveRequest.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(all);
  }

  const own = await prisma.leaveRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(own);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fromDate, toDate, reason } = await req.json();

    if (!fromDate || !toDate || !reason) {
      return NextResponse.json(
        { error: "fromDate, toDate and reason are required" },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    const leave = await prisma.leaveRequest.create({
      data: {
        userId,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        reason,
      },
    });

    return NextResponse.json(leave);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}