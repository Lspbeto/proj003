const $ = id => document.getElementById(id);
const state = { mode:"assistant", documentText:"", readingText:"", messages:[], quiz:0 };
const HISTORY_KEY="alfredo-chat-v2";
if(window.pdfjsLib)pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function addMessage(role,content,save=true){
  const node=document.createElement("article");node.className="message "+role;
  const avatar=document.createElement("div");avatar.className="avatar";avatar.textContent=role==="assistant"?"A":"Você";
  const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=content;
  node.append(avatar,bubble);
  const messages=$("messages");
  if(role==="user"||!messages.firstElementChild)messages.prepend(node);
  else if(messages.firstElementChild.classList.contains("user"))messages.insertBefore(node,messages.firstElementChild.nextElementSibling);
  else messages.prepend(node);
  if(save){state.messages.push({role,content});try{localStorage.setItem(HISTORY_KEY,JSON.stringify(state.messages.slice(-80)));}catch(_){}}
  if(role==="user")node.scrollIntoView({behavior:"smooth",block:"start"});
  return bubble;
}
function restoreHistory(){
  try{const saved=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");if(Array.isArray(saved)){state.messages=saved.slice(-80);for(const m of state.messages)addMessage(m.role,m.content,false);}}catch(_){}
  if(!state.messages.length)addMessage("assistant","Olá! Sou o Alfredo. Posso abrir PDFs, extrair textos, localizar trechos de um documento, ajudar você a estudar e ler em voz alta. Escolha uma opção para começar.");
}
function setMode(mode){
  state.mode=mode;document.querySelectorAll(".mode").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
  $("hint").textContent=({assistant:"Conversa: pergunte sobre o documento aberto ou pesquise um assunto na web.",teacher:"Professor: abra um PDF ou cole um texto. Peça um resumo, explicação ou exercício sobre o material.",reading:"Leitura: abra um PDF ou cole um texto. Alfredo lê o conteúdo em voz alta."})[mode];
}
document.querySelectorAll(".mode").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));

