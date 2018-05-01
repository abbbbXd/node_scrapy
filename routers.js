module.exports = function(app) {

    app.use('/', require('./routes/index'));
    app.use('/index', require('./routes/index'));
    app.use('/user', require('./routes/users'));
    app.use('/test', require('./routes/test'));

};