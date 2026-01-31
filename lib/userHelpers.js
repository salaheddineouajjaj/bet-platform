import prisma from './prisma';

/**
 * Ensures a user exists in the database and returns their actual ID.
 * Handles the fallback user case by finding or creating the user.
 * 
 * @param {Object} user - User object from requireAuth
 * @returns {Promise<string>} Actual user ID from database
 */
export async function ensureUserInDatabase(user) {
    // If already a real user ID, return it
    if (user.id !== 'fallback-id') {
        return user.id;
    }

    console.log('[USER] Fallback user detected, finding/creating actual user...');

    // Try to find user by email
    let dbUser = await prisma.user.findUnique({
        where: { email: user.email }
    });

    // If user doesn't exist, create them
    if (!dbUser) {
        console.log('[USER] Creating user in database:', user.email);
        dbUser = await prisma.user.create({
            data: {
                email: user.email,
                name: user.name,
                role: user.role,
                lot: user.lot || null,
            }
        });
    }

    console.log('[USER] Using actual user ID:', dbUser.id);
    return dbUser.id;
}
