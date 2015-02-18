var mongojs = require('mongojs');
var db = mongojs('studstore',['sessions', 'users', 'documents', 'pages']);
var bcrypt = require('bcrypt');

db.users.drop(function () {
    db.users.insert({
        login: 'id1',
        hash: bcrypt.hashSync('123', 8)
    }, function(){
        db.close();
    })
})