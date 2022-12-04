import { inferAsyncReturnType } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { verifyToken } from './utils/authentication/session';

export async function createContext({
  req,
}: trpcExpress.CreateExpressContextOptions) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return {};
  }

  const uid = verifyToken(token);
  if (!uid) {
    return {};
  }

  return { uid };
}

export type Context = inferAsyncReturnType<typeof createContext>;
