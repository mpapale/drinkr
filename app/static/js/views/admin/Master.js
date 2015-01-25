define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'views/admin/List',
        'text!./Master.html'
    ],
    function(
        $,
        _,
        Backbone,
        BaseView,
        ListView,
        Template
    ) {
        return BaseView.extend({
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.inventoriesList = new ListView({
                    collection: this.collection.inventories,
                    title: 'Inventories'
                });
                this.children.winesList = new ListView({
                    collection: this.collection.wines,
                    title: 'Wines'
                });
                this.children.tastingsList = new ListView({
                    collection: this.collection.wineTastings,
                    title: 'Wine Tastings'
                });
                this.children.usersList = new ListView({
                    collection: this.collection.users,
                    title: 'Users'
                });
            },
            render: function() {
                this.$el.html(this.template);
                this.children.inventoriesList.render().$el.appendTo(this.$('.drinkr-admin-content'));
                this.children.winesList.render().$el.appendTo(this.$('.drinkr-admin-content'));
                this.children.tastingsList.render().$el.appendTo(this.$('.drinkr-admin-content'));
                this.children.usersList.render().$el.appendTo(this.$('.drinkr-admin-content'));
                return this;
            },
            template: Template
        });
    }
);