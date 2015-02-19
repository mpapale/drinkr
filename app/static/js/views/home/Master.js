define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'text!./Master.html'
    ],
    function(
        $,
        _,
        Backbone,
        BaseView,
        Template
    ) {
        return BaseView.extend({
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                this.$el.html(this.compiledTemplate());
                return this;
            },
            template: Template
        });
    }
);