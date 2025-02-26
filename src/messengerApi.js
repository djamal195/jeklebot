const fetch = require("node-fetch")
const { MESSENGER_PAGE_ACCESS_TOKEN } = require("./config")
const { generateMistralResponse } = require("./mistralApi")
const { searchYoutube, downloadYoutubeVideo } = require("./youtubeApi")

async function handleMessage(senderId, receivedMessage) {
  console.log("Début de handleMessage pour senderId:", senderId)
  console.log("Message reçu:", JSON.stringify(receivedMessage))

  try {
    if (receivedMessage.text) {
      if (receivedMessage.text.toLowerCase().startsWith("youtube:")) {
        const query = receivedMessage.text.slice(8).trim()
        const videos = await searchYoutube(query)
        await sendYoutubeResults(senderId, videos)
      } else {
        const response = await generateMistralResponse(receivedMessage.text)
        await sendTextMessage(senderId, response)
      }
    } else if (receivedMessage.postback) {
      const payload = JSON.parse(receivedMessage.postback.payload)
      if (payload.type === "WATCH_VIDEO") {
        await handleWatchVideo(senderId, payload.videoId)
      }
    } else {
      await sendTextMessage(senderId, "Désolé, je ne peux traiter que des messages texte ou des actions spécifiques.")
    }
  } catch (error) {
    console.error("Erreur lors du traitement du message:", error)
    await sendTextMessage(senderId, "Désolé, j'ai rencontré une erreur en traitant votre demande.")
  }
}

async function sendYoutubeResults(senderId, videos) {
  const elements = videos.map((video) => ({
    title: video.title,
    subtitle: video.description,
    image_url: video.thumbnails.high.url,
    buttons: [
      {
        type: "postback",
        title: "Regarder",
        payload: JSON.stringify({ type: "WATCH_VIDEO", videoId: video.id }),
      },
    ],
  }))

  const messageData = {
    recipient: { id: senderId },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: elements,
        },
      },
    },
  }

  await callSendAPI(messageData)
}

async function handleWatchVideo(senderId, videoId) {
  await sendTextMessage(senderId, "Je télécharge la vidéo, veuillez patienter...")
  try {
    const videoPath = await downloadYoutubeVideo(videoId)
    await sendVideoMessage(senderId, videoPath)
  } catch (error) {
    console.error("Erreur lors du téléchargement de la vidéo:", error)
    await sendTextMessage(senderId, "Désolé, je n'ai pas pu télécharger la vidéo. Veuillez réessayer plus tard.")
  }
}

async function sendVideoMessage(recipientId, videoPath) {
  const messageData = {
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: videoPath,
          is_reusable: true,
        },
      },
    },
  }

  await callSendAPI(messageData)
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

