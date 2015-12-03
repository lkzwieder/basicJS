var DefaultCtrl = $b.def([
    '!/modules/default/defaultTemplate.html'
], function(defaultTmp) {
    $b.Controller({
        el: document.getElementsByTagName('body')[0],
        initialize: function() {
            this.vdom = $b.vdom.html2json(defaultTmp);
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