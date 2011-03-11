__CacheManager__ is a script for Appcelerator Titanium Mobile. It is an extension to __Titanium.Network.HTTPClient__ that allows you to cache remote resources. Another advantage is retrieving the cached resource when the network connection is unavailable.

This repository contains the CacheManager file and an example app showing how to implement it.

## Usage
Include Cache.js to your document
```javascript
Titanium.include('path/to/Cache.js');
```

To use CacheManager just call this function
```javascript
Cache.get();
```

__Cache.get()__ needs a parameters dictionary with the following values  
__url__: The URL for the request  
__callback__: The function to be called upon a successful response  
__data__ (optional): The data to send in the request. Can either be null, dictionary or string  
__method__ (optional): The HTTP method. Defaults to `GET`  
__ttl__: The time to live in seconds. Defaults to `DEFAULT_TTL`  
__cookie__: Can be a boolean or a string containing the cookie value. Defaults to `true`  


## Example
```javascript
Cache.get({
  url: 'http://gdata.youtube.com/feeds/api/videos',
  data: { author: 'appcelerator', alt: 'json', orderby: 'published' },
  ttl: 300,
  callback: function ( result ) {
    // Some stuff..
  }
});
```


----------------------------------
Stuff our legal folk make us say:

Appcelerator, Appcelerator Titanium and associated marks and logos are trademarks of Appcelerator, Inc.  
Titanium is Copyright (c) 2009-2010 by Appcelerator, Inc. All Rights Reserved.  
Titanium is licensed under the Apache Public License (Version 2). Please see the LICENSE file for the full license.