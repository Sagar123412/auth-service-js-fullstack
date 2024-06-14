import { Request } from 'express';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface userRequestType extends Request {
  body: UserData;
}
