type SessionClaimsLike =
    | {
          metadata?: {
              role?: string;
          };
      }
    | null
    | undefined;

export function getUserRole(sessionClaims: SessionClaimsLike | unknown): string | null {
    if (!sessionClaims || typeof sessionClaims !== "object") {
        return null;
    }

    const metadata = (sessionClaims as SessionClaimsLike)?.metadata;
    return typeof metadata?.role === "string" ? metadata.role : null;
}

export function isAdmin(sessionClaims: SessionClaimsLike | unknown): boolean {
    return getUserRole(sessionClaims) === "admin";
}
