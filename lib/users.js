import { prisma } from "./prisma";

export async function areUsersFriends(userId, targetPotentialFriendId) {
    const friendInfo = await prisma.friendRequests.findFirst({
        where: {
            OR: [
                {
                    initiatorUserId: userId,
                    targetUserId: targetPotentialFriendId,
                    status: "accepted"
                },
                {
                    initiatorUserId: targetPotentialFriendId,
                    targetUserId: userId,
                    status: "accepted"
                },
            ],
        },
    });

    if (friendInfo === null) {
        return false;
    }

    return true;
}