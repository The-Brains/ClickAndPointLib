define([
    'lodash',
    '../utility/check-data.js',
    './location.js',
    './action.js',
],
(_, CheckData, Location, Action) => {
    var Interaction = function(parent, data) {
        var myself = self;

        this.getName = () => {
            return parent.getName() + ` - Interaction`;
        }

        CheckData.checkKeys(
            data,
            [
                'location',
                'actions',
                'hidden',
            ],
            true,
            this.getName()
        );

        var location = new Location(this, data.location);
        var actions = _.map(data.actions, (action) => {
            return new Action(this, action);
        });

        this.isHidding = () => {
            return data.hidden;
        }

        var handleUpdate = (renderer, mouse, methodName) => {
            return location[methodName](renderer, mouse)
            .then((outputFromLocation) => {
                var promises = _.map(actions, (action) => {
                    return action[methodName](renderer, mouse);
                });
                return Promise.all(promises)
                .then((output) => {
                    return Promise.resolve(_.concat(outputFromLocation, output));
                });
            });
        }

        this.render = (renderer, mouse) => {
            return handleUpdate(renderer, mouse, 'render');
        }

        this.handleCursorMove = (renderer, mouse) => {
            return handleUpdate(renderer, mouse, 'handleCursorMove');
        }
    }

    return Interaction;
})
