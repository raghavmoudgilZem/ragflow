declare module 'better-sqlite3' {
  interface Statement<T = any> {
    get(...params: any[]): T | undefined;
    all(...params: any[]): T[];
    run(...params: any[]): { changes: number };
  }

  class Database {
    constructor(filename: string, options?: any);
    exec(sql: string): void;
    prepare(sql: string): Statement;
    pragma(pragma: string): any;
    close(): void;
  }

  export = Database;
}
