define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Wine'
    ],
    function(
        $,
        _,
        Backbone,
        WineModel
    ) {
        return Backbone.Collection.extend({
            url: '/api/wines',
            model: WineModel
        });
    }
);