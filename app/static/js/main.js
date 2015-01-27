require.config({
    baseUrl: '/static/js',
    paths: {
        'jquery': '/static/bower_components/jquery/dist/jquery.min',
        'underscore': '/static/bower_components/underscore/underscore-min',
        'backbone': '/static/bower_components/backbone/backbone',
        'text': '/static/bower_components/requirejs-text/text',
        'bootstrap': '/static/bower_components/bootstrap/dist/js/bootstrap.min',
        'chartjs': '/static/bower_components/chartjs/Chart.min'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: '$.fn.popover'
        }
    }
});

require(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/App',

        // "Because he's the hero Gotham deserves, but not the one it needs right now.
        //  So we'll hunt him, because he can take it. Because he's not the hero.
        //  He's a silent guardian, watchful protector.The Dark Knight."
        'bootstrap'
    ], 
    function(
        $,
        _,
        Backbone,
        AppView

        // Silent guardian
    ) {
        var appView = new AppView();
        appView.render().$el.appendTo($('#main'));
    }
);