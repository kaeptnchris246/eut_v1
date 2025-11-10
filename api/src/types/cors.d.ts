declare module "cors" {
  import { RequestHandler } from "express";
  interface CorsOptions {
    origin?: string | string[];
    credentials?: boolean;
  }
  function cors(options?: CorsOptions): RequestHandler;
  export default cors;
}
