define([
	'lodash',
	'jquery',
	'../utility/check-data.js',
	'./response.js',
],
(_, $, CheckData, Response) => {
	var Answer = function(parent, key, data) {
		this.parent = parent;
		var myself = self;

		this.getName = () => {
			if (parent) {
				return parent.getName() + ` - Answer '${key}'`;
			} else {
				return `Answer '${key}'`;
			}
		}

		CheckData.checkKeys(
			data,
			[
				'mainText',
				'responses',
			],
			true,
			this.getName()
		);

		var key = key;
		var backgroundColor = _.get(data, 'backgroundColor') || _.get(this.parent.data, 'backgroundColor') || "white";

		var npcText = data.mainText;
		var lineWidth = 2;
		var margin = 20;

		var responses = [];

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

		var ensureResponses = () => {
			responses = _.map(data.responses, (response, index) => {
				return responses[index] || new Response(this, index, response);
			});
			return responses;
		}

		this.render = (renderer, mouse) => {
			var canvas = renderer.getCanvas();
			var canvasContext = renderer.getContext();
			var backgroundDimensions = renderer.getBackgroundDimensions();

			var cornerX = backgroundDimensions.cornerX;
			var cornerY = backgroundDimensions.height * this.parent.shareOfScreen / 100.0;
			var maxWidth = backgroundDimensions.width - margin;
			canvasContext.fillStyle = backgroundColor;
			canvasContext.globalAlpha = 0.5;
			canvasContext.strokeStyle = "black";
			canvasContext.lineWidth = lineWidth;
			var rectX = backgroundDimensions.cornerX;
			var rectY = cornerY;
			var rectWidth =  backgroundDimensions.width - 0;
			var rectHeight = backgroundDimensions.height - rectY + backgroundDimensions.cornerY;
			canvasContext.fillRect(rectX, rectY, rectWidth, rectHeight);
			canvasContext.globalAlpha = 1;
			canvasContext.strokeRect(rectX, rectY, rectWidth, rectHeight);

			renderText(renderer, backgroundDimensions);
		}

		var renderText = (renderer, backgroundDimensions) => {
			var mainContainer = $('<div>', {
				class: 'dialogue temp-overlay'
			});
			var cornerX = backgroundDimensions.cornerX;
			var cornerY = backgroundDimensions.height * this.parent.shareOfScreen / 100.0;

			var textAreaCornerY = cornerY + lineWidth;
			var fontObject = this.getFont();
			var cssObject = _.merge(
				{
					backgroundColor: "white",
					width: (backgroundDimensions.width - margin * 2) + "px",
					height: (backgroundDimensions.height - textAreaCornerY - margin * 2) + "px",
					position: "absolute",
					left: cornerX + "px",
					top: textAreaCornerY + "px",
					padding: margin + "px",
				},
				fontObject,
				// TODO: Allow merge of completely custom CSS.
			);
			$(mainContainer).css(cssObject);

			var mainNPCText = $('<p>', {
				text: npcText,
				class: 'dialogue-npcText',
			});
			mainContainer.append(mainNPCText);

			var answersContainer = $('<div>', {});

			_.forEach(responses, (response) => {
				var content = response.toRender();
				answersContainer.append(content);
			});
			mainContainer.append(answersContainer);

			renderer.get$Canvas().parent().append(mainContainer);
		}

		responses = ensureResponses();
	};

	return Answer;
});
