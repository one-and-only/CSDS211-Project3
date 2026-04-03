import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

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

    if (targetUsername === null) {
        return NextResponse.json({
            success: false,
            error: "Failed to provide valid username"
        }, { status: 400 });
    }

    const user = await prisma.users.findFirst({
        where: {
            accessToken
        },
        select: {
            userId: true,
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
            error: "Failed to provide valid username"
        }, { status: 400 });
    }
    try {
        await prisma.friendRequests.create({
            data: {
                targetUserId: targetUser.userId,
                initiatorUserId: user.userId
            }
        });

        return NextResponse.json({
            success: true
        });
    } catch {
        return NextResponse.json({
            success: true
        });
    }
}