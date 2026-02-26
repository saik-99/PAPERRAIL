'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [googleLoading, setGoogleLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!email || !password) {
            setError('Please enter your email and password.')
            return
        }
        setLoading(true)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                setError(error.message)
            } else if (data?.user) {
                router.push('/')
                router.refresh()
            } else {
                setError('Login failed. Please check your credentials and try again.')
            }
        } catch (err: unknown) {
            console.error('Login error:', err)
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        setError('')
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` },
            })
            if (error) setError(error.message)
        } catch {
            setError('Could not initiate Google login. Please try again.')
            setGoogleLoading(false)
        }
    }

    return (
        // Full-screen override — hides sidebar shift on auth pages
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050e05] px-4">
            <main className="flex w-full max-w-md flex-col gap-8">
                <header className="space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 mb-2">
                        <span className="text-2xl">🌾</span>
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">Login</p>
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back, <span className="text-emerald-400">KhetiWala</span>
                    </h1>
                    <p className="text-sm text-zinc-500">Sign in to your account.</p>
                </header>

                <form onSubmit={handleLogin} className="space-y-4 rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-6 text-sm shadow-xl">
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-xs font-medium text-zinc-400">Email address</label>
                        <input
                            id="email" type="email" placeholder="farmer@example.com" required
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="password" className="text-xs font-medium text-zinc-400">Password</label>
                        <input
                            id="password" type="password" placeholder="••••••••" required
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                    </div>

                    <button type="submit" disabled={loading}
                        className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-70 transition-colors">
                        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : 'Login'}
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-[#1a2d1a]" />
                        <span className="shrink-0 px-4 text-xs text-zinc-500">OR</span>
                        <div className="flex-grow border-t border-[#1a2d1a]" />
                    </div>

                    <button type="button" onClick={handleGoogleLogin} disabled={googleLoading}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-5 text-sm font-medium text-zinc-300 hover:border-emerald-600 hover:text-emerald-400 disabled:opacity-70 transition-colors">
                        {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                                <path d="M12.0003 4.75001C13.7381 4.75001 15.2974 5.38573 16.5297 6.44754L19.9575 3.01977C17.8879 1.15049 15.1437 0 12.0003 0C7.29528 0 3.23075 2.71431 1.05353 6.66649L5.053 9.7645C6.01258 6.84803 8.78363 4.75001 12.0003 4.75001Z" fill="#EA4335" />
                                <path d="M23.5137 12.2727C23.5137 11.4545 23.4402 10.6682 23.3032 9.91818H12.0003V14.5455H18.4552C18.1764 16.0396 17.3392 17.3114 16.0827 18.1523L20.0821 21.2503C22.421 19.0964 23.5137 15.9636 23.5137 12.2727Z" fill="#4285F4" />
                                <path d="M5.05267 14.2355C4.80783 13.51 4.67086 12.75 4.67086 11.9636C4.67086 11.1773 4.8079 10.4173 5.05267 9.69182L1.05315 6.59381C0.387537 7.91364 0 9.40003 0 11.9636C0 14.5273 0.387537 16.0137 1.05315 17.3335L5.05267 14.2355Z" fill="#FBBC05" />
                                <path d="M12.0003 24.0001C15.2447 24.0001 17.9614 22.9255 19.9575 21.082L16.0827 17.984C15.0039 18.7056 13.6258 19.1433 12.0003 19.1433C8.78363 19.1433 6.01258 17.0452 5.053 14.1288L1.05353 17.2268C3.23075 21.1789 7.29528 23.8933 12.0003 24.0001Z" fill="#34A853" />
                            </svg>
                        )}
                        {googleLoading ? 'Connecting...' : 'Continue with Google'}
                    </button>

                    {error && (
                        <p className="mt-2 rounded-lg bg-red-900/20 border border-red-900/40 px-3 py-2 text-xs text-red-400">{error}</p>
                    )}
                </form>

                <p className="text-center text-sm text-zinc-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-medium text-emerald-400 hover:underline">Sign up</Link>
                </p>
            </main>
        </div>
    )
}
