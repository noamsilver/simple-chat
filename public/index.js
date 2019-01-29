const getMessages = async () => {
  const res = await fetch('/messages');
  return await res.json();
};

const submit = async () => {
  const body = {
    name: encodeURIComponent(document.getElementById('new-name').value),
    message: encodeURIComponent(document.getElementById('new-message').value),
  }
  document.getElementById('new-message').value = '';
  if (body.name !== '' && body.message !== '') {
    const res = await fetch('/new-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } else {
    console.log('Skiped, empty fields detected')
  }
};

const showEmptyList = () => {
  const emptyElement = document.getElementById('empty-chat');
  emptyElement.style.display = 'block';
}
const hideEmptyList = () => {
  const emptyElement = document.getElementById('empty-chat');
  emptyElement.style.display = 'none';
}

const addMessageToList = (message) => {
  hideEmptyList();
  const chatElement = document.getElementById('chat-messages');
  const time = new Date(message.time)
  chatElement.insertAdjacentHTML('afterbegin', `<div>(${time.toLocaleDateString()}, ${time.toLocaleTimeString()}) ${message.name}: ${message.text}</div>`)
};

const loadChat = async () => {
  const messages = await getMessages();
  if (messages.length === 0) {
    showEmptyList();
  } else {
    for(const message of messages) {
      addMessageToList(message);
    }
  }
};

async function init() {
  console.log('initializing the chat list.')
  await loadChat();
}

function initSocket() {
  const socket = io();
  console.log('initializing the socket.', { socket })
  socket.on('message', (message) => addMessageToList(message))
}

document.addEventListener('DOMContentLoaded', init);
window.onload = initSocket;
(console.log('script loaded'));