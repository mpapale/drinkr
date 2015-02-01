define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'text!./Table.html'
    ],
    function(
        $,
        _,
        Backbone,
        BaseView,
        Template
    ) {
        return BaseView.extend({
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.fields = options.fields || [];
                this.caption = options.caption || '';

                this.listenTo(this.collection, 'add reset remove sync', this.render);
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    caption: this.caption,
                    fields: this.fields,
                    collection: this.collection
                }));
                return this;
            },
            template: Template
        });
    }
);