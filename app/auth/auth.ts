import * as bcrypt from 'bcryptjs';

export default class Auth {

  public static async hashPassword(password: string, rounds: number) {
    const hashedPassword = await new Promise(function (resolve, reject) {
      bcrypt.hash(password, rounds, (error, hash) => {
        if (error) {
          reject(error)
        } else {
          resolve(hash)
        }
      });
    });
    return hashedPassword;
  }

  public static async compare(password: string, dbHash: string) {
    const match = await new Promise(function (resolve, reject) {
      bcrypt.compare(password, dbHash, (error, hash) => {
        if (error) {
          reject(error)
        } else {
          resolve(hash)
        }
      });
    });
    return match;
  }

  public static requireAuth(context) {
    if (!context) {
      throw new Error('You are not authorized!')
    }
  }

  public static requireSpecificAuth(context, value) {
    if (context != value) {
      throw new Error('You are not authorized!')
    }
  }
}