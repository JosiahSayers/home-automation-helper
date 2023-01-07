import { expect, it, describe, afterEach, beforeEach } from 'vitest';
import { trpcRouter } from '../src/app';
import * as trpc from '@trpc/server';
import { db } from '../src/utils/db';
import { encrypt } from '../src/utils/users/password';
import { truncateDb } from '../src/utils/test-helpers/teardown';
import { User } from '@prisma/client';

const caller = trpcRouter.createCaller({});

describe('user.', () => {
  const currentTime = new Date().getTime();
  const email = `${currentTime}@test.com`;
  const createTestUser = async () =>
    db.user.create({
      data: {
        email,
        password: await encrypt('password'),
        name: currentTime.toString(),
      },
    });
  afterEach(() => truncateDb());

  describe('register', () => {
    it('Allows a user to register', async () => {
      const response = await caller.user.register({
        email,
        password: 'password',
        name: currentTime.toString(),
      });
      expect(response).toEqual(
        expect.objectContaining({
          email,
          name: currentTime.toString(),
        })
      );
    });

    it('does not allow duplicate emails', async () => {
      await createTestUser();
      try {
        await caller.user.register({
          email,
          password: 'password',
          name: currentTime.toString(),
        });
        // Should not make it past here as error should be thrown by procedure
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toBeInstanceOf(trpc.TRPCError);
      }
    });
  });

  describe('authenticate', async () => {
    beforeEach(async () => {
      await createTestUser();
    });

    it('returns a token when auth is successful', async () => {
      const res = await caller.user.authenticate({
        email,
        password: 'password',
      });
      expect(res.token).toBeDefined();
    });

    it('does not return a token when the email is wrong', async () => {
      try {
        await caller.user.authenticate({
          email: 'bad-email@test.com',
          password: 'password',
        });
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeInstanceOf(trpc.TRPCError);
        expect(e.code).toBe('UNAUTHORIZED');
      }
    });

    it('does not return a token when the password is wrong', async () => {
      try {
        await caller.user.authenticate({
          email,
          password: 'wrong-password',
        });
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeInstanceOf(trpc.TRPCError);
        expect(e.code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('current', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await createTestUser();
    });

    it('returns the current user information', async () => {
      const authenticatedCaller = trpcRouter.createCaller({ uid: testUser.id });
      const res = await authenticatedCaller.user.current();
      expect(res).toEqual({
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
        createdAt: testUser.createdAt,
        updatedAt: testUser.updatedAt,
      });
    });

    it('returns an error when no user is logged in', async () => {
      try {
        await caller.user.current();
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeInstanceOf(trpc.TRPCError);
        expect(e.code).toBe('UNAUTHORIZED');
      }
    });
  });
});
