# Կրթական AI վերլուծության հարթակ

Production-oriented Armenian Next.js application for securely analysing student PDF/image work, preserving human review, synchronising reports, and generating LDM approval documents. PostgreSQL is always the source of truth; Sheets is only a retryable reporting layer.

## Architecture

- **Next.js / React / TypeScript** Armenian role dashboards and validated route handlers.
- **Auth.js Credentials + Argon2id** server sessions, disabled-account checks and server-side ADMIN/LDM/TEACHER boundaries.
- **Prisma / PostgreSQL** relational workflow, immutable raw AI JSON, question records, human overrides, approvals, audit and idempotency constraints.
- **Worker** claims queued work outside browser requests. AI, Drive, Sheets and Docs are interfaces with deterministic mock implementations.
- **Gemini structured output** is Zod validated; scores and percentages are recalculated server-side and low confidence can never silently complete.

## Local setup

```bash
cp .env.example .env
docker compose up -d db
npm install
npx prisma migrate dev
npm run db:seed
npm run dev                 # terminal 1
npm run worker              # terminal 2
```

Open `http://localhost:3000`. Health: `GET /api/health`.

### Development accounts

All seed accounts use `Demo1234!` and exist **only when the explicitly development-only seed runs**:

- Admin: `admin@example.am`
- LDM: `ldm1@example.am`, `ldm2@example.am`
- Teachers: `teacher1@example.am` … `teacher6@example.am`

## Environment

See `.env.example`. Real mode requires `MOCK_EXTERNAL_SERVICES=false`, `GEMINI_API_KEY`, a centrally configured `GEMINI_MODEL`, and either OAuth client credentials or `GOOGLE_SERVICE_ACCOUNT_EMAIL` plus escaped `GOOGLE_PRIVATE_KEY`. Domain-wide delegation may set `GOOGLE_IMPERSONATED_USER`. Share source files, answer keys, template, output folder and spreadsheet with the service account.

Enable Drive, Sheets and Docs APIs in Google Cloud. The service requests `drive.file` (files created/opened for the app), `spreadsheets` (the explicitly connected report), and `documents` (placeholder replacement). If an organisation's pre-existing private files cannot be covered by `drive.file`, an administrator must explicitly share them; do not broaden scopes by default.

`MAX_DRIVE_FILE_BYTES` limits downloads, and only validated `drive.google.com`/`docs.google.com` IDs with PDF/JPEG/PNG MIME types are fetched. Scans are processed in memory and are not persisted or logged.

## Mock mode

With `MOCK_EXTERNAL_SERVICES=true`, Drive returns an in-memory PDF, AI deterministically produces one confident and one review-required question, Sheet sync succeeds without network calls, and Docs returns a demo link. This supports local UI/workflow development without charge or credentials.

## Commands

```bash
npm run typecheck
npm test
npm run test:e2e
npm run build
npx prisma migrate deploy
```

Tests never call Google or Gemini. The test suite covers Drive parsing/SSRF boundaries, RBAC ownership, structured AI normalization, confidence escalation, server score calculation, Sheet record upsert, and Doc placeholders. Database unique constraints make submission, Sheet record, approval and generated-document operations idempotent.

## Deploy

`Dockerfile` builds the standalone Next server. `render.yaml` provisions PostgreSQL, web and worker services and runs migrations before deploy. Configure all production secrets in Render, set `APP_URL`, disable mock mode, and never run the development seed. Rotate credentials, use a dedicated Google service account, and configure database backups/retention before handling real student data.

## Connecting real institutional formats

Implement the concrete Sheets and Docs service methods against the provided interfaces, upload/share the institution's answer keys, set the master Doc/folder IDs in `AppSetting`, and validate a representative set of scans with staff. The answer-key boundary intentionally permits adding a format-specific parser without changing submission or AI orchestration.

## Security and privacy

Authorization is evaluated server-side on every data operation. Credentials remain server-only, passwords are Argon2id hashes, cookies are HTTP-only/SameSite and secure in production, mutations use Zod, IDs are ownership checked, and audit metadata excludes scans and secrets. Configure a reverse-proxy/WAF login rate limit and transactional email provider for reset-token delivery before public launch.

## First Render deployment checklist

1. Push this repository to GitHub/GitLab and choose **New → Blueprint** in Render.
2. Select the repository. Render reads `render.yaml` and creates PostgreSQL, the web service, and the worker.
3. Before applying the Blueprint, provide the prompted `BOOTSTRAP_ADMIN_EMAIL` and a unique `BOOTSTRAP_ADMIN_PASSWORD` of at least 12 characters. Never use the development password.
4. Keep `MOCK_EXTERNAL_SERVICES=true` for the first deployment. The pre-deploy command applies the committed SQL migration and idempotently creates the first administrator.
5. After the first successful deployment, remove `BOOTSTRAP_ADMIN_PASSWORD` from the web service environment. The bootstrap script never changes an existing administrator's password.
6. Open `https://<your-service>.onrender.com/api/health`; deploy only when it returns `status: ok` and `database: ok`, then sign in with the bootstrap administrator.
7. For real integrations, add the Google/Gemini secrets to **both** web and worker where applicable, share the exact Drive resources with the service account, and change `MOCK_EXTERNAL_SERVICES` to `false` only after integration validation.

The Blueprint defaults to mock mode intentionally, so the first public URL does not need Google or Gemini credentials. Render plan names and availability can vary by account/region; if `starter` is rejected, select an available PostgreSQL plan in the Render dashboard without changing the application architecture.
