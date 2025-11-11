declare module "helmet" {
  import { RequestHandler } from "express";

  interface HelmetContentSecurityPolicyOptions {
    useDefaults?: boolean;
    directives?: Record<string, string[]>;
  }

  interface HelmetOptions {
    crossOriginEmbedderPolicy?: boolean;
    contentSecurityPolicy?: boolean | HelmetContentSecurityPolicyOptions;
  }

  function helmet(options?: HelmetOptions): RequestHandler;
  export default helmet;
}
