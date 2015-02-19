define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'leaflet',
        'text!./Map.html'
    ],
    function(
        $,
        _,
        Backbone,
        BaseView,
        L,
        Template
    ) {

        return BaseView.extend({
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.getLatLng = options.getLatLng;
                this.getDisplayName = options.getDisplayName;

                this.listenTo(this.collection.geoItems, 'add remove reset sync', this.debouncedRender);
            },
            render: function() {
                this.$el.html(this.compiledTemplate());

                if (this._map) {
                    this._map.remove();
                }

                this._map = L.map(this.$('.drinkr-map').get(0)).setView([51.505, -0.09], 2);
                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
                    maxZoom: 18
                }).addTo(this._map);

                // Might just want to group by getLatLng
                var groups = this.collection.geoItems.groupBy(this._serializeLatLng, this);
                _.each(_.pairs(groups), function(pair) {
                    var latLng = this._deserializeLatLng(pair[0]),
                        items = pair[1],
                        names = _.uniq(_.map(items, this.getDisplayName)),
                        popupText = names.join('<br/>');

                    var marker = L.marker(latLng).addTo(this._map);
                    marker.bindPopup(popupText);
                }, this);

                _.defer(function() { this._map.invalidateSize(false); }.bind(this), 200);

                return this;
            },
            _serializeLatLng: function(geoItem) {
                return this.getLatLng(geoItem).join(',');
            },
            _deserializeLatLng: function(latLng) {
                return latLng.split(',');
            },
            template: Template
        });
    }
);