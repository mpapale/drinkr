define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/WineTasting',
        'views/Base',
        'views/shared/Table',
        'views/shared/Map',
        'text!./Master.html'
    ],
    function(
        $,
        _,
        Backbone,
        WineTastingModel,
        BaseView,
        TableView,
        MapView,
        Template
    ) {
        return BaseView.extend({
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.table = new TableView({
                    collection: {
                        items: this.collection.wineTastings
                    },
                    fields: [
                        { key: 'date', label: 'tasting date' },
                        'wine.name',
                        'wine.producer',
                        { key: 'tastingPartners', label: 'partners' },
                        'rating',
                        'conclusion'
                    ],
                    formatters: {
                        'date': function(date) {
                            return new Date(date).toLocaleDateString();
                        },
                        'tastingPartners': function(partners) {
                            return partners.pluck('name').join(', ');
                        }
                    },
                    caption: 'Tasted'
                });

                this.children.map = new MapView({
                    collection: {
                        geoItems: this.collection.wineTastings
                    },
                    getLatLng: function(wineTasting) {
                        return [wineTasting.getNested('wine.lat'), wineTasting.getNested('wine.lng')];
                    },
                    getDisplayName: function(wineTasting) {
                        return wineTasting.getNested('wine.name') +
                            ' by ' +
                            wineTasting.getNested('wine.producer');
                    }
                });

                this.listenTo(this.collection.wineTastings, 'add reset remove sync', this.debouncedRender);
                this.listenTo(this.collection.bottles, 'add reset remove sync', this.debouncedRender);
                this.listenTo(this.collection.users, 'add reset remove sync', this.debouncedRender);
            },
            events: {
                'click .btn-add': function(e) {
                    this.$('.drinkr-modal-tastings-add').modal();
                },
                'mousemove input[name="rating"]': function(e) {
                    this.$('.drinkr-rating-value').text($(e.target).val());
                },
                'keyup input[name="rating"]': function(e) {
                    this.$('.drinkr-rating-value').text($(e.target).val());
                },
                'click .btn-save-new-tasting': function(e) {
                    var that = this,
                        removeFromCollection,
                        bottleModel,
                        wineId,
                        createDfd = $.Deferred(),
                        dfds = [createDfd],
                        workingWineTastingModel = new Backbone.Model();

                    that.$('.drinkr-form-add-tasting').find('input, select').each(function() {
                        var $el = $(this),
                            name = $el.attr('name'),
                            val = $el.val();

                        if (name === 'wine') {
                            wineId = val;
                        }

                        if (name === 'deduct') {
                            removeFromCollection = $el.prop('checked');
                        } else if (name === 'date') {
                            workingWineTastingModel.set('date', new Date(val).getTime());
                        } else if (name === 'rating') {
                            workingWineTastingModel.set('rating', +val);
                        } else { // tagName === 'INPUT'
                            workingWineTastingModel.set(name, val);
                        }
                    });
                    workingWineTastingModel.set('taster', this.model.state.get('currentUser').get('_id'));

                   
                    that.collection.wineTastings.create(
                        workingWineTastingModel.toJSON(),
                        {
                            wait: true,
                            success: function(wineTastingModel) {
                                 if (removeFromCollection) {
                                    bottleModel = that.collection.bottles.find(function(bottle) {
                                        return bottle.get('wine').get('_id') === wineId;
                                    }, that);

                                    if (bottleModel) {
                                        // TODO wait for this
                                        bottleModel.destroy();
                                    }
                                }

                                createDfd.resolve();
                            },
                            failure: function() {
                                createDfd.reject();
                            }
                        }
                    );

                    $.when.apply($, dfds).done(function() {
                        this.$('.drinkr-modal-tastings-add').hide();
                    }.bind(this));
                }
            },
            render: function() {
                var date = new Date(),
                    yyyy = date.getFullYear().toString(),
                    mm = (date.getMonth()+1).toString(),
                    dd = date.getDate().toString();

                this.$el.html(this.compiledTemplate(
                    $.extend(
                        {
                            date: [yyyy, (mm[1]?mm:"0"+mm[0]), (dd[1]?dd:"0"+dd[0])].join('-'),
                            users: this.collection.users,
                            wines: this.collection.wines
                        },
                        WineTastingModel.validOptions
                    )
                ));
                this.children.table.render().$el.appendTo(this.$('.drinkr-tastings-content'));
                this.children.map.render().$el.appendTo(this.$('.drinkr-tastings-content'));
                return this;
            },
            template: Template
        });
    }
);