const chatStat = new Map();

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
  const chatElement = document.getElementById('chat-messages-h2');
  const time = new Date(message.time)
  chatElement.insertAdjacentHTML('afterend', `<div>(${time.toLocaleDateString()}, ${time.toLocaleTimeString()}) ${message.name}: ${message.text}</div>`)
};

const loadChat = async () => {
  const messagesData = await getMessages();
  for ( [word, count] of messagesData.chatStat) {
    chatStat.set(word, count);
  }
  const messages = messagesData.chatData;
  if (messages.length === 0) {
    showEmptyList();
  } else {
    for(const message of messages) {
      addMessageToList(message);
    }
  }
  renderStatTable();
};

const renderStatTable = () => {
  const tableBody = document.getElementById('table-body');
  const newTableBody = tableBody.cloneNode(false);
  tableBody.parentElement.append(newTableBody);
  tableBody.remove();
  const keys = Array.from(chatStat.keys()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })).reverse();
  keys.forEach(key => {
    newTableBody.insertAdjacentHTML('afterbegin', `<tr><td>${key}</td><td>${chatStat.get(key)}</td></tr>`)
  })
}

async function init() {
  console.log('initializing the chat list.')
  await loadChat();
}

function initSocket() {
  const socket = io();
  console.log('initializing the socket.')
  socket.on('message', (message) => {
    addMessageToList(message);
    message.text.match(/([^\s]+)/gm).forEach(word => {
      if (chatStat.has(word)) {
        chatStat.set(word, chatStat.get(word) + 1);
      } else {
        chatStat.set(word, 1);
      };
    });
    renderStatTable();
  })
}

document.addEventListener('DOMContentLoaded', init);
window.onload = initSocket;
(console.log('script loaded'));