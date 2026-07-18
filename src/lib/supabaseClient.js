/**
 * supabaseClient.js
 * -----------------
 * Single shared Supabase client for the entire MediCore app.
 *
 * Import this wherever you need to talk to Supabase:
 *   import { supabase } from '../lib/supabaseClient'
 *
 * The URL and anon key are read from environment variables so they
 * are never hard-coded in component files. Vite exposes any variable
 * prefixed with VITE_ to the browser bundle.
 *
 * IMPORTANT: Only the publishable (anon) key is used here.
 * The service_role secret key must NEVER appear in frontend code.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
