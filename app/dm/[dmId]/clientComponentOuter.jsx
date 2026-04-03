"use client";

import dynamic from "next/dynamic";

const MessagesList = dynamic(() => import("./clientComponentInner"), {
    ssr: false,
    loading: () => (<><h2>Loading Messages Component...</h2></>)
});

export default function ClientComponentOuter({ dmId }) {
    return (
        <MessagesList dmId={dmId} />
    );
}