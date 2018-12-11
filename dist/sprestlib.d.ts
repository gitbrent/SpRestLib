// Type definitions for sprestlib 1.9.0
// Project: https://gitbrent.github.io/SpRestLib/
// Definitions by: Brent Ely <https://github.com/gitbrent/>
//                 Jandos <https://github.com/Wireliner>
//                 Kelvin Bell <https://github.com/kelvinbell>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

declare namespace sprLib {
  const version: string;

  interface optionsOptions {
    baseUrl?: string;
    nodeCookie?: string;
    nodeEnabled?: boolean;
    nodeServer?: string;
    queryLimit?: number;
  }
  interface IOptions {
    baseUrl: string;
    nodeCookie?: string;
    nodeEnabled?: boolean;
    nodeServer?: string;
    queryLimit: number;
  }
  function options(): IOptions;
  function options(options: optionsOptions): IOptions;

  function baseUrl(): string;
  function baseUrl(baseUrl: string): void;

  function nodeConfig(options: object): void;

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
    info(options: FileInfoOptions): Promise<object>;
    perms(): Promise<object[]>;
    recycle(): Promise<boolean>;
  }
  function file(fileName: string): IFile;

  interface FolderUploadOptions {
    name: string;
    data: object;
    requestDigest?: string;
    overwrite?: boolean;
  }
  interface IFolder {
    add(folderName: string): Promise<object>;
    delete(): Promise<boolean>;
    files(): Promise<object[]>;
    folders(): Promise<object[]>;
    info(): Promise<object>;
    perms(): Promise<object[]>;
    recycle(): Promise<boolean>;
    upload(options: FolderUploadOptions): Promise<object>;
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
    listCols?: Array<string> | object;
    metadata?: boolean;
    queryFilter?: string;
    queryLimit?: number;
    queryNext?: object;
    queryOrderBy?: string;
  }
  interface IList {
    cols(): Promise<object[]>;
    info(): Promise<object>;
    perms(): Promise<object[]>;

    items(options: ListItemsOptions): Promise<object[]>;
    create(options: object): Promise<object[]>;
    update(options: object): Promise<object[]>;
    delete(options: object): Promise<number>;
    recycle(options: object): Promise<number>;
  }
  function list(listName: string): IList;
  function list(listGuid: string): IList;
  function list(options: ListOptions): IList;

  interface RestOptions {
    url: string;
    type?: 'GET' | 'POST' | 'DELETE';
    data?: object;
    headers?: any;
    requestDigest?: string;
  }
  function rest(options: RestOptions): Promise<object[]>;

  interface ISite {
    info(): Promise<object>;
    lists(): Promise<object[]>;
    subsites(): Promise<object[]>;
    perms(): Promise<object[]>;
    roles(): Promise<object[]>;
    groups(): Promise<object[]>;
    users(): Promise<object[]>;
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
    info(): Promise<object>;
    groups(): Promise<object[]>;
    profile(arrProfileKeys?: object): Promise<object>;
  }
  function user(options?: UserOptions): IUser;
}
