import { createClient } from '@supabase/supabase-js'

const SB_URL = import.meta.env.VITE_SUPABASE_URL || 'https://unjbdcjcfqmytapxyvuf.supabase.co'
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamJkY2pjZnFteXRhcHh5dnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTQ1NDAsImV4cCI6MjA5MjI5MDU0MH0.Wvc2IaYUib3zO1b92tAd5d9pH4Tpzr6cMm9yGKEelKs'

export const supabase = createClient(SB_URL, SB_KEY)
