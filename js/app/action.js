define([
    '../utility/check-data.js',
],
(CheckData) => {
    var Action = function(parent, data) {
        var myself = self;

        this.getName = () => {
            return parent.getName() + ` - Action`;
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

        this.goto = {
            hoverCursor: data.hoverCursor || 'pointer',
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
    }

    return Action;
})
