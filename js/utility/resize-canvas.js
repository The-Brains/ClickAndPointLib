define(['jquery', 'lodash', './retina.js'], function($, _, isRetina) {
    function resizeCanvas() {
        var canvasDrawing = $('#canvas');
        var container = $('.page-content');

        var height = container.height();
        var width = container.width();
        var resolution = isRetina ? 2 : 1;

        $('.CanvasArea').height(height);
        $('.CanvasArea').width(width);
        canvasDrawing.width(width);
        canvasDrawing.height(height);
        canvasDrawing.attr('width', width*resolution);
        canvasDrawing.attr('height', height*resolution);
    };

    $(window).resize(_.debounce(resizeCanvas, 200, {
        maxWait: 1000,
    }));
    resizeCanvas();
});
