var $b;!function(e,t){var n=function(e,t){var n={},r={},a={controller:function(){console.log("no default controller")}},o=a,s=function(e,t){var n={},r=[],a=[];t=t||{};var o=function(e,t,n,a){f.isEmptyArray(n)||n.forEach(function(e){r.indexOf(e)>-1&&n.slice(n.indexOf(e),1)}),f.isEmptyArray(n)?u(e,t,a):s(e,t,n,a)},s=function(e,t,r,a){n[t]||(n[t]={},n[t].url=e,n[t].pos=a,n[t].deps=r)},i=function(e){for(var t in n)if(n.hasOwnProperty(t)){var r=n[t],a=r.deps.indexOf(e);a>-1&&(n[t].deps.splice(a,1),n[t].deps.length||u(r.url,t,r.pos))}},u=function(e,t,n){var o={};o.name=t,o.url=e,o.pos=n,a.push(o),-1==r.indexOf(t)&&r.push(t),i(t)},l=function(e){var n=e,r=[];return t[e]&&(n=t[e].url||n,r=t[e].deps||r),{url:n,deps:r}},c=0;if(e.forEach(function(e){var t=l(e);o(t.url,e,t.deps,c),c+=1}),!f.isEmptyObject(n)&&(r.forEach(function(e){i(e)}),!f.isEmptyObject(n)))for(var p in n)t[p].deps.forEach(function(e){var t=l(e);o(t.url,e,t.deps)});return a},i=function(e){e=e||{verbose:!1,processOnFail:!1};var t,n,r=[],a=[],o=null,s=function(s,i,u){o--,s?r[u]=i[0]:(a[u]=i[0],e.processOnFail||(o=!1,r=[]),e.verbose&&console.log("The argument in the position number: "+u+" has failed")),o||(a.length&&(a=Array.prototype.slice.call(a),n.apply(null,a)),r.length&&(r=Array.prototype.slice.call(r),t.apply(null,r)))},i=function(e,t){t=Array.prototype.slice.call(t),e.apply(null,t)},u=function(e){return t=e,this},l=function(e){return t=e,this},c=function(e){return n=e,this};return{when:function(){for(var e=o=arguments.length;e--;)arguments[e].self.pos=e,arguments[e].self.resolve=function(){s(!0,arguments,this.pos)},arguments[e].self.reject=function(){s(!1,arguments,this.pos)};return{then:l,fail:c,done:u}},resolve:function(){i(t,arguments)},reject:function(){i(n,arguments)},promise:function(){return{done:u,fail:c,self:this}}}},u=function(a,o,u){var l=[],c=function(){var t=e.createElement("script");return t.type="text/javascript",t.charset="utf-8",t.async=!0,t},p=function(e,t){var n=new i,a=new XMLHttpRequest;return 0===t.indexOf("!")&&(t=t.substring(1,t.length)),a.onreadystatechange=function(){4==a.readyState&&200==a.status?(r[e]||(r[e]=a.responseText),n.resolve()):4==a.readyState&&200!=a.status&&n.reject("Error: "+t+" could not be loaded")},a.open("GET",t,!0),a.send(null),n.promise()},h=function(n,r){var a=new i,o=c();o.src=r;var s=f.shallowClone(t);return o.addEventListener("load",function(e){var o=e.currentTarget,i=m(s,t,n,o,r);f.isEmptyArray(i)||i.forEach(function(e){delete t[e]}),a.resolve(),o.parentNode.removeChild(o)}),o.addEventListener("error",function(e){var t=e.currentTarget;t.parentNode.removeChild(t),a.reject("Error: "+n+" could not be loaded")}),e.getElementsByTagName("head")[0].appendChild(o),a.promise()},d=function(e,t){return 0===e.indexOf("!")?p(e,t):h(e,t)},m=function(e,t,n,a,o){var s=[];t=f.shallowClone(t);for(var i in t)e[i]||-1!=a.src.indexOf(o)&&-1==l.indexOf(i)&&(r[n]=t[i],l.push(i),s.push(i));return s},v=[];if(f.isEmptyArray(a))o(u);else{var g=new s(a,n);g.forEach(function(e){f.inObject(e.name,r)||v.push(d(e.name,e.url))}),(new i).when.apply(null,v).then(function(){var e=[];a.forEach(function(t){e.push(r[t])}),e.push(u),o&&o.apply(null,e)}).fail(function(e){console.log(e)})}},l=function(e,t){return function(){u(e,t,arguments)}},c=function(e){n=e},f={isArray:function(e){return"[object Array]"==Object.prototype.toString.call(e)},isObject:function(e){return"[object Object]"==Object.prototype.toString.call(e)},isString:function(e){return"[object String]"==Object.prototype.toString.call(e)},isNumber:function(e){return"[object Number]"==Object.prototype.toString.call(e)},isFunction:function(e){return"[object Function]"==Object.prototype.toString.call(e)},isEmptyObject:function(e){return!Object.keys(e).length},isEmptyArray:function(e){return!e.length},objectLen:function(e){return Object.keys(e).length},inObject:function(e,t){var n=!1;for(var r in t)if(t.hasOwnProperty(r)){r==e&&(n=!0);break}return n},mergeObjects:function(){var e=Array.prototype.slice.call(arguments),t={};return e.forEach(function(e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])}),t},uniqueArray:function(e){var t=[];return e.forEach(function(e){-1==t.indexOf(e)&&t.push(e)}),t},shallowClone:function(e){var t={};for(var n in e)0!==n.indexOf("on")&&-1==["defaultstatus","defaultStatus","pageYOffset","scrollY","pageXOffset","scrollX","frameElement","opener","length","closed","status","name","TEMPORARY"].indexOf(n)&&(t[n]=e[n]);return t}},p=function(){var e=t.location.pathname,n=function(e,t){var n={};n[e]=t,history.pushState(n,e,t)},r=function(e){o=f.mergeObjects(o,e)},s=function(e){delete o[e]},i=function(){o=a},u=function(){var t=!1;for(var n in o)if(o[n].params&&!f.isEmptyObject(o[n].params)){var r=n;for(var a in o[n].params)r=r.replace(a,"("+o[n].params[a]+")");var s=new RegExp("^"+r+"$"),i=e.match(s);if(i){for(var u=f.objectLen(o[n].params),l=[],c=1;u>=c;c++)l.push(i[c]);if(!f.isEmptyArray(i)){o[n].controller.apply(null,l),t=!0;break}}}t||o["default"].controller()};return setInterval(function(){var n=t.location.pathname;if(e!=n){var r=new Event("urlChange");e=t.location.pathname,t.dispatchEvent(r)}},50),t.addEventListener("urlChange",function(){u()}),{run:u,navigate:n,addRoutes:r,delRoutes:s,flushRoutes:i}}(),h=function(t,n){return n=n||e,n.querySelectorAll(t)},d=function(e){if(e.render=e.render||function(){},e.events=e.events||{},e.initialize().render(),!f.isEmptyObject(e.events))for(var t in e.events)for(var n=t.split(" ",2),r=h(n[1]),a=r.length,o=a;o--;)r[o].addEventListener(n[0],e.events[t])},m=function(){var e=function(e){for(var t={},n=e.split(","),r=n.length,a=0;r>a;a++)t[n[a]]=!0;return t},t=/^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,n=/^<\/([-A-Za-z0-9_]+)[^>]*>/,r=/([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g,a=e("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr"),o=e("a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video"),s=e("abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var"),i=e("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr"),u=e("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected"),l=e("script,style"),c=function(e,c){function f(e,t,n,l){if(t=t.toLowerCase(),o[t])for(;v.last()&&s[v.last()];)p("",v.last());if(i[t]&&v.last()==t&&p("",t),l=a[t]||!!l,l||v.push(t),c.start){var f=[];n.replace(r,function(e,t){var n=arguments[2]?arguments[2]:arguments[3]?arguments[3]:arguments[4]?arguments[4]:u[t]?t:"";f.push({name:t,value:n,escaped:n.replace(/(^|[^\\])"/g,'$1\\"')})}),c.start&&c.start(t,f,l)}}function p(e,t){if(t)for(var n=v.length-1;n>=0&&v[n]!=t;n--);else var n=0;if(n>=0){for(var r=v.length-1;r>=n;r--)c.end&&c.end(v[r]);v.length=n}}var h,d,m,v=[],g=e;for(v.last=function(){return this[this.length-1]};e;){if(d=!0,v.last()&&l[v.last()])e=e.replace(new RegExp("([\\s\\S]*?)</"+v.last()+"[^>]*>"),function(e,t){return t=t.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g,"$1$2"),c.chars&&c.chars(t),""}),p("",v.last());else if(0==e.indexOf("<!--")?(h=e.indexOf("-->"),h>=0&&(c.comment&&c.comment(e.substring(4,h)),e=e.substring(h+3),d=!1)):0==e.indexOf("</")?(m=e.match(n),m&&(e=e.substring(m[0].length),m[0].replace(n,p),d=!1)):0==e.indexOf("<")&&(m=e.match(t),m&&(e=e.substring(m[0].length),m[0].replace(t,f),d=!1)),d){h=e.indexOf("<");var b=0>h?e:e.substring(0,h);e=0>h?"":e.substring(h),c.chars&&c.chars(b)}if(e==g)throw"Parse Error: "+e;g=e}p()},f=function(t){var n=e("a, abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");n.textarea=!1,n.input=!1,n.img=!1,n.a=!1,t=t.replace(/<!DOCTYPE[\s\S]+?>/,"");var r=[],a={},o=[];return r.last=function(){return this[this.length-1]},c(t,{start:function(e,t,a){var s=t.length;if(n[e]){for(var i="",u=0;s>u;u++)i+=" "+t[u].name+'="'+t[u].value+'"';o.push("<"+e+i+">")}else{var l={};if(l.tag=e,0!==s){for(var c={},u=0;s>u;u++){var f=t[u].name,p=t[u].value;"class"===f&&(p=p.split(" ")),c[f]=p}l.attr=c}if(a){var h=r.last();h.child instanceof Array||(h.child=[]),h.child.push(l)}else r.push(l)}},end:function(e){if(n[e]){var t=r.last();o.push("</"+e+">"),t.text||(t.text=""),t.text+=o.join(""),o=[]}else{var s=r.pop();if(0===r.length)return a=s;var t=r.last();t.child instanceof Array||(t.child=[]),t.child.push(s)}},chars:function(e){if(0!==o.length)o.push(e);else{var t=r.last();t&&(t.text||(t.text=""),t.text+=e)}},comment:function(e){}}),a},p=function(t){var n=t.tag,r=t.text,a=t.child,o=[],s=e("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed"),i=function(e){for(var t in e)o.push(" "+t+'="'),e[t]instanceof Array?o.push(e[t].join(" ")):o.push(e[t]),o.push('"')};if(o.push("<"),o.push(n),t.attr?o.push(i(t.attr)):null,s[n]&&o.push("/"),o.push(">"),r?o.push(r):null,a)for(var u=0;u<a.length;u++)o.push(p(a[u]));return s[n]||o.push("</"+n+">"),o.join("")};return{html2json:f,json2html:p}}();return{DependencyManager:s,Deferred:i,Controller:d,req:u,def:l,setConfig:c,vdom:m,Router:p,utils:f,select:h,controllers:{},store:r}};$b=new n(e,t);for(var r,a=e.getElementsByTagName("script"),o=a.length,s=o;s--;)if(r=a[s].getAttribute("data-main")){$b.req([r]);break}}(document,window);