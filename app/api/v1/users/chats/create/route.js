import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(request, context) {
    const searchParams = await request.nextUrl.searchParams;
    const accessToken = searchParams.get("accessToken");
    const targetUsername = searchParams.get("targetUsername");

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
            userId: true
        }
    });

    if (user === null) {
        return NextResponse.json({
            success: false,
            error: "Failed to provide a valid access token"
        }, { status: 401 });
    }

    const targetUser = await prisma.users.findFirst({
        where: {
            username: targetUsername
        },
        select: {
            userId: true
        }
    });

    if (targetUser === null) {
        return NextResponse.json({
            success: false,
            error: "Target user doesn't exist"
        });
    }

    await prisma.chats.create({
        data: {
            initiatorUserId: user.userId,
            targetUserId: targetUser.userId
        }
    });

    return NextResponse.json({
        success: true
    });
}