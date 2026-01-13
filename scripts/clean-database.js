/**
 * Script to clean all test data from database
 * Run: node scripts/clean-database.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanDatabase() {
    console.log('🧹 Cleaning database...\n');

    try {
        // Delete all projects (cascade will delete related data)
        const { error: projectsError } = await supabase
            .from('Project')
            .delete()
            .neq('id', ''); // Delete all

        if (projectsError) throw projectsError;
        console.log('✅ All projects deleted');

        // Clean other tables if needed
        const tables = ['Deliverable', 'Remark', 'Meeting', 'Decision', 'Risk', 'Document'];

        for (const table of tables) {
            const { error } = await supabase
                .from(table)
                .delete()
                .neq('id', '');

            if (error) {
                console.log(`⚠️  ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table} cleaned`);
            }
        }

        console.log('\n✨ Database cleaned successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

cleanDatabase();
