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
        }
    });

    if (user === null) {
        return NextResponse.json({
            success: false,
            error: "Failed to provide a valid access token"
        }, { status: 401 });
    }

    const friendsList = await prisma.friendRequests.findMany({
        where: {
            targetUserId: user.userId,
            status: "pending"
        },
        select: {
            users_friendRequests_targetUserIdTousers: {
                select: {
                    firstName: true,
                    lastName: true,
                    username: true,
                }
            },
            users_friendRequests_initiatorUserIdTousers: {
                select: {
                    firstName: true,
                    lastName: true,
                    username: true,
                }
            }
        }
    });

    return NextResponse.json({
        success: true,
        friends: friendsList.map(friendEntry => {
            // determine which side of the relationship is the friend (not the current user)
            const friend = Number(friendEntry.users_friendRequests_initiatorUserIdTousers.userId) === user.userId
                ? friendEntry.users_friendRequests_targetUserIdTousers
                : friendEntry.users_friendRequests_initiatorUserIdTousers;

            return {
                firstName: friend.firstName,
                lastName: friend.lastName,
                username: friend.username,
            };
        })
    });
}