
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkShopItems() {
    const { data, error } = await supabase.from('shop_items').select('id, name').limit(5);
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Shop Items in DB:', data);
}

checkShopItems();
