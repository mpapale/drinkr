define(
    [
        'jquery',
        'underscore',
        'backbone'
    ],
    function(
        $,
        _,
        Backbone
    ) {
        return Backbone.View.extend({
            initialize: function(options) {
                Backbone.View.prototype.initialize.apply(this, arguments);
                options = options || {};
                this.collection = this.collection || {};
                this.model = this.model || {};
                this.children = options.children || {};

                if (this.template) {
                    this.compiledTemplate = _.template(this.template);
                }
            }
        });
    }
);