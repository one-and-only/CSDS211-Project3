import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PUT(request, context) {
    const searchParams = await request.nextUrl.searchParams;
    const accessToken = searchParams.get("accessToken");
    const initiatorUserName = searchParams.get("rejectedUsername");

    if (accessToken === null) {
        return NextResponse.json({
            success: false,
            error: "Failed to provide a valid access token"
        }, { status: 401 });
    }

    if (initiatorUserName === null) {
        return NextResponse.json({
            success: false,
            error: "Failed to provide valid username"
        });
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

    try {
        await prisma.friendRequests.deleteMany({
            where: {
                targetUserId: user.userId,
                status: "pending",
                users_friendRequests_initiatorUserIdTousers: {
                    username: initiatorUserName
                }
            }
        });

        return NextResponse.json({
            success: true
        });
    } catch {
        return NextResponse.json({
            success: true
        });
    } // delete throws when not finding a record, but this is fine when no friend request exists
}