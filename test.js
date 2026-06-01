import { supabase } from './src/lib/supabase.js';

async function test() {
  const { data, error } = await supabase.from('products').select('*').limit(2);
  console.log("Data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

test();
