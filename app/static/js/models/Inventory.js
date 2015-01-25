define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base'
    ],
    function(
        $,
        _,
        Backbone,
        BaseModel
    ) {
        return BaseModel.extend();
    }
);