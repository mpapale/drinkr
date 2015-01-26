define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'text!./List.html'
    ],
    function(
        $,
        _,
        Backbone,
        BaseView,
        Template
    ) {
        return BaseView.extend({
            className: 'col-md-3',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.title = options.title || "List title";

                this.listenTo(this.collection, 'add reset remove sync', this.render);
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    title: this.title,
                    items: this.collection
                }));
                return this;
            },
            template: Template
        });
    }
);