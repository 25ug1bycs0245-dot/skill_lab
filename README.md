# CareerLens AI

A lightweight resume-analysis prototype built with React, Vite, TypeScript, and Express. PDF and DOCX text extraction happens in your browser. The API key, when configured, stays on the server.

## Run locally

1. Install dependencies: `npm.cmd install`
2. Start the API in one terminal: `npm.cmd run server`
3. Start the website in a second terminal: `npm.cmd run dev`
4. Open the local URL printed by Vite (usually `http://localhost:5173`).

Without an AI key, the app analyzes the submitted text using local heuristics and labels the results as **Demo mode**. To enable AI analysis, copy `.env.example` to `.env`, add your provider key to `AI_API_KEY`, then restart the API. `AI_BASE_URL` is an OpenAI-compatible API base URL and `AI_MODEL` selects the model.

## Notes

- Accepts text-based PDF and DOCX resumes up to 8 MB, or pasted text up to 50,000 characters.
- Resume text is sent to the configured AI provider only when a server-side key is present. The prototype does not store resumes.
- Demo results and quality scores are directional, not a hiring decision. Role suggestions are not live job vacancies.
