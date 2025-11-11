declare module "dotenv" {
  interface DotenvConfigOptions {
    path?: string;
  }

  interface DotenvConfigOutput {
    error?: Error;
    parsed?: Record<string, string>;
  }

  function config(options?: DotenvConfigOptions): DotenvConfigOutput;
  export { config };
  export default { config };
}
