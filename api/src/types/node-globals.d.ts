declare const process: {
  env: Record<string, string | undefined>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  exit: (code?: number) => never;
};
