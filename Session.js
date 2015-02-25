module.exports = function (_, db) {
    function makeid() {
        var text = "";
        var possible = "abcdef0123456789";
        for( var i=0; i < 32; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    function createSession(callback){
        var id = makeid();
        db.sessions.findOne({id: id}, function (err, session) {
            if(err) {
                callback(err);
            } else if(session!==null){
                createSession(callback);
            } else {
                db.sessions.insert({
                    id: id,
                    userId: null,
                    userPriviledge: 'guest'
                }, callback);
            }
        })
    }

    return {
        create: createSession,
        restore: function(sessionId, callback){
            db.sessions.findOne({id: sessionId}, function(err, session){
                if(err){
                    callback(err);
                } else if(session===null){
                    callback({
                        message: 'Invalid sessionId'
                    });
                } else {
                    callback(null, session);
                }
            })
        },
        remove: function(selector, callback){
            db.sessions.removeOne(selector, function(err){
                if(err) {
                    callback(err);
                } else {
                    callback(null);
                }
            })
        },
        setPriviledge: function(selector, newPriviledge, callback){
            db.sessions.updateOne(selector, {
                $set: {
                    userPriviledge: newPriviledge
                }
            }, function(err){
                if(err) {
                    callback(err);
                } else {
                    callback(null);
                }
            })
        }
    }
};