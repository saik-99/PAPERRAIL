'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // Expecting name, email, and password from the form
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Note: if Email Confirmations are ENBALED in Supabase Auth settings,
    // the user will receive an email before they can sign in.
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            },
        }
    })

    if (error) {
        return redirect(`/signup?message=${encodeURIComponent(error.message)}`)
    }

    // If email confirmation is enabled, they need to check their inbox.
    // Otherwise, they might be logged in automatically depending on settings.
    revalidatePath('/', 'layout')
    redirect('/features') // Or redirect to a confirmation page
}
