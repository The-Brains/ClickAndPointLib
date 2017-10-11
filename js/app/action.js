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

        this.render = (renderer, mouse) => {
            return Promise.resolve({});
        }

        this.handleCursorMove = (renderer, mouse) => {
            return Promise.resolve({});
        }
    }

    return Action;
})
