define([
    '../utility/retina.js',
], (isRetina) => {
    var Renderer = function($canvas, canvasContext) {
        var myself = self;
        var resolution = isRetina ? 2 : 1;
        var backgroundRatio = {
            width: 1,
            height: 1,
        };
        var offset = {
            x: 0,
            y: 0,
        }
        var backgroundDimensions = {
            cornerX: undefined,
            cornerY: undefined,
            width: undefined,
            height: undefined,
        };

        this.getBackgroundRatio = () => {
            return backgroundRatio;
        }

        this.setBackgroundRatio = (width, height) => {
            backgroundRatio.width = width;
            backgroundRatio.height = height;
        }

        this.setBackgroundDimensions = (cornerX, cornerY, width, height) => {
            backgroundDimensions = {
                cornerX: cornerX,
                cornerY: cornerY,
                width: width,
                height: height,
            };
        }

        this.getBackgroundDimensions = () => {
            return backgroundDimensions;
        }

        this.get$Canvas = () => {
            return $canvas;
        }

        this.getCanvas = () => {
            return canvas;
        }

        this.getContext = () => {
            return canvasContext;
        }

        this.convertCoordonateToBackground = (point, forDisplay) => {
            var r = forDisplay ? resolution : 1;
            return {
                x: point.x * backgroundRatio.width * r + offset.x,
                y: point.y * backgroundRatio.height * r + offset.y,
            };
        }

        this.convertBackgroundToCoordinate = (point, forDisplay) => {
            var r = forDisplay ? resolution : 1;
            return {
                x: (point.x - offset.x) / backgroundRatio.width / r,
                y: (point.y - offset.y) / backgroundRatio.height/ r,
            };
        }

        this.convertValueToBackground = (value, forDisplay) => {
            var r = forDisplay ? resolution : 1;
            return value * backgroundRatio.width* r;
        }

        this.convertBackgroundToValue = (value, forDisplay) => {
            var r = forDisplay ? resolution : 1;
            return value / backgroundRatio.width/ r;
        }

        this.setOffset = (offsetX, offsetY) => {
            offset.x = offsetX;
            offset.y = offsetY;
        }

        this.getOffset = () => {
            return offset;
        }
    }

    return Renderer;
});
