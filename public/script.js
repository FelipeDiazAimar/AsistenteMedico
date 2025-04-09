let pdfText = "";
let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
const chatDiv = document.getElementById('chat');
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const pageIndicator = document.getElementById('page-indicator');

async function renderPage(pageNum) {
  const page = await pdfDoc.getPage(pageNum);
  const scale = 1.5;
  const viewport = page.getViewport({ scale });
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: ctx, viewport }).promise;
  pageIndicator.textContent = `Página ${pageNum}`;
}

function changePage(offset) {
  const newPage = currentPage + offset;
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    renderPage(currentPage);
  }
}

// Cargar y leer PDF
document.getElementById('pdf-upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function () {
    const typedarray = new Uint8Array(this.result);
    pdfDoc = await pdfjsLib.getDocument({ data: typedarray }).promise;
    totalPages = pdfDoc.numPages;
    currentPage = 1;

    // Extraer texto de todas las páginas
    let text = "";
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + "\n";
    }
    pdfText = text;

    renderPage(currentPage);
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
