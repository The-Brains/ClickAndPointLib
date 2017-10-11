define([
    'jquery',
    'lodash',
    '../utility/read-file.js',
    '../utility/check-data.js',
    './renderer.js',
    './mouse.js',
    './scene.js',
],
($, _, ReadFile, CheckData, Renderer, Mouse, Scene) => {
    var Game = function(sourceFile, canvas) {
        var myself = self;
        var $canvas = null;
        this.renderer = null;

        if (canvas) {
            var canvas = canvas;
            $canvas = $(canvas);
            var canvasContext = canvas.getContext('2d');
            this.renderer = new Renderer($canvas, canvasContext);
        }

        var offsetX, offsetY;

        this.mouse = new Mouse();

        this.sourceFile = sourceFile;
        this.sourceData = null;
        this.scenes = {};
        this.currentScene = null;

        this.getName = () => {
            return 'MainGame';
        }

        this.start = () => {
            return ReadFile.readFileAsJson(sourceFile)
            .then((data) => {
                this.sourceData = data;

                CheckData.checkKeys(this.sourceData, ['startScene'], true, this.getName());

                _.each(this.sourceData.scenes, (sceneData, key) => {
                    this.scenes[key] = new Scene(this, key, sceneData);
                });

                CheckData.checkKeys(this.scenes, [this.sourceData.startScene], true, this.getName());

                this.currentScene = this.scenes[this.sourceData.startScene];

                return render();
            });
        };

        var render = () => {
            if (!this.renderer) {
                return Promise.reject('Renderer is not defined');
            }

            var boundingBox = canvas.getBoundingClientRect();
            offsetX = boundingBox.left;
            offsetY = boundingBox.top;

            return this.currentScene.render(this.renderer, this.mouse);
        }

        var handleCursorMove = (e) => {
            e.preventDefault();
            e.stopPropagation();

            mouseX = parseInt(e.clientX - offsetX);
            mouseY = parseInt(e.clientY - offsetY);
            this.mouse.registerMouseMove(mouseX, mouseY);

            return this.currentScene.handleCursorMove(this.renderer, this.mouse);
        }

        $(window).resize(_.debounce(render, 500, {
            maxWait: 1000,
        }));

        if ($canvas) {
            $canvas.mousemove(_.debounce(handleCursorMove, 150, {
                maxWait: 200,
            }));
        }
    }

    return Game;
})
