import bcrypt from "bcrypt";

export class CredentialService {
  async comparePassword(password: string, hashPassword: string) {
    return await bcrypt.compare(password, hashPassword);
  }
}
