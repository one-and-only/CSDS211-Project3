import { prisma } from "../../../../../lib/prisma";
import { verify as verifyPassword } from "@node-rs/argon2";
import { NextResponse } from 'next/server';

export async function GET(request, context) {
    const searchParams = await request.nextUrl.searchParams;
    const username = searchParams.get("username");
    const password = searchParams.get("password");

    if (username === null || password === null) {
        return NextResponse.json({
            success: false,
            error: "Failed to provide username or password"
        }, { status: 400 });
    }

    const user = await prisma.users.findFirst({
        where: {
            username
        },
        select: {
            accessToken: true,
            password: true
        }
    });

    if (user === null) {
        return NextResponse.json({
            success: false,
            error: "Invalid username or password"
        }, { status: 401 });
    }

    if (!await verifyPassword(user.password, password)) {
        return NextResponse.json({
            success: false,
            error: "Invalid username or password"
        }, { status: 401 });
    }

    return NextResponse.json({
        success: true,
        accessToken: user.accessToken
    });
}