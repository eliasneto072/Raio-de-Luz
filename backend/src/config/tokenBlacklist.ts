class TokenBlacklist {
  private tokens: Map<string, number> = new Map();

  add(token: string, expiresAt: number): void {
    this.tokens.set(token, expiresAt);
    this.cleanup();
  }

  has(token: string): boolean {
    return this.tokens.has(token);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [token, exp] of this.tokens.entries()) {
      if (exp < now) this.tokens.delete(token);
    }
  }
}

export const tokenBlacklist = new TokenBlacklist();