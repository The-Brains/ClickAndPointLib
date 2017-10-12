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

        var _setCursor = function(cursor) {
            document.body.style.cursor = cursor;
        }

        this.defaultCursor = () => {
            console.log('changed cursor to default');
            _setCursor('default');
        }

        this.updateCursor = (newCursor) => {
            console.log('changed cursor to ' + newCursor);
            _setCursor(newCursor);
        }
    }

    return Mouse;
})
