export class AppError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFound = (message = "Resource not found") => new AppError(404, message);
export const unauthorized = (message = "Unauthorized") => new AppError(401, message);
export const forbidden = (message = "Forbidden") => new AppError(403, message);
export const badRequest = (message = "Bad request", details?: unknown) => new AppError(400, message, details);
export const conflict = (message = "Conflict") => new AppError(409, message);
