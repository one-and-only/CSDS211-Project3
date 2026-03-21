"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group";
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
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group"

function UserAuthModal({ usedForSignup = false }) {
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
        console.log(data);
    };

    return (
        <Dialog>
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
                        <FieldGroup>
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
                        <FieldGroup>
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
    );
}

export default function SidebarUserAuth() {
    return (
        <>
            <h2>Chats will appear once you are logged in. We hope you enjoy your stay.</h2>
            <br />
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