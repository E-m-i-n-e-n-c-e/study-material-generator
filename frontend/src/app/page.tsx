"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Failed to load message"));
  }, []);

  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>Hello World</h1>
        <p style={{ marginTop: 8, fontSize: 18, color: "#555" }}>{message}</p>
      </div>
    </main>
  );
}


