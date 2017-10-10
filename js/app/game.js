define([
    'jquery',
    'lodash',
    '../utility/read-file.js',
    '../utility/check-data.js',
    './scene.js'
],
($, _, ReadFile, CheckData,  Scene) => {
    var Game = function(sourceFile, canvas) {
        var myself = self;
        if (canvas) {
            this.canvas = canvas;
            this.$canvas = $(canvas);
            this.canvasContext = canvas.getContext('2d');
        }
        this.sourceFile = sourceFile;
        this.sourceData = null;
        this.scenes = {};
        this.currentScene = null;

        // TODO: Split this rendering into a rendering library
        var drawImageBackground = (imagePath) => {
            var img = new Image();
            img.onload = (source) => {
                var originalWidth = source.target.naturalWidth;
                var originalHeight = source.target.naturalHeight;
                var originalRatio = originalWidth / originalHeight * 1.0;

                var fullHeight = this.$canvas.height();
                var height = fullHeight;
                var fullWidth =  this.$canvas.width();
                var width = fullWidth;

                var ratioWidth = originalWidth / width;
                var ratioHeight = originalHeight / height;
                if (ratioWidth > ratioHeight) {
                    height = width / originalRatio;
                } else {
                    width = height * originalRatio;
                }

                var cornerX = 0;
                var cornerY = 0;

                if (height < fullHeight) {
                    cornerY = (fullHeight - height) / 2;
                }
                if (width < fullWidth) {
                    cornerX = (fullWidth - width) / 2;
                }

                this.canvasContext.drawImage(img, cornerX, cornerY, width, height);
                console.log('redraw');
            };
            img.src = imagePath;
        }

        this.start = () => {
            return ReadFile.readFileAsJson(sourceFile)
            .then((data) => {
                this.sourceData = data;

                CheckData.checkKeys(this.sourceData, ['startScene'], true, 'GameCreation');

                _.each(this.sourceData.scenes, (sceneData, key) => {
                    this.scenes[key] = new Scene(key, sceneData);
                });

                CheckData.checkKeys(this.scenes, [this.sourceData.startScene], true, 'GameCreation');

                this.currentScene = this.scenes[this.sourceData.startScene];

                return renderCurrentScene();
            });
        };

        var renderCurrentScene = () => {
            if (!this.canvas) {
                return;
            }

            drawImageBackground(this.currentScene.getImageBackground())
        }

        $(window).resize(_.debounce(renderCurrentScene, 200, {
            maxWait: 1000,
        }))
    }

    return Game;
})
