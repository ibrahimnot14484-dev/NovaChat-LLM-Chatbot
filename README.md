# NovaChat — LLM Chatbot Assignment

A full-stack AI chatbot built with Next.js and the Groq API.

## Features

- Chat interface with message history
- Groq LLM integration through a server-side API route
- Conversation context for the current session
- Loading indicator and friendly API error handling
- Clear-chat button
- Responsive UI for desktop and mobile
- API key stored in an environment variable

## Model

This project uses `openai/gpt-oss-20b` on Groq.

## Run locally

1. Install Node.js.
2. Open a terminal in this project folder.
3. Install dependencies:

```bash
npm install
```

4. Create a file named `.env.local` in the project root:

```env
GROQ_API_KEY=your_actual_groq_api_key
```

5. Start the development server:

```bash
npm run dev
```

6. Open:

http://localhost:3000

## Deployment

Push the project to GitHub and import the repository into Vercel.

In Vercel, add this environment variable:

`GROQ_API_KEY`

Then redeploy the project.

## Security

Never commit `.env.local` or the Groq API key to GitHub. The key is used only by the server-side API route.

## Assignment requirements covered

- Groq API integration
- Frontend chat UI
- Backend/serverless API route
- Secure environment variable
- Session conversation history
- GitHub-ready project
- Vercel-ready project
- README documentation
