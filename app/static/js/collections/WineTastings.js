define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/WineTasting'
    ],
    function(
        $,
        _,
        Backbone,
        WineTastingModel
    ) {
        return Backbone.Collection.extend({
            url: '/api/wine-tastings',
            model: WineTastingModel            
        });
    }
);