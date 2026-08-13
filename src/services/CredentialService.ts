import bcrypt from "bcryptjs";

export class CredentialService {
  async comparePassword(password: string, hashPassword: string) {
    return await bcrypt.compare(password, hashPassword);
  }
}
