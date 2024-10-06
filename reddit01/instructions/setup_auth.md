# Auth Setup Instructions

Use this guide to set up the authentication for this project.

It uses Clerk for authentication and integrates Supabase to store user profiles.

Write the complete code for every step. Do not get lazy. Write everything that is needed.

Your goal is to completely finish whatever the user asks for.

Don't update .env.local, assume user already updated it


## Helpful Links

If you get stuck, refer to the following links:

- [Clerk](https://clerk.com/)
- [Clerk Docs](https://clerk.com/docs)
- [Supabase](https://supabase.com/)
- [Supabase Docs](https://supabase.com/docs)

## Setup Documentation

### 1. Install Dependencies

Install the necessary packages for Clerk and Supabase:
```bash
npm install @clerk/nextjs @supabase/supabase-js
```

### 2. Setup

#### 2.1 Set Your Environment Variables
Add these keys to your `.env.local` file or create the file if it doesn't exist. You can retrieve these keys from the respective dashboards.

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup

SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

- **Clerk Environment Variables:** Obtain these from your Clerk [API Keys](https://dashboard.clerk.com/last-active?path=api-keys) page.
- **Supabase Environment Variables:**
  - `SUPABASE_URL`: Your Supabase project URL.
  - `SUPABASE_SERVICE_KEY`: Your Supabase service role key (for admin access). **Keep this key secure and never expose it on the client side.**

#### 2.2. Create the Profiles Table in Supabase

In your Supabase dashboard, run the following SQL query in the SQL Editor to create the `profiles` table:

```sql
CREATE TABLE profiles (
  user_id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  tier text DEFAULT 'Free',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone DEFAULT now()
);
```

#### 2.3. Enable Row-Level Security (RLS)

Enable Row-Level Security on the `profiles` table to ensure that users can only access their own data.

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

Create policies to allow users to `SELECT`, `INSERT`, and `UPDATE` their own profiles.

```sql
-- Allow users to select their own profile
CREATE POLICY "Allow individual SELECT" ON profiles
FOR SELECT
USING (auth.uid()::text = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Allow individual INSERT" ON profiles
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own profile
CREATE POLICY "Allow individual UPDATE" ON profiles
FOR UPDATE
USING (auth.uid()::text = user_id);
```


### 3. Build a Sign-Up Page

Create a new file to render the sign-up page. Import the `<SignUp />` component from `@clerk/nextjs` and render it.

**app/signup/[[...sign-up]]/page.tsx**

```typescript:app/signup/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

### 4. Build a Sign-In Page

Create a new file to render the sign-in page. Import the `<SignIn />` component from `@clerk/nextjs` and render it.

**app/login/[[...sign-in]]/page.tsx**

```typescript:app/login/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

### 5. Make the Sign-Up and Sign-In Routes Public

Configure the middleware to make the sign-up, sign-in, and login routes public. This ensures that unauthenticated users can access these pages.

**middleware.ts**

```typescript:middleware.ts
import { authMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const publicRoutes = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/login(.*)',
  '/signup(.*)',
  // Add any other public routes here
]);

export default authMiddleware({
  publicRoutes,
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### 6. Add `ClerkProvider` to Your App

All Clerk hooks and components must be children of the `ClerkProvider` component.

**app/layout.tsx**

```typescript:app/layout.tsx
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header className="absolute top-0 right-0 w-full">
              <div className="bg-transparent flex justify-end p-4">
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 7. Integrate Supabase to Store User Profiles

We will use Supabase to create a `profiles` table that stores additional user information for each user.

#### 7.1. Use Your Existing Supabase Client with Admin Access

Since you already have a Supabase client with admin access, ensure it uses the service role key. Your Supabase client should look like this:

**lib/supabaseClient.ts**

```typescript:lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

This client uses the `SUPABASE_SERVICE_KEY`, which has admin access. **Do not expose this key on the client side.** Keep all operations using this client on the server side.

#### 7.2. Sync Clerk Users with Supabase Profiles Using an API Route

To synchronize Clerk users with Supabase profiles, we'll create an API route that is called when a user signs in. This API route will ensure that a profile exists for the user in Supabase.

**Create an API Route to Sync Profiles**

**app/api/sync-profile/route.ts**

```typescript:app/api/sync-profile/route.ts
import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
    const { userId } = auth();
  
    if (!userId) {
      return NextResponse.redirect('/sign-in');
    }
  
    try {
      // Fetch user data from Clerk
      const user = await clerkClient.users.getUser(userId);
      const email = user.emailAddresses[0]?.emailAddress;
  
      // Check if profile exists in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();
  
      if (!data) {
        // Insert new profile
        const { error } = await supabase.from('profiles').insert({
          user_id: userId,
          email,
        });
  
        if (error) {
          console.error('Error inserting profile:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error in sync-profile:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
```

**Note:** Ensure you have the correct imports and that `supabase` is imported from your `lib/supabaseClient.ts`.

**Call the API Route on Sign-In**

In your client-side code, call this API route to synchronize the profile when the user signs in.

**components/SyncProfile.tsx**

```typescript:components/SyncProfile.tsx
'use client';

import { useEffect } from 'react';

export default function SyncProfile() {
  useEffect(() => {
    const syncProfile = async () => {
      await fetch('/api/sync-profile');
    };

    syncProfile();
  }, []);

  return null;
}
```

**Include `SyncProfile` in Your Layout**

Update your `app/layout.tsx` to include the `SyncProfile` component for signed-in users.

**app/layout.tsx**

```typescript:app/layout.tsx
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import './globals.css';
import SyncProfile from '@/components/SyncProfile';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
            <SyncProfile />
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

Now, whenever a user signs in, the `SyncProfile` component will call the `/api/sync-profile` endpoint to ensure the user's profile exists in Supabase.

#### 7.3. Managing Stripe Customer and Subscription IDs

If you intend to integrate with Stripe to manage subscriptions, you can update the `profiles` table as follows:

- When a user subscribes or updates their subscription, update the `stripe_customer_id` and `stripe_subscription_id` fields in the `profiles` table.
- You can handle this in your application logic wherever you manage Stripe interactions.

**Example: Updating Subscription IDs**

```typescript
import { supabase } from '@/lib/supabaseClient';

async function updateSubscription(userId: string, customerId: string, subscriptionId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}
```

### 8. Accessing User Profiles in Your App

You can now use Supabase to access and manipulate user profile data in your application.

**Example: Fetching User Profile**

**app/profile/page.tsx**

```typescript:app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  if (!profile) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome, {profile.email}</h1>
      <p>Tier: {profile.tier || 'Free'}</p>
      {/* Display other profile information */}
    </div>
  );
}
```

### 9. Updating Profiles When User Data Changes

If you need to update the user profile when certain events occur (e.g., when the user upgrades their subscription), update the Supabase `profiles` table accordingly.

**Example: Updating Tier**

```typescript
import { supabase } from '@/lib/supabaseClient';

async function updateTier(userId: string, newTier: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ tier: newTier })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating tier:', error);
  }
}
```

### 6. Update Environment Variables

Ensure that your `.env.local` file contains the correct URLs for sign-in and sign-up pages:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
```

---

By following these steps, you have integrated Supabase into your authentication flow using Clerk. The `profiles` table in Supabase will store additional user data such as `user_id`, `email`, `tier`, `stripe_customer_id`, and `stripe_subscription_id`, allowing you to manage user profiles and subscription information effectively.

---

If you need further assistance, refer to the official documentation:

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
