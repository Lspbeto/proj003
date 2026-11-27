const $ = id => document.getElementById(id);
const state = { mode: "assistant", messages: [], documentText: "", readingText: "", busy: false };
if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
function addMessage(role, content) {
  const node = document.createElement("article"); node.className = "message " + role;
  const avatar = document.createElement("div"); avatar.className = "avatar"; avatar.textContent = role === "assistant" ? "A" : "Você";
  const bubble = document.createElement("div"); bubble.className = "bubble"; bubble.textContent = content;
  node.append(avatar, bubble); $("messages").append(node); node.scrollIntoView({ behavior: "smooth", block: "nearest" }); return bubble;
}
function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".mode").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  $("hint").textContent = ({ assistant:"Conversa livre: pergunte, peça ajuda ou pesquise um assunto.", teacher:"Professor: Alfredo explica em etapas, faz uma pergunta por vez e espera sua resposta.", reading:"Leitura: envie um texto ou PDF. Alfredo pode ler em voz alta sem fazer perguntas." })[mode];
}
document.querySelectorAll(".mode").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
async function sendMessage(text) {
  const content = text.trim(); if (!content || state.busy) return;
  state.messages.push({ role:"user", content }); addMessage("user", content); $("messageInput").value = ""; state.busy = true;
  const bubble = addMessage("assistant", "Estou pensando...");
  try {
    const response = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ messages:state.messages, mode:state.mode, documentText:state.documentText }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || "Erro ao consultar a IA.");
    bubble.textContent = data.reply; state.messages.push({ role:"assistant", content:data.reply });
  } catch (error) {
    bubble.textContent = error.message + "\n\nPara ativar a IA gratuita, instale o Ollama no computador e baixe o modelo indicado no README. A leitura de PDF e a voz do navegador podem ser testadas separadamente.";
  } finally { state.busy = false; }
}
$("composer").addEventListener("submit", e => { e.preventDefault(); sendMessage($("messageInput").value); });
$("messageInput").addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("composer").requestSubmit(); } });
function showDocument(name, text) {
  state.documentText = text; state.readingText = text;
  $("documentName").textContent = name; $("documentInfo").textContent = text.length.toLocaleString("pt-BR") + " caracteres extraídos. Arquivo disponível nesta sessão.";
  $("documentPanel").classList.remove("hidden"); $("reader").classList.remove("hidden");
  $("readerText").textContent = text.slice(0,18000); $("pageInfo").textContent = text.length > 18000 ? "Prévia do texto" : "Texto completo";
  addMessage("assistant", "Recebi o material. Você pode pedir uma explicação no modo Professor ou usar os controles para ouvir a leitura.");
}
$("pdfInput").addEventListener("change", async e => {
  const file = e.target.files[0]; if (!file) return;
  if (!window.pdfjsLib) { addMessage("assistant", "O leitor de PDF não carregou. Verifique sua conexão e tente novamente."); return; }
  try {
    const pdf = await pdfjsLib.getDocument({ data:await file.arrayBuffer() }).promise; const pages = [];
    for (let i=1;i<=pdf.numPages;i++) { const page=await pdf.getPage(i); const content=await page.getTextContent(); pages.push("\n[Página "+i+"]\n"+content.items.map(x=>x.str).join(" ")); }
    showDocument(file.name, pages.join("\n").slice(0,100000));
  } catch (_) { addMessage("assistant", "Não consegui extrair o texto. PDFs digitalizados como imagem precisarão de OCR, que será acrescentado depois."); }
  e.target.value = "";
});
$("removeDocument").addEventListener("click", () => { state.documentText=""; state.readingText=""; $("documentPanel").classList.add("hidden"); $("reader").classList.add("hidden"); speechSynthesis.cancel(); });
$("pasteTextBtn").addEventListener("click", () => $("textDialog").showModal());
$("loadText").addEventListener("click", e => { const text=$("pastedText").value.trim(); if(!text){e.preventDefault();return;} showDocument("Texto colado",text); $("pastedText").value=""; });
$("webSearchBtn").addEventListener("click", () => { const q=$("messageInput").value.trim(); if(!q){addMessage("assistant","Digite o assunto na caixa de mensagem e toque novamente em Pesquisar na web.");return;} window.open("https://duckduckgo.com/?q="+encodeURIComponent(q),"_blank","noopener"); addMessage("assistant","Abri uma pesquisa na web em outra aba. Para eu explicar uma página, cole o texto dela aqui ou envie o PDF. A leitura direta de páginas será ampliada em uma próxima etapa."); });
$("readButton").addEventListener("click", () => {
  if(!state.readingText){addMessage("assistant","Primeiro abra um PDF ou cole um texto.");return;}
  speechSynthesis.cancel(); const utterance=new SpeechSynthesisUtterance(state.readingText); utterance.lang="pt-BR"; utterance.rate=Number($("speedSelect").value);
  const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith("pt-br")); if(voice) utterance.voice=voice; speechSynthesis.speak(utterance);
});
$("pauseButton").addEventListener("click",()=>{if(speechSynthesis.speaking)speechSynthesis.pause();});
$("stopButton").addEventListener("click",()=>speechSynthesis.cancel());
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(Recognition){const recognition=new Recognition();recognition.lang="pt-BR";recognition.interimResults=false;recognition.onresult=e=>{$("messageInput").value=e.results[0][0].transcript;$("composer").requestSubmit();};recognition.onerror=recognition.onend=()=> $("micButton").classList.remove("listening");$("micButton").addEventListener("click",()=>{ $("micButton").classList.add("listening"); recognition.start(); });}
else $("micButton").addEventListener("click",()=>addMessage("assistant","O reconhecimento de voz não está disponível neste navegador. Tente Chrome ou Edge atualizado."));
async function checkHealth(){try{const r=await fetch("/api/health");const d=await r.json();$("statusText").textContent=d.ollama?"IA conectada":"IA aguardando configuração";document.querySelector(".status").classList.toggle("online",d.ollama);}catch(_){$("statusText").textContent="Servidor indisponível";}}
checkHealth();
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
