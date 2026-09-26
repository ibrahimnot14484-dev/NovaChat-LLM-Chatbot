import "./globals.css";

export const metadata = {
  title: "NovaChat — Groq LLM Chatbot",
  description: "A full-stack LLM chatbot built with Next.js and Groq.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}