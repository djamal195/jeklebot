const fetch = require("node-fetch")
const { MESSENGER_PAGE_ACCESS_TOKEN } = require("./config")
const { generateMistralResponse } = require("./mistralApi")

async function handleMessage(senderId, receivedMessage) {
  console.log("Début de handleMessage pour senderId:", senderId)
  console.log("Message reçu:", JSON.stringify(receivedMessage))
  try {
    if (receivedMessage.text) {
      console.log("Génération de la réponse Mistral...")
      const response = await generateMistralResponse(receivedMessage.text)
      console.log("Réponse Mistral générée:", response)
      await sendTextMessage(senderId, response)
      console.log("Message envoyé avec succès")
    } else {
      console.log("Message reçu sans texte")
      await sendTextMessage(senderId, "Désolé, je ne peux traiter que des messages texte.")
    }
  } catch (error) {
    console.error("Erreur lors du traitement du message:", error)
    let errorMessage = "Désolé, j'ai rencontré une erreur en traitant votre message. Veuillez réessayer plus tard."
    if (error.message.includes("timeout")) {
      errorMessage =
        "Désolé, la génération de la réponse a pris trop de temps. Veuillez réessayer avec une question plus courte ou plus simple."
    }
    await sendTextMessage(senderId, errorMessage)
  }
  console.log("Fin de handleMessage")
}

async function sendTextMessage(recipientId, messageText) {
  console.log("Début de sendTextMessage pour recipientId:", recipientId)
  console.log("Message à envoyer:", messageText)

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
      throw error // Propager l'erreur pour la gestion dans handleMessage
    }
  }

  console.log("Fin de sendTextMessage")
}

async function callSendAPI(messageData) {
  console.log("Début de callSendAPI avec messageData:", JSON.stringify(messageData))
  const url = `https://graph.facebook.com/v13.0/me/messages?access_token=${MESSENGER_PAGE_ACCESS_TOKEN}`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData),
    })

    console.log("Réponse reçue de l'API Facebook. Status:", response.status)

    const body = await response.json()
    console.log("Réponse de l'API Facebook:", JSON.stringify(body))

    if (body.error) {
      console.error("Erreur lors de l'appel à l'API Send:", body.error)
      throw new Error(body.error.message)
    }

    console.log("Message envoyé avec succès")
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API Facebook:", error)
    throw error
  }
}

module.exports = {
  handleMessage,
}

