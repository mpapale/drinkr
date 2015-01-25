define(
    [
        'jquery',
        'underscore',
        'backbone',
        'collections/Inventories',
        'collections/Users',
        'collections/Wines',
        'collections/WineTastings',
        'views/Base',
        'views/List',
        'text!views/App.html'
    ],
    function(
        $,
        _,
        Backbone,
        InventoriesCollection,
        UsersCollection,
        WinesCollection,
        WineTastingsCollection,
        BaseView,
        ListView,
        Template
    ) {
        return BaseView.extend({
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.collection.inventories = new InventoriesCollection();
                this.collection.wines = new WinesCollection();
                this.collection.wineTastings = new WineTastingsCollection();
                this.collection.users = new UsersCollection();

                this.children.inventoriesList = new ListView({
                    collection: this.collection.inventories,
                    title: 'Inventories'
                });
                this.children.winesList = new ListView({
                    collection: this.collection.wines,
                    title: 'Wines'
                });
                this.children.tastingsList = new ListView({
                    collection: this.collection.wineTastings,
                    title: 'Wine Tastings'
                });
                this.children.usersList = new ListView({
                    collection: this.collection.users,
                    title: 'Users'
                });

                this.collection.inventories.fetch();
                this.collection.wines.fetch();
                this.collection.wineTastings.fetch();
                this.collection.users.fetch();
            },
            render: function() {
                this.$el.html(this.template);
                this.$el.append(this.children.inventoriesList.render().$el);
                this.$el.append(this.children.winesList.render().$el);
                this.$el.append(this.children.tastingsList.render().$el);
                this.$el.append(this.children.usersList.render().$el);
                return this;
            },
            template: Template
        });
    }
);