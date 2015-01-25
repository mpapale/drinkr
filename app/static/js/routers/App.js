define(
    [
        'jquery',
        'underscore',
        'backbone'
    ],
    function(
        $,
        _,
        Backbone
    ) {
        return Backbone.Router.extend({
            routes: {
                '': 'home',
                'collection': 'collection',
                'admin': 'admin',
                'tastings': 'tastings',
                'home': 'home'
            }
        });
    }
);