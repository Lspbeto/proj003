const $ = id => document.getElementById(id);
const state = { mode:"assistant", documentText:"", readingText:"", messages:[], quiz:0, professorQuestion:null };
const HISTORY_KEY="alfredo-chat-v2";
if(window.pdfjsLib)pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function addMessage(role,content,save=true,timestamp=new Date().toISOString()){
  const node=document.createElement("article");node.className="message "+role;
  const avatar=document.createElement("div");avatar.className="avatar";avatar.textContent=role==="assistant"?"A":"Você";
  const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=content;
  const details=document.createElement("time");details.className="message-time";
  if(timestamp){const date=new Date(timestamp);details.dateTime=date.toISOString();details.textContent=date.toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});}
  else details.textContent="Data/hora não registrada";
  const body=document.createElement("div");body.className="message-body";body.append(bubble,details);
  node.append(avatar,body);
  const messages=$("messages");
  if(role==="user"||!messages.firstElementChild)messages.prepend(node);
  else if(messages.firstElementChild.classList.contains("user"))messages.insertBefore(node,messages.firstElementChild.nextElementSibling);
  else messages.prepend(node);
  if(save){state.messages.push({role,content,timestamp});try{localStorage.setItem(HISTORY_KEY,JSON.stringify(state.messages.slice(-80)));}catch(_){}}
  // Mantem a pergunta mais recente e a resposta no topo da area rolavel.
  requestAnimationFrame(()=>messages.scrollTo({top:0,behavior:"smooth"}));
  if(role==="assistant"){const listen=document.createElement("button");listen.type="button";listen.className="listen-message";listen.textContent="🔊 Ouvir resposta";listen.addEventListener("click",()=>speakText(content));body.append(listen);}
  return bubble;
}
function speakText(text){if(!("speechSynthesis" in window)){alert("Leitura em voz alta não disponível neste navegador.");return;}speechSynthesis.cancel();const chunks=String(text).match(/[\s\S]{1,1800}(?:\s|$)/g)||[String(text)];let index=0;const next=()=>{if(index>=chunks.length)return;const u=new SpeechSynthesisUtterance(chunks[index++]);u.lang="pt-BR";u.rate=Number($("speedSelect").value||1);const voices=speechSynthesis.getVoices();const v=voices.find(x=>x.lang.toLowerCase()==="pt-br")||voices.find(x=>x.lang.toLowerCase().startsWith("pt"));if(v)u.voice=v;u.onend=next;speechSynthesis.speak(u);};next();}
function restoreHistory(){
  try{const saved=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");if(Array.isArray(saved)){state.messages=saved.slice(-80);for(const m of state.messages)addMessage(m.role,m.content,false,m.timestamp||null);}}catch(_){}
  if(!state.messages.length)addMessage("assistant","Olá! Sou o Alfredo. Posso abrir PDFs, extrair textos, localizar trechos de um documento, ajudar você a estudar e ler em voz alta. Escolha uma opção para começar.",false);
}
function clearHistory(){
  if(!window.confirm("Apagar todas as conversas e o histórico salvo neste aparelho?"))return;
  state.messages=[];
  try{localStorage.removeItem(HISTORY_KEY);}catch(_){}
  $("messages").innerHTML="";
  addMessage("assistant","Histórico apagado. Vamos começar uma nova conversa.",false);
}
$("clearHistoryBtn").addEventListener("click",clearHistory);

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
  try{localStorage.setItem("alfredo-last-document-text",text.slice(0,100000));localStorage.setItem("alfredo-last-document-name",name);}catch(_){}
}
window.alfredoLoadText=(text,name="Texto editado")=>showDocument(name,text);
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
async function sendMessage(text){
  const content=text.trim();if(!content)return;
  addMessage("user",content);$("messageInput").value="";
  const lower=normalize(content);
  if(state.mode==="teacher"){
    if(!state.documentText){addMessage("assistant","No modo Professor, abra um PDF ou cole um texto. Depois posso resumir, explicar e fazer perguntas.");return;}
    if(state.professorQuestion && /^(proxima pergunta|outra pergunta|pergunta seguinte)$/.test(lower)){state.professorQuestion=null;}
    else if(state.professorQuestion){const expected=normalize(state.professorQuestion);const words=normalize(content).split(/[\s]+/).filter(w=>w.length>3);const hits=words.filter(w=>expected.includes(w));state.professorQuestion=null;addMessage("assistant",hits.length>2?"Boa resposta! Você identificou ideias do texto. Tente explicar também por que são importantes. Escreva próxima pergunta para continuar.":"Vamos melhorar sua resposta. Volte ao trecho e explique a ideia central com suas palavras. Você pode escrever explicar para rever o conteúdo.");return;}
    if(/resumo|resumir|resuma|síntese/i.test(content)){addMessage("assistant","Resumo do material:\\n\\n"+summarizeDocument());return;}
    if(/pergunta|perguntas|quiz|exercício|próxima/i.test(content)){const ps=state.documentText.split(/\n+/).map(x=>x.trim()).filter(x=>x.length>90);if(!ps.length){addMessage("assistant","Não encontrei texto suficiente para criar uma pergunta.");return;}const part=ps[state.quiz++%ps.length];state.professorQuestion=part;addMessage("assistant","Pergunta: qual é a ideia mais importante deste trecho? Explique com suas palavras.\\n\\nTrecho para estudar:\\n"+part.slice(0,1200));return;}
    const hits=findRelevant(content);const source=hits.length?hits.map(x=>x.chunk.trim()).join("\\n\\n"):summarizeDocument();addMessage("assistant","Vamos estudar por partes.\\n\\nIdeia principal:\\n"+source.slice(0,1800)+"\\n\\nExplicação simples: observe os conceitos centrais e como eles se relacionam. Se uma palavra ou parte ficou difícil, pergunte sobre ela.\\n\\nPara praticar, escreva: próxima pergunta.");return;
  }
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
  addMessage("assistant","Vou pesquisar esse assunto para começarmos...");
  try{const url="https://pt.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch="+encodeURIComponent(content)+"&gsrlimit=3&prop=extracts&exintro=1&explaintext=1&exchars=1000&format=json&origin=*";const response=await fetch(url);if(!response.ok)throw new Error("falha");const data=await response.json();const pages=Object.values(data.query?.pages||{});if(!pages.length)throw new Error("sem resultados");addMessage("assistant","Encontrei estas referências na Wikipédia:\\n\\n"+pages.map(p=>p.title+"\\n"+(p.extract||"Resumo indisponível.")+"\\nFonte: https://pt.wikipedia.org/wiki/"+encodeURIComponent(p.title.replace(/ /g,"_"))).join("\\n\\n---\\n\\n")+"\\n\\nPode perguntar sobre esses pontos e continuamos a conversa. A pesquisa integrada desta versão consulta a Wikipédia; ainda não interpreta toda a web como uma IA generativa.");}catch(e){addMessage("assistant","Não consegui acessar a pesquisa agora. Verifique a conexão com a internet e tente novamente. A pesquisa integrada consulta a Wikipédia em português.");}
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
  const q=$("messageInput").value.trim();
  if(!q){addMessage("assistant","Digite o assunto na caixa de mensagem e toque em Pesquisar na web.");$("messageInput").focus();return;}
  if(state.mode!=="assistant")setMode("assistant");
  sendMessage(q);
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
$("statusText").textContent="Modo independente • dados locais";document.querySelector(".status").classList.add("online");
restoreHistory();setMode("assistant");
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));



