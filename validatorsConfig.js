module.exports = function(_){
    return {
        guest: {
            f: function(data){
                return _.isObject(data);
            }
        },
        user: {
            f: [function(data, callback){
                callback(_.isObject(data)?null:{});
            }]
        }
    };
};