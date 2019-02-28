const express = require('express');
const app = express();

app.use(express.static('public'));

app.use('/api/websocket', );

app.listen(80);
