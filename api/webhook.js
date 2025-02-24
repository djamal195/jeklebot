const express = require('express');
const bodyParser = require('body-parser');
const { handleMessage } = require('../src/messengerApi');
const { verifyWebhook } = require('../src/config');

const app = express();

// Middleware pour parser le corps des requêtes en JSON
app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Route pour la vérification du webhook (GET request)
app.get('/api/webhook', (req, res) => {
  console.log('Requête GET reçue pour la vérification du webhook');
  return verifyWebhook(req, res);
});

// Route principale pour le webhook (POST request)
app.post('/api/webhook', (req, res) => {
  console.log('Requête POST reçue du webhook');
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      console.log('Événement Webhook reçu:', JSON.stringify(webhookEvent));

      const senderId = webhookEvent.sender.id;
      
      if (webhookEvent.message) {
        handleMessage(senderId, webhookEvent.message)
          .catch(error => console.error('Erreur lors du traitement du message:', error));
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    console.log('Requête non reconnue reçue');
    res.sendStatus(404);
  }
});

// Route pour la racine
app.get('/', (req, res) => {
  res.send('Bienvenue sur le serveur du chatbot Messenger. Le webhook est sur /api/webhook');
});

app.get('/api/webhook', (req, res) => {
  console.log('Requête GET reçue pour la vérification du webhook');
  return verifyWebhook(req, res);
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Quelque chose s\'est mal passé!');
});

// Gestion des routes non trouvées
app.use((req, res, next) => {
  res.status(404).send("Désolé, cette route n'existe pas!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});

module.exports = app;