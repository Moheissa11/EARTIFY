# Publish EARTIFY with GitHub + Render

This project is configured as a **single-instance Render Docker web service** with a persistent disk. The persistent disk is important: the current beta stores accounts, sessions, saved files, and history in a JSON database under `/var/data`.

## 1. Prepare the repository

1. Extract the contents of this folder.
2. Create a new GitHub repository (Public or Private).
3. Upload the **contents** of `EARTIFY_GitHub_Deploy` to the repository root. `server.js`, `package.json`, `Dockerfile`, `render.yaml`, and `public/` must be at the top level (do not add an extra nested project folder).
4. Do not upload `.env`, `data/`, API keys, passwords, or real user data. `.gitignore` and `.dockerignore` already exclude these.

## 2. Create the Render service

1. Sign in to Render and choose **New → Blueprint**.
2. Connect the GitHub repository containing EARTIFY.
3. Render reads `render.yaml`. Review the service and disk before applying it.
4. The blueprint uses the **Starter** web-service plan and a 1 GB persistent disk. These are paid resources; check the current price shown by Render before confirming. Do not switch to a free instance if you need accounts and saved documents to persist, because free instances do not provide this persistent-disk setup.
5. Wait for the Docker build and deploy to finish.

## 3. Configure the AI key (optional, but recommended)

In Render → EARTIFY service → Environment, set `OPENAI_API_KEY` to your own key. Keep it in Render's environment settings only; never commit it to GitHub or put it in `public/`. The chat and AI analysis use the configured OpenAI model, and semantic document retrieval may make additional embedding API calls. Those calls can incur usage charges. Without the key, the site opens in guided/starter mode, not full general-purpose AI mode.

## 4. Test the live site

Open the Render URL and check:

- Homepage loads and assets appear.
- Create an account, log out, and log back in.
- `/api/health` returns JSON with `"ok":true`.
- Search a known planet (for example Mars) in Explore.
- Search the Research Library for a topic; some providers may be unavailable temporarily.
- Open Cero and test a basic greeting. With the OpenAI key configured, test an open-ended question too.
- Upload a small TXT file. PDF/DOCX extraction is packaged with the Docker image; test it with a non-sensitive sample.
- Create a second test account in a separate browser/private window to verify account separation.

## 5. Share with friends

Once the checks above pass, send friends the public Render URL. They can create their own accounts. The beta is configured for up to 100 accounts by default (`MAX_ACCOUNTS` can be changed in Render Environment).

## Important beta limitations

- The app uses a JSON-file database on one persistent disk and is configured for **one web-service instance**. Do not scale to multiple instances or add a second server until the database is migrated to a managed database such as PostgreSQL.
- There is no email verification, password reset, admin dashboard, or account recovery flow yet. Users should use unique passwords and avoid uploading sensitive/private documents.
- Rate limiting is process-local and resets when the service restarts. This is a student beta, not a production-hardened public platform.
- Scientific search results are discovery leads. Open original NASA NTRS, Crossref, and arXiv records and verify them before relying on claims.
- The destination lookup currently uses Wikimedia/Wikipedia summaries with offline NASA topic fallbacks for known Solar System objects. **It does not use Google Search.** Google Fonts are only a visual font dependency; if blocked, the browser falls back to system sans-serif fonts.
- EARTIFY is an educational student concept and is not an official NASA product. Its visualizations and mission concepts are not certified engineering data.
