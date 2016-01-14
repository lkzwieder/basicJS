$b.vdom.attrExtensions.push({
   bc_repeat: function(json, params) {
      var _goDeeper = function(json, value, keyName) {
         if(json.child) {
            var len = json.child.length;
            for(var i = 0; i < len; i++) {
               if(json.child && json.child[i] && json.child[i].text) {
                  json.child[i].text = $b.vdom.replace(value, json.child[i].text, keyName);
                  json.child[i] = _goDeeper(json.child[i], value, keyName);
               }
            }
         }
         if(json.attr) {
            for(var i in json.attr) {
               if($b.utils.isArray(json.attr[i])) {
                  var len = json.attr[i].length;
                  for(var j = len; j--;) {
                     json.attr[i][j] = $b.vdom.replace(value, json.attr[i][j], keyName);
                  }
               } else {
                  json.attr[i] = $b.vdom.replace(value, json.attr[i], keyName);
               }
            }
         }
         return json;
      };

      var parts = json.attr['bc-repeat'].split(' ', 3); // TODO index is needed?
      var child = JSON.parse(JSON.stringify(json.child));
      json.child = [];
      var _addChild = function(json, child) {
         json.child = json.child.concat(child);
         return json;
      };
      var paramLen = params[parts[2]].length;
      for(var i = 0; i < paramLen; i++) {
         json = _addChild(json, JSON.parse(JSON.stringify(child)));
         json = _goDeeper(json, params[parts[2]][i], parts[0]);
      }
      return json;
   }
});
