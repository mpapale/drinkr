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
                this.children.list = new ListView({
                    title: "Tastings",
                    collection: this.collection
                });
            },
            render: function() {
                this.$el.html(this.template);
                 this.children.list.render().$el.appendTo(this.$('.drinkr-tastings-content'));
                return this;
            },
            template: Template
        });
    }
);