define([
    'jquery',
    'lodash',
    '../utility/read-file.js',
    '../utility/check-data.js',
    './renderer.js',
    './mouse.js',
    './scene.js',
    './action.js',
],
($, _, ReadFile, CheckData, Renderer, Mouse, Scene, Action) => {
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

        var backgroundColor = null;

        this.mouse = new Mouse();

        this.sourceFile = sourceFile;
        this.sourceData = null;
        this.scenes = {};
        this.globalActions = {};
        this.currentScene = null;

        this.getName = () => {
            return 'MainGame';
        }

        this.getActions = (actionName) => {
            var result = _.has(this.globalActions, actionName);

            if (!result) {
                throw `[MISSING ACTION] The action '${actionName}' cannot be find.`;
            }

            return this.globalActions[actionName];
        }

        this.start = () => {
            return ReadFile.readFileAsJson(sourceFile)
            .then((data) => {
                this.sourceData = data;

                CheckData.checkKeys(this.sourceData, ['startScene', 'scenes'],
                    true, this.getName());

                backgroundColor = this.sourceData.backgroundColor || 'black';

                // init actions
                _.each(this.sourceData.globalActions, (actionData, key) => {
                    CheckData.checkKeys(actionData, ['actions'], true,
                        this.getName() + ` - globalActions - ${key}`);

                    this.globalActions[key] = [];
                });

                // init scenes
                _.each(this.sourceData.scenes, (sceneData, key) => {
                    this.scenes[key] = {};
                });


                // create Global Actions
                 _.each(this.sourceData.globalActions, (actionData, key) => {
                    _.each(actionData.actions, (action, index) => {
                        this.globalActions[key].push(new Action(this, `${key}-${index}` ,action));
                    });
                });
                ////


                // Create scenes
                _.each(this.sourceData.scenes, (sceneData, key) => {
                    this.scenes[key] = new Scene(this, key, sceneData);
                });
                CheckData.checkKeys(this.scenes, [this.sourceData.startScene], true,
                    `The scenes are missing first scene named '${this.sourceData.startScene}'`);
                ////

                return changeScene(this.sourceData.startScene)
                .then(() => {
                    $(window).resize(_.debounce(render, 500, {
                        maxWait: 1000,
                    }));

                    if ($canvas) {
                        $canvas.mousemove(_.debounce(handleCursorMove, 150, {
                            maxWait: 200,
                        }));
                        $canvas.mousedown(handleClickDown);
                        $canvas.mouseup(handleClickUp);
                    }
                });
            });
        };

        this.isValidSceneKey = (sceneKey, raise=false) => {
            var result = _.has(this.scenes, sceneKey);

            if (!result && raise) {
                throw `[MISSING SCENE] The scene '${sceneKey}' cannot be find.`;
            }

            return result;
        }

        var resetCanvas = () => {
            var canvas = this.renderer.getCanvas();
            var context = this.renderer.getContext();
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        var changeScene = (sceneKey) => {
            this.isValidSceneKey(sceneKey, true);

            this.currentScene = this.scenes[sceneKey];
            this.mouse.defaultCursor();
            return render();
        }

        var render = () => {
            if (!this.renderer) {
                return Promise.reject('Renderer is not defined');
            }

            resetCanvas();
            var boundingBox = canvas.getBoundingClientRect();
            offsetX = boundingBox.left;
            offsetY = boundingBox.top;

            return this.currentScene.render(this.renderer, this.mouse);
        }

        var updateMousePosition = (e) => {
            mouseX = parseInt(e.clientX - offsetX);
            mouseY = parseInt(e.clientY - offsetY);
            this.mouse.registerMouseMove(mouseX, mouseY);
        }

        var handleCursorMove = (e) => {
            e.preventDefault();
            e.stopPropagation();

            updateMousePosition(e);
            return this.currentScene.handleCursorMove(this.renderer, this.mouse);
        }

        var handleClickDown = (e) => {
            e.preventDefault();
            e.stopPropagation();

            updateMousePosition(e);
            this.mouse.registerClick();
            return this.currentScene.handleClickDown(this.renderer, this.mouse)
            .then((output) => {
                output = _.flatten(output);
                var newScene = _.find(output, 'newScene');
                if (newScene) {
                    return changeScene(newScene.newScene);
                }
            });
        }

        var handleClickUp = (e) => {
            e.preventDefault();
            e.stopPropagation();

            updateMousePosition(e);
            this.mouse.registerRelease();
            return this.currentScene.handleClickUp(this.renderer, this.mouse);
        }
    }

    return Game;
});
