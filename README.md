This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

### 1. Prerequisites (Environment Variables)

You need to configure the following Environment Variables in your Vercel Project Settings under **Settings > Environment Variables**:

| Variable Name | Description | Example / Format |
|---|---|---|
| `DATABASE_URL` | Your PostgreSQL database connection string | `postgresql://user:password@host:port/database` |
| `CLOUDINARY_URL` | Your Cloudinary connection URL (automatically parsed by Cloudinary SDK) | `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` |

### 2. Database Sync / Push

Since the project uses Prisma, make sure your remote database is in sync with the Prisma schema. Before or after your first deployment, run this command locally:

```bash
npx prisma db push
```

This will automatically create the database tables (`Image` model) in your remote PostgreSQL database.

### 3. Build Configuration

The project is pre-configured to run `prisma generate` as part of the build step (`npm run build`). Vercel will automatically run this during the deployment build phase, ensuring the Prisma Client matches your schema.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

