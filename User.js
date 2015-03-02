module.exports = function(_, db, bcrypt){
    return {
        register: function(registerData, callback){
            db.users.findOne({login: registerData.login}, function(err, data){
                if(err) {
                    callback(err);
                } else if(user!==null){
                    callback({
                        message: 'User with same login already exists'
                    });
                } else {
                    bcrypt.hash(registerData.password, 8, function(err, hash){
                        if(err) {
                            callback(err);
                        } else {
                            db.users.insert({
                                login: registerData.login,
                                hash: hash
                            }, callback);
                        }
                    })
                }
            })
        },
        login: function(loginData, callback){
            db.users.findOne({
                login: loginData.login
            }, function(err, user){
                if(err){
                    callback(err);
                } else if(user===null){
                    callback({
                        message: 'Invalid login or password'
                    });
                } else {
                    bcrypt.compare(loginData.password, user.hash, function (err, result) {
                        if(err) {
                            callback(err);
                        } else if(result){
                            callback(null);
                        } else {
                            callback({
                                message: 'Invalid login or password'
                            });
                        }
                    });
                }
            })
        },
        getProfile: function(selector, callback){
            db.users.findOne(selector, callback);
        }
    }
}