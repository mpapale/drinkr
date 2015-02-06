define(
    [
        'jquery',
        'underscore',
        'backbone',
        'collections/Bottles',
        'collections/Users',
        'collections/Wines',
        'collections/WineTastings',
        'views/Base',
        'views/collection/Master',
        'views/admin/Master',
        'views/tastings/Master',
        'views/home/Master',
        'routers/App',
        'text!./App.html'
    ],
    function(
        $,
        _,
        Backbone,
        BottlesCollection,
        UsersCollection,
        WinesCollection,
        WineTastingsCollection,
        BaseView,
        CollectionView,
        AdminView,
        TastingsView,
        HomeView,
        AppRouter,
        Template
    ) {
        return BaseView.extend({
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.model.state = new Backbone.Model();

                this.collection.bottles = new BottlesCollection();
                this.collection.wines = new WinesCollection();
                this.collection.wineTastings = new WineTastingsCollection();
                this.collection.users = new UsersCollection();

                this.router = new AppRouter();

                this.children.collection = new CollectionView({
                    model: {
                        state: this.model.state
                    },
                    collection: {
                        bottles: this.collection.bottles,
                        wines: this.collection.wines
                    }
                });
                this.children.admin = new AdminView({
                    collection: {
                        bottles: this.collection.bottles,
                        wines: this.collection.wines,
                        wineTastings: this.collection.wineTastings,
                        users: this.collection.users
                    }
                });
                this.children.tastings = new TastingsView({
                    collection: this.collection.wineTastings
                });
                this.children.home = new HomeView();

                this.setupRoutes();
                this.fetchCollections();

                this.listenTo(this.model.state, 'change:currentUser', this.updateUser);
            },
            render: function() {
                this.$el.html(this.template);
                
                this.highlightNavLinks(Backbone.history.fragment);

                this.children.admin.render().$el.appendTo(this.$('.drinkr-app-content'));
                this.children.tastings.render().$el.appendTo(this.$('.drinkr-app-content'));
                this.children.home.render().$el.appendTo(this.$('.drinkr-app-content'));
                this.children.collection.render().$el.appendTo(this.$('.drinkr-app-content'));
                return this;
            },
            fetchCollections: function() {
                this.collection.bottles.fetch();
                this.collection.wines.fetch();
                this.collection.wineTastings.fetch();
                this.collection.users.fetch().done(function() {
                    // Glossing over login for now
                    if (_.isUndefined(this.model.state.get('currentUser'))) {
                        this.model.state.set('currentUser', this.collection.users.at(0));
                    }
                }.bind(this));
            },
            clearNavState: function() {
                _.each(_.keys(this.children), function(childKey) {
                    this.children[childKey].$el.hide();
                }, this);
            },
            setupRoutes: function() {
                this.router.on('route', this.highlightNavLinks, this);
                this.router.on('route:collection', function() {
                    this.clearNavState();
                    this.children.collection.$el.show();
                }, this);
                this.router.on('route:admin', function() {
                    this.clearNavState();
                    this.children.admin.$el.show();
                }, this);
                this.router.on('route:tastings', function() {
                    this.clearNavState();
                    this.children.tastings.$el.show();
                }, this);
                this.router.on('route:home', function() {
                    this.clearNavState();
                    this.children.home.$el.show();
                }, this);

                Backbone.history.start();
            },
            highlightNavLinks: function(route) {
                this.$('.drinkr-app-nav li').removeClass('active');
                this.$('.drinkr-app-nav a[href="#' + route + '"]')
                    .parent()
                    .addClass('active');
            },
            updateUser: function() {
                this.$('.drinkr-user-name').text(
                    this.model.state.get('currentUser').get('name')
                );
            },
            template: Template
        });
    }
);