const fetch = require("node-fetch")
const { MISTRAL_API_KEY } = require("./config")

async function generateMistralResponse(prompt) {
  console.log("Génération de réponse Mistral pour:", prompt)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 secondes de timeout

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
      signal: controller.signal,
      timeout: 30000, // 30 secondes de timeout
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`Erreur API Mistral: ${response.status} - ${errorBody}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    let generatedResponse = data.choices[0].message.content

    if (generatedResponse.length > 4000) {
      generatedResponse = generatedResponse.substring(0, 4000) + "... (réponse tronquée)"
    }

    console.log("Réponse générée:", generatedResponse)
    return generatedResponse
  } catch (error) {
    console.error("Erreur détaillée lors de la génération de la réponse Mistral:", error)
    return "Je suis désolé, mais je ne peux pas répondre pour le moment. Veuillez réessayer plus tard."
  }
}

module.exports = {
  generateMistralResponse,
}

