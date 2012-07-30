// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
    paths:{
        jquery:'libs/jquery',
        underscore:'libs/underscore',
        'underscore.string':"libs/underscore.string",
        backbone:'libs/backbone',
        'bootstrap-dropdown':'libs/bootstrap-dropdown',
        use:"libs/use",
        pubsub:'libs/pubsub',
        localstorage:"libs/localstorage",
        text:"libs/text",
        i18n:"libs/i18n",
        templates:"/templates"
    }

});

classes = {
    Routers:{},
    Collections:{},
    Models:{},
    Views:{}
};


require([

    // Load our app module and pass it to our definition function
    'app',
    'jquery',
    'underscore',
    'underscore.string',
    'util',
    'events'
    // Some plugins have to be loaded in order due to their non AMD compliance
    // Because these scripts are not "modules" they do not pass any values to the definition function below
], function (App, $, _, _s, util, events) {

    // Merge Underscore and Underscore.String
    _.str = _s;
    _.mixin(_.str.exports());
    _.str.include('Underscore.string', 'string');

    // The "app" dependency is passed in as "App"
    // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
    App.initialize();
});