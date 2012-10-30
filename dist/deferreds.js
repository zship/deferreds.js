(function() {
	
/**
 * almond 0.2.0 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        aps = [].slice;

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!defined.hasOwnProperty(name) && !defining.hasOwnProperty(name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (defined.hasOwnProperty(depName) ||
                           waiting.hasOwnProperty(depName) ||
                           defining.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        waiting[name] = [name, deps, callback];
    };

    define.amd = {
        jQuery: true
    };
}());

define("../lib/almond", function(){});

//just a stub. it's understood that jquery should be included before deferreds.js
define('jquery',[],function() {
	return jQuery;
});

define('amd-utils/lang/kindOf',[],function () {

    var _rKind = /^\[object (.*)\]$/,
        _toString = Object.prototype.toString,
        UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     * @version 0.1.0 (2011/10/31)
     */
    function kindOf(val) {
        if (val === null) {
            return 'Null';
        } else if (val === UNDEF) {
            return 'Undefined';
        } else {
            return _rKind.exec( _toString.call(val) )[1];
        }
    }
    return kindOf;
});

define('amd-utils/lang/isKind',['./kindOf'], function (kindOf) {
    /**
     * Check if value is from a specific "kind".
     * @version 0.1.0 (2011/10/31)
     */
    function isKind(val, kind){
        return kindOf(val) === kind;
    }
    return isKind;
});

define('amd-utils/lang/isArray',['./isKind'], function (isKind) {
    /**
     * @version 0.2.0 (2011/12/06)
     */
    var isArray = Array.isArray || function (val) {
        return isKind(val, 'Array');
    };
    return isArray;
});

define('amd-utils/array/forEach',[],function () {

    /**
     * Array forEach
     * @version 0.4.0 (2012/07/26)
     */
    function forEach(arr, callback, thisObj) {
        var i = -1,
            n = arr.length >>> 0;
        while (++i < n) {
            //according to spec callback should only be called for
            //existing items
            if (i in arr) {
                callback.call(thisObj, arr[i], i, arr);
            }
        }
    }

    return forEach;

});

define('amd-utils/array/map',['./forEach'], function (forEach) {

    /**
     * Array map
     * @version 0.3.0 (2012/07/26)
     */
    function map(arr, callback, thisObj) {
        // need to copy arr.length because of sparse arrays
        var results = new Array(arr.length);
        forEach(arr, function (val, i, arr) {
            results[i] = callback.call(thisObj, val, i, arr);
        });
        return results;
    }

     return map;
});

define('amd-utils/object/hasOwn',[],function () {

    /**
     * Safer Object.hasOwnProperty
     * @version 0.1.0 (2012/01/19)
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     return hasOwn;

});

define('amd-utils/object/forOwn',['./hasOwn'], function (hasOwn) {

    var _hasDontEnumBug,
        _dontEnums;

    function checkDontEnum(){
        _dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

        _hasDontEnumBug = true;

        for (var key in {'toString': null}) {
            _hasDontEnumBug = false;
        }
    }

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     * @version 0.2.0 (2012/08/30)
     */
    function forOwn(obj, fn, thisObj){
        var key, i = 0;
        // no need to check if argument is a real object that way we can use
        // it for arrays, functions, date, etc.

        //post-pone check till needed
        if (_hasDontEnumBug == null) checkDontEnum();

        for (key in obj) {
            exec(fn, obj, key, thisObj);
        }

        if (_hasDontEnumBug) {
            while (key = _dontEnums[i++]) {
                exec(fn, obj, key, thisObj);
            }
        }
    }

    function exec(fn, obj, key, thisObj){
        if (hasOwn(obj, key)) {
            fn.call(thisObj, obj[key], key, obj);
        }
    }

    return forOwn;

});

define('amd-utils/object/map',['./forOwn'], function(forOwn) {

    /**
     * Creates a new object where all the values are the result of calling
     * `callback`.
     * @version 0.1.0
     */
    function mapValues(obj, callback, thisObj) {
        var output = {};
        forOwn(obj, function(val, key, obj) {
            output[key] = callback.call(thisObj, val, key, obj);
        });

        return output;
    }
    return mapValues;
});

define('collection/map',['amd-utils/lang/isArray', 'amd-utils/array/map', 'amd-utils/object/map'], function (isArray, arrayMap, objectMap) {

	function map(list, iterator, context) {
		if (isArray(list)) {
			return arrayMap(list, iterator, context);
		}
		else {
			return objectMap(list, iterator, context);
		}
	}

	return map;

});

