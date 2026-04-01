import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function DELETE(request, context) {
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

    const chat = await prisma.chats.findFirst({
        where: {
            OR: [
                {
                    targetUserId: user.userId,
                    initiatorUserId: targetUser.userId
                },
                {
                    targetUserId: targetUser.userId,
                    initiatorUserId: user.userId
                }
            ]
        },
        select: {
            chatId: true
        }
    });

    await prisma.messages.deleteMany({
        where: {
            chatId: chat.chatId
        }
    });

    await prisma.chats.deleteMany({
        where: {
            OR: [
                {
                    initiatorUserId: user.userId,
                    users_chats_targetUserIdTousers: {
                        username: targetUsername
                    }
                },
                {
                    targetUserId: user.userId,
                    users_chats_initiatorUserIdTousers: {
                        username: targetUsername
                    }
                }
            ]
        }
    });
    try {
    } catch { } // catch-all is fine for safety in case the chat doesn't exist

    return NextResponse.json({
        success: true
    });
}