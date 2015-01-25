require.config({
    baseUrl: '/static/js',
    paths: {
        'jquery': '/static/bower_components/jquery/dist/jquery.min',
        'underscore': '/static/bower_components/underscore/underscore-min',
        'backbone': '/static/bower_components/backbone/backbone',
        'text': '/static/bower_components/requirejs-text/text'
    }
});

require(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/App'
    ], 
    function(
        $,
        _,
        Backbone,
        AppView
    ) {
        var appView = new AppView();
        appView.render().$el.appendTo($('#main'));
    }
);