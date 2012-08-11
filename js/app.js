define([
    'jquery',
    'underscore',
    'backbone.ext',
    'backbone-validation.ext',
    'router',
    'views/header',
    'views/alerts',
    'views/help/shortcuts',
    'views/footer',
    'controllers/keyboard',
    'handlebars',
    'handlebars.helpers'
], function ($, _, BackboneExtension, BackboneValidation, Router, HeaderView, AlertsView, ShortcutsView, FooterView, KeyboardController, Handlebars) {
        var initialize = function () {

            Handlebars.registerHelper('photo_link', function (picture_url) {
                return "http://localhost:3000/api" + picture_url;
            });

            // Define global singleton views
            classes.Views.HeaderView = new HeaderView();
            classes.Views.FooterView = new FooterView();
            $('footer').html(classes.Views.FooterView.render().el);
            classes.Views.ShortcutsView = new ShortcutsView();
            $('.header').html(classes.Views.HeaderView.render().el);
            classes.Views.AlertsView = new AlertsView();
            $('.alerts').html(classes.Views.AlertsView.render().el);
            classes.Controllers.KeyboardController = new KeyboardController();

            // Pass in our Router module and call it's initialize function
            Router.initialize();
        };

        return {
            initialize:initialize
        };
    }
)
;