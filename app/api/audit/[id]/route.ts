import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const audit = await db.audit.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      url: true,
      status: true,
      failureReason: true,
      createdAt: true,
      completedAt: true,
    },
  });

  if (!audit) {
    return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  }

  return NextResponse.json(audit);
}
