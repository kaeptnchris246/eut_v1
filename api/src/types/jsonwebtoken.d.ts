declare module "jsonwebtoken" {
  export interface SignOptions {
    expiresIn?: string | number;
  }

  export interface JwtPayload {
    [key: string]: any;
  }

  export function sign(payload: string | Buffer | object, secretOrPrivateKey: string, options?: SignOptions): string;
  export function verify<T = JwtPayload>(token: string, secretOrPublicKey: string): T;
}
