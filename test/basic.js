var $b;
(function(d, w) {
   var Basic = function(d, w) {
      var _config = {};
      var _store = {};
      var _loaded = [];
      var _defaultRoutes = {
         controller: function() {
            console.log('no default controller')
         }
      };
      var _routes = _defaultRoutes;
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
         var _toAddCode = function(name) {
            var url = name;
            var deps = [];
            if(config[name]) {
               url = config[name].url || url;
               deps = config[name].deps || deps;
            }
            return {url: url, deps: deps};
         };
         var originalPos = 0;
         arr.forEach(function(name) {
            var toAdd = _toAddCode(name);
            _addCode(toAdd.url, name, toAdd.deps, originalPos);
            originalPos += 1;
         });
         if(!_utils.isEmptyObject(queue)) {
            executed.forEach(function(name) {
               _wasDependency(name);
            });
            if(!_utils.isEmptyObject(queue)) {
               for(var script in queue) {
                  config[script].deps.forEach(function(name) {
                     var toAdd = _toAddCode(name);
                     _addCode(toAdd.url, name, toAdd.deps);
                  });
               }
            }
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
      var _req = function(deps, cb, params) {
         var _allowedGlobals = [];
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
            request.open("GET", url, true);
            request.send(null);
            return deferred.promise();
         };
         var _storeScript = function(name, url) {
            var deferred = new _Deferred();
            if(_loaded.indexOf(name) == -1) {
               _loaded.push(name);
               var script = _createScript();
               script.src = url;
               var prevWindow = _utils.shallowClone(w); // TODO cuando se ejecuta load, windowDiff encuentra todas las
                                                        // diferencias pero el nombre que llega como parametro es uno solo
               script.addEventListener('load', function(e) {
                  var node = e.currentTarget;
                  var names = _windowDiffStore(prevWindow, w, name, node, url);
                  if(!_utils.isEmptyArray(names)) {
                     names.forEach(function(n) {
                        if(_config.allowedGlobals.indexOf(n) == -1) delete w[n];
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
            } else {
               var inter = setInterval(function() {
                  if(_store[name]) {
                     deferred.resolve();
                     clearInterval(inter);
                  }
               }, 50);
            }
            return deferred.promise();
         };
         var _storeDeps = function(name, url) {
            return name.indexOf('!') === 0 ? _storeText(name, url) : _storeScript(name, url);
         };
         var _windowDiffStore = function(old, current, name, node, url) {
            var res = [];
            current = _utils.shallowClone(current);
            for(var i in current) {
               if(!old[i]) {
                  if(node.src.indexOf(url) != -1 && !_utils.inObject(i, _store)) {
                     _store[name] = current[i];
                     res.push(i);
                  }
               }
            }
            return res;
         };
         var dynamics = [];
         if(!_utils.isEmptyArray(deps)) {
            var orderedDeps = new _DependencyManager(deps, _config['paths']);
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
                  toSend.push(params);
                  if(cb) cb.apply(null, toSend);
               })
               .fail(function(e) {
                  console.log(e);
               });
         } else {
            cb(params);
         }
      };
      var _def = function(deps, cb) {
         return function() {
            _req(deps, cb, arguments);
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
         mergeObjects: function() {
            var args = Array.prototype.slice.call(arguments);
            var merged = {};
            args.forEach(function(obj) {
               for(var key in obj) {
                  if(obj.hasOwnProperty(key)) {
                     merged[key] = obj[key];
                  }
               }
            });
            return merged;
         },
         uniqueArray: function(arr) {
            var res = [];
            arr.forEach(function(i) {
               if(res.indexOf(i) == -1) res.push(i);
            });
            return res;
         },
         shallowClone: function(obj) {
            var clone = {};
            for(var i in obj) {
               if(i.indexOf('on') !== 0 &&
                  ["defaultstatus", "defaultStatus", "pageYOffset", "scrollY", "pageXOffset", "scrollX", "frameElement",
                     "opener", "length", "closed", "status", "name", "TEMPORARY"].indexOf(i) == -1) {
                  clone[i] = obj[i];
               }
            }
            return clone;
         },
         capitalize: function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
         },
         getCookie: function(name) {
            var nameEQ = name + "=";
            var ca = d.cookie.split(';');
            for(var i=0; i < ca.length; i++) {
               var c = ca[i];
               while (c.charAt(0)==' ') c = c.substring(1);
               if (c.indexOf(nameEQ) != -1) return c.substring(nameEQ.length, c.length);
            }
            return null;
         },
         deleteCookie: function(key) {
            d.cookie = key + "=;expires=Wed; 01 Jan 1970";
         },
         setCookie: function(key, value) {
            d.cookie = key + '=' + value + '; Path=/;';
         }
      };
      var _Router = (function() {
         var _hash = w.location.pathname;
         var _back = function(n) {
            n = n || 1;
            w.history.go(n * -1);
         };
         var _navigate = function(name, path) {
            var objState = {};
            objState[name] = path;
            history.pushState(objState, name, path);
         };
         var _addRoutes = function(routes) {
            _routes = _utils.mergeObjects(_routes, routes);
         };
         var _delRoutes = function(route) {
            delete _routes[route];
         };
         var _flushRoutes = function() {
            _routes = _defaultRoutes;
         };
         var _run = function() {
            var foundRoute = false;
            for(var route in _routes) {
               if(_routes[route]) {
                  var routeRegex = route;
                  var hasParams = _routes[route].params && !_utils.isEmptyObject(_routes[route].params);
                  if(hasParams) {
                     for(var param in _routes[route].params) {
                        routeRegex = routeRegex.replace(param, "(" + _routes[route].params[param] + ")");
                     }
                  }
                  var regex = new RegExp("^" + routeRegex + "$");
                  var matches = _hash.match(regex);
                  if(matches) {
                     var newParams = [];
                     if(hasParams) {
                        var howManyParams = _utils.objectLen(_routes[route].params);
                        for(var i = 1; i <= howManyParams; i++) {
                           newParams.push(matches[i]);
                        }
                     }
                     if(!_utils.isEmptyArray(matches)) {
                        _routes[route].controller.apply(null, newParams);
                        foundRoute = true;
                        break;
                     }
                  }
               }
            }
            if(!foundRoute) {
               _routes.default.controller();
            }
         };
         setInterval(function() {
            var currentUrl = w.location.pathname;
            if(_hash != currentUrl) {
               var evt = new Event('urlChange');
               _hash = w.location.pathname;
               d.dispatchEvent(evt);
            }
         }, 50);
         d.addEventListener('urlChange', function() {
            _run();
         });
         return {
            run: _run,
            navigate: _navigate,
            back: _back,
            addRoutes: _addRoutes,
            delRoutes: _delRoutes,
            flushRoutes: _flushRoutes
         };
      })();
      var _selectAll = function(query, el) {
         el = el || d;
         return el.querySelectorAll(query);
      };
      var _select = function(query, el) {
         el = el || d;
         return el.querySelector(query);
      };
      var _getFormElements = function(form) {
         var res = {};
         ["input", "select", "textarea"].forEach(function(i) {
            var data = _selectAll(i, form);
            var len = data.length;
            for(var j = len; j--;) {
               if(i == "select") data[j].value = data[j].options[data[j].selectedIndex].value;
               res[data[j].name] = data[j].value;
            }
         });
         return res;
      };
      var _reloadEvents = function(events) {
         if(!_utils.isEmptyObject(events)) {
            for(var event in events) {
               var evt = event.split(" ", 2);
               var el = _selectAll(evt[1]);
               var len = el.length;
               for(var i = len; i--;) {
                  el[i].addEventListener(evt[0], events[event]);
               }
            }
         }
      };
      var _Controller = function(opt) {
         opt.render = opt.render || false;
         opt.events = opt.events || {};
         opt.reloadEvents = function() {
            _reloadEvents(opt.events);
         };
         if(opt.wait) {
            var interval = setInterval(function() {
               opt.el = _select(opt.el);
               if(opt.el) {
                  _initializeController(opt);
                  clearInterval(interval);
               }
            }, 50);
         } else {
            opt.el = _select(opt.el);
            _initializeController(opt);
         }
      };
      var _initializeController = function(opt) {
         opt.initialize();
         if(opt.render) opt.render();
         _reloadEvents(opt.events);
      };
      var _parser = function() {
         var _makeMap = function(str) {
            var obj = {},
               items = str.split(","),
               itemsLen = items.length;
            for(var i = 0; i < itemsLen; i++) obj[items[i]] = true;
            return obj;
         };
         var startTag = /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
            endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
            attr = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
         var empty = _makeMap("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr");
         var block = _makeMap("a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,option,output,p,pre,section,select,script,table,tbody,td,tfoot,th,thead,tr,ul,video");
         var inline = _makeMap("abbr,acronym,applet,b,basefont,bdo,big,br,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,small,span,strike,strong,sub,sup,textarea,tt,u,var");
         var closeSelf = _makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");
         var fillAttrs = _makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");
         var special = _makeMap("script,style");
         var HTMLParser = function(html, handler) {
            var index, chars, match, stack = [], last = html;
            stack.last = function() {
               return this[this.length - 1];
            };
            while(html) {
               chars = true;
               if(!stack.last() || !special[stack.last()]) {
                  if(html.indexOf("<!--") == 0) {
                     index = html.indexOf("-->");
                     if(index >= 0) {
                        if(handler.comment) handler.comment(html.substring(4, index));
                        html = html.substring(index + 3);
                        chars = false;
                     }
                  } else if(html.indexOf("</") == 0) {
                     match = html.match(endTag);
                     if(match) {
                        html = html.substring(match[0].length);
                        match[0].replace(endTag, parseEndTag);
                        chars = false;
                     }
                  } else if(html.indexOf("<") == 0) {
                     match = html.match(startTag);
                     if(match) {
                        html = html.substring(match[0].length);
                        match[0].replace(startTag, parseStartTag);
                        chars = false;
                     }
                  }
                  if(chars) {
                     index = html.indexOf("<");
                     var text = index < 0 ? html : html.substring(0, index);
                     html = index < 0 ? "" : html.substring(index);
                     if(handler.chars) handler.chars(text);
                  }
               } else {
                  html = html.replace(new RegExp("([\\s\\S]*?)<\/" + stack.last() + "[^>]*>"), function(all, text) {
                     text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2");
                     if(handler.chars) handler.chars(text);
                     return "";
                  });
                  parseEndTag("", stack.last());
               }
               if(html == last) throw "Parse Error: " + html;
               last = html;
            }
            parseEndTag();
            function parseStartTag(tag, tagName, rest, unary) {
               tagName = tagName.toLowerCase();
               if(block[tagName]) while(stack.last() && inline[stack.last()]) parseEndTag("", stack.last());
               if(closeSelf[tagName] && stack.last() == tagName) parseEndTag("", tagName);
               unary = empty[tagName] || !!unary;
               if(!unary) stack.push(tagName);
               if(handler.start) {
                  var attrs = [];
                  rest.replace(attr, function(match, name) { // No need for uglify here, wacala!
                     var value = arguments[2] ? arguments[2] :
                        arguments[3] ? arguments[3] :
                           arguments[4] ? arguments[4] :
                              fillAttrs[name] ? name : "";
                     attrs.push({
                        name: name,
                        value: value,
                        escaped: value.replace(/(^|[^\\])"/g, '$1\\\"')
                     });
                  });
                  if(handler.start) handler.start(tagName, attrs, unary);
               }
            }

            function parseEndTag(tag, tagName) {
               if(!tagName) var pos = 0; else for(var pos = stack.length - 1; pos >= 0; pos--) if(stack[pos] == tagName) break;
               if(pos >= 0) {
                  for(var i = stack.length - 1; i >= pos; i--) if(handler.end) handler.end(stack[i]);
                  stack.length = pos;
               }
            }
         };
         var _html2json = function(html) {
            var inline = _makeMap('a, abbr,acronym,applet,basefont,bdo,big,button,br,cite,code,del,dfn,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,small,strike,strong,sub,sup,textarea,tt,u,var');
            inline.textarea = false;
            inline.input = false;
            inline.img = false;
            inline.a = false;
            inline.button = false;
            html = html.replace(/<!DOCTYPE[\s\S]+?>/, '');
            var bufArray = [];
            var results = {};
            var inlineBuf = [];
            bufArray.last = function() {
               return this[this.length - 1];
            };
            HTMLParser(html, {
               start: function(tag, attrs, unary) {
                  var attrLen = attrs.length;
                  if(inline[tag]) {
                     var attributes = '';
                     for(var i = 0; i < attrLen; i++) {
                        attributes += ' ' + attrs[i].name + '="' + attrs[i].value + '"';
                     }
                     inlineBuf.push('<' + tag + attributes + '>');
                  } else {
                     var buf = {};
                     buf.tag = tag;
                     if(attrLen !== 0) {
                        var attr = {};
                        for(var i = 0; i < attrLen; i++) {
                           var attr_name = attrs[i].name;
                           var attr_value = attrs[i].value;
                           if(attr_name === 'class') {
                              attr_value = attr_value.split(' ');
                           }
                           attr[attr_name] = attr_value;
                        }
                        buf['attr'] = attr;
                     }
                     if(unary) {
                        var last = bufArray.last();
                        if(!(last.child instanceof Array)) {
                           last.child = [];
                        }
                        last.child.push(buf);
                     } else {
                        bufArray.push(buf);
                     }
                  }
               },
               end: function(tag) {
                  if(inline[tag]) {
                     var last = bufArray.last();
                     inlineBuf.push('</' + tag + '>');
                     if(!last.text) last.text = '';
                     last.text += inlineBuf.join('');
                     inlineBuf = [];
                  } else {
                     var buf = bufArray.pop();
                     if(bufArray.length === 0) {
                        return results = buf;
                     }
                     var last = bufArray.last();
                     if(!(last.child instanceof Array)) {
                        last.child = [];
                     }
                     last.child.push(buf);
                  }
               },
               chars: function(text) {
                  if(inlineBuf.length !== 0) {
                     inlineBuf.push(text);
                  } else {
                     var last = bufArray.last();
                     if(last) {
                        if(!last.text) last.text = '';
                        last.text += text;
                     }
                  }
               },
               comment: function(text) {
               }
            });
            return results;
         };
         var _json2html = function(json) {
            var tag = json.tag;
            var text = json.text;
            var children = json.child;
            var buf = [];
            var empty = _makeMap('area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed');
            var buildAttr = function(attr) { // TODO improve
               for(var k in attr) {
                  buf.push(' ' + k + '="');
                  if(attr[k] instanceof Array) {
                     buf.push(attr[k].join(' '));
                  } else {
                     buf.push(attr[k]);
                  }
                  buf.push('"');
               }
            };
            buf.push('<');
            buf.push(tag);
            json.attr ? buf.push(buildAttr(json.attr)) : null;
            if(empty[tag]) buf.push('/');
            buf.push('>');
            text ? buf.push(text) : null;
            if(children) { // TODO improve
               for(var j = 0; j < children.length; j++) {
                  buf.push(_json2html(children[j]));
               }
            }
            if(!empty[tag]) buf.push('</' + tag + '>');
            return buf.join('');
         };
         var _attrExtensions = [];
         var _applyAttrs = function(json, params) {
            if(json.attr) {
               for(var attr in json.attr) {
                  _attrExtensions.forEach(function(extension) {
                     var dashedAttr = attr.replace('-', '_');
                     if(_utils.inObject(dashedAttr, extension)) {
                        json = extension[dashedAttr](json, params);
                     }
                  });
               }
            }
            return json;
         };
         var _replace = function(value, str, keyName) {
            var matches = str.match(/{{\s*[\w\.]+\s*}}/g);
            var toReplace = [];
            if(matches) {
               toReplace = matches.map(function(x) {
                  return x.match(/[\w\.]+/)[0];
               });
            }
            toReplace.forEach(function(v) {
               str = str.replace('{{' + v + '}}', (v.indexOf(keyName) === 0) ? eval(v.replace(keyName + '.', 'value.')) : _findValue(v, value));
            });
            return str;
         };
         var _findValue = function(strKeys, value) {
            var res = "";
            var keys = strKeys.split('.');
            var i = 0;
            keys.forEach(function(k) {
               res = i ? res[k] : value[k];
               i++;
            });
            return res;
         };
         var _process = function(json, params) {
            json = _applyAttrs(json, params);
            if(json) {
               if(json.text) json.text = _replace(params, json.text);
               if(json.attr) {
                  for(var k in json.attr) {
                     if(_utils.isArray(json.attr[k])) {
                        json.attr[k].forEach(function(v, i) {
                           json.attr[k][i] = _replace(params, v);
                        });
                     } else {
                        json.attr[k] = _replace(params, json.attr[k]);
                     }
                  }
               }
               if(json.child) {
                  for(var i = 0; i < json.child.length; i++) { // splice affects the length of json.child because of that we recalculate in every iteration
                     var res = _process(json.child[i], params);
                     if(!res) {
                        json.child.splice(i, 1);
                     } else {
                        json.child[i] = res;
                     }
                  }
               }
            }
            return json;
         };
         var _htmlProcess = function(html, params) {
            var json = _html2json(html);
            return _json2html(_process(json, params));
         };
         return {
            process: _htmlProcess,
            replace: _replace,
            attrExtensions: _attrExtensions
         };
      }();
      return {
         DependencyManager: _DependencyManager,
         Deferred: _Deferred,
         Controller: _Controller,
         req: _req,
         def: _def,
         setConfig: _setConfig,
         process: _parser.process,
         vdom: _parser,
         Router: _Router,
         utils: _utils,
         select: _select,
         selectAll: _selectAll,
         getFormElements: _getFormElements,
         controllers: {},
         store: _store
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