import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSubmit() {
    console.log("Testing waitlist submission...");
    const { data, error } = await supabase
        .from('waitlist')
        .insert([{
            full_name: "Test User",
            email: "test_" + Math.random().toString(36).substring(7) + "@example.com",
            status: 'pending',
            metadata: { test: true }
        }])
        .select();

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success! Data recorded:", data);
    }
}

testSubmit();
