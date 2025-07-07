import { UserFromClerk } from './user';

declare global {
  namespace Express {
    interface Request {
      user?: UserFromClerk;
    }
  }
}
