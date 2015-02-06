define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'views/shared/List',
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

                this.children.bottlesList = new ListView({
                    collection: this.collection.bottles,
                    title: 'Bottles'
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
                this.children.bottlesList.render().$el.appendTo(this.$('.drinkr-admin-content'));
                this.children.winesList.render().$el.appendTo(this.$('.drinkr-admin-content'));
                this.children.tastingsList.render().$el.appendTo(this.$('.drinkr-admin-content'));
                this.children.usersList.render().$el.appendTo(this.$('.drinkr-admin-content'));
                return this;
            },
            template: Template
        });
    }
);