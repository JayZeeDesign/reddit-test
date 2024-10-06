import { ThemeProvider } from 'next-themes'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "./globals.css"
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reddit Analytics Platform',
  description: 'Analyze Reddit posts and themes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
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
  )
}
