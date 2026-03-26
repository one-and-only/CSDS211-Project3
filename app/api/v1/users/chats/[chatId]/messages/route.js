import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/prisma";

export async function GET(request, { params }) {
    const chatId = (await params).chatId;

    if (!chatId) {
        return NextResponse.json({
            success: false,
            error: "Failed to provide a valid chat ID"
        }, { status: 400 });
    }

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

    const chat = await prisma.chats.findFirst({
        where: {
            chatId
        },
        select: {
            chatId: true
        }
    });

    if (chat === null) {
        return NextResponse.json({
            success: false,
            error: "Failed to provide a valid chat ID"
        }, { status: 404 });
    }

    const messageCount = Math.min(10, searchParams.get("messageCount") ?? 10);
    const lastMessageId = searchParams.get("lastMessageId") ?? -1;

    const messages = await prisma.messages.findMany({
        where: {
            chatId
        },
        select: {
            message: true,
            messageId: true,
            createdAt: true,
            userId: true
        },
        orderBy: {
            messageId: "asc"
        },
        take: messageCount,
        cursor: lastMessageId !== -1 ? { messageId: lastMessageId } : undefined,
        skip: lastMessageId !== -1 ? 1 : undefined
    });

    console.log(messages);
    return NextResponse.json({
        success: true,
        messages: messages.map(x => ({
            messageId: Number(x.messageId),
            message: x.message,
            createdAt: x.createdAt,
            userId: Number(x.userId)
        }))
    });
}