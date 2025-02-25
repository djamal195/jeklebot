const fetch = require("node-fetch")
const { MISTRAL_API_KEY } = require("./config")

function checkCreatorQuestion(prompt) {
  const lowerPrompt = prompt.toLowerCase()
  return (
  lowerPrompt.includes("qui t'a créé") ||
  lowerPrompt.includes("qui ta créé") || // sans apostrophe et sans accent
  lowerPrompt.includes("qui t'a cree") || // sans accents
  lowerPrompt.includes("qui ta cree") || // sans accents et sans apostrophe
  
  lowerPrompt.includes("qui t'a construit") ||
  lowerPrompt.includes("qui ta construit") ||
  
  lowerPrompt.includes("qui t'a développé") ||
  lowerPrompt.includes("qui ta développé") ||
  lowerPrompt.includes("qui t'a developpe") ||
  lowerPrompt.includes("qui ta developpe") ||
  
  lowerPrompt.includes("qui est ton créateur") ||
  lowerPrompt.includes("qui est ton createur") ||
  
  lowerPrompt.includes("qui est ton développeur") ||
  lowerPrompt.includes("qui est ton developpeur") ||
  
  lowerPrompt.includes("qui est a l'origine de toi") ||
  lowerPrompt.includes("qui est à l'origine de toi") ||
  
  lowerPrompt.includes("qui t'a fabriqué") ||
  lowerPrompt.includes("qui ta fabriqué") ||
  lowerPrompt.includes("qui t'a fabrique") ||
  lowerPrompt.includes("qui ta fabrique") ||
  
  lowerPrompt.includes("qui est ton inventeur") ||
  
  lowerPrompt.includes("par qui as-tu été créé") ||
  lowerPrompt.includes("par qui as tu ete cree") ||
  lowerPrompt.includes("par qui as-tu ete cree") ||
  lowerPrompt.includes("par qui as-tu été cree") ||
  
  lowerPrompt.includes("par qui as-tu été développé") ||
  lowerPrompt.includes("par qui as-tu ete developpe") ||
  
  lowerPrompt.includes("quel est ton créateur") ||
  lowerPrompt.includes("quel est ton createur") ||
  
  lowerPrompt.includes("quel est ton développeur") ||
  lowerPrompt.includes("quel est ton developpeur") ||
  
  lowerPrompt.includes("qui t'a conçu") ||
  lowerPrompt.includes("qui ta conçu") ||
  lowerPrompt.includes("qui t'a concu") ||
  lowerPrompt.includes("qui ta concu") ||
  
  lowerPrompt.includes("d'où viens-tu") ||
  lowerPrompt.includes("d'ou viens tu") || // sans accent grave
  lowerPrompt.includes("dou viens tu") || // sans apostrophe
  
  lowerPrompt.includes("qui est responsable de toi") ||
  
  lowerPrompt.includes("qui est derrière toi") ||
  lowerPrompt.includes("qui est derriere toi") ||
  
  lowerPrompt.includes("qui a fait de toi ce que tu es") ||
  
  lowerPrompt.includes("qui a mis en place ton système") ||
  lowerPrompt.includes("qui a mis en place ton systeme") // sans accent
);

}

async function generateMistralResponse(prompt) {
  console.log("Début de generateMistralResponse pour prompt:", prompt)

  // Vérifier si la question concerne le créateur
  if (checkCreatorQuestion(prompt)) {
    console.log("Question sur le créateur détectée. Réponse personnalisée envoyée.")
    return "J'ai été créé par Djamaldine Montana. C'est un développeur talentueux qui m'a conçu pour aider les gens comme vous !"
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
      console.log("Timeout atteint pour la requête Mistral")
    }, 50000) // 50 secondes de timeout

    console.log("Envoi de la requête à l'API Mistral...")
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
    })

    clearTimeout(timeout)

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
    if (error.name === "AbortError") {
      return "Désolé, la génération de la réponse a pris trop de temps. Veuillez réessayer avec une question plus courte ou plus simple."
    }
    return "Je suis désolé, mais je ne peux pas répondre pour le moment. Veuillez réessayer plus tard."
  }
}

module.exports = {
  generateMistralResponse,
}

