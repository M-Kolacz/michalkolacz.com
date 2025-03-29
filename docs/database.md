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

## Seeding the database during migrations

1. Create a new seed script:

```bash
cp prisma/seed.ts ./tmp/prod-seed.local.ts
```

2. Modify /tmp/prod-seed.local.ts to your needs.

3. Create a temporary database for seeding:

```bash
DATABASE_URL=file:./tmp/seed.local.db npx prisma migrate reset --skip-seed --force
```

4. Run custom seed script:

```bash
DATABASE_URL=file:./tmp/seed.local.db npx tsx ./tmp/prod-seed.local.ts
```

5. Create a "dump" of the seed database using sqlite3:

```bash
sqlite3 ./prisma/tmp/seed.local.db .dump > ./tmp/seed.local.sql
```

6. Copy relevant parts of the dump to the `migration.sql` file. (probably just `INSERT` commands)

7. Deploy app and verify that the data was seeded correctly.

## Seeding the database on production

1. Create a new seed script:

```bash
cp prisma/seed.ts ./tmp/prod-seed.local.ts
```

2. Modify /tmp/prod-seed.local.ts to your needs.

3. Create a temporary database for seeding:

```bash
DATABASE_URL=file:./tmp/seed.local.db npx prisma migrate reset --skip-seed --force
```

4. Run custom seed script:

```bash
DATABASE_URL=file:./tmp/seed.local.db npx tsx ./tmp/prod-seed.local.ts
```

5. Create a "dump" of the seed database using sqlite3:

```bash
sqlite3 ./prisma/tmp/seed.local.db .dump > ./tmp/seed.local.sql
```

6. Connect with production

```bash
fly sftp shell --app APP_NAME
```

7. Copy local `seed.local.sql` to `/tmp` on production 

```bash
put ./tmp/seed.local.sql /tmp/seed.local.sql
```

8. (Another terminal) Connect with production:

```bash
fly ssh console --app APP_NAME
```

9. Run sqlite3 to populate database with seed data

```bash
sqlite3 ../data/sqlite.db < ../tmp/seed.local.sql
```