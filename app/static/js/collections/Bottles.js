define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Bottle'
    ],
    function(
        $,
        _,
        Backbone,
        BottleModel
    ) {
        return Backbone.Collection.extend({
            url: '/api/bottles',
            model: BottleModel
        });
    }
);