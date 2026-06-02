import { createClient } from '@supabase/supabase-js'
const supabaseUrl = "https://cmsbdsnutzvizazxrlmb.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtc2Jkc251dHp2aXphenhybG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMjY5ODAsImV4cCI6MjA5NTcwMjk4MH0.DvbGo_VHiepC37O1P6OZ0uGFyjx6yH9xJm5OsH3Dpf8"
const supabase = createClient(supabaseUrl, supabaseAnonKey)
async function run() {
  const { data, error } = await supabase.from('products').select('*').limit(1)
  console.log("Product columns:", data && data.length > 0 ? Object.keys(data[0]) : "No products found")
  console.log("Product data:", JSON.stringify(data, null, 2))
  console.log("Error:", error)
}
run()
