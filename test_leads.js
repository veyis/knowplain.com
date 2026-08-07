require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

supabase.from('knowplain_leads')
  .insert(
    { email: 'test2@example.com', source: 'retirement_checkup', notes: 'test' }
  )
  .then(res => console.log("Duplicate Insert Result:", JSON.stringify(res, null, 2)))
  .catch(err => console.error("Error:", err));
