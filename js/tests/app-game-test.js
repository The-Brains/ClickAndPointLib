define(
    [
        'chai',
        'testWrapper',
        '../app/game.js',
    ],
    function(chai, testWrapper, Game) {
        var expect = chai.expect;
        var mainName = 'app-game';

        testWrapper.execTest(mainName, 'should load file properly', function() {
            var game = new Game('/game-files-examples/test-game-1.json');
            return game.start();
        });
    }
);
