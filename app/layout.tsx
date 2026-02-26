import type { Metadata } from 'next'
import { Noto_Sans, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import { Sidebar } from './components/Sidebar'
import { LanguageProvider } from './components/LanguageContext'
import { GeminiAdvisor } from './components/GeminiAdvisor'

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
  description: 'AI-powered agricultural advisory for Indian farmers.',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${notoSans.variable} ${notoDevanagari.variable} flex min-h-screen bg-[#050e05] font-sans text-zinc-100 antialiased`}>
        <LanguageProvider>
          <Sidebar />
          <div className="ml-[168px] flex flex-1 flex-col min-h-screen">
            {children}
          </div>
          <GeminiAdvisor />
        </LanguageProvider>
      </body>
    </html>
  )
}
