define([
	'lodash',
	'jquery',
	'../utility/check-data.js',
],
(_, $, CheckData) => {
	var Response = function(parent, key, data) {
		this.parent = parent;
		var myself = self;

		this.getName = () => {
			if (parent) {
				return parent.getName() + ` - Response '${key}'`;
			} else {
				return `Response '${key}'`;
			}
		}

		CheckData.checkKeys(
			data,
			[
				'text',
			],
			true,
			this.getName()
		);

		var key = key;
		var text = data.text;

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

		this.toRender = () => {
			var responseRender = $('<p>', {
				class: 'dialogue-answer-response',
				text: text,
			});

			$(responseRender).css({
				cursor: "pointer"
				// TODO: Allow merge of completely custom CSS.
			});

			$(responseRender).hover(function () {
            	$(this).css({
					color: "blue"
					// TODO: Allow merge of completely custom CSS.
				});
        	}, function () {
            	$(this).css({
					color: "black"
					// TODO: Allow merge of completely custom CSS.
				});
        	});

        	$(responseRender).click(() => {
        		// TODO: Implement click on response.
        	});

			return responseRender;
		}

	};

	return Response;
})
