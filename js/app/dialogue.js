define([
    'lodash',
    '../utility/check-data.js',
    '../utility/retina.js',
    './interaction.js',
    './answer.js',
],
(_, CheckData, isRetina, Interaction, Answer) => {
	var Dialogue = function(parent, key, data) {
 		this.parent = parent;
        this.data = data;
        var myself = self;

        this.getName = () => {
            if (parent) {
                return parent.getName() + ` - Dialogue '${key}'`;
            } else {
                return `Dialogue '${key}'`;
            }
        }

        CheckData.checkKeys(
            data,
            [
                'name',
                'backgroundImg',
                'answers',
                'interactions',
                'startAnswer',
                'shareOfScreen_percent',
            ],
            true,
            this.getName()
        );

        var name = data.name;
        var key = key;
        this.shareOfScreen = parseFloat(data.shareOfScreen_percent)

        var interactions = [];
        var answers = [];

        var ensureAnswers = () => {
             _.each(data.answers, (answer, key) => {
                answers[key] = answers[key] || new Answer(this, key, answer);
            });
            return answers;
        }

        var ensureInteractions = () => {
            interactions = _.map(data.interactions, (interaction, index) => {
                return interactions[index] || new Interaction(this, index, interaction);
            });
            return interactions;
        }

        var ensureEverything = () => {
            ensureAnswers();
            ensureInteractions();
        }

        this.getImageBackground = () => {
            return data.backgroundImg;
        }

        this.getFont = () => {
            var bold = _.get(data, ['font', 'bold']);
            var font = _.get(data, ['font', 'font']);
            var size = _.get(data, ['font', 'size']);
            var color = _.get(data, ['font', 'color']);

            return _.merge(
                this.parent.getFont(),
                {
                    fontFamily: font,
                    fontSize: size ? size + "px" : undefined,
                    fontWeight: bold,
                    color: color
                }
            );
        }

        var applyBackgroundImage = (image, renderer, callback) => {
            var $canvas = renderer.get$Canvas();
            var canvasContext = renderer.getContext();
            var originalWidth = image.naturalWidth;
            var originalHeight = image.naturalHeight;
            var originalRatio = originalWidth / originalHeight * 1.0;

            var fullHeight = $canvas.height() * this.shareOfScreen / 100.0;
            var height = fullHeight;
            var fullWidth =  $canvas.width();
            var width = fullWidth;
            var resolution = isRetina ? 2 : 1;

            var ratioWidth = originalWidth / width;
            var ratioHeight = originalHeight / height;
            if (ratioWidth > ratioHeight) {
                height = width / originalRatio;
            } else {
                width = height * originalRatio;
            }

            renderer.setBackgroundRatio(
                width / originalWidth,
                height / originalHeight,
            );

            var cornerX = 0;
            var cornerY = 0;

            if (height < fullHeight) {
                cornerY = (fullHeight - height) / 2;
            }
            if (width < fullWidth) {
                cornerX = (fullWidth - width) / 2;
            }

            renderer.setOffset(cornerX, cornerY);

            canvasContext.drawImage(image, cornerX, cornerY, width * resolution, height * resolution);
            height = $canvas.height();
            width = $canvas.width();
            cornerX = 0;
            cornerY = 0;
            renderer.setBackgroundDimensions(cornerX, cornerY, width * resolution, height * resolution);
            callback();
        }

        var backgroundSrc = null;
        var backgroundImage = new Image();
        var renderBackground = (renderer) => {
            return new Promise((resolve, reject) => {
                if(backgroundSrc === this.getImageBackground()) {
                    applyBackgroundImage(backgroundImage, renderer, resolve);
                    return;
                }

                backgroundImage.onload = (source) => {
                    applyBackgroundImage(source.target, renderer, resolve);
                };
                backgroundImage.src = backgroundSrc = data.backgroundImg;
            });
        }

        this.render = (renderer, mouse) => {
            return renderBackground(renderer)
            .then(() => {
                return renderAnswer(this.currentAnswer, renderer, mouse)
            })
            .then(() => {
                return handleUpdate(renderer, mouse, 'render');
            });
        }

        var renderAnswer = (answer, renderer, mouse) => {
            return answer.render(renderer, mouse);
        }

        var handleUpdate = (renderer, mouse, methodName) => {
            ensureEverything();

            var promises = _.map(interactions, (interaction) => {
                return interaction[methodName](renderer, mouse);
            });
            return Promise.all(promises)
            .then((output) => {
                output = _.flatten(output);
                // None is active and at least one was
                if (_.every(output, (a) => { return !a.isActive; }) &&
                    _.some(output, (a) => {return a.needDefaultCursor;})) {
                    mouse.defaultCursor();
                }

                // at least one is TRUE
                if (_.some(output, (a) => {return a.needRedrawScene;})) {
                    return this.render(renderer, mouse);
                } else {
                    return Promise.resolve(output);
                }
            });;
        }

        this.handleCursorMove = (renderer, mouse) => {
            return handleUpdate(renderer, mouse, 'handleCursorMove');
        }

        this.handleClickDown = (renderer, mouse) => {
            ensureEverything();
            var promises = _.map(interactions, (interaction) => {
                return interaction.handleClickDown(renderer, mouse);
            });
            return Promise.all(promises);
        }

        this.handleClickUp = (renderer, mouse) => {
            ensureEverything();
            var promises = _.map(interactions, (interaction) => {
                return interaction.handleClickUp(renderer, mouse);
            });
            return Promise.all(promises);
        }

        answers = ensureAnswers();
        CheckData.checkKeys(answers, [data.startAnswer], true,
            `The answers are missing first answer named '${data.startAnswer}'`);
        this.currentAnswer = answers[data.startAnswer];
        interactions = ensureInteractions();
	}

	return Dialogue;
});
