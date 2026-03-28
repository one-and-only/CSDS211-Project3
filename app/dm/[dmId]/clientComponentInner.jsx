"use client";

import {
    Message,
    MinChatUiProvider,
} from "@minchat/react-chat-ui";
import { chatTheme } from "./chat-theme";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import { Input, Button } from "@base-ui/react";
import { LucideSend } from "lucide-react";

export default function MessagesListClientComponent({ dmId }) {
    const [messages, setMessages] = useState([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [inputText, setInputText] = useState("");

    const accessTokenRef = useRef("");
    const lastMessageIdRef = useRef(-1);
    const currentUserIdRef = useRef(-1);
    const chattingWithUsernameRef = useRef("");

    const router = useRouter();

    useEffect(() => {
        async function init() {
            const token = (await window.cookieStore.get("accessToken"))?.value;
            if (token === undefined) {
                router.replace("/");
                return;
            }

            accessTokenRef.current = token;

            const profile = await (await fetch(`/api/v1/users/profile?accessToken=${encodeURIComponent(accessTokenRef.current)}`)).json();
            currentUserIdRef.current = profile.userId;

            const chatsResponse = await (await fetch(`/api/v1/users/chats?accessToken=${encodeURIComponent(accessTokenRef.current)}`)).json();
            const chatInfo = chatsResponse.chats.filter(x => x.chatId === parseInt(dmId))[0];
            chattingWithUsernameRef.current = chatInfo.username;
            await fetchMoreMessages();
        }

        init();
    }, [dmId, router]);

    const sendMessage = async input => {
        const message = await (await fetch(`/api/v1/users/chats/${dmId}/messages/send?accessToken=${encodeURIComponent(accessTokenRef.current)}`, {
            method: "POST",
            body: JSON.stringify({
                message: input
            })
        })).json();

        setMessages(messages => {
            return [{
                messageId: message.messageId,
                message: input,
                createdAt: new Date(message.createdAt),
                userId: message.userId
            }, ...messages];
        });
    }

    const fetchMoreMessages = async () => {
        const messagesFetch = await (await fetch(`/api/v1/users/chats/${dmId}/messages?accessToken=${encodeURIComponent(accessTokenRef.current)}${lastMessageIdRef.current !== -1 ? `&lastMessageId=${lastMessageIdRef.current}` : ""}`)).json();

        if (!messagesFetch) {
            console.log("Failed to get new messages!")
            return;
        }

        const newMessages = messagesFetch.messages.map(message => ({ ...message, createdAt: new Date(message.createdAt) }));

        newMessages.sort((a, b) => b.createdAt - a.createdAt);

        if (newMessages.length < 10) setHasMoreMessages(false);
        lastMessageIdRef.current = newMessages.at(-1).messageId;

        setMessages(messages => {
            return [...messages, ...newMessages];
        });
    }

    return (
        <div className="flex flex-col h-screen w-full bg-white relative overflow-hidden">

            <div className="h-16 border-b flex items-center px-6 bg-white shrink-0 z-10 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800">Chatting With {chattingWithUsernameRef.current}</h2>
            </div>

            <MinChatUiProvider colorSet={chatTheme}>
                <div
                    id="scrollable-chat-container"
                    className="flex-1 min-h-0 overflow-auto flex flex-col-reverse bg-gray-50/50 p-4"
                >
                    <InfiniteScroll
                        dataLength={messages.length}
                        next={fetchMoreMessages}
                        hasMore={hasMoreMessages}
                        loader={<h4 className="text-center py-2 text-sm text-gray-400">Loading Messages...</h4>}
                        scrollableTarget="scrollable-chat-container"
                        style={{ display: 'flex', flexDirection: 'column-reverse' }}
                        inverse
                        endMessage={<></>}
                    >
                        {messages.map((message, index) =>
                            <Message
                                type={message.userId === currentUserIdRef.current ? "outgoing" : "incoming"}
                                created_at={message.createdAt}
                                seen
                                text={message.message}
                                user={message.userId}
                                showAvatar={true}
                                key={`msg-${message.messageId}-${index}`}
                            />
                        )}
                    </InfiniteScroll>
                </div>
            </MinChatUiProvider>

            <div className="flex items-center gap-2 border-t p-2 md:p-3 bg-white shrink-0 relative z-20">
                <Input
                    type="text"
                    placeholder="Type message here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={async (e) => {
                        if (e.key === 'Enter' && inputText.trim()) {
                            e.preventDefault();
                            await sendMessage(inputText.trim());
                            setInputText("");
                        }
                    }}
                    className="flex-1 rounded-full bg-secondary border-none focus-visible:ring-0 px-4 py-2 h-10 text-sm md:text-base placeholder:text-muted-foreground"
                />
                <Button
                    type="button"
                    onClick={async (e) => {
                        e.preventDefault();
                        if (inputText.trim()) {
                            await sendMessage(inputText.trim());
                            setInputText("");
                        }
                    }}
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 text-violet-500 hover:text-violet-600 hover:bg-transparent shrink-0"
                >
                    <LucideSend className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
            </div>

        </div>
    );
}