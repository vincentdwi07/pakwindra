import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  'https://qkoewbkgwoncumsydqdp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrb2V3Ymtnd29uY3Vtc3lkcWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTIxMDUsImV4cCI6MjA2NjQyODEwNX0._bAkewG_24PsFVHVCV7mT9jPqDgIjNUJ7kR_TTFwa7o', 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Untuk client-side operations
export const supabaseClient = createClient(
  'https://qkoewbkgwoncumsydqdp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrb2V3Ymtnd29uY3Vtc3lkcWRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1MjEwNSwiZXhwIjoyMDY2NDI4MTA1fQ.hJN8h9Z8qxt1z0Gi4QYspmwo7sJK9QBplxYQi9hRliw'
)