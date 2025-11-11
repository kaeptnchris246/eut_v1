declare module "cors" {
  interface CorsOptions {
    origin?: string | string[];
    credentials?: boolean;
  }

  type CorsMiddleware = (req: any, res: any, next: (error?: any) => void) => void;

  function cors(options?: CorsOptions): CorsMiddleware;
  export = cors;
}