function showDocument(name,text){
  state.documentText=text;state.readingText=text;
  $("documentName").textContent=name;
  $("documentInfo").textContent=text.length.toLocaleString("pt-BR")+" caracteres extraídos. Processamento local no navegador.";
  $("documentPanel").classList.remove("hidden");$("reader").classList.remove("hidden");
  $("readerText").textContent=text.slice(0,50000);
  $("pageInfo").textContent=text.length>50000?"Prévia dos primeiros 50 mil caracteres":"Texto extraído";
  addMessage("assistant","Documento carregado! Agora posso localizar partes do texto, montar um resumo inicial, responder com trechos encontrados e ajudar com perguntas de estudo. Para ouvir, use “Ler em voz alta”.");
}
function normalize(s){return s.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ");}
function findRelevant(query){
  const text=state.documentText;if(!text)return [];
  const words=[...new Set(normalize(query).split(/\s+/).filter(w=>w.length>2&&!["qual","quais","como","para","sobre","uma","uns","das","dos","que","com","isso","esse","esta","pode","ser","tem"].includes(w)))];
  if(!words.length)return [];
  const chunks=text.split(/(?=\[Página \d+\])/i).flatMap(p=>p.match(/[\s\S]{1,1000}/g)||[]);
  return chunks.map((chunk,index)=>({chunk,index,score:words.reduce((n,w)=>n+(normalize(chunk).includes(w)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4);
}
function summarizeDocument(){
  const paragraphs=state.documentText.split(/\n+/).map(x=>x.trim()).filter(x=>x.length>70);
  if(!paragraphs.length)return state.documentText.slice(0,1800);
  return paragraphs.slice(0,6).map((p,i)=>(i+1)+". "+p.slice(0,380)).join("\n\n");
}
function answerFromDocument(question){
  const hits=findRelevant(question);
  if(!hits.length)return "Não encontrei no texto carregado um trecho claramente relacionado a essa pergunta. Tente usar outras palavras ou termos que apareçam no documento. Também posso mostrar um resumo inicial.";
  return "Encontrei estes trechos no documento que podem ajudar. Confira o contexto original:\n\n"+hits.map((h,i)=>"Trecho "+(i+1)+":\n"+h.chunk.trim()).join("\n\n---\n\n");
}
function sendMessage(text){
  const content=text.trim();if(!content)return;
  addMessage("user",content);$("messageInput").value="";
  const lower=normalize(content);
  if(state.mode==="reading"){
    if(state.readingText){addMessage("assistant","Você está no modo Leitura. Use “Ler em voz alta” para ouvir o texto. Para localizar informações, mude para Conversar.");}
    else addMessage("assistant","Abra um PDF ou cole um texto para começar a leitura.");
    return;
  }
  if(/^(https?:\/\/)/i.test(content)){window.open(content,"_blank","noopener");addMessage("assistant","Abri o endereço em outra aba. Se quiser que eu examine o conteúdo, copie o texto da página e cole aqui.");return;}
  if(state.documentText){
    if(/\b(resumo|resumir|resuma|sintese|sintetize)\b/.test(lower)){addMessage("assistant","Resumo inicial baseado no começo e nos parágrafos do documento:\n\n"+summarizeDocument());return;}
    if(/\b(quiz|exercicio|exercicios|questoes|perguntas|estudar|estudo)\b/.test(lower)){
      const hits=findRelevant("conceito objetivo definição importância processo");const base=hits.length?hits[0].chunk:state.documentText.slice(0,900);
      addMessage("assistant","Vamos estudar com o documento aberto. Leia este trecho:\n\n"+base+"\n\nPergunta: explique com suas palavras qual é a ideia principal desse trecho. Escreva sua resposta e eu ajudo a comparar com o texto.");return;
    }
    addMessage("assistant",answerFromDocument(content));return;
  }
  addMessage("assistant","Para responder com base em um material, primeiro abra um PDF ou cole o texto. Sem documento, posso abrir uma pesquisa externa: escreva o assunto na caixa e toque em “Pesquisar na web”. A conversa com IA generativa ainda não está conectada nesta versão estática.");
}
$("composer").addEventListener("submit",e=>{e.preventDefault();sendMessage($("messageInput").value);});
$("messageInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("composer").requestSubmit();}});

$("pdfInput").addEventListener("change",async e=>{
  const file=e.target.files[0];if(!file)return;
  if(!window.pdfjsLib){addMessage("assistant","O leitor de PDF não carregou. Verifique a conexão com a internet e tente novamente.");return;}
  try{
    const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;const pages=[];
    for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const c=await page.getTextContent();pages.push("\n[Página "+i+"]\n"+c.items.map(x=>x.str).join(" "));}
    showDocument(file.name,pages.join("\n").slice(0,250000));
  }catch(_){addMessage("assistant","Não consegui extrair o texto. Este PDF pode ser digitalizado como imagem e precisar de OCR, ainda não disponível.");}
  e.target.value="";
});
$("removeDocument").addEventListener("click",()=>{state.documentText="";state.readingText="";$("documentPanel").classList.add("hidden");$("reader").classList.add("hidden");if("speechSynthesis"in window)speechSynthesis.cancel();});
$("pasteTextBtn").addEventListener("click",()=>$("textDialog").showModal());
$("loadText").addEventListener("click",e=>{const text=$("pastedText").value.trim();if(!text){e.preventDefault();return;}showDocument("Texto colado",text);$("pastedText").value="";});
$("webSearchBtn").addEventListener("click",()=>{
  const q=$("messageInput").value.trim();if(!q){addMessage("assistant","Digite o assunto que deseja pesquisar na caixa de mensagem e toque novamente em Pesquisar na web.");return;}
  window.open("https://html.duckduckgo.com/html/?q="+encodeURIComponent(q),"_blank","noopener");
  addMessage("assistant","Abri os resultados no DuckDuckGo em outra aba. A pesquisa externa funciona, mas a leitura e o resumo automático dos resultados ainda não estão disponíveis.");
});

// Divide textos longos em blocos para reduzir interrupções comuns na leitura de textos extensos no celular.
let speechQueue=[],speechIndex=0;
function speakNext(){
  if(speechIndex>=speechQueue.length)return;
  const u=new SpeechSynthesisUtterance(speechQueue[speechIndex++]);u.lang="pt-BR";u.rate=Number($("speedSelect").value);
  const voices=speechSynthesis.getVoices();const voice=voices.find(v=>v.lang.toLowerCase()==="pt-br")||voices.find(v=>v.lang.toLowerCase().startsWith("pt"));if(voice)u.voice=voice;
  u.onend=speakNext;u.onerror=()=>{if(speechIndex<speechQueue.length)speakNext();};speechSynthesis.speak(u);
}
$("readButton").addEventListener("click",()=>{
  if(!state.readingText){addMessage("assistant","Primeiro abra um PDF ou cole um texto.");return;}
  if(!("speechSynthesis"in window)){addMessage("assistant","Este navegador não oferece leitura em voz alta.");return;}
  speechSynthesis.cancel();speechQueue=state.readingText.match(/[\s\S]{1,2200}(?:\s|$)/g)||[state.readingText];speechIndex=0;speakNext();
});
$("pauseButton").addEventListener("click",()=>{if("speechSynthesis"in window&&speechSynthesis.speaking)speechSynthesis.pause();});
$("stopButton").addEventListener("click",()=>{if("speechSynthesis"in window)speechSynthesis.cancel();speechQueue=[];speechIndex=0;});
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(Recognition){const recognition=new Recognition();recognition.lang="pt-BR";recognition.interimResults=false;recognition.onresult=e=>{$("messageInput").value=e.results[0][0].transcript;$("composer").requestSubmit();};recognition.onerror=recognition.onend=()=>$("micButton").classList.remove("listening");$("micButton").addEventListener("click",()=>{$("micButton").classList.add("listening");try{recognition.start();}catch(_){$("micButton").classList.remove("listening");}});}
else $("micButton").addEventListener("click",()=>addMessage("assistant","O reconhecimento de voz não está disponível neste navegador. Você ainda pode digitar. Tente Chrome atualizado."));
$("statusText").textContent="Alfredo pronto";document.querySelector(".status").classList.add("online");
restoreHistory();setMode("assistant");
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
