"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#fbfaf8",
            color: "#2b231d",
            padding: "2rem",
            fontFamily: "sans-serif",
          }}
        >
          <section style={{ maxWidth: "40rem", textAlign: "center" }}>
            <p style={{ letterSpacing: "0.18em", textTransform: "uppercase", fontSize: "0.75rem" }}>
              Atelier Nord
            </p>
            <h1 style={{ marginTop: "0.75rem", fontSize: "2rem" }}>Something went wrong</h1>
            <p style={{ marginTop: "0.75rem", opacity: 0.75 }}>
              {error.message || "An unexpected error occurred while loading this page."}
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "1.5rem",
                border: 0,
                borderRadius: "9999px",
                padding: "0.7rem 1.2rem",
                background: "#7f5534",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
