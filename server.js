const express = require('express');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public', { index: false }));

app.post('/ask', async (req, res) => {
  const { question, context } = req.body;
  const apiKey = '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'; // Reemplazá esto por tu clave

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Sos un asistente que responde preguntas sobre el siguiente contenido:" + context },
          { role: "user", content: question }
        ]
      })
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "No tengo una respuesta clara.";
    res.json({ answer });
  } catch (error) {
    console.error("Error al consultar OpenRouter:", error);
    res.status(500).json({ answer: "Error del servidor" });
  }
});

// <<<<<< ESTA ES LA PARTE QUE AGREGA LA PORTADA COMO PRINCIPAL >>>>>
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'portada.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
