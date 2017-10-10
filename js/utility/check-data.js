define([
    'lodash'
], function(_) {
    var checkKeys = (data, keys, exception=false, origin='') => {
        _.each(keys, (key) => {
            if (!_.has(data, key)) {
                if (exception) {
                    throw `[${origin}] Data is missing "${key}" key.`;
                } else {
                    return false;
                }
            }
        });

        return true;
    }

    return {
        checkKeys: checkKeys,
    }
});
