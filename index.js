var filewalker = require('filewalker');
var Encoder = require('./encoder');
var encoder = new Encoder();
var path = require('path');
var _  = require('lodash');
var box_sdk = require('box-sdk');
var express = require('express'),
    passport = require('passport'),
    BoxStrategy = require('passport-box').Strategy;
var box = box_sdk.Box();
var app = express();
var allowedExtensions = [
    'webm',
    'mkv',
    'flv',
    'vob',
    'ogv',
    'ogg',
    'drc',
    'mng',
    'avi',
    'mov',
    'qt',
    'wmv',
    'rm',
    'rmvb',
    'yuv',
    'asf',
    'mp4',
    'm4p',
    'm4v',
    'mpg',
    'mp2',
    'mpeg',
    'mpe',
    'mpv',
    'm2v',
    '3gp',
    '3g2',
    'nsv',
    'roq',
    'mxf',
];

app.get('/auth/box', passport.authenticate('box'), function (req, res) {
});

app.get('/auth/box/callback',
    passport.authenticate('box', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        res.redirect('/');
    });

app.get('/', function (req, res) {
    var opts = {
        user: req.user
    };
    if (req.user) {
        var connection = box.getConnection(req.user.login);
        connection.ready(function () {
            connection.getFolderItems(0, null, function (err, result) {
                if (err) {
                    opts.body = err;
                } else {
                    opts.body = result;
                }
                res.render('index', opts);
            });
        });
    } else {
        res.render('index', opts);
    }
});


var getExtension = function(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
};

var encodeFolder = function(folderPath){
    filewalker(folderPath)
        .on('dir', function(p) {
            console.log('dir:  %s', p);
        })
        .on('file', function(p, s) {
            console.log('file: %s, %d bytes', p, s.size);
            if(_.includes(allowedExtensions, getExtension(p))){
                encoder.setup(this.root + '/' + p, this.root.substring(0,this.root.lastIndexOf('/')) + '/encoded/' + p + '.encoded.mp4');
            }
        })
        .on('error', function(err) {
            console.error(err);
        })
        .on('done', function() {
            console.log('%d dirs, %d files, %d bytes', this.dirs, this.files, this.bytes);
            encoder.run();
        })
        .walk();
};
//encodeFolder('./footage')

app.listen();

passport.use(new BoxStrategy({
    clientID: 'cqyzgbno1dyb0rumm58w7kcdt6oiykoo',
    clientSecret: 'NqerI8rBT9WT9A7XvQ3QtmNFT6UYQwEq',
    callbackURL: "http://localhost:3000/auth/box/callback"
}, box.authenticate()));

