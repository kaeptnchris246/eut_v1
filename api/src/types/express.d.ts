declare module "express" {
  export interface Request<Params = Record<string, any>, ResBody = any, ReqBody = any, ReqQuery = Record<string, any>> {
    params: Params;
    body: ReqBody;
    query: ReqQuery;
    headers: Record<string, any> & { authorization?: string };
    user?: any;
  }

  export interface Response<ResBody = any> {
    json(body: ResBody): Response<ResBody>;
    status(code: number): Response<ResBody>;
    send(body?: any): Response<ResBody>;
  }

  export type NextFunction = (error?: any) => void;
  export type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

  export interface Router {
    use(...handlers: any[]): Router;
    get(path: string, ...handlers: RequestHandler[]): Router;
    post(path: string, ...handlers: RequestHandler[]): Router;
    patch(path: string, ...handlers: RequestHandler[]): Router;
    delete(path: string, ...handlers: RequestHandler[]): Router;
  }

  export interface Application extends Router {
    listen(port: number, callback?: () => void): any;
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
