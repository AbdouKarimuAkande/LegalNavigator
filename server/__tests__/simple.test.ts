import { describe, it, expect } from '@jest/globals';
import { storage } from '../storage';

describe('Simple Storage Tests', () => {
  it('should create a user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashedpassword123',
      firstName: 'Test',
      lastName: 'User',
      isLawyer: false,
      twoFactorEnabled: false,
      emailVerified: false
    };

    const user = await storage.createUser(userData);
    
    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
  });

  it('should retrieve user by email', async () => {
    const userData = {
      name: 'Test User 2',
      email: 'test2@example.com',
      passwordHash: 'hashedpassword123',
      firstName: 'Test',
      lastName: 'User',
      isLawyer: false,
      twoFactorEnabled: false,
      emailVerified: false
    };

    const createdUser = await storage.createUser(userData);
    const foundUser = await storage.getUserByEmail('test2@example.com');
    
    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(createdUser.id);
  });
});