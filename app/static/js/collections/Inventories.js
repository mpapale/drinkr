define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Inventory'
    ],
    function(
        $,
        _,
        Backbone,
        InventoryModel
    ) {
        return Backbone.Collection.extend({
            url: '/api/inventories',
            model: InventoryModel            
        });
    }
);