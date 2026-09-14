# Babar Ali Khan — AI Engineer Portfolio

A dependency-free, responsive static portfolio. Open `index.html` locally or deploy the folder to GitHub Pages, Netlify, Vercel, or Cloudflare Pages.

## Update checklist

- Projects and skills: edit `data.js`. The five featured projects were verified against their linked GitHub READMEs on 27 August 2026.
- Email, social URLs, experience, education and certifications: edit `index.html`.
- Portrait: add `assets/profile.jpg`, then update the image source in `index.html`.
- Resume: `resume.pdf` is connected to the navigation, hero, About, and Contact actions.
- Contact submissions: connect your preferred serverless form endpoint; the current safe fallback opens the visitor's email client.
- SEO: replace the placeholder domain in `sitemap.xml` and create a final social preview image.

Published metrics are shown only where documented in the source repository. Projects without published evaluation results explicitly say so.

## Portfolio chatbot

The repository includes a FastAPI Retrieval-Augmented Generation (RAG) backend and an accessible vanilla-JavaScript chat widget. The backend requests normalized `sentence-transformers/all-MiniLM-L6-v2` embeddings from Hugging Face hosted inference, retrieves relevant chunks from Pinecone, and asks a configurable Groq model to answer only from that evidence.

### Architecture

```text
Portfolio visitor → chatbot.js → FastAPI /api/chat → hosted MiniLM embedding
                  → Pinecone retrieval → Groq generation → answer + approved links
```

The frontend contains no service credentials. Conversation history is limited and stored only in browser `sessionStorage`. Knowledge ingestion is available only through a command-line script.

### Local backend setup

Use Python 3.11 or 3.12:

```powershell
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

Add `GROQ_API_KEY`, `PINECONE_API_KEY`, and `HF_TOKEN` (with Inference Providers permission) to the untracked `.env` file. All three are required; a missing token causes chat requests to return HTTP 503. Restart the backend after changing credentials. Confirm that `GROQ_MODEL` is available in the configured Groq account; model availability can change. Never place actual secret values in `.env.example` or frontend code.

### Knowledge ingestion

Review `data/portfolio_knowledge_base.md` before indexing. First run a credential-free dry run:

```powershell
python -m scripts.ingest --source data/portfolio_knowledge_base.md --dry-run
```

Then create or validate the 384-dimensional cosine Pinecone index and upsert the knowledge chunks:

```powershell
python -m scripts.ingest --source data/portfolio_knowledge_base.md
```

Chunk IDs are deterministic, so unchanged content does not create duplicates. Stale-vector cleanup runs after a successful upsert when the Pinecone SDK supports ID enumeration.

### Run locally

Run the API on port 8001 because the static portfolio uses port 8000:

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

Serve the static site separately:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

The widget reads the backend URL from the `data-chat-api` attribute on `<body>` in `index.html`. This URL is public configuration, not a secret.

### API

- `GET /api/health` reports credential-presence booleans for Groq, Pinecone, and Hugging Face without exposing credentials. These checks do not verify provider connectivity or token validity.
- `POST /api/chat` accepts a message, anonymous session ID, and up to six recent user/assistant history messages.
- No public ingestion endpoint exists.

Interactive API documentation is available at `http://127.0.0.1:8001/docs` while the backend runs locally.

### Tests and evaluation

```powershell
pytest
python -m scripts.evaluate --api http://127.0.0.1:8001
```

The evaluation dataset contains profile, skills, projects, comparison, experience, education, certification, contact, follow-up, missing-information, out-of-scope, and prompt-injection cases. Human review is required before release; simple substring checks are only a diagnostic aid.

### Production checklist

- Configure the final frontend and backend HTTPS URLs.
- Restrict `ALLOWED_ORIGINS` to the final portfolio origin.
- Store Groq and Pinecone keys in the backend host's secret manager.
- Deploy one backend worker initially so the embedding model is loaded once.
- Replace the placeholder domain in `sitemap.xml`.
- Re-index after final public URLs are added to the knowledge base.
- Run the automated evaluation, keyboard/accessibility review, prompt-injection tests, and mobile/desktop smoke tests.
- Add the chatbot as a completed RAG project to the knowledge base only after public end-to-end verification.

The full delivery sequence is documented in `personal_portfolio_chatbot_implementation_plan.md`.
# Portfolio themes

The circular navigation control switches between Navy (the default) and White.
`theme.js` restores `portfolio-theme` from localStorage before styles render, and
updates `data-theme` on the document. Storage restrictions do not prevent switching.
Palette tokens live in `navy-theme.css`; `theme-controls.css` handles the toggle,
responsive navigation spacing, and 350ms transitions with reduced-motion support.
Both files and the script are included in the static build. Source project images,
certificates, and technology logos retain their original colors.
