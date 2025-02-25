const fetch = require('node-fetch');
const { MISTRAL_API_KEY } = require('./config');

async function generateMistralResponse(prompt) {
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let generatedResponse = data.choices[0].message.content;
    
    if (generatedResponse.length > 2000) {
      generatedResponse = generatedResponse.substring(0, 1997) + '...';
    }
    
    return generatedResponse;
  } catch (error) {
    console.error('Erreur lors de la génération de la réponse Mistral:', error);
    return 'Je suis désolé, mais je ne peux pas répondre pour le moment. Veuillez réessayer plus tard.';
  }
}

module.exports = {
  generateMistralResponse
};
