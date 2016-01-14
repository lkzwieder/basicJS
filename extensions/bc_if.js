$b.vdom.attrExtensions.push({
   bc_if: function(json, params) {
      var val = json.attr['bc-if'];
      var res;
      if(val.indexOf('!') == 0) {
         val = val.substring(1);
         res = !params[val];
      } else {
         res = params[val];
      }
      delete json.attr['bc-if'];
      return res ? json : false;
   }
});
