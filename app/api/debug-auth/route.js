import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// DEBUG endpoint to check authentication
export async function GET(request) {
    try {
        console.log('[DEBUG] Testing authentication...');

        // Check headers
        const authHeader = request?.headers?.get('Authorization');
        const cookieHeader = request?.headers?.get('cookie');

        console.log('[DEBUG] Auth header:', authHeader ? 'Present (Bearer ...)' : 'Missing');
        console.log('[DEBUG] Cookie header:', cookieHeader ? 'Present' : 'Missing');

        // Try to get current user
        const user = await getCurrentUser(request);

        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'No user found',
                debug: {
                    hasAuthHeader: !!authHeader,
                    hasCookieHeader: !!cookieHeader,
                }
            }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            debug: {
                hasAuthHeader: !!authHeader,
                hasCookieHeader: !!cookieHeader,
            }
        });

    } catch (error) {
        console.error('[DEBUG] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 });
    }
}
