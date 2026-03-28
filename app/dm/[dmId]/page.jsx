import ClientComponentOuter from "./clientComponentOuter";

export default async function Page({ params }) {
    const { dmId } = await params;

    return (
        <ClientComponentOuter dmId={dmId} />
    )
}