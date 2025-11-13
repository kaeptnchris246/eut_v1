declare module "cors" {
  import type { RequestHandler } from "express";

  export interface CorsOptions {
    origin?: string | RegExp | (string | RegExp)[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
    credentials?: boolean;
  }

  const cors: (options?: CorsOptions) => RequestHandler;
  export default cors;
}

declare module "express" {
  type IncomingHttpHeaders = Record<string, string | string[] | undefined>;

  export interface Request<Params = Record<string, any>, ResBody = any, ReqBody = any, ReqQuery = Record<string, any>> {
    params: Params;
    body: ReqBody;
    query: ReqQuery;
    headers: IncomingHttpHeaders & { authorization?: string };
    user?: any;
  }

  export interface Response<ResBody = any> {
    json(body: ResBody): Response<ResBody>;
    status(code: number): Response<ResBody>;
    send(body?: any): Response<ResBody>;
  }

  export type NextFunction = (error?: any) => void;
  export type RequestHandler<
    Params = Record<string, any>,
    ResBody = any,
    ReqBody = any,
    ReqQuery = Record<string, any>,
  > = (
    req: Request<Params, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => any;

  export interface Router {
    use(...handlers: any[]): Router;
    get<Params = Record<string, any>, ResBody = any, ReqBody = any, ReqQuery = Record<string, any>>(
      path: string,
      ...handlers: RequestHandler<Params, ResBody, ReqBody, ReqQuery>[]
    ): Router;
    post<Params = Record<string, any>, ResBody = any, ReqBody = any, ReqQuery = Record<string, any>>(
      path: string,
      ...handlers: RequestHandler<Params, ResBody, ReqBody, ReqQuery>[]
    ): Router;
    patch<Params = Record<string, any>, ResBody = any, ReqBody = any, ReqQuery = Record<string, any>>(
      path: string,
      ...handlers: RequestHandler<Params, ResBody, ReqBody, ReqQuery>[]
    ): Router;
    delete<Params = Record<string, any>, ResBody = any, ReqBody = any, ReqQuery = Record<string, any>>(
      path: string,
      ...handlers: RequestHandler<Params, ResBody, ReqBody, ReqQuery>[]
    ): Router;
  }

  export interface Application extends Router {
    listen(port: number, callback?: () => void): { close(callback?: () => void): void };
  }

  export interface ExpressStatic {
    (): Application;
    Router(): Router;
    json(): RequestHandler;
  }

  export function Router(): Router;

  const express: ExpressStatic;
  export default express;
}

declare module "swagger-ui-express" {
  import type { RequestHandler } from "express";
  import type { OpenAPIV3 } from "openapi-types";

  export const serve: RequestHandler[];
  export const setup: (document: OpenAPIV3.Document) => RequestHandler;
}

declare module "express-rate-limit" {
  import type { RequestHandler } from "express";

  export interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
  }

  const rateLimit: (options?: RateLimitOptions) => RequestHandler;
  export default rateLimit;
}

declare module "helmet" {
  import type { RequestHandler } from "express";

  export interface HelmetContentSecurityPolicyOptions {
    useDefaults?: boolean;
    directives?: Record<string, readonly string[]>;
  }

  export interface HelmetOptions {
    crossOriginEmbedderPolicy?: boolean;
    contentSecurityPolicy?: HelmetContentSecurityPolicyOptions;
  }

  const helmet: (options?: HelmetOptions) => RequestHandler;
  export default helmet;
}

declare module "jsonwebtoken" {
  export interface SignOptions {
    expiresIn?: string | number;
  }

  export function sign(payload: any, secret: string, options?: SignOptions): string;
  export function verify<T>(token: string, secret: string): T;
  const _default: {
    sign: typeof sign;
    verify: typeof verify;
  };
  export default _default;
}

declare module "dotenv" {
  export interface DotenvConfigOutput {
    parsed?: Record<string, string>;
    error?: Error;
  }

  export function config(): DotenvConfigOutput;
  const _default: {
    config: typeof config;
  };
  export default _default;
}

declare module "pg" {
  export interface QueryResultRow {
    [column: string]: any;
  }

  export interface QueryResult<T extends QueryResultRow = QueryResultRow> {
    rows: T[];
    rowCount: number;
  }

  export class PoolClient {
    release(): void;
    query<T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>>;
  }

  export interface PoolConfig {
    connectionString?: string;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>>;
    connect(): Promise<PoolClient>;
    on(event: "error", listener: (error: Error) => void): void;
  }
}

declare module "openapi-types" {
  export namespace OpenAPIV3 {
    export interface Document {
      openapi: string;
      info: { title: string; version: string; description?: string };
      servers?: Array<{ url: string }>;
      components?: Record<string, any>;
      paths?: Record<string, any>;
      security?: Array<Record<string, any>>;
    }
  }
}
