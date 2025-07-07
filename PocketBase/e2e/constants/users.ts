// Interfaces
import { User } from '@/interfaces';

// Utils
import { generateUserId } from '@/utils';

export const USER = {
  USER_NAME: process.env.USER_NAME,
  PASSWORD: process.env.PASSWORD,

  INVALID_USER_NAME: process.env.INVALID_USER_NAME,
  INVALID_PASSWORD: process.env.INVALID_PASSWORD,
};

export const MOCK_USER: User = {
  id: generateUserId(),
  email: `test${generateUserId()}@gmail.com`,
  password: 'test123@',
  passwordConfirm: 'test123@',
};
