define([
	'lodash',
	'../utility/check-data.js',
],
(_, CheckData) => {
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
				'mainText'
			],
			true,
			this.getName()
		);

		var key = key;
		// answer can have their own "font" block or use the parent one of the default.
		var bold = _.get(data, ['font', 'bold']) || _.get(this.parent.data, ['font', 'bold']) || "normal";
		var font = _.get(data, ['font', 'font']) || _.get(this.parent.data, ['font', 'font']) || "Arial";
		var size = (_.get(data, ['font', 'size']) || _.get(this.parent.data, ['font', 'size']) || 26);
		var color = _.get(data, ['font', 'color']) || _.get(this.parent.data, ['font', 'color']) || "black";

		var backgroundColor = _.get(data, 'backgroundColor') || _.get(this.parent.data, 'backgroundColor') || "white";

		var npcText = data.mainText;

		function wrapText(context, text, x, y, maxWidth, lineHeight) {
			var lineCount = 0;
			var words = text.split(' ');
			var line = '';

			for(var n = 0; n < words.length; n++) {
				var testLine = line + words[n] + ' ';
				var metrics = context.measureText(testLine);
				var testWidth = metrics.width;
				if (testWidth > maxWidth && n > 0) {
					context.fillText(line, x, y);
					lineCount += 1;
					line = words[n] + ' ';
					y += lineHeight;
				}
				else {
					line = testLine;
				}
			}
			context.fillText(line, x, y);
			if (line !== '') {
				lineCount += 1;
			}
			return lineCount;
		}

		this.render = (renderer, mouse) => {
			var canvas = renderer.getCanvas();
			var canvasContext = renderer.getContext();
			var backgroundDimensions = renderer.getBackgroundDimensions();

			var margin = 20;
			var cornerX = backgroundDimensions.cornerX + margin;
			var cornerY = (backgroundDimensions.height / 3 * 2);
			var maxWidth = backgroundDimensions.width - margin;
			canvasContext.fillStyle = backgroundColor;
			canvasContext.globalAlpha = 0.5;
			canvasContext.strokeStyle = color;
			canvasContext.lineWidth   = 2;
			var rectX = backgroundDimensions.cornerX;
			var rectY = cornerY - size - margin;
			var rectWidth =  backgroundDimensions.width - 0;
			var rectHeight = backgroundDimensions.height - rectY + backgroundDimensions.cornerY;
			canvasContext.fillRect(rectX, rectY, rectWidth, rectHeight);
			canvasContext.globalAlpha = 1;
			canvasContext.strokeRect(rectX, rectY, rectWidth, rectHeight);

			canvasContext.fillStyle = color;
			var canvasFont = `${bold} ${size}px ${font}`;
			canvasContext.font = canvasFont
			var lineUsed = wrapText(canvasContext, npcText, cornerX, cornerY, maxWidth, size);

			// TODO: Draw possible responses.
		}
	};

	return Answer;
})
