var $b;
(function(d, w) {
   var Basic = function(d, w) {
      var _config = {};
      var _store = {};
      var _vdom = {};

      var _DependencyManager = function(arr, config) {
         var queue = {};
         var executed = [];
         var data = [];
         config = config || {};

         var _addCode = function(url, name, deps, pos) {
            if(!_utils.isEmptyArray(deps)) {
               deps.forEach(function(v) {
                  if(executed.indexOf(v) > -1) {
                     deps.slice(deps.indexOf(v), 1);
                  }
               });
            }
            !_utils.isEmptyArray(deps) ? _enqueue(url, name, deps, pos) : _execute(url, name, pos);
         };

         var _enqueue = function(url, name, deps, pos) {
            if(!queue[name]) {
               queue[name] = {};
               queue[name].url = url;
               queue[name].pos = pos;
               queue[name].deps = deps;
            }
         };

         var _wasDependency = function(name) {
            for(var key in queue) {
               if(queue.hasOwnProperty(key)) {
                  var value = queue[key];
                  var num = value.deps.indexOf(name);
                  if(num > -1) {
                     queue[key].deps.splice(num, 1);
                     if(!queue[key].deps.length) {
                        _execute(value.url, key, value.pos);
                     }
                  }
               }
            }
         };

         var _execute = function(url, name, pos) {
            var d = {};
            d.name = name;
            d.url = url;
            d.pos = pos;
            data.push(d);
            if(executed.indexOf(name) == -1) executed.push(name);
            _wasDependency(name);
         };

         var originalPos = 0;
         arr.forEach(function(name) {
            var url = name;
            var deps = [];
            if(config[name]) {
               url = config[name].url || url;
               deps = config[name].deps || deps;
            }
            _addCode(url, name, deps, originalPos);
            originalPos += 1;
         });

         if(!_utils.isEmptyObject(queue)) {
            executed.forEach(function(name) {
               _wasDependency(name);
            });
         }

         return data;
      };
      var _Deferred = function(options) {
         options = options || {
               verbose: false,
               processOnFail: false
            };
         var _successStoreArr = [];
         var _failStoreArr = [];
         var _thenCount = null;
         var _doneCb;
         var _failCb;

         var _executeWhen = function(isSuccess, args, pos) {
            _thenCount--;
            if(isSuccess) {
               _successStoreArr[pos] = args[0];
            } else {
               _failStoreArr[pos] = args[0];
               if(!options.processOnFail) {
                  _thenCount = false;
                  _successStoreArr = [];
               }
               if(options.verbose) console.log("The argument in the position number: " + pos + " has failed");
            }

            if(!_thenCount) {
               if(_failStoreArr.length) {
                  _failStoreArr = Array.prototype.slice.call(_failStoreArr);
                  _failCb.apply(null, _failStoreArr);
               }
               if(_successStoreArr.length) {
                  _successStoreArr = Array.prototype.slice.call(_successStoreArr);
                  _doneCb.apply(null, _successStoreArr);
               }
            }
         };

         var _execute = function(callback, args) {
            args = Array.prototype.slice.call(args);
            callback.apply(null, args);
         };

         var _done = function(callback) {
            _doneCb = callback;
            return this;
         };

         var _then = function(callback) {
            _doneCb = callback;
            return this;
         };

         var _fail = function(callback) {
            _failCb = callback;
            return this;
         };

         return {
            when: function() {
               var i = _thenCount = arguments.length;
               while(i--) {
                  arguments[i].self.pos = i;
                  arguments[i].self.resolve = function() {
                     _executeWhen(true, arguments, this.pos);
                  };
                  arguments[i].self.reject = function() {
                     _executeWhen(false, arguments, this.pos);
                  };
               }
               return {then: _then, fail: _fail, done: _done};
            },
            resolve: function() {
               _execute(_doneCb, arguments);
            },
            reject: function() {
               _execute(_failCb, arguments);
            },
            promise: function() {
               return {done: _done, fail: _fail, self: this};
            }
         };
      };
      var _req = function(deps, cb) {
         var _createScript = function() {
            var script = d.createElement('script');
            script.type = 'text/javascript';
            script.charset = 'utf-8';
            script.async = true;
            return script;
         };

         var _storeText = function(name, url) {
            var deferred = new _Deferred();
            var request = new XMLHttpRequest();
            if(url.indexOf('!') === 0) url = url.substring(1, url.length);
            request.onreadystatechange = function() {
               if(request.readyState == 4 && request.status == 200) {
                  if(!_store[name]) {
                     _store[name] = request.responseText;
                  }
                  deferred.resolve();
               } else if(request.readyState == 4 && request.status != 200) {
                  deferred.reject("Error: " + url + " could not be loaded");
               }
            };
            request.open("GET", url, true );
            request.send(null);
            return deferred.promise();
         };

         var _storeScript = function(name, url) {
            var deferred = new _Deferred();
            var script = _createScript();
            script.src = url;
            var prevWindow = _utils.shallowClone(w);
            script.addEventListener('load', function(e) {
               var node = e.currentTarget;
               var names = _windowDiffStore(prevWindow, w, name);
               if(!_utils.isEmptyArray(names)) {
                  names.forEach(function(n) {
                     delete w[n];
                  });
               }
               deferred.resolve();
               node.parentNode.removeChild(node);
            });
            script.addEventListener('error', function(e) {
               var node = e.currentTarget;
               node.parentNode.removeChild(node);
               deferred.reject("Error: " + name + " could not be loaded");
            });
            d.getElementsByTagName('head')[0].appendChild(script);
            return deferred.promise();
         };

         var _storeDeps = function(name, url) {
            return name.indexOf('!') === 0 ? _storeText(name, url) : _storeScript(name, url);
         };

         var _windowDiffStore = function(old, current, name) {
            var res = [];
            current = _utils.shallowClone(current);
            for(var i in current) {
               if(!old[i] && !_store[name]) {
                  _store[name] = current[i];
                  res.push(i);
               }
            }
            return res;
         };

         var dynamics = [];
         if(!_utils.isEmptyArray(deps)) {
            var orderedDeps = new _DependencyManager(deps, _config);
            orderedDeps.forEach(function(dep) {
               if(!_utils.inObject(dep.name, _store)) {
                  dynamics.push(_storeDeps(dep.name, dep.url));
               }
            });
            new _Deferred().when.apply(null, dynamics)
               .then(function() {
                  var toSend = [];
                  deps.forEach(function(name) {
                     toSend.push(_store[name]);
                  });
                  if(cb) cb.apply(null, toSend);
               })
               .fail(function(e) {
                  console.log(e);
               });
         } else {
            cb();
         }
      };
      var _def = function(deps, cb) {
         return function() {
            _req(deps, cb);
         };
      };
      var _setConfig = function(config) {
         _config = config;
      };
      var _utils = {
         isArray: function(x) {
            return Object.prototype.toString.call(x) == "[object Array]";
         },
         isObject: function(x) {
            return Object.prototype.toString.call(x) == "[object Object]";
         },
         isString: function(x) {
            return Object.prototype.toString.call(x) == "[object String]";
         },
         isNumber: function(x) {
            return Object.prototype.toString.call(x) == "[object Number]";
         },
         isFunction: function(x) {
            return Object.prototype.toString.call(x) == "[object Function]";
         },
         isEmptyObject: function(x) {
            return !Object.keys(x).length;
         },
         isEmptyArray: function(x) {
            return !x.length;
         },
         objectLen: function(x) {
            return Object.keys(x).length;
         },
         inObject: function(prop, obj) {
            var res = false;
            for(var key in obj) {
               if(obj.hasOwnProperty(key)) {
                  if(key == prop) res = true;
                  break;
               }
            }
            return res;
         },
         shallowClone: function(obj) { // bettar than deepClone if your concern is performance
            var clone = {};
            for(var i in obj) {
               clone[i] = obj[i];
            }
            return clone;
         },
         deepClone: function(obj) {
            return JSON.parse(JSON.stringify(obj));
         },
         anotherClone: function(obj) {
            return new Object(obj);
         }
      };

      var _Router = function(routes) { // TODO https://developer.mozilla.org/en-US/docs/Web/API/History_API
         var hash = w.location.pathname;
         var foundRoute = false;
         for(var route in routes) {
            if(routes[route].params && !_utils.isEmptyObject(routes[route].params)) {
               var routeRegex = route;
               for(var param in routes[route].params) {
                  routeRegex = routeRegex.replace(param, "(" + routes[route].params[param] + ")");
               }
               var regex = new RegExp("^" + routeRegex + "$");
               var matches = hash.match(regex);
               if(matches) {
                  var howManyParams = _utils.objectLen(routes[route].params);
                  var newParams = [];
                  for(var i = 1; i <= howManyParams; i++) {
                     newParams.push(matches[i]);
                  }
                  if(!_utils.isEmptyArray(matches)) {
                     routes[route].controller.apply(this, newParams);
                     foundRoute = true;
                     break;
                  }
               }
            }
         }
         if(!foundRoute) routes.default.controller();
      };

      var _vdom2html = function() { // TODO

      };

      var _html2vdom = function() { // TODO

      };

      var _vdomDiff = function(old, current) { // TODO

      };

      var _replace = function(id, vdom) { // TODO

      };

      var _getById = function(id) { // TODO VDOM notation (levels, siblings)... 5c3c10 (fifth sibling, children, third sibling, children tenth sibling)

      };

      return {
         Router: _Router,
         DependencyManager: _DependencyManager,
         Deferred: _Deferred,
         req: _req,
         def: _def,
         setConfig: _setConfig,
         utils: _utils
      };
   };

   $b = new Basic(d, w);
   var mains = d.getElementsByTagName('script');
   var len = mains.length;
   var main;
   for(var i = len; i--;) {
      main = mains[i].getAttribute('data-main');
      if(main) {
         $b.req([main]);
         break;
      }
   }
})(document, window);