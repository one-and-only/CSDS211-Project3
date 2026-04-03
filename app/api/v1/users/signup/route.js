import { prisma } from "../../../../../lib/prisma";
import { hash as passwordHash } from "@node-rs/argon2";
import { NextResponse } from 'next/server';
import { randomBytes } from "node:crypto";

export async function POST(request, context) {
    const data = await request.nextUrl.searchParams;
    const { username, email, firstName, lastName, password } = await request.json();

    const potentialDuplicate = await prisma.users.findFirst({
        where: {
            OR: [
                {
                    username
                },
                {
                    email
                }
            ]
        },
        select: {
            accessToken: true,
            password: true
        }
    });

    if (potentialDuplicate !== null) {
        return NextResponse.json({
            success: false,
            error: "User with this information already exists!"
        }, { status: 400 });
    }

    const newUser = await prisma.users.create({
        data: {
            username,
            email,
            firstName,
            lastName,
            password: await passwordHash(password),
            accessToken: randomBytes(64).toString("hex")
        }
    });

    return NextResponse.json({
        success: true,
        accessToken: newUser.accessToken
    });
}