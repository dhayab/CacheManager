/*
	Copyright (C) 2011 by Dhaya Benmessaoud <dhaya@technolog33k.fr>
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
 */
var Cache = new function CacheManager ( ) {
	var DEFAULT_TTL = 60; // seconds
	
	// Initialization. Will create a directory named 'cache' to store cached resources
	var cacheDirectory = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory + Titanium.Filesystem.separator + 'cache');
	if ( !cacheDirectory.exists() ) {
		cacheDirectory.createDirectory();
	}
	
	var create = function ( filename, parameters ) {
		// FIX 2011-03-02: Workaround for HTTPClient.connectionType forcing to "POST" when sending data
		if ( parameters.method == "GET" && parameters.data != null ) {
			if ( typeof(parameters.data) == 'object' ) {
				var pairs = [];
				for ( var key in parameters.data ) {
					if ( parameters.data.hasOwnProperty(key) ) { pairs.push(key + "=" + parameters.data[key]); }
				}
				parameters.url += "?" + pairs.join('&');
			} else if ( typeof(parameters.data) == 'string' ) {
				parameters.url += "?" + parameters.data;
			}
			parameters.data = null;
		}
		
		Titanium.API.debug("CacheManager/ Creating a new connection for " + parameters.url + " (" + parameters.method + ")");
		
		var loader = Titanium.Network.createHTTPClient();
		loader.open(parameters.method, parameters.url);
		
		if ( parameters.cookie == true && getCookie() !== false ) {
			loader.setRequestHeader('Cookie', getCookie());
		}
		loader.setRequestHeader('User-Agent', parameters.userAgent);
		
		loader.onload = function (e) {
			if ( loader.getResponseHeader('Set-Cookie') != null ) {
				saveCookie(loader.getResponseHeader('Set-Cookie'));
			}
			
			var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory + Titanium.Filesystem.separator + 'cache' + Titanium.Filesystem.separator + filename);
			if ( file.exists() ) {
				file.deleteFile();
			}
			file.write(this.responseText);
			parameters.callback(this.responseText, this.location);
		};
		loader.onerror = function (e) {
			dispatchError(e.error);
		};
		loader.send(parameters.data);
	};
	
	var dispatchError = function ( message ) {
		Titanium.API.error(message);
		return;
	};
	
	var getCookie = function ( ) {
		if ( Titanium.App.Properties.hasProperty('CacheManagerCookie') ) {
			return Titanium.App.Properties.getString('CacheManagerCookie');
		}
		return false;
	};
	
	var saveCookie = function ( value ) {
		value = value.split(';')[0];
		Titanium.App.Properties.setString('CacheManagerCookie', value);
	};
	
	/**
	 * Create an instance of Titanium.Network.HTTPClient if the URL is not cached or has expired 
	 * @param {Object} parameters	url: The URL for the request
	 * 								callback: The function to be called upon a successful response
	 * 								data (optional): The data to send in the request. Can either be null, dictionary or string
	 * 								method (optional): The HTTP method. Defaults to "GET"
	 * 								ttl: The time to live in seconds. Defaults to DEFAULT_TTL
	 * 								cookie: Can be a boolean or a string containing the cookie value. Defaults to true
	 * 								userAgent: Will override Titanium's default user agent in the current request.
	 */
	this.get = function(parameters){
		if ( typeof(parameters) != 'object' ) {
			return dispatchError("<parameters> must be a valid Object { url, callback, [data], [method], [ttl] }");
		}
		if ( typeof(parameters.url) != 'string' ) {
			return dispatchError("<url> must be a string");
		}
		if ( typeof(parameters.callback) != 'function' ) {
			return dispatchError("<callback> must be a function");
		}
		if ( typeof(parameters.data) != 'object' && typeof(parameters.data) != 'string' ) {
			parameters.data = null;
		}
		if ( parameters.method != "GET" && parameters.method != "POST" ) {
			parameters.method = 'GET';
		}
		if ( typeof(parameters.ttl) != 'number' || parameters.ttl < 0 ) {
			parameters.ttl = DEFAULT_TTL;
		}
		if ( typeof(parameters.cookie) == 'string' ) {
			saveCookie(parameters.cookie);
			parameters.cookie = true;
		} else if ( typeof(parameters.cookie) != 'boolean' ) {
			parameters.cookie = true;
		}
		if ( typeof(parameters.userAgent) != 'string' ) {
			parameters.userAgent = Titanium.userAgent;
		}
		
		var hash = '-' + Titanium.Utils.md5HexDigest(parameters.url + JSON.stringify(parameters.data) + parameters.method);
		var filename = parameters.url.split('/')[parameters.url.split('/').length-1];
		filename = filename.length == 0 ? "index" + hash : filename + hash;
		
		var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory + Titanium.Filesystem.separator + 'cache' + Titanium.Filesystem.separator + filename);
		if ( file.exists() ) {
			if ( (new Date().getTime() - file.modificationTimestamp()) / 1000 < parameters.ttl || !Titanium.Network.online ) {
				Titanium.API.debug("CacheManager/ Retrieving " + filename + " from cache");
				parameters.callback(file.read());
			} else {
				create(filename, parameters);
			}
		} else {
			create(filename, parameters);
		}
	};
	
	Titanium.API.debug("CacheManager/ Loaded");
};