define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'views/shared/List',
        'views/shared/PieChart',
        'text!./Master.html'
    ],
    function(
        $,
        _,
        Backbone,
        BaseView,
        ListView,
        PieChartView,
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
                    // this.children[_.uniqueId()] = new ListView({
                    //     title: collection.get('name'),
                    //     collection: new Backbone.Collection(
                    //         collection.get('bottles').map(function(bottle) {
                    //             return new Backbone.Model({
                    //                 name: bottle.quantity + 'x ' + bottle.volume + 'ml ' + bottle.wine.name,
                    //                 wine: bottle.wine,
                    //                 quantity: bottle.quantity,
                    //                 volume: bottle.volume 
                    //             });
                    //         }, this)
                    //     )
                    // });
                    this.children[_.uniqueId()] = new PieChartView({
                        title: 'Countries',
                        className: 'col-md-3',
                        'chartjs.tooltipFontSize': 12,
                        modelAttribute: function(model) {
                            var ret = {};
                            ret[model.get('country')] = 1;
                            return ret;
                        },
                        collection: new Backbone.Collection(
                            collection.get('bottles').map(function(bottle) {
                                return new Backbone.Model(bottle.wine);
                            })
                        )
                    });
                    this.children[_.uniqueId()] = new PieChartView({
                        title: "Price breakdown",
                        className: 'col-md-3',
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
                            collection.get('bottles').map(function(bottle) {
                                return new Backbone.Model(
                                    $.extend(bottle, { wine: bottle.wine} )
                                );
                            })
                        )
                    });
                    this.children[_.uniqueId()] = new PieChartView({
                        title: "Grape varieties - bottle agnostic",
                        className: 'col-md-3',
                        'chartjs.tooltipFontSize': 12,
                        'chartjs.tooltipTemplate': "<%if (label){%><%=label%>: <%}%><%= value*100 %>%",
                        modelAttribute: function(model) {
                            var varieties = model.get('grapeVarieties');
                            var ret = {};

                            _.each(varieties, function(variety) {
                                var percentage;
                                if (variety.percentage === -1) {
                                    percentage = 100 / varieties.length;
                                } else {
                                    percentage = variety.percentage || 100;
                                }
                                if (_.has(ret, variety.species)) {
                                    ret[variety.species] += percentage;
                                } else {
                                    ret[variety.species] = percentage;
                                }
                            }, this);
                            return ret;
                        },
                        normalize: true,
                        collection: new Backbone.Collection(
                            collection.get('bottles').map(function(bottle) {
                                return new Backbone.Model(bottle.wine);
                            })
                        )
                    });
                    this.children[_.uniqueId()] = new PieChartView({
                        title: "Grape varieties - per bottle",
                        className: 'col-md-3',
                        'chartjs.tooltipFontSize': 12,
                        modelAttribute: function(model) {
                            var varieties = model.get('grapeVarieties');
                            var ret = {};
                            // Option 1: show every grape
                            // ret[
                            //     _.map(varieties, function(v) {
                            //         return v.species;
                            //     })
                            //     .sort()
                            //     .join('+')
                            // ] = 1;

                            // Option 2: show "blend" if not pure
                            if (varieties.length > 1) {
                                ret['blend'] = 1;
                            } else {
                                ret[varieties[0].species] = 1;
                            }
                            return ret;
                        },
                        collection: new Backbone.Collection(
                            collection.get('bottles').map(function(bottle) {
                                return new Backbone.Model(bottle.wine);
                            })
                        )
                    });
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