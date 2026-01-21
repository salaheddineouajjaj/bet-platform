import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    db: {
        schema: 'public',
    },
    global: {
        headers: {
            'x-application-name': 'bet-platform',
        },
    },
});

// Helper function to get current session
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

// Helper function to get current user
export async function getCurrentUser() {
    const session = await getSession();
    if (!session) return null;

    // Get user details from our database
    const { data: user, error } = await supabase
        .from('User')
        .select('*')
        .eq('email', session.user.email)
        .single();

    if (error) throw error;
    return user;
}

// Sign in with email/password
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

// Sign out
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// Sign up new user
export async function signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: userData,
        },
    });

    if (error) throw error;
    return data;
}
