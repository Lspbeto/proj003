const $ = id => document.getElementById(id);
const state = { mode:"assistant", documentText:"", readingText:"", busy:false, messages:[] };
const HISTORY_KEY = "alfredo-chat-v1";
if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function addMessage(role, content, save=true) {
  const node=document.createElement("article"); node.className="message "+role;
  const avatar=document.createElement("div"); avatar.className="avatar"; avatar.textContent=role==="assistant"?"A":"Você";
  const bubble=document.createElement("div"); bubble.className="bubble"; bubble.textContent=content;
  node.append(avatar,bubble); $("messages").append(node);
  if(save){state.messages.push({role,content}); try{localStorage.setItem(HISTORY_KEY,JSON.stringify(state.messages.slice(-80)));}catch(_){}}
  node.scrollIntoView({behavior:"smooth",block:"nearest"}); return bubble;
}
function restoreHistory(){
  try{const saved=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");if(Array.isArray(saved)){state.messages=saved.slice(-80);for(const m of state.messages)addMessage(m.role,m.content,false);}}catch(_){}
  if(!state.messages.length)addMessage("assistant","Olá! Sou o Alfredo. Posso ajudar a ler seus PDFs, ouvir textos em voz alta e pesquisar assuntos na web. A inteligência artificial para conversar e ensinar será conectada em uma próxima etapa.",true);
}
function setMode(mode){
  state.mode=mode;document.querySelectorAll(".mode").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
  $("hint").textContent=({assistant:"Conversa: escreva uma pergunta ou pesquise na web. A IA ainda será conectada.",teacher:"Professor: carregue um PDF ou texto para estudar. O professor com IA será ativado numa próxima etapa.",reading:"Leitura: abra um PDF ou cole um texto. Alfredo lê sem fazer perguntas."})[mode];
}
document.querySelectorAll(".mode").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));
async function sendMessage(text){
  const content=text.trim();if(!content||state.busy)return;
  addMessage("user",content);$("messageInput").value="";
  if(state.mode==="reading"&&state.readingText){addMessage("assistant","Você está no modo Leitura. Use o botão “Ler em voz alta” para ouvir o material. Para fazer perguntas sobre o conteúdo, será necessário ativar a inteligência artificial.");return;}
  if(/^(https?:\/\/)/i.test(content)){window.open(content,"_blank","noopener");addMessage("assistant","Abri o endereço em outra aba. Quando possível, copie o texto da página e cole aqui para leitura. A análise automática de páginas será adicionada depois.");return;}
  addMessage("assistant","Ainda estou sendo preparado. Esta versão hospedada diretamente no GitHub já permite abrir e ler PDFs, ouvir textos e pesquisar na web. Para conversar de forma inteligente e ensinar com perguntas e respostas, preciso de um modelo de IA executado no próprio navegador ou de um serviço externo — o GitHub Pages não executa esse modelo no servidor. Não vou fingir que respondi usando uma IA.");
}
$("composer").addEventListener("submit",e=>{e.preventDefault();sendMessage($("messageInput").value);});
$("messageInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("composer").requestSubmit();}});
function showDocument(name,text){
  state.documentText=text;state.readingText=text;$("documentName").textContent=name;
  $("documentInfo").textContent=text.length.toLocaleString("pt-BR")+" caracteres extraídos. O conteúdo fica no seu navegador.";
  $("documentPanel").classList.remove("hidden");$("reader").classList.remove("hidden");
  $("readerText").textContent=text.slice(0,50000);$("pageInfo").textContent=text.length>50000?"Prévia dos primeiros 50 mil caracteres":"Texto extraído";
  addMessage("assistant","Documento carregado! Você pode ler em voz alta, ou pesquisar na web sobre o assunto. A explicação interativa com IA será habilitada numa próxima etapa.");
}
$("pdfInput").addEventListener("change",async e=>{
  const file=e.target.files[0];if(!file)return;
  if(!window.pdfjsLib){addMessage("assistant","O leitor de PDF não carregou. Verifique sua conexão e tente novamente.");return;}
  try{const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;const pages=[];
    for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const c=await page.getTextContent();pages.push("\n[Página "+i+"]\n"+c.items.map(x=>x.str).join(" "));}
    showDocument(file.name,pages.join("\n").slice(0,250000));
  }catch(_){addMessage("assistant","Não consegui extrair o texto. Este PDF pode ser digitalizado como imagem e precisar de OCR, que ainda não está disponível.");}
  e.target.value="";
});
$("removeDocument").addEventListener("click",()=>{state.documentText="";state.readingText="";$("documentPanel").classList.add("hidden");$("reader").classList.add("hidden");if("speechSynthesis"in window)speechSynthesis.cancel();});
$("pasteTextBtn").addEventListener("click",()=>$("textDialog").showModal());
$("loadText").addEventListener("click",e=>{const text=$("pastedText").value.trim();if(!text){e.preventDefault();return;}showDocument("Texto colado",text);$("pastedText").value="";});
$("webSearchBtn").addEventListener("click",()=>{
  const q=$("messageInput").value.trim();if(!q){addMessage("assistant","Digite o assunto que deseja pesquisar na caixa de mensagem e toque novamente em Pesquisar na web.");return;}
  window.open("https://html.duckduckgo.com/html/?q="+encodeURIComponent(q),"_blank","noopener");
  addMessage("assistant","Abri os resultados da pesquisa em outra aba. A pesquisa acontece no DuckDuckGo; ainda não consigo ler e resumir os resultados automaticamente.");
});
$("readButton").addEventListener("click",()=>{
  if(!state.readingText){addMessage("assistant","Primeiro abra um PDF ou cole um texto.");return;}
  if(!("speechSynthesis"in window)){addMessage("assistant","Este navegador não oferece leitura em voz alta.");return;}
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(state.readingText);u.lang="pt-BR";u.rate=Number($("speedSelect").value);
  const v=speechSynthesis.getVoices().find(x=>x.lang.toLowerCase().startsWith("pt-br"));if(v)u.voice=v;speechSynthesis.speak(u);
});
$("pauseButton").addEventListener("click",()=>{if("speechSynthesis"in window&&speechSynthesis.speaking)speechSynthesis.pause();});
$("stopButton").addEventListener("click",()=>{if("speechSynthesis"in window)speechSynthesis.cancel();});
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(Recognition){const recognition=new Recognition();recognition.lang="pt-BR";recognition.interimResults=false;recognition.onresult=e=>{$("messageInput").value=e.results[0][0].transcript;$("composer").requestSubmit();};recognition.onerror=recognition.onend=()=> $("micButton").classList.remove("listening");$("micButton").addEventListener("click",()=>{$("micButton").classList.add("listening");recognition.start();});}
else $("micButton").addEventListener("click",()=>addMessage("assistant","O reconhecimento de voz não está disponível neste navegador. Você ainda pode digitar. Tente Chrome ou Edge atualizado."));
$("statusText").textContent="Hospedado pelo GitHub";document.querySelector(".status").classList.add("online");
restoreHistory();setMode("assistant");
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
