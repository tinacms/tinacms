// Utility to generate test password hashes for authentication tests
// Run with: node generate-test-data.mjs

import { randomBytes, pbkdf2 } from 'crypto';

const DEFAULT_SALT_LENGTH = 32;
const DEFAULT_KEY_LENGTH = 512;
const DEFAULT_ITERATIONS = 25000;
const DEFAULT_DIGEST = 'sha256';

const generatePasswordHash = async (password) => {
  if (!password) {
    throw new Error('Password is required');
  }
  if (password.length < 3) {
    throw new Error('Password must be at least 3 characters');
  }

  const salt = (
    await new Promise((resolve, reject) => {
      randomBytes(DEFAULT_SALT_LENGTH, (err, saltBuffer) => {
        if (err) {
          reject(err);
        }
        resolve(saltBuffer);
      });
    })
  ).toString('hex');

  const hash = (
    await new Promise((resolve, reject) => {
      pbkdf2(
        password,
        salt,
        DEFAULT_ITERATIONS,
        DEFAULT_KEY_LENGTH,
        DEFAULT_DIGEST,
        (err, hashBuffer) => {
          if (err) {
            reject(err);
          }
          resolve(hashBuffer);
        }
      );
    })
  ).toString('hex');
  return `${salt}${hash}`;
};

// Generate test data
const generateTestUsers = async () => {
  const users = [
    {
      username: 'northwind',
      name: 'Mr Bob Northwind',
      email: 'bob@northwind.com',
      password: 'northwind123'
    },
    {
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword'
    }
  ];

  const hashedUsers = [];
  for (const user of users) {
    const hashedPassword = await generatePasswordHash(user.password);
    hashedUsers.push({
      username: user.username,
      name: user.name,
      email: user.email,
      password: {
        value: hashedPassword
      }
    });
    console.log(`Generated hash for ${user.username} (password: ${user.password})`);
  }

  const userData = {
    users: hashedUsers
  };

  console.log('\nGenerated user data:');
  console.log(JSON.stringify(userData, null, 2));
  
  return userData;
};

generateTestUsers().catch(console.error);
