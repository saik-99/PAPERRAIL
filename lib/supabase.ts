import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'Farmer' | 'Buyer' | 'FPO' | 'Admin'
export type SpoilageRisk = 'Low' | 'Medium' | 'High'
export type ListingStatus = 'Active' | 'Pending_Sale' | 'Sold' | 'Cancelled'
export type TransactionStatus = 'Negotiation' | 'Confirmed' | 'Complete' | 'Disputed'
