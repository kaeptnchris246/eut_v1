declare module "jsonwebtoken" {
  export interface SignOptions {
    expiresIn?: string | number;
  }
  export function sign(payload: any, secret: string, options?: SignOptions): string;
  export function verify(token: string, secret: string): any;
}
