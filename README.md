# E-commerce Next.js Supabase Project

A full-stack e-commerce application built with Next.js (App Router) and Supabase.

## Tech Stack

- **Frontend**: Next.js (App Router)
- **Backend**: Next.js API routes / server actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for product images)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Project Structure

```
/app
  /products
    /[id]
  /cart
  /checkout
  /orders
  /auth
  /login
  /signup
/components
/lib
/api
```
