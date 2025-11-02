# DocRoom

MVP secure data room: auth, S3 presigned uploads, doc list, viewer with basic analytics.

## Local development
1) Install Docker Desktop
2) Start infra: `docker compose up -d`
3) API: `cp api/.env.example api/.env && npm run dev -w api`
4) Web: `cp web/.env.local.example web/.env.local && npm run dev -w web`
5) Open http://localhost:3000

Seed demo user: `npm run seed -w api`

## Production (Render + MongoDB Atlas + AWS S3)
- Click "New +" on Render, Import repo, it will read `render.yaml`.
- Set env vars on the API service:
  - `MONGO_URI` = your MongoDB Atlas SRV string
  - `JWT_SECRET` = random string
  - `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` (and `S3_ENDPOINT` if using non-AWS)
  - `CORS_ORIGIN` = your web URL (e.g. https://docroom.onrender.com or Vercel domain)
- Deploy API first. Copy its URL.
- In Web service env, set `NEXT_PUBLIC_API_URL` = API URL. Redeploy.

### One‑click deploys
- API (Render): [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ayush-dev-s/docroom)
- Web (Vercel): [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ayush-dev-s/docroom&project-name=docroom-web&repository-name=docroom&root-directory=web&env=NEXT_PUBLIC_API_URL)

## Notes
- For AWS S3 uploads, client must set the same Content-Type used during presign.
- Replace MinIO in docker with real S3 in production.
