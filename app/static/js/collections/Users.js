define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/User'
    ],
    function(
        $,
        _,
        Backbone,
        UserModel
    ) {
        return Backbone.Collection.extend({
            url: '/api/users',
            model: UserModel            
        });
    }
);