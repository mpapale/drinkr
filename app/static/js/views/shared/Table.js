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
                this.groupBy = options.groupBy;
                this.formatters = options.formatters || {};
                this.caption = options.caption || '';

                this.collection.rows = new Backbone.Collection();

                this._computeRows();

                this.listenTo(this.collection.items, 'add reset remove sync', this._computeRows);
                this.listenTo(this.collection.rows, 'add reset remove', this.render);
            },
            _computeRows: function() {
                var groups,
                    rows;

                if (_.isUndefined(this.groupBy)) {
                    this.collection.rows.reset(
                        this.collection.items.map(function(item) {
                            item = item.clone();
                            item.set('quantity', 0);
                            return item;
                        }, this)
                    );
                } else {
                    groups = this.collection.items.groupBy(function(item) {
                        return _.reduce(
                            this.groupBy, 
                            function(memo, key) {
                                var split,
                                    value;
                                if (key.indexOf('[') !== -1) {
                                    split = key.split('[');
                                    key = split[0];
                                    arrProp = split[1].substr(0, split[1].length-1);
                                    value = item.getNested(key);

                                    return memo + _.map(value, function(v) {
                                        return v[arrProp]; 
                                    }).join('-');
                                }
                                return memo + item.getNested(key);
                            },
                            '',
                            this  
                        );
                    }, this);

                    rows = _.map(_.values(groups), function(group) {
                        var representative = group[0].clone();
                        representative.set('quantity', group.length);
                        return representative;
                    }, this);

                    this.collection.rows.reset(rows);
                }
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    caption: this.caption,
                    fields: ['quantity'].concat(this.fields),
                    formatters: this.formatters,
                    rows: this.collection.rows
                }));
                return this;
            },
            _format: function(model) {
                _.each(_.pairs(this.formatters), function(pair) {
                    var key = pair[0], formatter = pair[1];

                    model.set(
                        key,
                        formatter(model.getNested(key))
                    );
                });
            },
            template: Template
        });
    }
);