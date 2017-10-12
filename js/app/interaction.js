define([
    'lodash',
    '../utility/check-data.js',
    './location.js',
    './action.js',
],
(_, CheckData, Location, Action) => {
    var Interaction = function(parent, key, data) {
        this.parent = parent;
        var myself = self;

        this.getName = () => {
            return parent.getName() + ` - Interaction '${key}'`;
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
        var actions = _.map(data.actions, (action, index) => {
            return new Action(this, index, action);
        });

        this.isHidding = () => {
            return data.hidden;
        }

        var handleUpdate = (renderer, mouse, methodName) => {
            return location[methodName](renderer, mouse)
            .then((outputFromLocation) => {
                var promises = _.map(actions, (action) => {
                    return action[methodName](renderer, mouse, outputFromLocation.isInside);
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
        this.handleClickDown = (renderer, mouse) => {
            return handleUpdate(renderer, mouse, 'handleClickDown');
        }
        this.handleClickUp = (renderer, mouse) => {
            return handleUpdate(renderer, mouse, 'handleClickUp');
        }
    }

    return Interaction;
})
