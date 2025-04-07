let pdfText = "";
const chatDiv = document.getElementById('chat');

// Cargar y leer PDF
document.getElementById('pdf-upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function () {
    const typedarray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + "\n";
    }
    pdfText = text;

    // Mostrar primera página
    const page = await pdf.getPage(1);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });
    const canvas = document.getElementById('pdf-canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport }).promise;
  };
  reader.readAsArrayBuffer(file);
});

// Enviar mensaje al asistente
async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;
  chatDiv.innerHTML += `<div><strong>Vos:</strong> ${message}</div>`;
  input.value = "";

  try {
    const response = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: message, context: pdfText })
    });

    const data = await response.json();
    chatDiv.innerHTML += `<div><strong>Asistente:</strong> ${data.answer}</div>`;
    chatDiv.scrollTop = chatDiv.scrollHeight;
  } catch (error) {
    chatDiv.innerHTML += `<div><strong>Error:</strong> No se pudo contactar al asistente.</div>`;
  }
}