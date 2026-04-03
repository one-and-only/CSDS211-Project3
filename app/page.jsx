import Image from "next/image";
import logoPic from "../logo.png";

export default function Page() {
    return (
        <div style={{ display: "flex", alignItems: "center", flexDirection: "column", marginLeft: "auto", marginRight: "auto", marginBottom: "auto", marginTop: "5vh" }}>
            <Image
                src={logoPic}
                alt="Chant logo"
                style={{ width: "300px", height: "409px" }}
            />
            <h1 style={{ fontSize: "32px" }}>Welcome to Chant!</h1>
            <br />
            <br />
            <p style={{ fontSize: "20px" }}>your favorite place to freely chat with your favorite people.</p>
            <p style={{ fontSize: "16px", color: "grey" }}>← Use the sidebar to get started 🙂‍↕️</p>
        </div>
    );
}