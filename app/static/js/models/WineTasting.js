define(
    [
        'jquery',
        'underscore',
        'backbone',
        'collections/Users',
        'models/Base',
        'models/User',
        'models/Wine'
    ],
    function(
        $,
        _,
        Backbone,
        UsersCollection,
        BaseModel,
        UserModel,
        WineModel
    ) {
        return BaseModel.extend({
            parse: function(response) {
                response.wine = new WineModel(response.wine, { parse: true });
                response.taster = new UserModel(response.taster, { parse: true });
                response.tastingPartners = new UsersCollection(response.tastingPartners, { parse: true });
                return response;
            }
        });
    }
);