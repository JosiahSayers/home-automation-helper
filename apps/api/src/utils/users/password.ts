import bcrypt from 'bcryptjs';

export const encrypt = async (password: string): Promise<string> => {
  const saltLength = 10;
  return bcrypt.hash(password, saltLength);
};

export const doPasswordsMatch = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => bcrypt.compare(password, hashedPassword);
