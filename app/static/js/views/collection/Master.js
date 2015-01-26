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
                this.buildChildren();
                this.listenTo(this.collection, 'add reset remove sync', this.onCollectionChange);
            },
            buildChildren: function() {
                _.each(_.values(this.children), function(child) {
                    child.remove();
                }, this);
                this.children = {};

                this.collection.each(function(collection) {
                    this.children[_.uniqueId()] = new ListView({
                        title: collection.get('name'),
                        collection: new Backbone.Collection(
                            collection.get('bottles').map(function(bottle) {
                                return new Backbone.Model({
                                    name: bottle.quantity + 'x ' + bottle.volume + 'ml ' + bottle.wine.name,
                                    wine: bottle.wine,
                                    quantity: bottle.quantity,
                                    volume: bottle.volume 
                                });
                            }, this)
                        )
                    })
                }, this);
            },
            onCollectionChange: function() {
                this.buildChildren();
                this.render();
            },
            render: function() {
                this.$el.html(this.template);
                _.each(_.values(this.children), function(child) {
                    child.render().$el.appendTo(this.$('.drinkr-collection-content'));
                }, this);
                return this;
            },
            template: Template
        });
    }
);