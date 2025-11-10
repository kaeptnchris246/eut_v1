declare module "express" {
  export interface Request {
    body: any;
    params: Record<string, any>;
    query: Record<string, any>;
    headers: Record<string, any>;
    user?: any;
  }

  export interface Response {
    status(code: number): Response;
    json(body: any): Response;
    send(body?: any): Response;
  }

  export type NextFunction = (error?: any) => void;
  export type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

  export interface Router {
    use(...handlers: any[]): Router;
    get(path: string, ...handlers: RequestHandler[]): Router;
    post(path: string, ...handlers: RequestHandler[]): Router;
    patch(path: string, ...handlers: RequestHandler[]): Router;
  }

  export interface Application {
    use(...handlers: any[]): Application;
    get(path: string, ...handlers: RequestHandler[]): Application;
    post(path: string, ...handlers: RequestHandler[]): Application;
    patch(path: string, ...handlers: RequestHandler[]): Application;
    listen(port: number, callback?: () => void): any;
  }

  export interface ExpressStatic {
    (): Application;
    Router(): Router;
    json(): any;
  }

  const express: ExpressStatic;
  export default express;
}
