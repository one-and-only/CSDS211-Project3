"use client"

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import { Controller, useForm } from "react-hook-form"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Avvvatars from "avvvatars-react"
import useSWR from "swr";
import { ButtonGroup } from "@/components/ui/button-group"
import { useRouter } from "next/navigation";
import { Loader2, XCircleIcon, CheckCircle2 } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

function AddFriendModal() {
    const accessTokenRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const friendRequestsFetcher = async () => {
        const accessToken = (await window.cookieStore.get("accessToken"))?.value;
        if (accessToken === undefined)
            throw "Unable to get access token. Are you logged in?";

        const friendRequests = await (await fetch(`/api/v1/friends/pending?accessToken=${encodeURIComponent(accessToken)}`)).json();
        if (!friendRequests.success) {
            throw "Failed fetching pending friend requests. Refresh the page and try again."
        }

        return friendRequests.friends;
    }
    const { data: pendingFriendRequests, error: friendRequestsLoadError, isLoading: loadingPendingFriendRequests } = useSWR('/api/v1/friends/pending', friendRequestsFetcher, { refreshInterval: 5000 })

    const usernameFromForm = e => {
        return new FormData(e.currentTarget).get("username") ?? "FAIL";
    }

    useEffect(() => {
        async function init() {
            const accessToken = (await window.cookieStore.get("accessToken"))?.value;
            accessTokenRef.current = accessToken;
        }

        init();
    }, []);

    const createPendingFriendRequest = async e => {
        e.preventDefault();
        setLoading(true);

        const username = usernameFromForm(e);

        const res = await (await fetch(`/api/v1/friends/send?accessToken=${encodeURIComponent(accessTokenRef.current)}&targetUsername=${username}`, { method: "POST" })).json();
        if (!res.success) {
            window.alert(`Failed to create friend request.\n\n${res.error}`);
            setLoading(false);
            return;
        }

        setLoading(false);
        window.location.reload();
    };

    const acceptPendingFriendRequest = async username => {
        const res = await ((await fetch(`/api/v1/friends/accept?accessToken=${encodeURIComponent(accessTokenRef.current)}&acceptedUsername=${username}`, { method: "PUT" })).json());
        if (!res.success) {
            window.alert(`Failed to accept friend request.\n\n${res.error}`);
            setLoading(false);
            return;
        }

        setLoading(false);
    };

    const rejectPendingFriendRequest = async username => {
        const res = await ((await fetch(`/api/v1/friends/reject?accessToken=${encodeURIComponent(accessTokenRef.current)}&rejectedUsername=${username}`, { method: "DELETE" })).json());
        if (!res.success) {
            window.alert(`Failed to reject friend request.\n\n${res.error}`);
            return;
        }
    };

    if (loadingPendingFriendRequests) return null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Add Friend</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <p style={{ fontSize: "16px" }}>Pending Friend Requests:</p>
                <ScrollArea className="max-h-72 min-h-24">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Username</TableHead>
                                <TableHead className="w-[100px]">Name</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                pendingFriendRequests.map(friendRequest => {
                                    return (
                                        <TableRow key={`pending-friend-request-entry-${friendRequest.username}`}>
                                            <TableCell className="font-medium">{friendRequest.username}</TableCell>
                                            <TableCell className="font-medium"><ScrollArea className="w-36"><p>{`${friendRequest.firstName} ${friendRequest.lastName}`}</p><ScrollBar orientation="horizontal" /></ScrollArea></TableCell>
                                            <TableCell className="text-right"><Button style={{ marginRight: "10px" }} onClick={() => acceptPendingFriendRequest(friendRequest.username)} size="icon" color="success"><CheckCircle2 /></Button><Button onClick={() => rejectPendingFriendRequest(friendRequest.username)} size="icon" variant="destructive"><XCircleIcon /></Button></TableCell>
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                </ScrollArea>

                <form onSubmit={createPendingFriendRequest}>
                    <DialogHeader>
                        <DialogTitle asChild><p style={{ fontSize: "18px"}}>Add Friend</p></DialogTitle>
                        <DialogDescription>
                            Input the username of the friend you'd like to add.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup style={{ marginTop: "20px" }}>
                        <Field>
                            <Label style={{ fontSize: "16px" }} htmlFor="add-friend-username">Username</Label>
                            <Input style={{ fontSize: "16px" }} required id="add-friend-username" name="username" placeholder="@DistinguishedUser" autoComplete="off" />
                        </Field>
                    </FieldGroup>

                    <DialogFooter style={{ marginTop: "20px" }}>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                        {loading && <Loader2 />}
                        {!loading && <Button type="submit">Send Invite</Button>}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CreateChatModal() {
    const accessTokenRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const usernameFromForm = e => {
        return new FormData(e.currentTarget).get("username") ?? "FAIL";
    }

    useEffect(() => {
        async function init() {
            const accessToken = (await window.cookieStore.get("accessToken"))?.value;
            accessTokenRef.current = accessToken;
        }

        init();
    }, []);

    const createChat = async e => {
        e.preventDefault();
        setLoading(true);
        const username = usernameFromForm(e);

        const res = await (await fetch(`/api/v1/users/chats/create?accessToken=${encodeURIComponent(accessTokenRef.current)}&targetUsername=${username}`, { method: "POST" })).json();
        if (!res.success) {
            window.alert(`Failed to create chat.\n\n${res.error}`);
            setLoading(false);
            return;
        }

        setLoading(false);
        window.location.reload();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Create Chat</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={createChat}>
                    <DialogHeader>
                        <DialogTitle>Create Chat</DialogTitle>
                        <DialogDescription>
                            Input the username of the friend you'd like to create a chat with.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <Label htmlFor="add-friend-username">Username</Label>
                            <Input required id="add-friend-username" name="username" placeholder="@DistinguishedUser" autoComplete="off" />
                        </Field>
                    </FieldGroup>

                    <DialogFooter style={{ marginTop: "20px" }}>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                        {loading && <Loader2 />}
                        {!loading && <Button type="submit">Create Chat</Button>}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function UserAuthModal({ usedForSignup = false }) {
    const [accessToken, setAccessToken] = useState(null);
    const router = useRouter();

    const chatsFetcher = async () => {
        const accessToken = (await window.cookieStore.get("accessToken"))?.value;
        if (accessToken === undefined)
            throw "Unable to get access token. Are you logged in?";

        const chats = await (await fetch(`/api/v1/users/chats?accessToken=${encodeURIComponent(accessToken)}`)).json();
        if (!chats.success) {
            throw "Failed fetching chats. Refresh the page and try again."
        }

        return chats.chats;
    }
    const { data: chats, error: chatLoadError, isLoading: loadingChats } = useSWR('/api/user', chatsFetcher, { refreshInterval: 5000 })

    const form = useForm({
        defaultValues: {
            email: "",
            firstName: "",
            lastName: "",
            username: "",
            password: ""
        },
    });

    const onSubmit = async data => {
        if (
            (usedForSignup && data.email === "") ||
            (usedForSignup && data.firstName === "") ||
            (usedForSignup && data.lastName === "") ||
            data.username === "" ||
            data.password === ""
        ) {
            alert("Please fill out all of the form fields");
            return;
        }

        if (usedForSignup) {
            const accessTokenResponse = await (await fetch(`/api/v1/users/signup`, {
                method: "POST",
                body: JSON.stringify({
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    username: data.username,
                    password: data.password,
                })
            })).json();

            if (!accessTokenResponse.success) {
                alert(`Failed to log in:\n\n${accessTokenResponse.error}`);
                return;
            }

            window.location.reload();
            return;
        }

        try {
            const accessTokenResponse = await (await fetch(`/api/v1/users/login?username=${encodeURIComponent(data.username)}&password=${encodeURIComponent(data.password)}`)).json();
            if (!accessTokenResponse.success) {
                alert(`Failed to log in:\n\n${accessTokenResponse.error}`);
                return;
            }

            await window.cookieStore.set("accessToken", accessTokenResponse.accessToken);
            setAccessToken(accessTokenResponse.accessToken);
            window.location.reload();
        } catch (e) {
            alert("Network request failed. Please check your network connection, refresh the page, and try again.");
            return;
        }
    };

    useEffect(() => {
        async function init() {
            const accessToken = (await window.cookieStore.get("accessToken"))?.value;
            setAccessToken(accessToken ?? null);
        }

        init();
    }, []);

    return (
        <>
            {accessToken === null ? <Dialog>
                <DialogTrigger asChild>
                    {usedForSignup ? <Button variant="outline">Sign Up</Button> : <Button color="primary">Sign In</Button>}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{usedForSignup ? "Create your account" : "Welcome back!"}</DialogTitle>
                        <DialogDescription style={{ whiteSpace: 'pre-wrap' }}>
                            {
                                usedForSignup ? "Fill out this form to create your account and begin chatting with your favorite people!"
                                    :
                                    "Glad you came back today. We missed you!\nAs usual, fill out the form below to log in:"
                            }
                        </DialogDescription>
                        <form id="signin-signup" onSubmit={form.handleSubmit(onSubmit)}>
                            {usedForSignup && <FieldGroup>
                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="signup-signin-email-field">
                                                Email
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="signup-signin-email-field"
                                                placeholder="user@example.com"
                                                autoComplete="email"
                                            />
                                        </Field>
                                    )}
                                />
                            </FieldGroup>}
                            <FieldGroup>
                                <Controller
                                    name="username"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="signup-signin-username-field">
                                                Username
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="signup-signin-username-field"
                                                placeholder="RandomUser007"
                                                autoComplete="username"
                                            />
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                            {usedForSignup && <FieldGroup>
                                <Controller
                                    name="firstName"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="signup-signin-firstname-field">
                                                First Name
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="signup-signin-firstname-field"
                                                placeholder="Distinguished"
                                                autoComplete="given-name"
                                            />
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                            }
                            {usedForSignup && <FieldGroup>
                                <Controller
                                    name="lastName"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="signup-signin-lastname-field">
                                                Last Name
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="signup-signin-lastname-field"
                                                placeholder="Person"
                                                autoComplete="family-name"
                                            />
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                            }
                            <FieldGroup>
                                <Controller
                                    name="password"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="signup-signin-password-field">
                                                Password
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="signup-signin-password-field"
                                                placeholder="totallySecure123!"
                                                autoComplete="off"
                                                type="password"
                                            />
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                            <Button style={{ marginTop: "20px" }} type="submit" form="signin-signup">
                                {usedForSignup ? "Sign Up" : "Sign In"}
                            </Button>
                        </form>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
                : (<h2>{usedForSignup ? "" : (loadingChats ? "Loading your messages..." : <div><h2 style={{ fontWeight: "bold" }}>Your Chats</h2><ButtonGroup
                    orientation="vertical"
                    className="h-fit"
                    key="CurrentChatsButtonGroup"
                >
                    <ButtonGroup style={{ marginTop: "20px" }}>
                        <AddFriendModal />
                        <CreateChatModal />
                    </ButtonGroup>
                    {chats.map((chat) => {
                        const displayValue =
                            chat.username[0].toUpperCase() +
                            (chat.username[parseInt(chat.username.length / 2)] ?? "").toUpperCase();

                        return (
                            <Tooltip key={`hover-tooltip-${chat.username}`}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => router.push(`/dm/${chat.chatId}`)}
                                        className="focus:outline-none" // Optional: clean up focus rings if needed
                                    >
                                        <Avvvatars
                                            size={96}
                                            value={chat.username}
                                            displayValue={displayValue}
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>{chat.username}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </ButtonGroup></div>)}</h2>)
            }
        </>
    );
}

export default function SidebarUserAuth() {
    return (
        <>
            <div style={{ flex: 1, margin: "auto" }}>
                <ButtonGroup>
                    <ButtonGroup>
                        <UserAuthModal />
                    </ButtonGroup>
                    <ButtonGroup>
                        <UserAuthModal usedForSignup />
                    </ButtonGroup>
                </ButtonGroup>
            </div>
        </>
    );
}