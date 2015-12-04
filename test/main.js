$b.setConfig({
   jquery: {
      url: '/jquery-1.11.3.min.js'
   },
   underscore: {
      url: '/underscore-min.js',
      deps: ['jquery']
   }
});

$b.req([
   '/app.js',
   '/extensions/bc_repeat.js'
], function(App) {
   App();
});