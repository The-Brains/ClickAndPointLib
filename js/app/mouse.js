define([
    '../utility/check-data.js',
],
(CheckData) => {
    var Mouse = function() {
        var myself = self;

        var x = null;
        var y = null;

        this.registerMouseMove = (newX, newY) => {
            x = newX;
            y = newY;
        }

        this.getX = () => {
            return x;
        }

        this.getY = () => {
            return y;
        }

        this.isInitialize = () => {
            return x !== null && y !== null;
        }

        this.toString = () => {
            return `Mouse:(${x}, ${y})`;
        }
    }

    return Mouse;
})
