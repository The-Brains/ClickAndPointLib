define([
    '../utility/check-data.js',
],
(CheckData) => {
    var Scene = function(key, data) {
        var myself = self;
        CheckData.checkKeys(
            data,
            [
                'name',
                'backgroundImg',
            ],
            true,
            `SceneCreation ${key}`
        );

        var name = data.name;
        var key = key;
        var backgroundImg = data.backgroundImg;

        this.getImageBackground = () => {
            return backgroundImg;
        }
    }

    return Scene;
})
