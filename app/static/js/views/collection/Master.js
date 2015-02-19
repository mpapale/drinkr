define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Wine',
        'models/Bottle',
        'views/Base',
        'views/shared/Map',
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
        WineModel,
        BottleModel,
        BaseView,
        MapView,
        ListView,
        PieChartView,
        TableView,
        Template
    ) {
        return BaseView.extend({
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.countryChart = new PieChartView({
                    title: 'Countries',
                    className: 'col-md-4',
                    'chartjs.tooltipFontSize': 12,
                    modelAttribute: function(model) {
                        var ret = {};
                        ret[model.get('wine').get('country')] = 1;
                        return ret;
                    },
                    collection: this.collection.bottles
                });
                this.children.priceChart = new PieChartView({
                    title: "Price breakdown",
                    className: 'col-md-4',
                    'chartjs.tooltipFontSize': 12,
                    modelAttribute: function(model) {
                        var ret = {};
                        ret['$' + model.get('price').toFixed(2)] = 1;
                        return ret;
                    },
                    collection: this.collection.bottles
                });
                this.children.grapeChart = new PieChartView({
                    title: "Grape varieties",
                    className: 'col-md-4',
                    'chartjs.tooltipFontSize': 12,
                    modelAttribute: function(model) {
                        var varieties = model.get('wine').get('grapeVarieties');
                        var ret = {};
                        // Option 2: show "blend" if not pure
                        if (varieties.length > 1) {
                            ret['blend'] = 1;
                        } else {
                            ret[varieties[0].species || 'unknown'] = 1;
                        }
                        return ret;
                    },
                    collection: this.collection.bottles
                });
                
                this.children.bottleTable = new TableView({
                    className: 'col-md-12',
                    caption: 'The Collection',
                    fields: [
                        'wine.name',
                        'wine.producer',
                        'volume',
                        'price',
                        'wine.vintage',
                        'wine.alcohol',
                        'wine.regionOrAppellation',
                        'wine.country',
                        'wine.grapeVarieties'
                    ],
                    // This doesn't work: it's complicated why
                    //groupBy: ['price','volume','wine._id'],
                    groupBy: [
                        'wine.name',
                        'wine.producer',
                        'volume',
                        'price',
                        'wine.vintage',
                        'wine.alcohol',
                        'wine.regionOrAppellation',
                        'wine.country',
                        'wine.grapeVarieties[species]'
                    ],
                    formatters: {
                        'wine.grapeVarieties': function(grapeVarieties) {
                            return _.map(grapeVarieties, function(v) {
                                return v.species;
                            }).join(', ') || 'unknown';
                        },
                        price: function(price) {
                            return '$' + price.toFixed(2);
                        },
                        'wine.alcohol': function(alcohol) {
                            return alcohol + '%';
                        }
                    },
                    collection: {
                        items: this.collection.bottles
                    }
                });

                this.children.map = new MapView({
                    collection: {
                        geoItems: this.collection.bottles
                    },
                    getLatLng: function(bottle) {
                        return [bottle.getNested('wine.lat'), bottle.getNested('wine.lng')];
                    },
                    getDisplayName: function(bottle) {
                        return bottle.getNested('wine.name') + 
                            ' by ' + 
                            bottle.getNested('wine.producer');
                    }
                });

                this.listenTo(this.collection.bottles, 'add reset remove sync', this.debouncedRender);
                this.listenTo(this.model.state, 'change:currentUser', this.renderCurrentUser);
            },
            events: $.extend(BaseView.events, {
                'click .drinkr-collection-content .btn-add': function(e) {
                    this.$('.drinkr-modal-collection-add').modal();
                },
                'click .drinkr-modal-collection-add .btn-save-new-bottles': function(e) {
                    var workingBottleModel = new Backbone.Model(),
                        workingWineModel = new Backbone.Model(),
                        workingMetaModel = new Backbone.Model();

                    this.$('.drinkr-form-add-bottle input').each(function() {
                        var $el = $(this),
                            value = $el.val(),
                            name = $el.attr('name');

                        if (name.indexOf('wine.') === 0) {
                            if (name === 'wine.grapeVarieties') {
                                value = _.map(value.split(','), function(part) {
                                    return {
                                        species: $.trim(part),
                                        percentage: -1 // unknown
                                    }
                                });
                            }

                            workingWineModel.set(name.substr('wine.'.length), value);
                        } else if (name.indexOf('meta.') === 0) {
                            if (name === 'meta.quantity') {
                                value = +value;
                            }
                            workingMetaModel.set(name.substr('meta.'.length), value);
                        } else {
                            workingBottleModel.set(name, value);
                        }
                    });

                    // 1. Create the wine.
                    this.collection.wines.create(
                        workingWineModel.toJSON(),
                        { 
                            wait: true,
                            success: function(wineModel) {
                                var bottleJson = workingBottleModel.toJSON(),
                                    dfds = [];

                                bottleJson.owners = [
                                    this.model.state.get('currentUser').get('_id')
                                ];
                                bottleJson.wine = wineModel.get('_id');

                                // 2. Create the bottle
                                _.times(workingMetaModel.get('quantity'), function() {
                                    var dfd = $.Deferred();
                                    dfds.push(dfd);
                                    this.collection.bottles.create(
                                        bottleJson,
                                        {
                                            wait: true,
                                            success: function(bottleModel) {
                                                dfd.resolve();
                                            }.bind(this)
                                        }
                                    );
                                }, this);

                                $.when.apply($, dfds).done(function() {
                                    // TODO
                                    //alert('success');
                                    this.$('.drinkr-modal-collection-add').hide();
                                }.bind(this));

                            }.bind(this)
                        }
                    );

                }
            }),
            render: function() {
                var $tableRow,
                    $chartRow,
                    $mapRow;

                this.$el.html(this.compiledTemplate());
                this.renderCurrentUser();

                $tableRow = this.$('.drinkr-collection-table-row');
                $chartRow = this.$('.drinkr-collection-chart-row');
                $mapRow = this.$('.drinkr-collection-map-row');

                this.children.countryChart.render().$el.appendTo($chartRow);
                this.children.priceChart.render().$el.appendTo($chartRow);
                this.children.grapeChart.render().$el.appendTo($chartRow);

                this.children.bottleTable.render().$el.appendTo($tableRow);

                this.children.map.render().$el.appendTo($mapRow);

                return this;
            },
            renderCurrentUser: function() {
                this.$('.drinkr-collection-content .btn-add').prop(
                    'disabled',
                    !this.model.state.get('currentUser')
                );
            },
            template: Template
        });
    }
);