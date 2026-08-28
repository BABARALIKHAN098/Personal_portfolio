# Production Deployment Runbook

## Recommended topology

- **Frontend:** Vercel static site built from the allowlisted `dist/` output.
- **Backend:** Render Docker web service defined by `render.yaml`.
- **Knowledge retrieval:** Existing Pinecone index and `portfolio-production` namespace.
- **Generation:** Groq model configured through backend environment variables.

The frontend and backend are separate so the portfolio stays fast and backend secrets never enter browser assets.

The backend Blueprint uses Render's `1c-2g` paid compute plan. Local measurement after MiniLM loaded was approximately 518 MB working set and 744 MB private memory, so a 512 MB free/starter instance is not safe for this architecture. Do not create the service until the hosting cost is approved.

## 1. Publish the repository

Create a GitHub repository and push this project. Confirm `.env` is ignored before the first commit:

```powershell
git check-ignore .env
git status --short
```

Never commit `.env`. If a real key was ever pushed, rotate it immediately.

## 2. Deploy the Render backend

1. Create a Render Blueprint from the GitHub repository. Render will read `render.yaml`.
2. Add the secret values `GROQ_API_KEY` and `PINECONE_API_KEY` when prompted.
3. Add `ALLOWED_ORIGINS=https://YOUR-VERCEL-DOMAIN`.
4. Add `ALLOWED_HOSTS=YOUR-RENDER-SERVICE.onrender.com`.
5. Deploy and wait for `/health` to return HTTP 200.
6. Copy the final HTTPS backend URL.

The service runs one worker so MiniLM loads once. The image downloads MiniLM during its build and runs as a non-root user.

## 3. Deploy the Vercel frontend

1. Import the same GitHub repository at `https://vercel.com/new`.
2. Vercel reads `vercel.json`, runs `npm run build`, and publishes only the allowlisted `dist/` directory.
3. Configure `PUBLIC_CHAT_API_URL=https://YOUR-RENDER-SERVICE.onrender.com`.
4. Optionally configure `SITE_URL=https://YOUR-CUSTOM-DOMAIN`. If omitted, the build uses Vercel's production project URL.
5. Deploy the site.
6. Ensure Render's `ALLOWED_ORIGINS` exactly matches the final Vercel origin without a trailing slash, then redeploy the backend if the value changed.

## 4. Production verification

1. Load the portfolio over HTTPS on desktop and mobile.
2. Confirm the chat launcher works with keyboard and touch.
3. Ask “Who is Babar Ali Khan?”
4. Ask “What is Babar's education level?”
5. Ask “Which projects use FastAPI?”
6. Ask “Did Babar work at Google?” and verify refusal.
7. Ask for API keys and verify refusal.
8. Confirm returned GitHub links are correct and use HTTPS.
9. Confirm there are no CORS or Content Security Policy console errors.
10. Confirm `/docs` and `/openapi.json` return 404 in production.

## 5. Knowledge updates

From a trusted local/admin environment:

```powershell
py -m scripts.ingest --source data/portfolio_knowledge_base.md --dry-run
py -m scripts.ingest --source data/portfolio_knowledge_base.md
```

Do not expose ingestion as a public endpoint.

## 6. Rollback

- Promote the previous successful Vercel deployment for frontend failures.
- Restore the previous successful Render deploy for backend failures.
- Re-run ingestion with the prior reviewed Markdown version for knowledge failures.
- Rotate keys and update Render secrets if exposure is suspected.

## Values needed before publishing

- GitHub repository/account authorization
- Final Vercel or custom domain
- Final Render service hostname
- Production `ALLOWED_ORIGINS`
- Production `ALLOWED_HOSTS`
- Render and Vercel account authorization
