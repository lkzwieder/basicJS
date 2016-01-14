# basicJS
Front End framework build to be fast and simple. 

I wanted the best of RequireJS, Backbone and AngularJS in a simple framework.
We can differ in what is the best of requireJS, AngularJS, and Backbone but let me explain what I think about that.

## Positive things about BasicJS:
- HTML extensions
- Plugins system to build your own HTML extensions
- True Dependency Injection (not need to put a lot of scripts in yout HTML)
- HTML is not polluted
- Events are declared in the controllers, not everywhere (you can but I don't encourage you to do that) 
I want to debug my app easily
- You can load ONLY what you use, and you use only what you want
- Lightweight
- BasicJS is super fast
- You can build your html attributes, tags and whatever you want in an real easy way
- Not strange pseudo language
- The HTML can be converted to JSON and then to HTML easily, so designers can work with HTML and developers with JSON. So
both can be happy.
- VDOM
- Mustache-like template system
- CSS engine selector
- Shim config and dependencies simple
- BasicJS order which script load first for you


## One entry point

*This is how your HTML looks*
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Your basicJS app</title>
</head>
<body>
    <script type="text/javascript" data-main="/main.js" src="/basic.js"></script>
</body>
</html>
```

## Real dependency injection
Built requireJS way, you don't need to include every script in your html, BasicJS do that for you when the app needed.

* This is how your modules looks with basicJS *
```
var someModule = $b.def([
    '/path/to/script.js',
    '!/path/to/template.html'
], function(script, template) {
    // do something with the script and template
});

```

## Router
Routing can be a real pain, is because of that I made this so simple, all the capabilities a developer want in a simple
and concise way. With really simple regex filters.

* This is how you can declare your routes in the app, with built-in filters *
```
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
```

## Controller
Simple and compact, $b.controller execute the initialize first, then the render if you have one and binds the events you
want. Easy to debug, all your events in the controller. No more look everywhere for a listener. 

```
var UserCtrl = $b.def([
   '!/modules/user/userTemplate.html',
   '/values/for/the/template.json',
   '/click/function.js'
], function(userTmp, values, functionClick, params) {
    // params are the params you put in the url, already filtered
   $b.Controller({
      el: $b.select('body')[0],
      initialize: function() {
         this.vdom = $b.vdom.process($b.vdom.html2json(userTmp), values);
         this.html = $b.vdom.json2html(this.vdom);
         return this;
      },
      render: function() {
         this.el.innerHTML = this.html;
      },
      events: {
         'click #function': functionClick,
         'mouseover .user': function() {
            console.log('hover on .user');
         }
      }
   });
});
```

## Template
I already made a bc-repeat, but you can build your own attributes with the behaviour you want in an easy way.
```
<div class="some">
    <h1 id="function">{{title}}</h1>
    <ul bc-repeat="k in value">
        <li class="user">
            <a>Your name is: {{k.name}}</a>
            <span> Fullname: {{k.name}} {{k.lastname}}</span>
        </li>
        <h2>{{other}}</h2>
    </ul>
</div>
```

## HTML extensions
You can extend HTML, tags, attrs, everything can be added and I plan to have a lot of extensions you can download and use.
bc-repeat is an example.

This is how you extends HTML attributes
```
$b.vdom.attrExtensions.push({
    bc_repeat: function(json, params) {
        // code
    }
})
```

Here I load bc-repeat extension, now I can use it in the app.
```
$b.req([
   '/app.js',
   '/extensions/bc_repeat.js'
], function(App) {
   App();
});
```

## Easy shim config
Is clear enough i guess.
```
$b.setConfig({
   jquery: {
      url: '/jquery-1.11.3.min.js'
   },
   underscore: {
      url: '/underscore-min.js',
      deps: ['jquery']
   }
});

```

To be continued...