// ===== Leitura iniciada ao tocar em qualquer parágrafo =====
function startReadingFrom(text){
 if(!("speechSynthesis"in window)){addMessage("assistant","A leitura em voz alta não está disponível neste navegador.");return;}
 speechSynthesis.cancel();speechQueue=String(text).match(/[\s\S]{1,1800}(?:\s|$)/g)||[String(text)];speechIndex=0;speakNext();
}
function makeReaderSelectable(){
 const oldShow=showDocument;
 showDocument=function(docName,docText){
   oldShow(docName,docText);
   const target=$("readerText");target.innerHTML="";
   let offset=0;
   String(docText).split(/\n+/).forEach(raw=>{
     const value=raw.trim();if(!value){offset+=raw.length+1;return;}
     const p=document.createElement("p");p.className="reader-paragraph";p.textContent=value;p.dataset.start=String(offset+raw.indexOf(value));
     p.title="Toque aqui para começar a leitura deste ponto";
     p.addEventListener("click",()=>{const start=Number(p.dataset.start);startReadingFrom(String(state.readingText).slice(start));document.querySelectorAll(".reader-paragraph").forEach(x=>x.classList.remove("reading-start"));p.classList.add("reading-start");});
     target.append(p);offset+=raw.length+1;
   });
 };
}
makeReaderSelectable();
