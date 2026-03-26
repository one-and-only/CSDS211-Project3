import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(request, context) {
    const searchParams = await request.nextUrl.searchParams;
    const accessToken = searchParams.get("accessToken");
    if (accessToken === null) {
        return NextResponse.json({
            success: false,
            error: "Failed to provide a valid access token"
        }, { status: 401 });
    }

    const user = await prisma.users.findFirst({
        where: {
            accessToken
        },
        select: {
            userId: true,
            username: true,
            firstName: true,
            lastName: true,
        }
    });

    if (user === null) {
        return NextResponse.json({
            success: false,
            error: "Failed to provide a valid access token"
        }, { status: 401 });
    }

    user.userId = Number(user.userId);
    return NextResponse.json({
        success: true,
        ...user
    });
}