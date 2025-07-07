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

export interface Table
  extends Pick<User, 'email' | 'id' | 'name' | 'avatar' | 'website' | 'username'> {
  emailVisibility?: boolean;
  verified?: boolean;
}
