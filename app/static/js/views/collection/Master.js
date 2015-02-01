define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'views/shared/List',
        'views/shared/PieChart',
        'views/shared/Table',
        'text!./Master.html',
        // The Dark Knights
        'bootstrap'
    ],
    function(
        $,
        _,
        Backbone,
        BaseView,
        ListView,
        PieChartView,
        TableView,
        Template
    ) {
        return BaseView.extend({
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.model.state = this.model.state || new Backbone.Model();

                this.model.state.set({
                    currentCollection: this.collection.at(0)
                });

                this.buildChildren();

                this.listenTo(this.collection, 'add reset remove sync', this.onCollectionChange);
                this.listenTo(this.model.state, 'change:currentCollection', this.onCollectionChange);
            },
            events: $.extend(BaseView.events, {
                'click .drinkr-collection-content .btn-add': function(e) {
                    this.$('.drinkr-modal-collection-add').modal();
                },
                'click .drinkr-collection-content .btn-create': function(e) {
                    // TBI
                },
                'change .drinkr-collection-chooser-row select': function(e) {
                    var id = $(e.target).val();

                    this.model.state.set(
                        currentCollection,
                        this.collection.get(id)
                    );
                },
                'click .drinkr-modal-collection-add .btn-save-new-bottles': function(e) {
                    
                }
            }),
            buildChildren: function() {
                var currentCollection = this.model.state.get('currentCollection');

                _.each(_.values(this.children), function(child) {
                    child.remove();
                }, this);
                this.children = {};

                if (!_.isUndefined(currentCollection)) {
                    this.children[_.uniqueId()] = new PieChartView({
                        title: 'Countries',
                        className: 'col-md-4',
                        'chartjs.tooltipFontSize': 12,
                        modelAttribute: function(model) {
                            var ret = {};
                            ret[model.get('country')] = 1;
                            return ret;
                        },
                        collection: new Backbone.Collection(
                            currentCollection.get('bottles').map(function(bottle) {
                                return new Backbone.Model(bottle.wine);
                            })
                        )
                    });
                    this.children[_.uniqueId()] = new PieChartView({
                        title: "Price breakdown",
                        className: 'col-md-4',
                        'chartjs.tooltipFontSize': 12,
                        modelAttribute: function(model) {
                            var ret = {};
                            ret[''+model.get('wine').price] = model.get('quantity');
                            return ret;
                        },
                        modelFormat: function(price) {
                            price = +price;
                            return '$' + price.toFixed(2);
                        },
                        collection: new Backbone.Collection(
                            currentCollection.get('bottles').map(function(bottle) {
                                return new Backbone.Model(
                                    $.extend(bottle, { wine: bottle.wine} )
                                );
                            })
                        )
                    });
                    this.children[_.uniqueId()] = new PieChartView({
                        title: "Grape varieties",
                        className: 'col-md-4',
                        'chartjs.tooltipFontSize': 12,
                        modelAttribute: function(model) {
                            var varieties = model.get('grapeVarieties');
                            var ret = {};
                            // Option 2: show "blend" if not pure
                            if (varieties.length > 1) {
                                ret['blend'] = 1;
                            } else {
                                ret[varieties[0].species] = 1;
                            }
                            return ret;
                        },
                        collection: new Backbone.Collection(
                            currentCollection.get('bottles').map(function(bottle) {
                                return new Backbone.Model(bottle.wine);
                            })
                        )
                    });
                    
                    this.children['_drinkr-table_' + _.uniqueId()] = new TableView({
                        className: 'col-md-12',
                        caption: 'The Collection',
                        fields: ['quantity','name','producer','volume','vintage','alcohol','regionOrAppellation','country','varietiesList'],
                        collection: new Backbone.Collection(
                            currentCollection.get('bottles').map(function(bottle) {
                                return new Backbone.Model(
                                    $.extend(
                                        bottle.wine, 
                                        { 
                                            quantity: bottle.quantity,
                                            volume: bottle.volume,
                                            varietiesList: _.pluck(bottle.wine.grapeVarieties, 'species').join(', ')
                                        }
                                    )
                                );
                            })
                        )
                    });
                }
            },
            onCollectionChange: function() {
                if (_.isUndefined(this.model.state.get('currentCollection'))) {
                    this.model.state.set(
                        'currentCollection', 
                        this.collection.at(0), 
                        { silent: true }
                    );
                }
                this.buildChildren();
                this.render();
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    collections: this.collection
                }));

                _.each(_.pairs(this.children), function(pair) {
                    var key = pair[0], child = pair[1];

                    if (key.indexOf('_drinkr-table_') === 0) {
                        child.render().$el.appendTo(this.$('.drinkr-collection-table-row'));
                    } else {
                        child.render().$el.appendTo(this.$('.drinkr-collection-chart-row'));
                    }
                }, this);

                return this;
            },
            template: Template
        });
    }
);