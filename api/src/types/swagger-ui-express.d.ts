declare module "swagger-ui-express" {
  import { RequestHandler } from "express";

  export const serve: RequestHandler[];
  export function setup(document: unknown): RequestHandler;
}
