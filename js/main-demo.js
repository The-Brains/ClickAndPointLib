define([
        'jquery',
        'lodash',
        './app/game.js',
        './utility/resize-canvas.js',
    ], function($, _, Game, resizeCanvas) {
        window.game = new Game(
            './game-files-examples/test-game-1.json',
            document.getElementById('canvas'),
            null
        );

        $('.CanvasArea').removeClass('is-hidden');
        window.game.start()
        .then(() => {
            resizeCanvas();
            window.game.rerender();
            console.log('App started.');
        });
});
