define([
    'jquery'
], function($) {
    var readFile = (path) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                async: true,
                url: path,
                crossDomain: true,
                success: (data) => {
                    resolve(data);
                },
                error: reject,
            });
        });
    }

    var readFileAsJson = (path) => {
        return readFile(path)
        .then((data) => {
            return JSON.parse(data);
        });
    }


    return {
        readFileAsJson: readFileAsJson,
    }
});
