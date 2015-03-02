var express = require('express');
var _ = require('underscore')
var bodyParser = require('body-parser');
var app = express();
var static = require('node-static');
var mongojs = require('mongojs');
var db = mongojs('studstore',['sessions', 'users', 'documents', 'pages']);
var bcrypt = require('bcrypt');
var User = require('./User.js')(_, db, bcrypt);
var Session = require('./Session.js')(_, db);
var validatorsConfig = require('./validatorsConfig.js')(_);
var callApiMethod = require('./config.js')(_, validatorsConfig, User, Session);

var file = new static.Server('./public');

app.use(bodyParser.urlencoded({ extended: false }))

app.get('*', function(req, res){
    file.serve(req, res, function (err) {
        if(err){
            res.writeHead(404);
            res.end('404 Not Found');
        }
    })
});

app.post('/call/:method', function(req, res){
    if(_.isString(req.params.method)) {
        callApiMethod(_.isObject(req.cookies)?req.cookies.sessionId:undefined, req.params.method, req.body, function(err, data){
            if(err){
                if(err.newSessionId){
                    res.cookie('sessionId', err.newSessionId, {maxAge: 2592000000});
                    if(err.hasError) {
                        err = _.omit(err, ['newSesisonId', 'hasError']);
                    } else {
                        err = null;
                    }
                }
                try {
                    res.end(JSON.stringify({
                        err: err,
                        data: data
                    }));
                } catch (e){
                    res.end(JSON.stringify({
                        message: 'Internal server error'
                    }));
                }
            }
        });
    } else {
        res.end();
    }
});



app.post('/login', function(req, res){

    User.login({
        login: req.body.login,
        password: req.body.password
    }, function(err){
        if(err){
            if(err.message==="Invalid login or password"){
                res.end('Invalid login or password');
            }
            else {
                res.end('Internal server error');
            }
        } else {
            Session.restore(_.isObject(req.cookies)?req.cookies.sessionId:undefined, function(err, session){
                function updatePriviledge(session, callback){
                    console.log(session);
                    Session.setPriviledge({_id: session._id}, 'user', callback);
                }
                if(err){
                    Session.create(function(err, session){
                        if(err){
                            res.end('Internal server error');
                        } else {
                            updatePriviledge(session, function(err){
                                if(err) {
                                    res.end('Internal server error');
                                } else {
                                    res.cookie('sessionId', session.id, {maxAge: 2592000000});
                                    res.redirect('/');
                                }
                            });
                        }
                    })
                } else {
                    updatePriviledge(session, function(err){
                        if(err) {
                            res.end('Internal server error');
                        } else {
                            res.redirect('/');
                        }
                    });
                }
            });
        }
    });
});

app.listen(8080);