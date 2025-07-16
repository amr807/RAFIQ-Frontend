import { NextRequest } from "next/server";

export type UserCredentials = {
  refreshToken: string;
  accessToken: string;
  tokenExpires: number;
};

export function getUserCredentials(req: NextRequest): UserCredentials | null {
  const tokens = req.cookies.get('tokens')?.value;
  if (!tokens) return null;
  const credentials = JSON.parse(tokens) as UserCredentials;
  return credentials
}
