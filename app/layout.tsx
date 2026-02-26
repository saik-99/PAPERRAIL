import type { Metadata } from 'next'
import { Noto_Sans, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import { Navbar } from './components/Navbar'

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto',
})

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-devanagari',
})

export const metadata: Metadata = {
  title: 'KhetiWala - Smart Farming Advisory',
  description: 'AI-powered agricultural advisory for Indian farmers — maximize income, minimize spoilage.',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${notoSans.variable} ${notoDevanagari.variable} flex min-h-screen flex-col bg-white font-sans text-zinc-900 antialiased dark:bg-black dark:text-zinc-50`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-100 px-4 py-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:px-8 lg:px-20">
          <div className="mx-auto max-w-6xl">
            © {new Date().getFullYear()} KhetiWala. Built for Indian farmers.
          </div>
        </footer>
      </body>
    </html>
  )
}
