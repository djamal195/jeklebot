const fetch = require("node-fetch")
const { MISTRAL_API_KEY } = require("./config")

async function generateMistralResponse(prompt) {
  console.log("Début de generateMistralResponse pour prompt:", prompt)
  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
    })

    console.log("Réponse reçue de l'API Mistral. Status:", response.status)

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`Erreur API Mistral: ${response.status} - ${errorBody}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Données reçues de l'API Mistral:", JSON.stringify(data))

    let generatedResponse = data.choices[0].message.content

    if (generatedResponse.length > 4000) {
      generatedResponse = generatedResponse.substring(0, 4000) + "... (réponse tronquée)"
    }

    console.log("Réponse générée:", generatedResponse)
    return generatedResponse
  } catch (error) {
    console.error("Erreur détaillée lors de la génération de la réponse Mistral:", error)
    throw error // Propager l'erreur pour la gestion dans handleMessage
  }
}

module.exports = {
  generateMistralResponse,
}

