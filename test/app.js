var Module = $b.def([
   '!/storeText.html'
], function(someText) {
   var _default = function() {
      console.log(someText);
      var vdom = $b.vdom.html2json(someText);
      console.log(vdom);
      //$b.Router.replace('user', '/user/123/some/thing');
   };

   var _user = function(id, thing) {
      console.log(id, thing);
   };

   $b.Router.addRoutes({
      '/user/id/some/thing': {
         controller: _user,
         params: {
            id: '\\d{1,3}',
            thing: '[a-z]{1,6}'
         }
      },
      'default': {
         controller: _default
      }
   });

   $b.Router.run();
});
