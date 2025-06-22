import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { storage } from '../../server/storage';
import { nanoid } from 'nanoid';

describe('Storage Layer', () => {
  let testUserId: string;
  let testChatSessionId: string;

  beforeEach(() => {
    testUserId = nanoid();
    testChatSessionId = nanoid();
  });

  afterEach(async () => {
    // Clean up test data
  });

  describe('User Operations', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        isLawyer: false
      };

      const user = await storage.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.isLawyer).toBe(false);
    });

    it('should get user by email', async () => {
      const userData = {
        name: 'Test User',
        email: 'unique@example.com',
        passwordHash: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        isLawyer: false
      };

      await storage.createUser(userData);
      const user = await storage.getUserByEmail(userData.email);

      expect(user).toBeDefined();
      expect(user?.email).toBe(userData.email);
    });

    it('should update user information', async () => {
      const userData = {
        name: 'Test User',
        email: 'update@example.com',
        passwordHash: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        isLawyer: false
      };

      const user = await storage.createUser(userData);
      const updatedUser = await storage.updateUser(user.id, {
        name: 'Updated Name',
        emailVerified: true
      });

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.emailVerified).toBe(true);
    });
  });

  describe('Chat Operations', () => {
    it('should create a chat session', async () => {
      const userData = {
        name: 'Test User',
        email: 'chat@example.com',
        passwordHash: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        isLawyer: false
      };

      const user = await storage.createUser(userData);
      const sessionData = {
        userId: user.id,
        title: 'Test Legal Question'
      };

      const session = await storage.createChatSession(sessionData);

      expect(session).toBeDefined();
      expect(session.userId).toBe(user.id);
      expect(session.title).toBe(sessionData.title);
    });

    it('should create chat messages', async () => {
      const userData = {
        name: 'Test User',
        email: 'chatmsg@example.com',
        passwordHash: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        isLawyer: false
      };

      const user = await storage.createUser(userData);
      const session = await storage.createChatSession({
        userId: user.id,
        title: 'Test Session'
      });

      const messageData = {
        userId: user.id,
        sessionId: session.id,
        content: 'What are my rights?',
        sender: 'user'
      };

      const message = await storage.createChatMessage(messageData);
      const messages = await storage.getChatMessages(session.id);

      expect(message.id).toBeDefined();
      expect(message.content).toBe('What are my rights?');
      expect(message.sender).toBe('user');
    });

    it('should retrieve chat messages for a session', async () => {
      const userData = {
        name: 'Test User',
        email: 'retrieve@example.com',
        passwordHash: 'hashed_password',
        isLawyer: false
      };

      const user = await storage.createUser(userData);
      const session = await storage.createChatSession({
        userId: user.id,
        title: 'Test Session'
      });

      const userMessage = {
        userId: user.id,
        sessionId: session.id,
        content: 'Hello',
        sender: 'user'
      };

      const assistantMessage = {
        userId: user.id,
        sessionId: session.id,
        content: 'Hi there!',
        sender: 'assistant'
      };

      await storage.createChatMessage(userMessage);

      await storage.createChatMessage(assistantMessage);

      const messages = await storage.getChatMessages(session.id);

      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Hello');
      expect(messages[1].content).toBe('Hi there!');
    });
  });

  describe('Lawyer Operations', () => {
    it('should create a lawyer profile', async () => {
      const userData = {
        name: 'Test Lawyer',
        email: 'lawyer@example.com',
        passwordHash: 'hashed_password',
        isLawyer: true
      };

      const user = await storage.createUser(userData);
      const lawyerData = {
        userId: user.id,
        licenseNumber: 'BAR001',
        specialization: 'Family Law',
        experienceYears: 5,
        practiceAreas: ['Family Law', 'Divorce'],
        languages: ['English', 'French'],
        verified: true
      };

      const lawyer = await storage.createLawyer(lawyerData);

      expect(lawyer.id).toBeDefined();
      expect(lawyer.specialization).toBe(lawyerData.specialization);
      expect(lawyer.experienceYears).toBe(5);
    });

    it('should filter lawyers by specialization', async () => {
      // Create test lawyers with different specializations
      const user1 = await storage.createUser({
        name: 'Contract Lawyer',
        email: 'contract@example.com',
        passwordHash: 'hash',
        isLawyer: true
      });

      const user2 = await storage.createUser({
        name: 'Criminal Lawyer',
        email: 'criminal@example.com',
        passwordHash: 'hash',
        isLawyer: true
      });

      const lawyer1Data = {
        userId: user1.id,
        licenseNumber: 'BAR001',
        specialization: 'Criminal Law',
        experienceYears: 10,
        practiceAreas: ['Criminal Law', 'Defense'],
        languages: ['English', 'French'],
        verified: true
      };

      const lawyer2Data = {
        userId: user2.id,
        licenseNumber: 'BAR002',
        specialization: 'Family Law',
        experienceYears: 5,
        practiceAreas: ['Family Law', 'Divorce'],
        languages: ['English'],
        verified: true
      };

      await storage.createLawyer(lawyer1Data);

      await storage.createLawyer(lawyer2Data);

      const contractLawyers = await storage.getLawyers({
        specialization: 'Contract Law'
      });

      expect(contractLawyers).toHaveLength(0);
      const criminalLawyers = await storage.getLawyers({
        specialization: 'Criminal Law'
      });
      expect(criminalLawyers).toHaveLength(1);
    });
  });

  describe('Verification Operations', () => {
    it('should create and retrieve verification codes', async () => {
      const userData = {
        name: 'Test User',
        email: 'verify@example.com',
        passwordHash: 'hashed_password',
        isLawyer: false
      };

      const user = await storage.createUser(userData);
      const codeData = {
        userId: user.id,
        type: 'email_verification',
        code: '123456',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      };

      const verificationCode = await storage.createVerificationCode(codeData);

      expect(verificationCode).toBeDefined();
      expect(verificationCode.code).toBe(codeData.code);
      expect(verificationCode.type).toBe(codeData.type);

      const retrievedCode = await storage.getVerificationCode(
        user.id,
        'email_verification',
        '123456'
      );

      expect(retrievedCode).toBeDefined();
      expect(retrievedCode?.code).toBe('123456');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent user creation', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        storage.createUser({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          passwordHash: 'hash',
          isLawyer: false
        })
      );

      const users = await Promise.all(promises);
      expect(users).toHaveLength(10);

      // Verify all users have unique IDs
      const ids = users.map(u => u.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });
  });
});