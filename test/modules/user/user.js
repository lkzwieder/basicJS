var UserCtrl = $b.def([
   '!/modules/user/userTemplate.html'
], function(userTmp, params) {
   $b.Controller({
      el: $b.select('body')[0],
      initialize: function() {
         this.vdom = $b.vdom.html2json(userTmp);
         this.html = $b.vdom.json2html(this.vdom);
         return this;
      },
      render: function() {
         this.el.innerHTML = this.html;
      },
      events: {
         'click #function': function() {
            console.log('click on #function');
         }
      }
   });
});