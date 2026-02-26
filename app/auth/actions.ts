'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginWithGoogle() {
    const supabase = await createClient()

    // We need the origin to set the redirect URL
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        return redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    // Supabase returns a URL to redirect the user to for OAuth
    if (data.url) {
        redirect(data.url)
    }
}
