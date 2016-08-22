var express = require('express');  
var path = require('path');
var expressHBs = require('express-handlebars');

var app = express();  
var port = 3000;

app.use('/static', express.static(__dirname + '/static'));

app.set('port', port)

app.engine('.hbs', expressHBs({  
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts/')
}))
app.set('view engine', '.hbs');  
app.set('views', path.join(__dirname, 'views'));

app.get('/', (request, response) => {  
  response.render(path.join(__dirname, 'views/layouts/main'), {
    audio: 'static/audio.js',
    tests: 'static/tests.js'
  })
})

app.listen(port, (err) => {  
  if (err) {
    return console.log('Error: ', err);
  }

  console.log('Server is listening on port: ', port);
});