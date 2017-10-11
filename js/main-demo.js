define([
        'jquery',
        'lodash',
        './app/game.js',
    ], function($, _, Game) {
        var game = new Game(
            './game-files-examples/test-game-1.json',
            document.getElementById('canvas')
        );

        game.start()
        .then(() => {
            $('.CanvasArea').removeClass('is-hidden');
            console.log('App started.');
        });
});
