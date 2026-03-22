import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(request, context) {
    const searchParams = await request.nextUrl.searchParams;
    const accessToken = searchParams.get("accessToken");
    if (accessToken === null) {
        return NextResponse({
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
        return NextResponse({
            success: false,
            error: "Failed to provide a valid access token"
        }, { status: 401 });
    }

    const chats = await prisma.chats.findMany({
        where: {
            OR: [
                {
                    targetUserId: user.userId
                },
                {
                    initiatorUserId: user.userId
                }
            ]
        },
        select: {
            chatId: true,
            users_chats_initiatorUserIdTousers: {
                select: {
                    userId: true,
                    firstName: true,
                    lastName: true,
                    username: true
                }
            },
            users_chats_targetUserIdTousers: {
                select: {
                    userId: true,
                    firstName: true,
                    lastName: true,
                    username: true
                }
            }
        }
    });

    return NextResponse.json(chats.map(chat => {
        const targetUserObject = chat.users_chats_initiatorUserIdTousers.userId === user.userId ? chat.users_chats_targetUserIdTousers : chat.users_chats_initiatorUserIdTousers;
        
        return {
            chatId: Number(chat.chatId),
            firstName: targetUserObject.firstName,
            lastName: targetUserObject.lastName,
            username: targetUserObject.username,
        };
    }));
}