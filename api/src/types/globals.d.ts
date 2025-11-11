declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
  on(event: string, listener: (...args: any[]) => void): void;
};
