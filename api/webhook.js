const express = require('express');
const bodyParser = require('body-parser');
const { handleMessage } = require('../src/messengerApi');
const { verifyWebhook } = require('../src/config');

const app = express();

app.use(bodyParser.json());

app.get('/api/webhook', (req, res) => {
  return verifyWebhook(req, res);
});

app.post('/api/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;
      
      if (webhookEvent.message) {
        handleMessage(senderId, webhookEvent.message);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

module.exports = app;
