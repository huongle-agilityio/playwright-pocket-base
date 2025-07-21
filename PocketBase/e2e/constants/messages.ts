export const MESSAGES = {
  INVALID_LOGIN_CREDENTIALS: 'Invalid login credentials.',
  SUCCESSFULLY_CREATED_RECORD: 'Successfully created record.',
  SUCCESSFULLY_UPDATED_RECORD: 'Successfully updated record.',
  SUCCESSFULLY_DELETED_RECORD: 'Successfully deleted the selected record.',
  SUCCESSFULLY_DELETED_MULTIPLE_RECORDS: 'Successfully deleted the selected records.',
  INVALID_FORMAT: 'Invalid value format.',
  INVALID_EMAIL: 'Must be a valid email address.',
  UNIQUE_VALUE: 'Value must be unique.',
  FAILED_TO_AUTHENTICATE: 'Failed to authenticate.',
  FAILED_TO_CREATE_RECORD: 'Failed to create record.',
  FAILED_TO_UPDATE_RECORD: 'Failed to update record.',
  LIMIT_CHARACTERS: (number = 3) => `Must be at least ${number} character(s).`,
} as const;
