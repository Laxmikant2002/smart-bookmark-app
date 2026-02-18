# Smart Bookmark App ✨

A modern, secure bookmark manager built with Next.js and Supabase. Features Google OAuth authentication, real-time sync, and private bookmarks per user.

## Features

✅ **Google OAuth Authentication** - Simple one-click sign-in via Supabase Auth  
✅ **Private Bookmarks** - Each user's bookmarks are completely private (Row-Level Security)  
✅ **Real-time Updates** - Changes appear instantly across all devices/tabs  
✅ **Modern UI** - Clean, light theme with responsive design  
✅ **Type-safe** - Built with TypeScript for better code quality

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **Authentication**: Supabase Auth with Google OAuth
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Google OAuth credentials configured in Supabase

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd smart-bookmark-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Setup

### 1. Create the bookmarks table in Supabase:

```sql
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default now()
);
```

### 2. Enable Row Level Security (RLS):

```sql
alter table bookmarks enable row level security;

-- Users can only see their own bookmarks
create policy "Users can view own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

-- Users can insert their own bookmarks
create policy "Users can insert own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

-- Users can delete their own bookmarks
create policy "Users can delete own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);
```

### 3. Enable Real-time:

In Supabase Dashboard → Database → Replication, enable replication for the `bookmarks` table.

### 4. Configure Google OAuth:

In Supabase Dashboard → Authentication → Providers, enable Google and add your OAuth credentials.

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx         # Protected dashboard page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Login page
│   └── globals.css           # Global styles
└── utils/
    └── supabase/
        ├── client.ts         # Supabase client (browser)
        └── server.ts         # Supabase client (server)
```

## Security

- **Row Level Security (RLS)** ensures users can only access their own bookmarks
- **No unsafe DOM rendering** - no use of `dangerouslySetInnerHTML` or `innerHTML`
- **Type-safe** - TypeScript prevents common runtime errors
- **Secure authentication** - Handled entirely by Supabase

## Testing

Test the app with multiple Google accounts in different browser tabs to verify:

- Real-time updates work within the same user
- Different users cannot see each other's bookmarks

## Deployment

### Deploy to Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

Update your Supabase Authentication settings to include your production URL in the allowed redirect URLs.

## License

MIT

---

Built with ❤️ using Next.js and Supabase
