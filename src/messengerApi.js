const fetch = require("node-fetch")
const { MESSENGER_PAGE_ACCESS_TOKEN } = require("./config")
const { generateMistralResponse } = require("./mistralApi")

async function handleMessage(senderId, receivedMessage) {
  console.log("Début de handleMessage pour senderId:", senderId)
  console.log("Message reçu:", receivedMessage)
  try {
    if (receivedMessage.text) {
      console.log("Génération de la réponse Mistral...")
      const response = await generateMistralResponse(receivedMessage.text)
      console.log("Réponse Mistral générée:", response)
      await sendTextMessage(senderId, response)
      console.log("Message envoyé avec succès")
    }
  } catch (error) {
    console.error("Erreur lors du traitement du message:", error)
    let errorMessage = "Désolé, j'ai rencontré une erreur en traitant votre message."
    if (error.code === "ECONNRESET" || error.type === "system") {
      errorMessage = "Désolé, il y a un problème de connexion. Veuillez réessayer dans quelques instants."
    }
    await sendTextMessage(senderId, errorMessage)
  }
  console.log("Fin de handleMessage")
}

async function sendTextMessage(recipientId, messageText) {
  console.log("Envoi de message à", recipientId, ":", messageText)

  // Diviser le message en morceaux de 2000 caractères maximum
  const chunks = messageText.match(/.{1,2000}/g) || []

  for (const chunk of chunks) {
    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: chunk,
      },
    }

    try {
      await callSendAPI(messageData)
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
    }
  }
}

async function callSendAPI(messageData) {
  const url = `https://graph.facebook.com/v13.0/me/messages?access_token=${MESSENGER_PAGE_ACCESS_TOKEN}`

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messageData),
  })

  const body = await response.json()

  if (body.error) {
    console.error("Erreur lors de l'appel à l'API Send:", body.error)
    throw new Error(body.error.message)
  }

  console.log("Message envoyé avec succès")
}

module.exports = {
  handleMessage,
}

