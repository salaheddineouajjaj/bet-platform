/**
 * Script to sync existing Auth users to User table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testUsers = [
    { email: 'chef@bet-platform.com', name: 'Marie Dupont', role: 'CHEF_DE_PROJET', lot: null },
    { email: 'structure@bet-platform.com', name: 'Pierre Martin', role: 'REFERENT_LOT', lot: 'Structure' },
    { email: 'cvc@bet-platform.com', name: 'Sophie Bernard', role: 'REFERENT_LOT', lot: 'CVC' },
    { email: 'contrib@bet-platform.com', name: 'Lucas Électricité', role: 'CONTRIBUTEUR', lot: 'Électricité' },
    { email: 'moa@bet-platform.com', name: 'Jean Architecte', role: 'EXTERNE', lot: null },
];

async function syncUsers() {
    console.log('🔄 Syncing users to database...\n');

    // Get all auth users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    for (const userData of testUsers) {
        const authUser = users.find(u => u.email === userData.email);

        if (!authUser) {
            console.log(`⚠️  ${userData.email} - Not found in Auth`);
            continue;
        }

        try {
            // Check if already exists in User table
            const { data: existing } = await supabase
                .from('User')
                .select('id')
                .eq('email', userData.email)
                .single();

            if (existing) {
                console.log(`✅ ${userData.email} - Already in database`);
                continue;
            }

            // Insert into User table
            const now = new Date().toISOString();
            const { error: insertError } = await supabase
                .from('User')
                .insert({
                    id: authUser.id,
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                    lot: userData.lot,
                    createdAt: now,
                    updatedAt: now,
                });

            if (insertError) throw insertError;

            console.log(`✅ ${userData.email} - Added to database`);
        } catch (err) {
            console.error(`❌ ${userData.email} - Error:`, err.message);
        }
    }

    console.log('\n✨ Done!');
}

syncUsers();
