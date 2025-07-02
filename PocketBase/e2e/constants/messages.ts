export const MESSAGES = {
  INVALID_LOGIN_CREDENTIALS: 'Invalid login credentials.',
  SUCCESSFULLY_CREATED_RECORD: 'Successfully created record.',
  INVALID_FORMAT: 'Invalid value format.',
  INVALID_EMAIL: 'Must be a valid email address.',
  UNIQUE_VALUE: 'Value must be unique.',
  FAILED_TO_AUTHENTICATE: 'Failed to authenticate.',
  FAILED_TO_CREATE_RECORD: 'Failed to create record.',
  LIMIT_CHARACTERS: (number = 3) => `Must be at least ${number} character(s).`,
};
