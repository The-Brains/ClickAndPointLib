define([
        'jquery',
        'lodash',
        './app/game.js',
    ], function($, _, Game) {
        var game = new Game(
            './game-files-examples/test-game-1.json',
            document.getElementById('canvas')
        );

        $('.CanvasArea').removeClass('is-hidden');
        game.start()
        .then(() => {
            console.log('App started.');
        });
});
