export interface User {
  id?: string;
  email: string;
  password: string;
  passwordConfirm?: string;
  isVerified?: boolean;
  isEmailVisibility?: boolean;
  username?: string;
  name?: string;
  avatar?: string;
  website?: string;
}
