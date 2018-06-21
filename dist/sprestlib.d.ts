// Type definitions for sprestlib v1.8.0
// Project: https://gitbrent.github.io/SpRestLib/
// Definitions by: Brent Ely <https://github.com/gitbrent/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/*
	REFS:
	https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html
	https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-d-ts.html
	http://blog.wolksoftware.com/contributing-to-definitelytyped
	http://definitelytyped.org/guides/best-practices.html
	https://github.com/ConquestArrow/dtsmake/blob/c02c32c2f30c4cb61a39d2c0678c083df2fbb30d/example/dist/mylib.d.ts
	https://www.youtube.com/watch?v=wYVaCTmdj3g
	https://www.stevefenton.co.uk/2013/01/complex-typescript-definitions-made-easy/
	https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/jquery/index.d.ts
*/

declare namespace sprLib {
	const version: string;

	function baseUrl(): string;
	function baseUrl(baseUrl: string): void;

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

		// TODO: FIXME:
	}

	function nodeConfig(options: object);

	function renewSecurityToken();
}

//sprLib.site.prototype.
