
import request from 'supertest';
import { app } from '../../index';
import { createTestDatabase, cleanupTestDatabase } from '../test-utils';

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    await createTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        user: {
          email: userData.email,
          name: userData.name,
          role: userData.role
        }
      });
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.token).toBeDefined();
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'weak@example.com',
        password: '123',
        name: 'Weak User',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('Password must be at least');
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
        name: 'First User',
        role: 'user'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error).toContain('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    const testUser = {
      email: 'login@example.com',
      password: 'LoginPass123!',
      name: 'Login User',
      role: 'user'
    };

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.token).toBeDefined();
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });
  });

  describe('2FA Integration', () => {
    let userToken: string;
    let userId: string;

    beforeEach(async () => {
      const userData = {
        email: '2fa@example.com',
        password: 'TwoFactorPass123!',
        name: '2FA User',
        role: 'user'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      userToken = registerResponse.body.token;
      userId = registerResponse.body.user.id;
    });

    it('should setup TOTP 2FA successfully', async () => {
      const response = await request(app)
        .post('/api/auth/setup-2fa')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ method: 'totp' })
        .expect(200);

      expect(response.body.secret).toBeDefined();
      expect(response.body.qrCode).toBeDefined();
      expect(response.body.backupCodes).toHaveLength(10);
    });

    it('should verify and enable 2FA', async () => {
      // Setup 2FA first
      const setupResponse = await request(app)
        .post('/api/auth/setup-2fa')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ method: 'totp' });

      // Simulate TOTP verification (in real test, you'd generate actual TOTP)
      const mockTotpCode = '123456';
      
      const verifyResponse = await request(app)
        .post('/api/auth/verify-2fa-setup')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ code: mockTotpCode })
        .expect(200);

      expect(verifyResponse.body.message).toContain('2FA enabled');
    });
  });
});
