# Database

## Connecting to production database

1. Start Prisma Studio on the server:

```bash
fly ssh console -C "npx prisma studio" --app APP_NAME
```

2. Proxy your local port 5556 to Prisma Studio:

```bash
fly proxy 5556:5555 --app APP_NAME
```

3. [Open browser](http://localhost:5556/)
