var Module = $b.def([
   '!/storeText.html'
], function(someText) {
   var _home = function() {};
   var _login = function() {};
   var _user = function(id, thing) {
      console.log(id, thing);
   };

   $b.Router({
      '/': {
         controller: _home
      },
      '/login': {
         controller: _login
      },
      '/user/id/some/thing': {
         controller: _user,
         params: {
            id: '\\d{1,3}',
            thing: '[a-z]{1,6}'
         }
      }
   });
});
