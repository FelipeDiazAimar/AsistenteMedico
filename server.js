require('dotenv').config(); // 👉 Carga variables del .env

const express = require('express');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public', { index: false }));

// 🔄 Ruta principal para el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'portada.html'));
});

// 🤖 Ruta del asistente
app.post('/ask', async (req, res) => {
  const { question, context } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  // 🧾 Log de entrada del usuario
  console.log("📥 Pregunta recibida del usuario:");
  console.log("Pregunta:", question);
  console.log("Contexto:", context?.substring(0, 200) + "..."); // Solo los primeros 200 caracteres

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // Podés cambiar el modelo acá
        messages: [
          { role: "system", content: "Sos un asistente que responde preguntas sobre el siguiente contenido:" + context },
          { role: "user", content: question }
        ]
      })
    });

    const data = await response.json();

    // 📤 Log de salida del asistente
    console.log("📬 Respuesta recibida del modelo:");
    console.dir(data, { depth: null });

    const answer = data.choices?.[0]?.message?.content || "No tengo una respuesta clara.";
    res.json({ answer });
  } catch (error) {
    console.error("❌ Error al consultar OpenRouter:");
    console.error(error);
    res.status(500).json({ answer: "Error del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
