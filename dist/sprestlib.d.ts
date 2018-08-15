// Type definitions for sprestlib 1.8.0
// Project: https://gitbrent.github.io/SpRestLib/
// Definitions by: Brent Ely <https://github.com/gitbrent/>
//                 Jandos <https://github.com/Wireliner>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

declare namespace sprLib {
  const version: string;

  function baseUrl(): string;
  function baseUrl(baseUrl: string): void;

  function nodeConfig(options: Object): void;

  function renewSecurityToken(): void;

  class file {
    constructor(fileName: string);

    info(): Promise<Object>;
    perms(): Promise<Object[]>;
    version(): Promise<Object>;
  }

  /**
   * SharePoint List/Library API.
   *
   * @see \`{@link https://gitbrent.github.io/SpRestLib/docs/api-list.html }\`
   * @since 1.0
   */
  interface ListOptions {
    name: string;
    baseUrl?: string;
    requestDigest?: string;
  }
  interface ListItemsOptions {
    listCols?: Array<string> | Object;
    metadata?: boolean;
    queryFilter?: string;
    queryLimit?: number;
    queryNext?: Object;
    queryOrderBy?: string;
  }
  class list {
    constructor(listName: string);
    constructor(listGuid: string);
    constructor(options: ListOptions);

    cols(): Promise<Object[]>;
    info(): Promise<Object>;
    perms(): Promise<Object[]>;

    items(options: ListItemsOptions): Promise<Object[]>;
    create(options: Object): Promise<Object[]>;
    update(options: Object): Promise<Object[]>;
    delete(options: Object): Promise<number>;
    recycle(options: Object): Promise<number>;
  }

  interface RestOptions {
    url: string;
    type?: 'GET' | 'POST' | 'DELETE';
    data?: Object;
    headers?: any;
    requestDigest?: string;
  }
  function rest(options: RestOptions): Promise<Object[]>;

  class site {
    constructor(siteUrl?: string);

    info(): Promise<Object>;
    lists(): Promise<Object[]>;
    subsites(): Promise<Object[]>;
    perms(): Promise<Object[]>;
    roles(): Promise<Object[]>;
    groups(): Promise<Object[]>;
    users(): Promise<Object[]>;
  }

  interface UserOptions {
    id?: string;
    email?: string;
    login?: string;
    title?: string;
  }

  class user {
    constructor(options?: UserOptions);

    info(): Promise<Object>;
    groups(): Promise<Object[]>;
    profile(arrProfileKeys: Object): Object;
  }
}
