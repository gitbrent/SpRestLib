// Type definitions for sprestlib 1.9.0
// Project: https://gitbrent.github.io/SpRestLib/
// Definitions by: Brent Ely <https://github.com/gitbrent/>
//                 Jandos <https://github.com/Wireliner>
//                 Kelvin Bell <https://github.com/kelvinbell>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

declare namespace sprLib {
  const version: string;

  function baseUrl(): string;
  function baseUrl(baseUrl: string): void;

  function nodeConfig(options: Object): void;

  function renewSecurityToken(): void;

  interface FileCheckInOptions {
    comment?: string;
	type?: 'major' | 'minor' | 'overwrite';
  }
  interface FileInfoOptions {
    version?: number;
  }
  interface IFile {
    checkin(options: FileCheckInOptions): Promise<boolean>;
    checkout(): Promise<boolean>;
    delete(): Promise<boolean>;
    get(): Promise<Blob>;
    info(options: FileInfoOptions): Promise<Object>;
    perms(): Promise<Object[]>;
    recycle(): Promise<boolean>;
  }
  function file(fileName: string): IFile;

  interface IFolder {
    add(folderName: string): Promise<Object>;
    delete(): Promise<boolean>;
    files(): Promise<Object[]>;
    folders(): Promise<Object[]>;
    info(): Promise<Object>;
    perms(): Promise<Object[]>;
    recycle(): Promise<boolean>;
  }
  function folder(folderName: string): IFolder;

  /**
   * SharePoint List/Library API.
   *
   * @see \`{@link https://gitbrent.github.io/SpRestLib/docs/api-list.html }\`
   * @since 1.0
   */
  interface ListOptions {
    name?: string;
    guid?: string;
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
  interface IList {
    cols(): Promise<Object[]>;
    info(): Promise<Object>;
    perms(): Promise<Object[]>;

    items(options: ListItemsOptions): Promise<Object[]>;
    create(options: Object): Promise<Object[]>;
    update(options: Object): Promise<Object[]>;
    delete(options: Object): Promise<number>;
    recycle(options: Object): Promise<number>;
  }
  function list(listName: string): IList;
  function list(listGuid: string): IList;
  function list(options: ListOptions): IList;

  interface RestOptions {
    url: string;
    type?: 'GET' | 'POST' | 'DELETE';
    data?: Object;
    headers?: any;
    requestDigest?: string;
  }
  function rest(options: RestOptions): Promise<Object[]>;

  interface ISite {
    info(): Promise<Object>;
    lists(): Promise<Object[]>;
    subsites(): Promise<Object[]>;
    perms(): Promise<Object[]>;
    roles(): Promise<Object[]>;
    groups(): Promise<Object[]>;
    users(): Promise<Object[]>;
  }
  function site(siteUrl?: string): ISite;

  interface UserOptions {
    baseUrl?: string;
    id?: string;
    email?: string;
    login?: string;
    title?: string;
  }

  interface IUser {
    info(): Promise<Object>;
    groups(): Promise<Object[]>;
    profile(arrProfileKeys?: Object): Promise<Object>;
  }
  function user(options?: UserOptions): IUser;
}
