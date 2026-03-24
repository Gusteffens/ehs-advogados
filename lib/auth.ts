export function isAdmin(sessionClaims: any): boolean {
    return sessionClaims?.metadata?.role === 'admin';
}
