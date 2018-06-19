// Type definitions for sprestlib v1.8.0
// Project: https://gitbrent.github.io/SpRestLib/
// Definitions by: Brent Ely <https://github.com/gitbrent/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/*
http://blog.wolksoftware.com/contributing-to-definitelytyped
https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-d-ts.html
http://definitelytyped.org/guides/best-practices.html
https://github.com/ConquestArrow/dtsmake/blob/c02c32c2f30c4cb61a39d2c0678c083df2fbb30d/example/dist/mylib.d.ts
https://www.youtube.com/watch?v=wYVaCTmdj3g
https://www.stevefenton.co.uk/2013/01/complex-typescript-definitions-made-easy/
https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/jquery/index.d.ts
*/

/*
declare namespace sprLib {
	const version: string;

	function baseUrl(): string;
	function baseUrl(inStr: string): void;

	function list(inOpt: object): object;
	//function list(inOpt: object) { function cols(): object; }
}
*/

declare module sprLib {
	const version: string;

	export class list {
	    constructor (listName: string);
		cols(): object[];
	    info(): object;
		perms(): object[];
	}

//	var List: typeof list;
//	function list(listName: string): typeof list;
	//function list(listName: string): object;

//declare function extends list cols(options: object): object;

	export class library {
		constructor (libraryName: string);
		constructor (libraryGuid: string);
		info() : object;
	}
}

/*
declare module sprLib {
	//export local version: string;

	export class list {
		static cols() : object;
		static info() : object;
		static items(options: object) : object[];
	}

	export interface library {
	    static class info() : object;
	}

	class list2 {
		static info() : object;
		static cols() : object;
	}
}
*/
/*
interface sprLib {
	list: {
		cols(): object;
		items(query: string) : void;
	};
}
*/

//sprLib.list('name').cols().then
//sprLib.library('guid').info
sprLib.list.prototype.cols()
