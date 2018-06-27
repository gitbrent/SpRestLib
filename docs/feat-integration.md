---
id: feat-integration
title: Library Integration
---

## Integration with other Libraries

SpRestLib works with Angular, React, Typescript, Webpack, etc.!

The library exports itself when available and defaults to a non-Node setup.  This should enable the code to integrate into your solution without errors.

As of 1.7.0, I don't have a good solution for the issue of `https` dependency.  The `package.json` file includes https as
a dependency because Node.js requires it for network connectivity.  However, since there's only one package.json, Angular/React, et al. tend to fail on that during build.

I've lightly searched and found no clear answer on how to handle the need for separate `package.json`.  If any of you have some expertise in this area, please let me know! :-)

In the meantime, remove `https` from `package.json` before your build, or look to the solutions below...


## More Information

See these issues for code samples and other helpful information:
* [Issue #9](https://github.com/gitbrent/SpRestLib/issues/9)
* [Issue #23](https://github.com/gitbrent/SpRestLib/issues/23)