define('collection/pluck',['./map'], function (map) {

    function pluck(list, key){
		return map(list, function(value) {
			return value[key]; 
		});
    }

    return pluck;

});

define('amd-utils/object/keys',['./forOwn'], function (forOwn) {

    /**
     * Get object keys
     * @version 0.3.0 (2011/12/17)
     */
     var keys = Object.keys || function (obj) {
            var keys = [];
            forOwn(obj, function(val, key){
                keys.push(key);
            });
            return keys;
        };

    return keys;

});

define('collection/size',['amd-utils/lang/isArray', 'amd-utils/object/keys'], function (isArray, keys) {

	function size(obj) {
		if (!obj) {
			return 0;
		}
		if (isArray(obj)) {
			return obj.length;
		}
		return keys(obj).length;
	}

	return size;

});

define('forEachSeries',['require','jquery','amd-utils/lang/isArray','./collection/size','amd-utils/object/keys'],function(require) {

	var $ = require('jquery');
	var isArray = require('amd-utils/lang/isArray');
	var size = require('./collection/size');
	var objectKeys = require('amd-utils/object/keys');


	/**
	 * Version of forEach which is guaranteed to execute passed functions in
	 * order.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {jQuery.Deferred}
	 */
	var forEachSeries = function(list, iterator) {

		var superDeferred = $.Deferred();

		if (!size(list)) {
			superDeferred.reject();
			return superDeferred;
		}

		var completed = 0;
		var keys;
		if (!isArray(list)) {
			keys = objectKeys(list);
		}

		var iterate = function() {
			var item;
			var key;

			if (isArray(list)) {
				key = completed;
				item = list[key];
			}
			else {
				key = keys[completed];
				item = list[key];
			}

			iterator(item, key)
			.fail(function() {
				superDeferred.reject();
			})
			.done(function() {
				completed += 1;
				if (completed === size(list)) {
					superDeferred.resolve();
				}
				else {
					iterate();
				}
			});
		};
		iterate();

		return superDeferred;

	};

	return forEachSeries;

});

