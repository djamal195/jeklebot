const express = require("express")
const bodyParser = require("body-parser")
const { handleMessage } = require("../src/messengerApi")
const { verifyWebhook } = require("../src/config")

const app = express()

// Middleware pour parser le corps des requêtes en JSON
app.use(bodyParser.json())

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  console.log("Headers:", req.headers)
  console.log("Body:", req.body)
  next()
})

// Route pour la vérification du webhook (GET request)
app.get("/api/webhook", (req, res) => {
  console.log("Requête GET reçue pour la vérification du webhook")
  return verifyWebhook(req, res)
})

// Route principale pour le webhook (POST request)
app.post("/api/webhook", (req, res) => {
  console.log("Requête POST reçue du webhook")
  const body = req.body

  if (body.object === "page") {
    console.log("Événement de page reçu")
    body.entry.forEach((entry) => {
      const webhookEvent = entry.messaging[0]
      console.log("Événement Webhook reçu:", JSON.stringify(webhookEvent))

      const senderId = webhookEvent.sender.id

      if (webhookEvent.message) {
        console.log("Message reçu, appel de handleMessage")
        handleMessage(senderId, webhookEvent.message)
          .then(() => console.log("handleMessage terminé avec succès"))
          .catch((error) => console.error("Erreur lors du traitement du message:", error))
      } else {
        console.log("Événement non reconnu:", webhookEvent)
      }
    })

    res.status(200).send("EVENT_RECEIVED")
  } else {
    console.log("Requête non reconnue reçue")
    res.sendStatus(404)
  }
})

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error("Erreur non gérée:", err)
  res.status(500).send("Quelque chose s'est mal passé!")
})

module.exports = app

