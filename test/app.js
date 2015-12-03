var AppLoader = $b.def([
   '/modules/default/default.js',
   '/modules/user/user.js'
], function(_default, _user) {
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
