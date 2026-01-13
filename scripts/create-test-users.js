/**
 * Script to create test users in Supabase
 * Run: node scripts/create-test-users.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const testUsers = [
    {
        email: 'chef@bet-platform.com',
        password: 'demo123',
        name: 'Marie Dupont',
        role: 'CHEF_DE_PROJET',
        lot: null,
    },
    {
        email: 'structure@bet-platform.com',
        password: 'demo123',
        name: 'Pierre Martin',
        role: 'REFERENT_LOT',
        lot: 'Structure',
    },
    {
        email: 'cvc@bet-platform.com',
        password: 'demo123',
        name: 'Sophie Bernard',
        role: 'REFERENT_LOT',
        lot: 'CVC',
    },
    {
        email: 'contrib@bet-platform.com',
        password: 'demo123',
        name: 'Lucas Électricité',
        role: 'CONTRIBUTEUR',
        lot: 'Électricité',
    },
    {
        email: 'moa@bet-platform.com',
        password: 'demo123',
        name: 'Jean Architecte',
        role: 'EXTERNE',
        lot: null,
    },
];

async function createTestUsers() {
    console.log('🚀 Creating test users in Supabase...\n');

    for (const userData of testUsers) {
        try {
            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true,
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    console.log(`⚠️  ${userData.email} - Already exists`);
                    continue;
                }
                throw authError;
            }

            // Create user record in database with timestamps
            const now = new Date().toISOString();
            const { error: dbError } = await supabase
                .from('User')
                .insert({
                    id: authData.user.id,
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                    lot: userData.lot,
                    createdAt: now,
                    updatedAt: now,
                });

            if (dbError) throw dbError;

            console.log(`✅ ${userData.email} - ${userData.name} (${userData.role})`);
        } catch (error) {
            console.error(`❌ Error creating ${userData.email}:`, error.message);
        }
    }

    console.log('\n✨ Done! Test users created.');
    console.log('\n📝 Login credentials:');
    console.log('   Email: Any of the above emails');
    console.log('   Password: demo123');
}

createTestUsers();
