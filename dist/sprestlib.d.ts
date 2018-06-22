// Type definitions for sprestlib v1.7.0
// Project: https://gitbrent.github.io/SpRestLib/
// Definitions by: Brent Ely <https://github.com/gitbrent/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace sprLib {
	const version: string;

	function baseUrl(): string;
	function baseUrl(baseUrl: string): void;

	function nodeConfig(options: object): void;

	function renewSecurityToken(): void;

	/**
	* SharePoint List/Library API.
	*
	* @see \`{@link https://gitbrent.github.io/SpRestLib/docs/api-list.html }\`
	* @since 1.0
	*/
	class list {
		constructor(listName: string);
		constructor(listGuid: string);
		constructor(options: object);

		cols(): object[];
		info(): object[];
		perms(): object[];

		items(options: object): object[];
		create(options: object): object[];
		update(options: object): object[];
		delete(options: object): number;
		recycle(options: object): number;
	}

	function rest(options: object): object[];

	class site {
		constructor(siteUrl?: string);

		info(): object[];
		lists(): object[];
		subsites(): object[];
		perms(): object[];
		roles(): object[];
		groups(): object[];
		users(): object[];
	}

	class user {
		constructor(options: object);

		info(): object;
		groups(): object[];
		profile(arrProfileKeys: object): object;
	}
}
