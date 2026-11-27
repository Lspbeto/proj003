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
  try{const url="https://pt.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch="+encodeURIComponent(content)+"&gsrlimit=3&prop=extracts&exintro=1&explaintext=1&exchars=1000&format=json&origin=*";const response=await fetch(url);if(!response.ok)throw new Error("falha");const data=await response.json();const pages=Object.values(data.query?.pages||{});if(!pages.length)throw new Error("sem resultados");addMessage("assistant","Encontrei estas referências na Wikipédia:\\n\\n"+pages.map(p=>p.title+"\\n"+(p.extract||"Resumo indisponível.")+"\\nFonte: https://pt.wikipedia.org/wiki/"+encodeURIComponent(p.title.replace(/ /g,"_"))).join("\\n\\n---\\n\\n")+"\\n\\nPode perguntar sobre esses pontos e continuamos a conversa. A pesquisa integrada desta versão consulta a Wikipédia; ainda não interpreta toda a web como uma IA generativa.");}catch(e){window.open("https://html.duckduckgo.com/html/?q="+encodeURIComponent(content),"_blank","noopener");addMessage("assistant","Não consegui trazer resultados diretamente. Abri uma pesquisa externa em outra aba.");}
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


// ===== Escola de HTML do Alfredo: conteúdo local e leitura por toque =====
const htmlLessons = [
 {title:"1. O que é HTML?",body:"HTML é a linguagem de marcação usada para organizar o conteúdo de páginas da internet. Ela indica ao navegador o que é título, parágrafo, imagem, link, lista e outras partes. HTML não é uma linguagem de programação: é uma linguagem de marcação. O navegador interpreta as etiquetas e monta a página.",code:"<!doctype html>\n<html lang=\"pt-BR\">\n  <head>\n    <title>Minha primeira página</title>\n  </head>\n  <body>\n    Olá, mundo!\n  </body>\n</html>",question:"Para que serve o HTML?",answer:["organizar","conteúdo","página","estrutura","marcação"]},
 {title:"2. Entendendo as etiquetas",body:"As etiquetas, também chamadas de tags, são palavras entre sinais de menor e maior. Muitas têm abertura e fechamento. Por exemplo, <p> inicia um parágrafo e </p> encerra esse parágrafo. O conteúdo fica entre as duas etiquetas. Algumas etiquetas, como <img>, não precisam de fechamento tradicional.",code:"<p>Este é um parágrafo.</p>\n<h1>Este é um título principal</h1>",question:"Qual é a função da etiqueta <p>?",answer:["parágrafo","texto"]},
 {title:"3. A estrutura básica",body:"Uma página HTML começa com <!doctype html>, que informa ao navegador que usamos HTML moderno. A etiqueta <html> envolve a página. Dentro dela, <head> guarda informações sobre a página, e <body> contém o conteúdo que aparece para a pessoa que visita o site.",code:"<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Minha página</title>\n</head>\n<body>\n  <h1>Bem-vindo!</h1>\n  <p>Estou aprendendo HTML.</p>\n</body>\n</html>",question:"Em qual parte colocamos o conteúdo visível da página?",answer:["body","corpo"]},
 {title:"4. Títulos e parágrafos",body:"Os títulos organizam o conteúdo em níveis. <h1> representa o título principal; <h2> e os demais níveis representam subtítulos. <p> cria parágrafos. Use os níveis na ordem lógica para facilitar a leitura e a acessibilidade.",code:"<h1>Minha empresa</h1>\n<h2>Quem somos</h2>\n<p>Conheça nosso trabalho.</p>",question:"Qual etiqueta representa o título principal?",answer:["h1"]},
 {title:"5. Links e imagens",body:"A etiqueta <a> cria um link. O atributo href informa o endereço de destino. A etiqueta <img> mostra uma imagem. O atributo src indica o arquivo da imagem e alt oferece uma descrição textual, importante para acessibilidade.",code:"<a href=\"https://example.com\">Visitar site</a>\n<img src=\"foto.jpg\" alt=\"Uma paisagem verde\">",question:"Qual atributo informa o destino de um link?",answer:["href"]},
 {title:"6. Listas e formulários",body:"As listas podem ser ordenadas com <ol> ou não ordenadas com <ul>. Cada item usa <li>. Formulários coletam informações: <form> agrupa os campos, <label> identifica um campo e <input> permite digitar ou selecionar dados.",code:"<ul>\n  <li>Maçã</li>\n  <li>Banana</li>\n</ul>\n<label for=\"nome\">Seu nome</label>\n<input id=\"nome\" type=\"text\">",question:"Qual etiqueta representa cada item de uma lista?",answer:["li"]}
];
let htmlLessonIndex=0;
function addHtmlSchool(){
 const toolsBox=document.querySelector(".tools"); if(!toolsBox||$("htmlSchoolBtn"))return;
 const btn=document.createElement("button");btn.type="button";btn.id="htmlSchoolBtn";btn.className="tool-button";btn.textContent="💻 Aprender HTML";toolsBox.append(btn);
 const panel=document.createElement("section");panel.id="htmlSchool";panel.className="html-school hidden";
 panel.innerHTML='<div class="school-head"><div><strong>🎓 Escola de HTML</strong><small>Aprenda passo a passo com o Alfredo</small></div><button type="button" id="closeHtmlSchool" class="icon-button" aria-label="Fechar aulas">✕</button></div><div class="school-progress" id="htmlProgress"></div><h2 id="htmlLessonTitle"></h2><div id="htmlLessonBody" class="html-lesson-body"></div><pre class="html-code" id="htmlLessonCode"></pre><div class="school-actions"><button type="button" class="primary small" id="readHtmlLesson">🔊 Ouvir esta aula</button><button type="button" class="tool-button small" id="explainHtmlLesson">💡 Explicar de outro jeito</button></div><div class="html-quiz"><strong id="htmlQuestion"></strong><input id="htmlAnswer" type="text" placeholder="Digite sua resposta"><button type="button" class="primary small" id="checkHtmlAnswer">Conferir resposta</button><p id="htmlFeedback" aria-live="polite"></p></div><div class="school-actions"><button type="button" class="tool-button small" id="prevHtmlLesson">← Aula anterior</button><button type="button" class="primary small" id="nextHtmlLesson">Próxima aula →</button></div>';
 document.querySelector("main").insertBefore(panel,document.querySelector(".chat-toolbar"));
 $("htmlSchoolBtn").addEventListener("click",()=>{panel.classList.remove("hidden");setMode("teacher");renderHtmlLesson();panel.scrollIntoView({behavior:"smooth",block:"start"});});
 $("closeHtmlSchool").addEventListener("click",()=>panel.classList.add("hidden"));
 $("prevHtmlLesson").addEventListener("click",()=>{htmlLessonIndex=Math.max(0,htmlLessonIndex-1);renderHtmlLesson();});
 $("nextHtmlLesson").addEventListener("click",()=>{htmlLessonIndex=Math.min(htmlLessons.length-1,htmlLessonIndex+1);renderHtmlLesson();});
 $("readHtmlLesson").addEventListener("click",()=>{const l=htmlLessons[htmlLessonIndex];startReadingFrom(l.title+". "+l.body+". Exemplo de código: "+l.code);});
 $("explainHtmlLesson").addEventListener("click",()=>{const l=htmlLessons[htmlLessonIndex];addMessage("assistant","Vamos simplificar: "+simpleHtmlExplanation(htmlLessonIndex));});
 $("checkHtmlAnswer").addEventListener("click",()=>{const answer=normalize($("htmlAnswer").value);const l=htmlLessons[htmlLessonIndex];const ok=l.answer.some(w=>answer.includes(normalize(w)));$("htmlFeedback").textContent=ok?"Muito bem! Você acertou. Explique agora com suas palavras por que essa resposta está correta.":"Ainda não. Leia a explicação e tente novamente. Dica: procure a palavra principal da pergunta.";if(ok)addMessage("assistant","Muito bem! Sua resposta está no caminho certo. Quer avançar para a próxima aula?");});
 renderHtmlLesson();
}
function simpleHtmlExplanation(i){
 return [
 "Imagine que uma página é um documento. O HTML organiza as partes desse documento para o navegador saber o que mostrar e como cada parte se relaciona.",
 "Pense nas etiquetas como marcações em um texto: uma marca onde o parágrafo começa e outra onde termina. Assim o navegador reconhece cada elemento.",
 "O head é como a ficha de identificação da página; o body é o espaço onde fica o conteúdo que aparece na tela.",
 "Os títulos são como capítulos e subtítulos de um livro. Eles criam uma hierarquia para organizar o assunto.",
 "Um link é uma porta para outro endereço. O href informa para qual endereço essa porta leva. A imagem usa src para indicar o arquivo.",
 "Uma lista organiza itens. Um formulário funciona como uma ficha que permite à pessoa preencher informações."
 ][i];
}
function renderHtmlLesson(){
 const l=htmlLessons[htmlLessonIndex];if(!$("htmlLessonTitle"))return;
 $("htmlProgress").textContent="Aula "+(htmlLessonIndex+1)+" de "+htmlLessons.length;
 $("htmlLessonTitle").textContent=l.title;$("htmlLessonBody").textContent=l.body;$("htmlLessonCode").textContent=l.code;
 $("htmlQuestion").textContent="Vamos conferir: "+l.question;$("htmlAnswer").value="";$("htmlFeedback").textContent="";
 $("prevHtmlLesson").disabled=htmlLessonIndex===0;$("nextHtmlLesson").disabled=htmlLessonIndex===htmlLessons.length-1;
}
function startReadingFrom(text){
 if(!("speechSynthesis"in window)){addMessage("assistant","A leitura em voz alta não está disponível neste navegador.");return;}
 speechSynthesis.cancel();speechQueue=String(text).match(/[\s\S]{1,1800}(?:\s|$)/g)||[String(text)];speechIndex=0;speakNext();
}
function makeReaderSelectable(name,text){
 const oldShow=showDocument;
 showDocument=function(docName,docText){
   oldShow(docName,docText);
   const target=$("readerText");target.innerHTML="";
   let offset=0;
   const paragraphs=String(docText).split(/\n+/);
   paragraphs.forEach(raw=>{
     const value=raw.trim();if(!value){offset+=raw.length+1;return;}
     const p=document.createElement("p");p.className="reader-paragraph";p.textContent=value;p.dataset.start=String(offset+raw.indexOf(value));
     p.title="Toque aqui para começar a leitura deste ponto";
     p.addEventListener("click",()=>{const start=Number(p.dataset.start);startReadingFrom(String(state.readingText).slice(start));document.querySelectorAll(".reader-paragraph").forEach(x=>x.classList.remove("reading-start"));p.classList.add("reading-start");});
     p.addEventListener("dblclick",()=>{const selected=window.getSelection()?.toString().trim();if(selected)addMessage("assistant","Explicação do trecho selecionado: "+explainHtmlSelection(selected));});
     target.append(p);offset+=raw.length+1;
   });
 };
}
function explainHtmlSelection(word){
 const w=normalize(word);
 const defs={"html":"Linguagem de marcação que organiza o conteúdo de páginas da web.","head":"Parte que guarda informações e configurações da página, normalmente não exibidas como conteúdo principal.","body":"Parte que contém o conteúdo visível da página.","h1":"Etiqueta usada para o título principal de uma página ou seção.","p":"Etiqueta usada para criar um parágrafo.","div":"Elemento genérico usado para agrupar outros elementos.","href":"Atributo que indica o endereço de destino de um link.","src":"Atributo que indica a origem de um arquivo, como uma imagem.","alt":"Texto alternativo que descreve uma imagem."};
 for(const [key,value] of Object.entries(defs))if(w.includes(key))return value;
 return "Este trecho faz parte do conteúdo estudado. No HTML, observe as etiquetas, os atributos e o conteúdo entre as etiquetas. Posso explicar melhor se você me disser qual palavra ou linha ficou difícil.";
}
makeReaderSelectable();addHtmlSchool();
