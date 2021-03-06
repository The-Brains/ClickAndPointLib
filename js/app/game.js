define([
    'jquery',
    'lodash',
    '../utility/data-provider.js',
    '../utility/check-data.js',
    './renderer.js',
    './mouse.js',
    './scene.js',
    './action.js',
    './item.js',
    './dialogue.js',
],
($, _, DataProvider, CheckData, Renderer, Mouse, Scene, Action, Item, Dialogue) => {
    var Game = function(sourceFile, canvas, sourceData) {
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
        this.dataProvider = new DataProvider();
        this.dataProvider.sourceFile = sourceFile;
        this.dataProvider.sourceData = sourceData;

        this.sourceData = null;
        this.scenes = {};
        this.globalActions = {};
        this.currentScene = null;
        this.items = {};
        this.variables = {};
        this.dialogues = {};

        this.getName = () => {
            return 'MainGame';
        }

        this.getActions = (actionName) => {
            var result = _.has(this.globalActions, actionName);

            if (!result) {
                throw `[MISSING ACTION] The action '${actionName}' cannot be found.`;
            }

            return this.globalActions[actionName];
        }

        this.getFont = () => {
            var bold = _.get(this.sourceData, ['font', 'bold']) || "normal";
            var font = _.get(this.sourceData, ['font', 'font']) || "Arial";
            var size = _.get(this.sourceData, ['font', 'size']) || 26;
            var color = _.get(this.sourceData, ['font', 'color']) || "black";

            return {
                fontFamily: font,
                fontSize: size ? size + "px" : undefined,
                fontWeight: bold,
                color: color
            };
        }

        /**
        * Can be used by the editor to reload the edited data.
        */
        this.reloadGame = (data) => {
            this.sourceData = data;

            CheckData.checkKeys(
                this.sourceData,
                [
                    'startScene',
                    'scenes',
                    'items',
                    'globalActions',
                    'variables',
                ],
                true,
                this.getName()
            );

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

            // Init Items
            _.each(this.sourceData.items, (item, key) => {
                this.items[key] = {};
            });

            // init variables
            _.each(this.sourceData.variables, (variable, key) => {
                this.variables[key] = {};
            });

            // init dialogues
            _.each(this.sourceData.dialogues, (dialogue, key) => {
                this.dialogues[key] = {};
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

            // Create items
            _.each(this.sourceData.items, (item, key) => {
                this.items[key] = new Item(this, key, item);
            });
            ///

            // create variables
            _.each(this.sourceData.variables, (variable, key) => {
                this.variables[key] = variable;
            });
            ///

            // create dialogues
            _.each(this.sourceData.dialogues, (dialogue, key) => {
                this.dialogues[key] = new Dialogue(this, key, dialogue);
            });
            ///
        }

        this.start = () => {
            return this.dataProvider.fetchData()
            .then((data) => {
                this.reloadGame(data);

                return changeScene(this.sourceData.startScene)
                .then((output) => {
                    return render();
                })
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

            if(!result && _.has(this.sourceData.scenes, sceneKey)) {
                this.scenes[sceneKey] = new Scene(this, sceneKey, this.sourceData.scenes[sceneKey]);
                result = _.has(this.scenes, sceneKey);
            }

            if (!result && raise) {
                throw `[MISSING SCENE] The scene '${sceneKey}' cannot be found.`;
            }

            return result;
        }

        this.isValidItemKey = (itemKey, raise=false) => {
            var result = _.has(this.items, itemKey);
            if(!result && _.has(this.sourceData.items, itemKey)) {
                this.items[itemKey] = new Item(this, itemKey, this.sourceData.items[itemKey]);
                result = _.has(this.items, itemKey);
            }

            if (!result && raise) {
                throw `[MISSING ITEMS] The item '${itemKey}' cannot be found.`;
            }

            return result;
        }

        this.isValidDialogueKey = (dialogueKey, raise=false) => {
            var result = _.has(this.dialogues, dialogueKey);
            if(!result && _.has(this.sourceData.dialogues, dialogueKey)) {
                this.dialogues[dialogueKey] = new Dialogue(this, dialogueKey, this.sourceData.dialogues[dialogueKey]);
                result = _.has(this.dialogues, dialogueKey);
            }

            if (!result && raise) {
                throw `[MISSING DIALOGUE] The dialogue '${dialogueKey}' cannot be found.`;
            }

            return result;
        }

        this.isValidVariableName = (varName, raise=false) => {
            var result = _.has(this.variables, varName);
            if (!result && typeof(this.sourceData.variables[varName])!=='undefined') {
                this.variables[varName] = this.sourceData.variables[varName];
                result = _.has(this.variables, varName);
            }

            if (!result && raise) {
                throw `[MISSING VARIABLE] The variable '${varName}' cannot be found.`;
            }

            return result;
        }

        this.isItemOwned = (itemKey) => {
            this.isValidItemKey(itemKey, true);
            return this.items[itemKey].owned;
        }

        this.getVariable = (varName) => {
            // check item
            if(varName.indexOf('has')===0) {
                var itemKey = _.camelCase(varName.substr(3));
                if(this.isValidItemKey(itemKey)) {
                    return this.isItemOwned(itemKey);
                }
            }

            this.isValidVariableName(varName, true);
            return this.variables[varName];
        }

        var resetCanvas = () => {
            $('.temp-overlay').remove();
            var canvas = this.renderer.getCanvas();
            var context = this.renderer.getContext();
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        var changeScene = (sceneKey) => {
            if(!this.scenes[sceneKey]) {
                this.scenes[sceneKey] = new Scene(this, sceneKey, this.sourceData.scenes[sceneKey]);
            }

            this.isValidSceneKey(sceneKey, true);

            this.currentScene = this.scenes[sceneKey];
            this.mouse.defaultCursor();
            return Promise.resolve({
                render: true,
            });
        }

        var startDialogue = (dialogueKey) => {
            this.isValidDialogueKey(dialogueKey, true);

            this.currentScene = this.dialogues[dialogueKey];
            this.mouse.defaultCursor();
            return Promise.resolve({
                render: true,
            });
        }

        var takeItem = (itemKey) => {
            this.isValidItemKey(itemKey, true);
            this.items[itemKey].owned = true;
            this.mouse.updateCursor('default');
            return Promise.resolve({
                render: true,
            });
        }

        var dropItem = (itemKey) => {
            this.isValidItemKey(itemKey, true);
            this.items[itemKey].owned = false;
            this.mouse.updateCursor('default');
            return Promise.resolve({
                render: true,
            });
        };

        var dropItem = (itemKey) => {
            this.isValidItemKey(itemKey, true);
            this.items[itemKey].owned = false;
            this.mouse.updateCursor('default');
            return Promise.resolve({
                render: true,
            });
        };

        var updateVariable = (varName, varValue) => {
            this.variables[varName] = varValue;
            return Promise.resolve({
                render: true,
            });
        }

        this.rerender = () => {
            render();
        }

        var render = () => {
            if (!this.renderer) {
                return Promise.reject('Renderer is not defined');
            }

            resetCanvas();
            var boundingBox = canvas.getBoundingClientRect();
            offsetX = boundingBox.left;
            offsetY = boundingBox.top;

            if(this.currentScene) {
                return this.currentScene.render(this.renderer, this.mouse);
            }
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
                var takenItems = _.filter(output, 'takeItem');
                var updateVariables = _.filter(output, 'setVariable');
                var startDialogueKey = _.find(output, 'startDialogue');

                var promises = [];
                if (newScene) {
                    promises.push(changeScene(newScene.newScene));
                }
                if (takenItems && takenItems.length > 0 ) {
                    promises = _.concat(promises, _.map(takenItems, (takenItem) => {
                        return takeItem(takenItem.takeItem);
                    }));
                }
                if (updateVariables && updateVariables.length > 0) {
                    promises = _.concat(promises, _.map(updateVariables, (updateVar) => {
                        return updateVariable(
                            updateVar.setVariable.target,
                            updateVar.setVariable.value
                        );
                    }));
                }
                if (startDialogueKey) {
                    promises.push(startDialogue(startDialogueKey.startDialogue));
                }
                return Promise.all(promises);
            })
            .then((outputs) => {
                var needRender = _.find(outputs, 'render');

                if (needRender) {
                    return render();
                }

                return Promise.resolve();
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