define('filterSeries',['require','jquery','./collection/map','./collection/pluck','./forEachSeries'],function(require) {

	var $ = require('jquery');
	var map = require('./collection/map');
	var pluck = require('./collection/pluck');
	var forEachSeries = require('./forEachSeries');

	var filter = function(eachfn, arr, iterator) {

		var superDeferred = $.Deferred();
		var results = [];

		arr = map(function(val, i) {
			return {index: i, value: val};
		});

		forEachSeries(arr, function(item) {
			return iterator(item.value)
			.done(function() {
				results.push(item);
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			results = results.sort(function(a, b) {
				return a.index - b.index;
			});
			results = pluck(results, 'value');
			superDeferred.resolve(results);
		});

		return superDeferred;

	};

	return filter;

});

define('mapSeries',['require','jquery','./collection/map','./forEachSeries'],function(require) {

	var $ = require('jquery');
	var cmap = require('./collection/map');
	var forEachSeries = require('./forEachSeries');

	var mapSeries = function(eachfn, arr, iterator) {

		var superDeferred = $.Deferred();
		var results = [];

		arr = cmap(arr, function (val, i) {
			return {index: i, value: val};
		});

		forEachSeries(arr, function(item) {
			return iterator(item.value)
			.fail(function(err) {
				results[item.index] = err;
			})
			.done(function(transformed) {
				results[item.index] = transformed;
			});
		})
		.fail(function(err) {
			superDeferred.reject(err);
		})
		.done(function() {
			superDeferred.resolve(results);
		});

		return superDeferred;

	};

	return mapSeries;

});

define('collection/forEach',['amd-utils/lang/isArray', 'amd-utils/array/forEach', 'amd-utils/object/forOwn'], function (isArray, forEach, forOwn) {

	function cForEach(list, fn, thisObj) {
		if (isArray(list)) {
			return forEach(list, fn, thisObj);
		}
		return forOwn(list, fn, thisObj);
	}

	return cForEach;

});

define('forEach',['require','jquery','./collection/forEach','./collection/size'],function(require) {

	var $ = require('jquery');
	var each = require('./collection/forEach');
	var size = require('./collection/size');


	/**
	 * Invoke **iterator** once for each function in **arr**.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {jQuery.Deferred}
	 */
	var forEach = function(list, iterator) {

		var superDeferred = $.Deferred();

		if (!size(list)) {
			superDeferred.reject();
			return superDeferred;
		}

		var completed = 0;
		each(list, function(item, key) {
			iterator(item, key)
			.fail(function() {
				superDeferred.reject();
			})
			.done(function() {
				completed++;
				if (completed === size(list)) {
					superDeferred.resolve();
				}
			});
		});

		return superDeferred;

	};

	return forEach;

});

define('map',['require','jquery','./collection/map','./forEach'],function(require) {

	var $ = require('jquery');
	var cmap = require('./collection/map');
	var forEach = require('./forEach');

	var map = function(eachfn, arr, iterator) {

		var superDeferred = $.Deferred();
		var results = [];

		arr = cmap(arr, function (val, i) {
			return {index: i, value: val};
		});

		forEach(arr, function(item) {
			return iterator(item.value)
			.fail(function(err) {
				results[item.index] = err;
			})
			.done(function(transformed) {
				results[item.index] = transformed;
			});
		})
		.fail(function(err) {
			superDeferred.reject(err);
		})
		.done(function() {
			superDeferred.resolve(results);
		});

		return superDeferred;

	};

	return map;

});

define('until',['require','jquery'],function(require) {

	var $ = require('jquery');


	var until = function(test, iterator) {

		var superDeferred = $.Deferred();

		if (!test()) {
			iterator()
			.fail(function(err) {
				superDeferred.reject(err);
			})
			.done(function() {
				until(test, iterator);
			});
		}
		else {
			superDeferred.resolve();
		}

		return superDeferred;

	};

	return until;

});

define('amd-utils/lang/toArray',['./kindOf'], function (kindOf) {

    var _win = this;

    /**
     * Convert array-like object into array
     * @version 0.3.1 (2012/08/30)
     */
    function toArray(val){
        var ret = [],
            kind = kindOf(val),
            n;

        if (val != null) {
            if ( val.length == null || kind === 'String' || kind === 'Function' || kind === 'RegExp' || val === _win ) {
                //string, regexp, function have .length but user probably just want
                //to wrap value into an array..
                ret[ret.length] = val;
            } else {
                //window returns true on isObject in IE7 and may have length
                //property. `typeof NodeList` returns `function` on Safari so
                //we can't use it (#58)
                n = val.length;
                while (n--) {
                    ret[n] = val[n];
                }
            }
        }
        return ret;
    }
    return toArray;
});

define('amd-utils/lang/isFunction',['./isKind'], function (isKind) {
    /**
     * @version 0.1.0 (2011/10/31)
     */
    function isFunction(val) {
        return isKind(val, 'Function');
    }
    return isFunction;
});

define('anyToDeferred',['require','jquery','amd-utils/lang/isFunction'],function(require) {

	var $ = require('jquery');
	var isFunction = require('amd-utils/lang/isFunction');


	var _isDeferredObject = function(obj) {
		return obj && obj.promise;
	};


	var anyToDeferred = function(obj) {
		//any arguments after obj will be passed to obj(), if obj is a function
		var args = Array.prototype.slice.call(arguments, 1);
		if (_isDeferredObject(obj)) {
			return obj;
		}
		else if (isFunction(obj)) {
			var result = obj.apply(obj, args);
			if (!_isDeferredObject(result)) {
				return $.Deferred().resolve(result);
			}
			return result;
		}
		else {
			return $.Deferred().resolve(obj);
		}
	};

	return anyToDeferred;

});

define('parallel',['require','jquery','amd-utils/lang/isArray','amd-utils/lang/toArray','./anyToDeferred','./forEach','./map'],function(require) {

	var $ = require('jquery');
	var isArray = require('amd-utils/lang/isArray');
	var toArray = require('amd-utils/lang/toArray');
	var anyToDeferred = require('./anyToDeferred');
	var forEach = require('./forEach');
	var map = require('./map');


	var parallel = function(tasks) {

		var superDeferred = $.Deferred();

		if (arguments.length > 1) {
			tasks = toArray(arguments);
		}

		if (isArray(tasks)) {
			map(tasks, function(task) {
				return anyToDeferred(task);
			})
			.fail(function() {
				superDeferred.reject();
			})
			.done(function(results) {
				superDeferred.resolve(results);
			});
		}
		else {
			var results = {};
			forEach(tasks, function(task, key) {
				var deferred = anyToDeferred(task);
				return deferred.done(function(result) {
					results[key] = result;
				});
			})
			.fail(function() {
				superDeferred.reject();
			})
			.done(function() {
				superDeferred.resolve(results);
			});
		}

		return superDeferred;

	};

	return parallel;

});

define('reject',['require','jquery','./collection/map','./collection/pluck','./forEach'],function(require) {

	var $ = require('jquery');
	var map = require('./collection/map');
	var pluck = require('./collection/pluck');
	var forEach = require('./forEach');

	var reject = function(eachfn, arr, iterator) {

		var superDeferred = $.Deferred();
		var results = [];

		arr = map(arr, function(val, i) {
			return {index: i, value: val};
		});

		forEach(arr, function (item) {
			return iterator(item.value)
			.fail(function() {
				results.push(item);
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			results = results.sort(function(a, b) {
				return a.index - b.index;
			});
			results = pluck(results, 'value');
			superDeferred.resolve(results);
		});

		return superDeferred;

	};

	return reject;

});

define('every',['require','jquery','./forEach'],function(require) {

	var $ = require('jquery');
	var forEach = require('./forEach');

	var every = function(arr, iterator) {

		var superDeferred = $.Deferred();

		forEach(arr, function(item) {
			return iterator(item)
			.fail(function() {
				superDeferred.reject();
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			superDeferred.resolve();
		});

		return superDeferred;

	};

	return every;

});

define('waterfall',['require','jquery','amd-utils/lang/isArray','amd-utils/lang/toArray','./anyToDeferred','amd-utils/object/keys','./collection/size'],function(require) {

	var $ = require('jquery');
	var isArray = require('amd-utils/lang/isArray');
	var toArray = require('amd-utils/lang/toArray');
	var anyToDeferred = require('./anyToDeferred');
	var objkeys = require('amd-utils/object/keys');
	var size = require('./collection/size');


	var waterfall = function(tasks) {

		var superDeferred = $.Deferred();

		if (arguments.length > 1) {
			tasks = toArray(arguments);
		}

		if (!size(tasks)) {
			superDeferred.reject();
			return superDeferred;
		}

		var completed = 0;
		var keys;
		if (!isArray(tasks)) {
			keys = objkeys(tasks);
		}

		var iterate = function() {
			var args = toArray(arguments);
			var task;
			var key;

			if (isArray(tasks)) {
				key = completed;
				task = tasks[key];
			}
			else {
				key = keys[completed];
				task = tasks[key];
			}

			args.unshift(task);

			anyToDeferred.apply(this, args)
			.fail(function(err) {
				superDeferred.reject(key, err);
			})
			.done(function(result) {
				completed += 1;
				if (completed === size(tasks)) {
					superDeferred.resolve(result);
				}
				else {
					iterate(result);
				}
			});
		};

		iterate();

		return superDeferred;

	};

	return waterfall;

});

define('series',['require','jquery','amd-utils/lang/isArray','amd-utils/lang/toArray','./anyToDeferred','./forEachSeries','./mapSeries'],function(require) {

	var $ = require('jquery');
	var isArray = require('amd-utils/lang/isArray');
	var toArray = require('amd-utils/lang/toArray');
	var anyToDeferred = require('./anyToDeferred');
	var forEachSeries = require('./forEachSeries');
	var mapSeries = require('./mapSeries');


	var series = function(tasks) {

		var superDeferred = $.Deferred();

		if (arguments.length > 1) {
			tasks = toArray(arguments);
		}

		if (isArray(tasks)) {
			mapSeries(tasks, function(task) {
				return anyToDeferred(task);
			})
			.fail(function() {
				superDeferred.reject();
			})
			.done(function(result) {
				superDeferred.resolve(result);
			});
		}
		else {
			var results = {};
			forEachSeries(tasks, function(task, key) {
				var deferred = anyToDeferred(task);
				return deferred.done(function(result) {
					results[key] = result;
				});
			})
			.fail(function() {
				superDeferred.reject();
			})
			.done(function() {
				superDeferred.resolve(results);
			});
		}

		return superDeferred;

	};

	return series;

});

define('rejectSeries',['require','jquery','./collection/map','./collection/pluck','./forEachSeries'],function(require) {

	var $ = require('jquery');
	var map = require('./collection/map');
	var pluck = require('./collection/pluck');
	var forEachSeries = require('./forEachSeries');

	var rejectSeries = function(eachfn, arr, iterator) {

		var superDeferred = $.Deferred();
		var results = [];

		arr = map(arr, function(val, i) {
			return {index: i, value: val};
		});

		forEachSeries(arr, function (item) {
			return iterator(item.value)
			.fail(function() {
				results.push(item);
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			results = results.sort(function(a, b) {
				return a.index - b.index;
			});
			results = pluck(results, 'value');
			superDeferred.resolve(results);
		});

		return superDeferred;

	};

	return rejectSeries;

});

define('filter',['require','jquery','./collection/map','./collection/pluck','./forEach'],function(require) {

	var $ = require('jquery');
	var map = require('./collection/map');
	var pluck = require('./collection/pluck');
	var forEach = require('./forEach');

	var filter = function(eachfn, arr, iterator) {

		var superDeferred = $.Deferred();
		var results = [];

		arr = map(function(val, i) {
			return {index: i, value: val};
		});

		forEach(arr, function(item) {
			return iterator(item.value)
			.done(function() {
				results.push(item);
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			results = results.sort(function(a, b) {
				return a.index - b.index;
			});
			results = pluck(results, 'value');
			superDeferred.resolve(results);
		});

		return superDeferred;

	};

	return filter;

});

define('find',['require','jquery','./forEach'],function(require) {

	var $ = require('jquery');
	var forEach = require('./forEach');

	var find = function(eachfn, arr, iterator) {

		var superDeferred = $.Deferred();

		forEach(arr, function(item) {
			return iterator(item)
			.done(function() {
				superDeferred.resolve(item);
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			superDeferred.reject();
		});

		return superDeferred;

	};

	return find;

});

define('some',['require','jquery','./forEach'],function(require) {

	var $ = require('jquery');
	var forEach = require('./forEach');

	var some = function(arr, iterator) {

		var superDeferred = $.Deferred();

		forEach(arr, function(item) {
			return iterator(item)
			.done(function() {
				superDeferred.resolve();
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			superDeferred.resolve();
		});

		return superDeferred;

	};

	return some;

});

define('findSeries',['require','jquery','./forEachSeries'],function(require) {

	var $ = require('jquery');
	var forEachSeries = require('./forEachSeries');

	var find = function(eachfn, arr, iterator) {

		var superDeferred = $.Deferred();

		forEachSeries(arr, function(item) {
			return iterator(item)
			.done(function() {
				superDeferred.resolve(item);
			});
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			superDeferred.reject();
		});

		return superDeferred;

	};

	return find;

});

define('whilst',['require','jquery'],function(require) {

	var $ = require('jquery');


	var whilst = function(test, iterator) {

		var superDeferred = $.Deferred();

		if (test()) {
			iterator()
			.fail(function(err) {
				superDeferred.reject(err);
			})
			.done(function() {
				whilst(test, iterator);
			});
		}
		else {
			superDeferred.resolve();
		}

		return superDeferred;

	};

	return whilst;

});

define('reduce',['require','jquery','./forEachSeries'],function(require) {

	var $ = require('jquery');
	var forEachSeries = require('./forEachSeries');

	var reduce = function(arr, memo, iterator) {

		var superDeferred = $.Deferred();

		forEachSeries(arr, function(item, key) {
			return iterator(memo, item, key, arr);
		})
		.fail(function() {
			superDeferred.reject();
		})
		.done(function() {
			superDeferred.resolve(memo);
		});

		return superDeferred;

	};

	return reduce;

});

define('reduceRight',['require','./reduce','./collection/map','./collection/pluck'],function(require) {

	var reduce = require('./reduce');
	var map = require('./collection/map');
	var pluck = require('./collection/pluck');

	var reduceRight = function(arr, memo, iterator) {
		var reversed = map(arr, function(val, i) {
			return {index: i, value: val};
		}).reverse();
		reversed = pluck(reversed, 'value');
		return reduce(reversed, memo, iterator);
	};

	return reduceRight;

});

})();

/*
-------------------------------------------
Global definitions for a built deferreds.js
-------------------------------------------
*/

window.Deferreds = {
	"forEachSeries": require("forEachSeries"),
	"filterSeries": require("filterSeries"),
	"mapSeries": require("mapSeries"),
	"forEach": require("forEach"),
	"map": require("map"),
	"until": require("until"),
	"anyToDeferred": require("anyToDeferred"),
	"parallel": require("parallel"),
	"reject": require("reject"),
	"every": require("every"),
	"waterfall": require("waterfall"),
	"series": require("series"),
	"rejectSeries": require("rejectSeries"),
	"filter": require("filter"),
	"find": require("find"),
	"some": require("some"),
	"findSeries": require("findSeries"),
	"whilst": require("whilst"),
	"reduce": require("reduce"),
	"reduceRight": require("reduceRight")
};
