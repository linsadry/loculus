import { createClient } from '@supabase/supabase-js'

const SB_URL = import.meta.env.VITE_SUPABASE_URL || 'https://unjbdcjcfqmytapxyvuf.supabase.co'
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamJkY2pjZnFteXRhcHh5dnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3ODUzNDAsImV4cCI6MjA2MTM2MTM0MH0.j4VQfPNvAyMOkN7F3eiGSBzSV-WBzZ_XRhNjOY8bT_E'

export const supabase = createClient(SB_URL, SB_KEY)
