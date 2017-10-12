define([
    '../utility/check-data.js',
],
(CheckData) => {
    var Action = function(parent, key, data) {
        this.parent = parent;
        var myself = self;
        var game = null;

        this.getName = () => {
            return parent.getName() + ` - Action '${key}'`;
        }

        var getGame = () => {
            if (game) {
                return game;
            }
            var currentParent = parent;
            while (currentParent.parent) {
                currentParent = currentParent.parent;
            }
            game = currentParent;
            return getGame();
        }

        CheckData.checkKeys(
            data,
            [
                'type',
                'target',
            ],
            true,
            this.getName()
        );

        var type = data.type;
        var target = data.target;

        this.goto = {
            checkData: () => {
                getGame().isValidSceneKey(target, true);
            },
            hoverCursor: data.hoverCursor || 'pointer',
            actClickDown: (renderer, mouse, isHover) => {
                if (isHover) {
                    return Promise.resolve({
                        newScene: target,
                    });
                }
                return Promise.resolve({});
            },
            actClickUp: (renderer, mouse, isHover) => {
                return Promise.resolve({});
            }
        }

        var cursorWasChanged = false;

        var handleUpdate = (renderer, mouse, isHover) => {
            if (isHover && this[type].hoverCursor !== null) {
                mouse.updateCursor(this[type].hoverCursor);
                cursorWasChanged = true;
            }
            var data = {
                needDefaultCursor: !isHover && cursorWasChanged,
                isActive: cursorWasChanged && isHover,
            };
            if (!isHover) {
                cursorWasChanged = false;
            }

            return Promise.resolve(data);
        }

        this.render = (renderer, mouse, isHover) => {
            return handleUpdate(renderer, mouse, isHover);
        }

        this.handleCursorMove = (renderer, mouse, isHover) => {
            return handleUpdate(renderer, mouse, isHover);
        }

        this.handleClickDown = (renderer, mouse, isHover) => {
            return this[type].actClickDown(renderer, mouse, isHover);
        }
        this.handleClickUp = (renderer, mouse, isHover) => {
            return this[type].actClickUp(renderer, mouse, isHover);
        }

        this[type].checkData();
    }

    return Action;
})
