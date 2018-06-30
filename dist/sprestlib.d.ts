// Type definitions for sprestlib v1.7.0
// Project: https://gitbrent.github.io/SpRestLib/
// Definitions by: Brent Ely <https://github.com/gitbrent/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace sprLib {
  const version: string;

  function baseUrl(): string;
  function baseUrl(baseUrl: string): void;

  function nodeConfig(options: Object): void;

  function renewSecurityToken(): void;

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

  class list {
    constructor(listName: string);
    constructor(listGuid: string);
    constructor(options: ListOptions);

    cols(): Object[];
    info(): Object[];
    perms(): Object[];

    items(options: Object): Promise<Object[]>;
    create(options: Object): Promise<Object[]>;
    update(options: Object): Promise<Object[]>;
    delete(options: Object): Promise<number>;
    recycle(options: Object): Promise<number>;
  }

  interface RestOptions {
    url: string;
    type: 'GET' | 'POST' | 'DELETE';
    requestDigest?: string;
    data?: Object;
    headers?: any;
  }

  function rest(options: RestOptions): Promise<Object[]>;

  class site {
    constructor(siteUrl?: string);

    info(): Object[];
    lists(): Object[];
    subsites(): Object[];
    perms(): Object[];
    roles(): Object[];
    groups(): Object[];
    users(): Object[];
  }

  class user {
    constructor(options?: Object);

    info(): Promise<Object>;
    groups(): Object[];
    profile(arrProfileKeys: Object): Object;
  }
}
