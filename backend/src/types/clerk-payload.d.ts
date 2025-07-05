export interface ClerkJwtPublicMetadata {
  role?: string;
  teamId?: string;
}

export interface ClerkJwtPayload {
  sub: string;
  email: string;
  publicMetadata?: ClerkJwtPublicMetadata;
}
