declare module "pg" {
  export interface QueryResultRow {
    [column: string]: any;
  }

  export interface QueryResult<T extends QueryResultRow = QueryResultRow> {
    command: string;
    rowCount: number;
    rows: T[];
  }

  export interface PoolConfig {
    connectionString?: string;
  }

  export interface PoolClient {
    release(): void;
    query<T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>>;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>>;
    connect(): Promise<PoolClient>;
    on(event: "error", listener: (error: Error) => void): this;
  }
}
