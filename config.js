module.exports = function(_, validatorsConfig, User, Session){
    var config = {
        guest: {
            f: function(session, data, callback){
                callback(null, _.extend(data, {scope: 'guest'}));
            }
        },
        user: {
            f: function(session, data, callback){
                callback(null, _.extend(data, {scope: 'user'}));
            }
        }
    };

    return function(sessionId, method, data, callback){
        Session.restore(sessionId, function(err, session){
            function callMethod(session, justCreated){
                config[session.userPriviledge][method](session, data, function(err, data){
                    if(justCreated){
                        if(err){
                            err = _.extend(err, {newSessionId: session.id, hasError: true});
                        } else {
                            err = {newSessionId: session.id};
                        }
                    }
                    callback(err, data);
                })
            }

            function executeMethod(session, justCreated){
                console.log(session);

                if(_.isObject(config[session.userPriviledge]) && _.isFunction(config[session.userPriviledge][method])){
                    if(_.isUndefined(validatorsConfig[session.userPriviledge][method])){
                        callMethod(session, justCreated);
                    } else if(_.isFunction(validatorsConfig[session.userPriviledge][method])){
                        if(validatorsConfig[session.userPriviledge][method](data)){
                            callMethod(session, justCreated);
                        } else {
                            callback({
                                message: 'Invalid data'
                            });
                        }
                    } else {
                        validatorsConfig[session.userPriviledge][method](data, function(err){
                            if(err){
                                callback({
                                    message: 'Invalid data'
                                });
                            } else {
                                callMethod(session, justCreated);
                            }
                        });
                    }


                } else {
                    callback({
                        message: "Action not permitted"
                    });
                }
            }

            if(err) {
                Session.create(function(err, session){
                    if(err){
                        callback({
                            message: "Internal server error"
                        });
                    } else {
                        executeMethod(session, true);
                    }
                })
            } else {
                executeMethod(session);
            }
        });
    }

}