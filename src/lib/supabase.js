import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = 'https://xcbtuznihpgllhwijmkr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYnR1em5paHBnbGxod2lqbWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NTk1ODcsImV4cCI6MjA3OTIzNTU4N30.GSBXgJJjixRKARKVcA9ueDuhG47sGgsdxjyLOMxGVRI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

