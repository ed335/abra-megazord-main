const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET is not set in environment variables');
}

export function getJWTSecret(): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Authentication cannot proceed.');
  }
  return JWT_SECRET;
}

export default JWT_SECRET || '';
