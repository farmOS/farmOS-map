const express = require('express');
const compression = require('compression');

const app = express();

if (!process.env.TEST_PORT_NUM) {
  process.env.TEST_PORT_NUM = '1234';
}

app.use(compression());

app.use((req, res, next) => {
  res.set('Cache-control', 'public, max-age=300');
  next();
});

app.use(express.static('dist'));

app.set('port', parseInt(process.env.TEST_PORT_NUM));
app.listen(app.get('port'), () => {
  console.log(`Node App Started on port ${app.get('port')}`);
});
