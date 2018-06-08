// Type definitions for sprestlib v1.8.0
// Project: https://gitbrent.github.io/SpRestLib/
// Definitions by: Brent Ely <https://github.com/gitbrent/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/*
http://blog.wolksoftware.com/contributing-to-definitelytyped
https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-d-ts.html
http://definitelytyped.org/guides/best-practices.html
https://github.com/ConquestArrow/dtsmake/blob/c02c32c2f30c4cb61a39d2c0678c083df2fbb30d/example/dist/mylib.d.ts
*/

declare namespace sprLib {

	const version: string;

	function baseUrl(): string;
	function baseUrl(inStr: string): void;

	function list(inOpt: object): object;
}
