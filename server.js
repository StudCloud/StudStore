var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var static = require('node-static');
var mongojs = require('mongojs');
var db = mongojs('studstore',['sessions', 'users', 'documents', 'pages']);
var bcrypt = require('bcrypt');

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

app.post('/login', function(req, res){
    db.users.findOne({
        login: req.body.login
    }, function(err, user){
        if(err){
            res.end('Internal server error');
        } else if(user===null) {
            res.end('Invalid login or password');
        } else {
            bcrypt.compare(req.body.password, user.hash, function(err, result){
                if(err){
                    res.end('Internal server error');
                } else {
                    if(result){
                        res.end('Login success');
                    } else {
                        res.end('Invalid login or password');
                    }
                }
            })
        }
    })
});

app.listen(8080);