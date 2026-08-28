# Production Deployment Runbook

## Deployment topology

- **Frontend:** Vercel static site built from the allowlisted `dist/` output.
- **Backend:** FastAPI running as the same Vercel project's `/api` function.
- **Knowledge retrieval:** Existing Pinecone index and `portfolio-production` namespace.
- **Generation:** Groq model configured through backend environment variables.
- **Query embeddings:** Hugging Face hosted inference using the same normalized `all-MiniLM-L6-v2` vectors as the existing Pinecone index.

The local PyTorch embedding runtime has been replaced for production so the backend fits Vercel's Python function bundle. All API credentials remain server-side.

## 1. Publish the repository

Create a GitHub repository and push this project. Confirm `.env` is ignored before the first commit:

```powershell
git check-ignore .env
git status --short
```

Never commit `.env`. If a real key was ever pushed, rotate it immediately.

## 2. Deploy the full application on Vercel

1. Import the same GitHub repository at `https://vercel.com/new`.
2. Vercel reads `vercel.json`, runs `npm run build`, and publishes only the allowlisted `dist/` directory.
3. Add `GROQ_API_KEY`, `PINECONE_API_KEY`, and `HF_TOKEN` as Vercel secrets.
4. Add `APP_ENVIRONMENT=production`, `ALLOWED_ORIGINS=https://YOUR-VERCEL-DOMAIN`, and `ALLOWED_HOSTS=YOUR-VERCEL-HOSTNAME`.
5. Add the remaining non-secret model and Pinecone values from `.env.example` if they differ from the defaults.
6. Leave `PUBLIC_CHAT_API_URL` unset so the browser uses the same-origin `/api/chat` endpoint.
7. Optionally configure `SITE_URL=https://YOUR-CUSTOM-DOMAIN`. If omitted, the build uses Vercel's production project URL.
8. Deploy, then confirm `/api/health` returns HTTP 200.

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

- Promote the previous successful Vercel deployment for frontend or backend failures.
- Re-run ingestion with the prior reviewed Markdown version for knowledge failures.
- Rotate keys and update Vercel secrets if exposure is suspected.

## Values needed before publishing

- GitHub repository/account authorization
- Final Vercel or custom domain
- Production `ALLOWED_ORIGINS`
- Production `ALLOWED_HOSTS`
- Hugging Face token with Inference Providers permission
- Vercel account authorization
