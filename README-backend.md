# Backend local dev

This project includes several TypeScript services under the `services/` folder. Use the included docker-compose to run a minimal local environment (Postgres + Redis + selected services).

Quickstart (requires Docker & Docker Compose):

```bash
# from repository root
docker compose up --build
```

This will build `startup-service` and `api-gateway` and make them available on:
- API Gateway: http://localhost:3000
- Startup Service: http://localhost:3001

Environment

- The services read configuration from environment variables. Sample env vars are defined inline in `docker-compose.yml` for dev.

Notes

- Dockerfiles copy the full repository to support workspace dependencies. For faster builds, consider publishing shared packages to a registry or using a smaller build context.
- Next recommended tasks: add a root `tsconfig.base.json`, shared ESLint config, and CI workflows. I can create those next if you want.
