import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../../lib/prisma";

export async function POST(request, { params }) {
    const chatId = (await params).chatId;
    const body = await request.json();
    const text = body.message;

    if (!text) {
        return NextResponse.json({
            success: false,
            error: "Failed to provide message"
        }, { status: 400 })
    }

    if (!chatId) {
        return NextResponse.json({
            success: false,
            error: "Failed to provide a valid chat ID"
        }, { status: 400 });
    }

    const chat = await prisma.chats.findFirst({
        where: {
            chatId
        },
        select: {
            chatId: true,
            initiatorUserId: true,
            targetUserId: true
        }
    });

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
            userId: true
        }
    });

    if (user === null) {
        return NextResponse.json({
            success: false,
            error: "Failed to provide a valid access token"
        }, { status: 401 });
    }

    const message = await prisma.messages.create({
        data: {
            chatId,
            message: text,
            userId: user.userId
        }
    });

    return NextResponse.json({
        success: true,
        messageId: Number(message.messageId),
        createdAt: message.createdAt,
        userId: Number(message.userId)
    });
}