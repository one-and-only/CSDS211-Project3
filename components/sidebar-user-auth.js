"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Controller, useForm } from "react-hook-form"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Avvvatars from "avvvatars-react"
import useSWR from "swr";
import { ButtonGroup } from "@/components/ui/button-group"

function UserAuthModal({ usedForSignup = false }) {
    const [accessToken, setAccessToken] = useState(null);

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
    const { data: chats, error: chatLoadError, isLoading: loadingChats } = useSWR('/api/user', chatsFetcher)

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
    }, [accessToken]);

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
                : (<h2>{usedForSignup ? "" : (loadingChats ? "Loading your messages..." : <div><h2 style={{fontWeight: "bold"}}>Your Chats</h2><ButtonGroup
                    orientation="vertical"
                    aria-label="Media controls"
                    className="h-fit"
                    key="CurrentChatsButtonGroup"
                >
                    {chats.map(chat => {
                        const displayValue = chat.username[0].toUpperCase() + (chat.username[chat.username.length / 2] ?? "").toUpperCase();
                        return <Button key={`${displayValue}BtnContainer`} style={{marginTop: "10px", marginBottom: "10px"}}><Avvvatars value={chat.username} borderColor="red" displayValue={displayValue} key={displayValue} /></Button>
                    })}</ButtonGroup></div>)}</h2>)
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