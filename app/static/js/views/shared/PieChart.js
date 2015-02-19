define(
    [
        'jquery',
        'underscore',
        'backbone',
        'chartjs',
        'views/Base',
        'text!./PieChart.html'
    ],
    function(
        $,
        _,
        Backbone,
        Chartjs,
        BaseView,
        Template
    ) {
        var COLOR_PALETTE = ['#F7464A','#46BFBD','#FDB45C','#ABC123','#123ABC','#DEADBE'];
        var CHARTJS_PREFIX = 'chartjs.';

        return BaseView.extend({
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.title = options.title || "List title";
                this.modelAttribute = options.modelAttribute;
                this.normalize = !!options.normalize;

                this.chartjsOptions = {};
                _.each(_.pairs(options), function(pair) {
                    var key = pair[0], value = pair[1];
                    if (key.indexOf(CHARTJS_PREFIX) === 0) {
                        this.chartjsOptions[key.substr(CHARTJS_PREFIX.length)] = value;
                    }
                }, this);

                this.listenTo(this.collection, 'add reset remove sync', this.debouncedRender);
            },
            remove: function() {
                BaseView.prototype.remove.apply(this, arguments);
                this.destroyChart();
            },
            render: function() {
                this.destroyChart();
                this.$el.html(this.compiledTemplate({
                    title: this.title
                }));

                var ctx = this.$('.drinkr-pie-canvas').get(0).getContext('2d');
                var chart = new Chartjs(ctx);

                var histograms = this.collection.map(this.modelAttribute);
                var counts = _.reduce(histograms, function(memo, histogram) {
                    _.each(_.pairs(histogram), function(pair) {
                        var key = pair[0];
                        var value = pair[1];

                        if (_.has(memo, key)) {
                            memo[key] += value;
                        } else {
                            memo[key] = value;
                        }
                    }, this);
                    return memo;
                }, {}, this);

                var colorIndex = 0;
                var data = _.map(_.pairs(counts), function(pair) {
                    var count = pair[1];
                    var label = pair[0];
                    return {
                        value: +count.toFixed(2),
                        label: label,
                        color: COLOR_PALETTE[colorIndex++ % COLOR_PALETTE.length]
                    };
                }, this);

                if (this.normalize) {
                    var sum = _.reduce(data, function(tally, datum) {
                        return tally + datum.value; 
                    }, 0);

                    data = _.map(data, function(datum) {
                        datum.value = +(datum.value / sum).toFixed(2);
                        return datum;
                    }, this);
                }

                this.chart = chart.Doughnut(data, this.chartjsOptions);
                //this.$('.drinkr-pie-legend').html(this.chart.generateLegend());

                return this;
            },
            destroyChart: function() {
                if (this.chart) {
                    this.chart.destroy();
                }
                this.chart = null;
            },
            template: Template
        });
    }
);