import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return NextResponse.json({ error: "User exists" }, { status: 400 });

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword }
        });

        const token = signToken({ id: user.id, role: user.role });
        return NextResponse.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        return NextResponse.json({ error: "ERR" }, { status: 500 });
    }
}
