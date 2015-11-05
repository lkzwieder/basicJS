var Module = $b.def([
   '!/storeText.html'
], function(someText) {
   var _home = function() {
      console.log("home");
   };

   var _default = function() {
      console.log('default');
   };

   var _user = function(id, thing) {
      console.log(id, thing);
   };

   $b.Router.setRoutes({
      '/': {
         controller: _home
      },
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
});
