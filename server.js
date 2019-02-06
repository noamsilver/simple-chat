const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const path = require('path');

const chatData = [];
const chatStat = new Map();

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('a user disconnected')
  })
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())

app.get('/messages', (req, res) => {
  const data = {
    chatData,
    chatStat: Array.from(chatStat),
  }
  res.send(JSON.stringify(data))
})
app.post('/new-message', (req, res) => {
  const message = addNewMessage(decodeURIComponent(req.body.name), decodeURIComponent(req.body.message));
  io.emit('message', message);
  res.sendStatus(200);
})
const server = http.listen(3000, () => {
  console.log('Server is listening on port ' + server.address().port)
})

const addNewMessage = (name, message) => {
  const newMessage = {
    name: name,
    time: new Date().valueOf(),
    text: message,
  };
  chatData.unshift(newMessage);
  message.match(/([^\s]+)/gm).forEach(word => {
    if (chatStat.has(word)) {
      chatStat.set(word, chatStat.get(word) + 1);
    } else {
      chatStat.set(word, 1);
    };
  });
  return newMessage;
}