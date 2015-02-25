module.exports = function(_, User, Session){
    var config = {
        guest: {
            login: function(session, data, callback){

            }
        },
        user: {

        }
    };

    return function(req, res){
        var method = req.params.method;
        Session.restore(req.cookies.sessionId, function(err, session){
            if(err) {
                Session.create(function(err, session){
                    if(err){
                        res.end('{"err": {"message": "Internal server error"}}');
                    } else {
                        res.cookie('sessionId', session.id);

                        if(_.isObject(config[session.userPriviledge]) && _.isFunction(config[session.userPriviledge][method])){
                            config[session.userPriviledge][method](session, req.body, function(err, data){
                                try {
                                    res.end(JSON.stringify({
                                        err: err,
                                        data: data
                                    }));
                                } catch(e) {
                                    res.end('{"err": {"message": "Internal server error"}}');
                                }
                            })
                        } else {
                            res.end('{"err": {"message": "Action not permitted"}}');
                        }
                    }
                })
            } else {
                if(_.isObject(config[session.userPriviledge]) && _.isFunction(config[session.userPriviledge][method])){
                    config[session.userPriviledge][method](session, req.body, function(err, data){
                        try {
                            res.end(JSON.stringify({
                                err: err,
                                data: data
                            }));
                        } catch(e) {
                            res.end('{"err": {"message": "Internal server error"}}');
                        }
                    })
                } else {
                    res.end('{"err": {"message": "Action not permitted"}}');
                }
            }
        });
    }

}