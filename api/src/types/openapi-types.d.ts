declare module "openapi-types" {
  export namespace OpenAPIV3 {
    interface Document {
      openapi: string;
      info: { title: string; version: string; description?: string };
      servers?: Array<{ url: string }>;
      paths: Record<string, any>;
      components?: Record<string, any>;
      tags?: Array<{ name: string; description?: string }>;
    }
  }
}
