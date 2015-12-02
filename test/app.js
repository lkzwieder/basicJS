var Module = $b.def([
   '!/storeText.html'
], function(someText) {
   var _default = function() {
      //console.log(someText);
      var vdom = $b.vdom.html2json(someText);
      //console.log(vdom);
      var html = $b.vdom.json2html(vdom);
      //console.log(html);
      document.getElementsByTagName('body')[0].innerHTML = html;
      //$b.Router.navigate('user', '/user/123/some/pedo');
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
