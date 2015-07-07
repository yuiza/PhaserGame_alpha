var express = require('express');
var app = express();

app.use(express.static(__dirname + '/src'));
app.set('view engine', 'jade');
app.set('views', __dirname + '/src/views');

app.get('/', function (req, res) {
		  res.render('index', { title: 'game' });
});

app.listen(3000);
