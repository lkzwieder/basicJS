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
         return json;
      };

       var parts = json.attr['bc-repeat'].split(' ', 3);
       var child = JSON.parse(JSON.stringify(json.child));
       json.child = [];
       var _addChild = function(json, child) {
          json.child = json.child.concat(child);
          return json;
       };
       var sourceArray = params[parts[2]];
       if(!_utils.isArray(sourceArray)) {
          console.warn('bc-repeat: expected array for "' + parts[2] + '", got', sourceArray);
          return json;
       }
       var paramLen = sourceArray.length;
       for(var i = 0; i < paramLen; i++) {
          json = _addChild(json, JSON.parse(JSON.stringify(child)));
          json = _goDeeper(json, sourceArray[i], parts[0]);
       }
      return json;
   }
});