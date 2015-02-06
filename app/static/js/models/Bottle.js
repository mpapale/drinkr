define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'models/Wine'
    ],
    function(
        $,
        _,
        Backbone,
        BaseModel,
        WineModel
    ) {
        return BaseModel.extend({
            parse: function(response) {
                response.wine = new WineModel(response.wine, { parse: true });
                return response;
            }
        });
    }
);