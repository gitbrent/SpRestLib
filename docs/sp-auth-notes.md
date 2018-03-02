---
id: sp-auth-notes
title: SharePoint Authentication
---
**************************************************************************************************
Table of Contents
- [SharePoint Authentication Overview](#sharepoint-authentication-overview)
- [SharePoint Authentication Requirements](#sharepoint-authentication-requirements)
  - [GET Operations](#get-operations)
  - [POST Operations](#post-operations)
- [SharePoint Authentication Keys](#sharepoint-authentication-keys)
  - [Example: Retrieve a FormDigestValue value](#example-retrieve-a-formdigestvalue-value)
**************************************************************************************************

## SharePoint Authentication Overview

SharePoint requires authentication tokens to interact with its API.  Depending upon how your application
is built, the generation and handling of tokens will vary.

## Authentication Requirements

### GET Operations
GET operations are methods that read data from SharePoint (REST queries, get list items, site/user info).

GET Authentication Requirements:
* Cookie (containing both `rtFA` and `FedAuth` values)

### POST Operations
POST operations are methods that write data to SharePoint (Create, Update, Delete, Recycle).

POST Authentication Requirements:
* Cookie (containing both `rtFA` and `FedAuth` values)
* Security Token (an `X-RequestDigest` request header containing the FormDigestValue value)

## SharePoint Authentication Keys
If your app is running in a WebPart, then both the cookie values and the FormDigestValue exist in the page already,
and you can simply call `sprLib.list('Some List').update()` etc. and it will work as the library will detect these
security items and send them along with any GET/POST requests.

Once you get away from embedded WebPart code, you will need to be provide the necessary security items.

For example, the Node demo (`sprestlib/examples/nodejs-demo.js`) runs completely outside of SharePoint, but can
connect as it authenticates into a Microsoft portal to query the two required cookie values, and also queries the SharePoint context
when a RequestDigest value is required.  Use the code provided in the demo to fetch cookie or RequestDigest values as needed.

Most applications that run in a webpage should have the necessary cookie values, so try fetching and passing
the FormDigestValue for CRUD/POST operations with `requestDigest` as shown below if you encounter authentication errors.

### Example: Retrieve a FormDigestValue value
```javascript
sprLib.rest({ url:'_api/contextinfo', type:'POST' })
.then(arr => {
    let strReqDig = arr[0].GetContextWebInformation.FormDigestValue;
    return sprLib.list({ name:'Announcements', requestDigest:strReqDig }).create({ "Title":"New Item" });
})
.then(obj => {
    console.log('Item created!');
});
```

If you encounter an error that states "The security validation for this page is invalid and might be corrupted. [...]", that
indicates your POST operation is not receiving a valid `requestDigest` value.

An invalid FormDigestValue error:
![SharePoint POST auth error](/SpRestLib/docs/assets/auth-error-security-validation-invalid.png)
