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
        return Backbone.Model.extend({
            idAttribute: '_id',
            getNested: function(prop) {
                var split = prop.split('.'),
                    i,
                    current = this;

                for (i = 0; i < split.length - 1; i++) {
                    current = current.get(split[i]);
                }

                return current.get(split[i]);
            }
        });
    }
);