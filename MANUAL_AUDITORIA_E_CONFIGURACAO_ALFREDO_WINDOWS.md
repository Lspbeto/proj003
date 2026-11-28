# ALFREDO — MANUAL DE AUDITORIA, CONFIGURAÇÃO E PUBLICAÇÃO PELO TERMINAL (WINDOWS)

**Repositório analisado:** https://github.com/Lspbeto/proj003  
**Branch examinada:** `main`  
**Aplicativo publicado:** https://lspbeto.github.io/proj003/  
**Data da revisão:** 28/11/2026

Este manual foi escrito para quem está começando. Cada comando é apresentado com sua finalidade, o local em que deve ser executado e o resultado esperado. O foco é Windows (CMD e PowerShell), com alternativas de hospedagem e serviços com planos gratuitos.

---

# PARTE 1 — O QUE FOI ENCONTRADO NA REVISÃO DO CÓDIGO

## 1.1 Estrutura atual do repositório

A branch `main` contém estes arquivos principais:

```text
proj003/
|-- .env.example
|-- .gitignore
|-- .github/
|   |-- workflows/
|       |-- check.yml
|       |-- pages.yml
|-- DEPLOYMENT.md
|-- README.md
|-- index.html
|-- iniciar-alfredo.bat
|-- package.json
|-- server.js
|-- public/
    |-- app.js
    |-- index.html
    |-- manifest.webmanifest
    |-- styles.css
    |-- sw.js
```

### O que cada arquivo faz

| Arquivo | Função |
|---|---|
| `server.js` | Servidor Node.js/Express. Oferece endpoints `/api/health` e `/api/chat` e entrega os arquivos estáticos. |
| `package.json` | Nome, versão, dependência Express, versão mínima do Node e comandos npm. |
| `.env.example` | Exemplo de variáveis para endereço e modelo do Ollama. |
| `.gitignore` | Impede que `node_modules`, `.env` e `.DS_Store` sejam enviados ao Git. |
| `iniciar-alfredo.bat` | Atalho do Windows que verifica Node, instala dependências se necessário e inicia o servidor. |
| `index.html` | Redireciona para a pasta `public`. |
| `public/index.html` | Tela principal, botões, áreas de conversa, professor, leitura, PDF e entrada de texto. |
| `public/app.js` | Lógica da interface, histórico local, leitura em voz alta, reconhecimento de voz, PDF, pesquisa e modos. |
| `public/styles.css` | Aparência e adaptação para celular e computador. |
| `public/manifest.webmanifest` | Configuração para instalação como aplicativo PWA. |
| `public/sw.js` | Cache de arquivos para ajudar a abrir a interface depois da primeira visita. |
| `.github/workflows/check.yml` | Verifica sintaxe JavaScript em cada envio para a branch principal. |
| `.github/workflows/pages.yml` | Publica a pasta `public` no GitHub Pages. |
| `README.md` e `DEPLOYMENT.md` | Explicam a versão estática e a publicação. |

## 1.2 O que já existe no Alfredo

Pela leitura do código atual:

- Interface responsiva para celular e computador.
- Três modos: Conversar, Professor e Leitura.
- Abertura de PDFs digitais com PDF.js e extração de texto no navegador.
- Colagem de texto.
- Leitura em voz alta com as vozes disponíveis no navegador.
- Reconhecimento de voz quando o navegador oferece a API.
- Histórico guardado no armazenamento local do navegador.
- Data e hora nas mensagens.
- Botão para apagar o histórico local.
- Mensagens recentes posicionadas no topo da conversa.
- Leitura que pode começar ao tocar em um parágrafo do documento.
- Pesquisa externa integrada que consulta a Wikipédia em português.
- Um servidor Express que possui uma rota de conversa com Ollama.

## 1.3 Limitações e problemas importantes identificados

Esta parte é especialmente importante: ela evita que alguém contrate uma hospedagem esperando que a IA já esteja pronta.

### A. A interface não está conectada ao servidor de IA

O arquivo `server.js` possui a rota `POST /api/chat`, mas o arquivo `public/app.js` não faz uma chamada para essa rota. Na versão atual, a conversa da interface responde por regras locais, trechos do documento e pesquisa na Wikipédia. Portanto, publicar o servidor no Render, por si só, não ativa a conversa inteligente.

**Consequência:** para ter conversa com IA, será necessário conectar a interface à API e escolher onde o modelo será executado.

### B. O servidor depende do Ollama

O servidor tenta conversar com o Ollama no endereço padrão `http://127.0.0.1:11434`, usando o modelo `qwen2.5:3b`.

Esse endereço significa “o próprio computador onde o servidor está executando”. Se o servidor for hospedado no Render ou em outro provedor, `127.0.0.1` será o computador/contêiner da hospedagem, não o notebook do usuário.

**Consequência:** o Ollama local funciona para testes no computador, mas não fica automaticamente disponível na nuvem.

### C. O arquivo .env não é carregado automaticamente pelo código atual

O projeto possui `.env.example`, mas o `package.json` não lista a biblioteca `dotenv` e o `server.js` não chama `require("dotenv").config()`.

**Consequência:** criar um arquivo `.env` sozinho não garante que suas variáveis serão carregadas ao iniciar localmente. No Render/Cloud Run, as variáveis devem ser cadastradas no painel do serviço. Para carregar `.env` localmente, seria preciso acrescentar e configurar `dotenv`, ou definir as variáveis no terminal.

### D. A pesquisa não é uma pesquisa completa em toda a internet

O código atual consulta a API de busca da Wikipédia. Não é um mecanismo que navega por qualquer site, abre páginas arbitrárias e produz uma síntese de toda a web.

O botão “Pesquisar na web” encaminha o assunto para esse mecanismo. Quando existe um documento carregado, o fluxo normal de mensagem pode priorizar respostas com o documento em vez de executar uma pesquisa externa.

### E. O modo Professor ainda é uma versão inicial

O modo Professor usa regras e trechos do texto para montar explicações e perguntas. Não usa a rota de IA do servidor. A verificação da resposta do aluno é simples e não substitui uma avaliação semântica por modelo de linguagem.

### F. Histórico não é sincronizado entre aparelhos

O histórico é guardado no `localStorage` do navegador. Isso significa:

- Fica naquele navegador e aparelho.
- Não é salvo em banco de dados.
- Não sincroniza automaticamente com outro celular ou computador.
- Pode desaparecer se os dados do site forem apagados.

### G. PDF escaneado como imagem não tem OCR

O PDF.js extrai texto digital que já existe no PDF. Um documento que seja apenas imagem precisa de OCR (reconhecimento de caracteres), recurso que não está implementado nesta versão.

### H. Pontos técnicos que merecem correção antes de uma publicação pública com IA

1. A API não possui autenticação de usuário.
2. Não há limitação de quantidade de requisições por pessoa.
3. Não há proteção contra abuso de uma rota de IA pública.
4. Não há banco de dados conectado para salvar contas ou conversas.
5. Não há integração entre o frontend e `/api/chat`.
6. O status visual “Alfredo pronto” é definido pela interface sem confirmar a disponibilidade do modelo de IA.
7. O scroll é controlado em parte pelo elemento `messages`, embora a área que possui rolagem seja `chat`; o comportamento deve ser testado e ajustado em aparelhos diferentes.
8. A leitura de parágrafo usa posições calculadas a partir de separações de linhas; documentos com várias linhas em branco podem exigir ajuste no cálculo do ponto de início.
9. O PWA não declara ícones próprios no manifesto. A instalação pode ficar menos completa em alguns aparelhos.
10. O service worker mantém cache local. Ao atualizar o aplicativo, pode ser necessário trocar a versão do cache e recarregar a página.
11. A dependência PDF.js é carregada de CDN; sem internet, a leitura de PDF pode não carregar na primeira abertura.
12. O workflow de verificação testa a sintaxe de `server.js` e `public/app.js`, mas ainda não executa testes funcionais automatizados.

**Conclusão da auditoria:** a versão publicada é um aplicativo estático útil para leitura de texto/PDF digital, voz, histórico local e pesquisa básica. O repositório também contém um servidor experimental com Ollama, mas ele ainda não está ligado à interface. Não descreva a versão atual como uma IA em nuvem completa nem como sistema com banco de dados.

---

# PARTE 2 — PREPARAR O WINDOWS

## 2.1 Abrir o Prompt de Comando

1. Pressione **Windows + R** no teclado.
2. Na caixa Executar, digite:

```text
cmd
```

3. Pressione Enter.

Uma janela preta será aberta. Ela é o Prompt de Comando, também chamado CMD.

Você também pode abrir o PowerShell pelo menu Iniciar, digitando “PowerShell”.

## 2.2 Instalar Git e Node.js

Instale pelos sites oficiais:

- Git: https://git-scm.com/downloads
- Node.js: https://nodejs.org/

Escolha uma versão LTS do Node.js compatível com o requisito do projeto, que atualmente é Node.js 20 ou superior.

Feche e abra novamente o terminal após a instalação.

### Conferir Git

```bat
git --version
```

- `git` chama o programa Git.
- `--version` solicita a versão instalada.

Deve aparecer um número de versão.

### Conferir Node.js

```bat
node --version
```

- `node` chama o Node.js.
- `--version` mostra a versão.

### Conferir npm

```bat
npm --version
```

- `npm` é o gerenciador de bibliotecas que acompanha o Node.js.
- `--version` mostra a versão instalada.

Se algum comando não for reconhecido, confira a instalação e abra um terminal novo.

---

# PARTE 3 — BAIXAR O ALFREDO PELO TERMINAL

## 3.1 Criar uma pasta para o projeto

No CMD, digite um comando por vez:

```bat
cd /d C:\
```

- `cd` significa mudar de pasta.
- `/d` permite mudar também a unidade.
- `C:\` é a raiz do disco C.

Crie a pasta Projetos:

```bat
mkdir Projetos
```

- `mkdir` cria uma nova pasta.
- `Projetos` é o nome escolhido.

Entre nela:

```bat
cd Projetos
```

Crie a pasta Alfredo:

```bat
mkdir Alfredo
cd Alfredo
```

O primeiro comando cria a pasta. O segundo entra nela.

## 3.2 Baixar o repositório

Execute:

```bat
git clone https://github.com/Lspbeto/proj003.git
```

Explicação:

- `git clone` baixa uma cópia do repositório.
- O endereço identifica o repositório Alfredo.
- O Git cria a pasta `proj003`.

Entre na pasta:

```bat
cd proj003
```

Confira os arquivos:

```bat
dir
```

O comando `dir` lista arquivos e pastas do local atual.

A pasta deve conter `package.json`, `server.js`, `public` e outros arquivos descritos na auditoria.

## 3.3 Abrir um arquivo para leitura

Exemplo:

```bat
notepad README.md
```

- `notepad` abre o Bloco de Notas.
- `README.md` é o arquivo que será aberto.

Para abrir o código do servidor:

```bat
notepad server.js
```

Para abrir o código da interface:

```bat
notepad public\app.js
```

O Bloco de Notas serve para leitura e edições pequenas. Para programar com mais conforto, pode instalar o Visual Studio Code: https://code.visualstudio.com/

---

# PARTE 4 — INSTALAR E EXECUTAR A VERSÃO LOCAL

## 4.1 Instalar as dependências

Certifique-se de estar dentro da pasta que contém `package.json`.

Digite:

```bat
npm install
```

- `npm` chama o gerenciador de pacotes.
- `install` instala as dependências listadas em `package.json`.
- O projeto atual utiliza Express como dependência do servidor.
- O npm cria a pasta `node_modules`.

Aguarde o comando terminar.

## 4.2 Iniciar o servidor

Digite:

```bat
npm start
```

- `npm` executa scripts do projeto.
- `start` executa o script definido no `package.json`.
- O script atual inicia `node server.js`.

Se tudo iniciar corretamente, o servidor informa que está disponível em:

```text
http://localhost:3000
```

Abra esse endereço no navegador do computador.

Para encerrar, volte ao terminal e pressione **Ctrl + C**.

## 4.3 Usar o atalho iniciar-alfredo.bat

Também é possível iniciar pelo Explorador de Arquivos:

1. Abra a pasta onde baixou o repositório.
2. Localize `iniciar-alfredo.bat`.
3. Dê dois cliques.

O arquivo BAT:

- Desliga a exibição dos comandos com `@echo off`.
- Define o título da janela com `title`.
- Entra na pasta onde o próprio BAT está com `cd /d "%~dp0"`.
- Verifica se o Node está instalado com `where node`.
- Instala dependências se `node_modules` ainda não existir.
- Inicia o servidor com `npm start`.
- Mantém a janela aberta com `pause`.

**Atenção:** esse atalho não instala o Ollama nem baixa o modelo de IA. Ele inicia somente o servidor Node/Express.

---

# PARTE 5 — TESTAR A IA LOCAL COM O OLLAMA

Esta etapa é opcional. Ela serve para experimentar o servidor de IA localmente no próprio computador.

## 5.1 Instalar Ollama

Site oficial:

https://ollama.com/download

Baixe e instale a versão para Windows.

O Ollama é um programa que executa modelos de linguagem localmente. O computador precisa ter memória e capacidade suficientes para o modelo escolhido.

## 5.2 Baixar o modelo usado como padrão no Alfredo

Abra uma nova janela do CMD ou PowerShell e digite:

```bat
ollama pull qwen2.5:3b
```

- `ollama` chama o programa.
- `pull` baixa um modelo.
- `qwen2.5:3b` é o identificador do modelo configurado como padrão no servidor.

Aguarde o download. O tamanho pode ser significativo.

## 5.3 Conferir se o modelo foi instalado

```bat
ollama list
```

- `list` mostra os modelos baixados.

## 5.4 Testar o Ollama sozinho

```bat
ollama run qwen2.5:3b
```

- `run` inicia uma conversa no terminal com o modelo escolhido.

Digite uma pergunta. Para sair, use o comando de saída indicado pelo Ollama ou feche a sessão.

## 5.5 Testar a saúde do servidor Alfredo

Com o servidor Alfredo iniciado em outra janela, abra o navegador e acesse:

```text
http://localhost:3000/api/health
```

A rota informa se o servidor responde e se conseguiu localizar o Ollama.

**Importante:** o teste de saúde não prova que a interface web está usando a IA. No código atual, a interface ainda não chama `/api/chat`.

---

# PARTE 6 — COMANDOS DE TERMINAL QUE SERÃO USADOS SEMPRE

| Comando | Significado |
|---|---|
| `cd caminho` | Entrar em uma pasta. |
| `cd ..` | Voltar para a pasta anterior. |
| `cd /d C:\` | Mudar para a raiz do disco C no CMD. |
| `mkdir nome` | Criar uma pasta. |
| `dir` | Listar arquivos e pastas. |
| `cls` | Limpar a tela do terminal. |
| `copy origem destino` | Copiar um arquivo no CMD. |
| `del arquivo` | Apagar um arquivo no CMD. |
| `notepad arquivo` | Abrir um arquivo no Bloco de Notas. |
| `git clone endereço` | Baixar um repositório. |
| `git status` | Verificar alterações no repositório. |
| `git pull` | Baixar atualizações do repositório remoto. |
| `git add .` | Preparar alterações para o commit. |
| `git commit -m "mensagem"` | Registrar as alterações localmente. |
| `git push` | Enviar commits ao GitHub. |
| `npm install` | Instalar dependências do projeto. |
| `npm start` | Iniciar o servidor. |
| `node --check arquivo.js` | Verificar a sintaxe de um arquivo JavaScript. |

---

# PARTE 7 — PUBLICAR A INTERFACE NO GITHUB PAGES

O GitHub Pages hospeda arquivos estáticos como HTML, CSS, JavaScript, imagens e manifestos. Ele não executa o servidor Node.js nem o Ollama.

O workflow atual `.github/workflows/pages.yml` publica a pasta `public`.

## 7.1 Configurar GitHub Pages

1. Entre em https://github.com/Lspbeto/proj003
2. Abra **Settings**.
3. Escolha **Pages**.
4. Em **Build and deployment**, escolha **GitHub Actions** como origem.
5. Salve, se solicitado.

## 7.2 Enviar mudanças do frontend

No CMD, entre na pasta local do projeto:

```bat
cd /d C:\Projetos\Alfredo\proj003
```

Confira o que mudou:

```bat
git status
```

Prepare as alterações:

```bat
git add .
```

Registre:

```bat
git commit -m "Atualiza aplicativo Alfredo"
```

Envie:

```bat
git push
```

Depois:

1. Abra a aba **Actions** do repositório.
2. Acompanhe o workflow **Publicar Alfredo no GitHub Pages**.
3. Espere terminar com sucesso.
4. Acesse https://lspbeto.github.io/proj003/

Se o site parecer antigo, atualize a página. Se continuar antigo, teste uma janela anônima e considere que o service worker pode estar usando cache.

---

# PARTE 8 — HOSPEDAR O SERVIDOR: ALTERNATIVAS AO RENDER

O Render é uma opção, mas não é a única. A disponibilidade e os limites dos planos gratuitos mudam; confirme os termos e a região antes de cadastrar cartão ou publicar.

## 8.1 Opção 1 — Render

Site: https://render.com/

O Render oferece hospedagem de aplicações web. O plano gratuito, quando disponível para o tipo de serviço e região, tem limitações e pode suspender serviços sem uso. O primeiro acesso depois de uma suspensão pode demorar.

Passos gerais:

1. Crie uma conta no Render.
2. Conecte sua conta GitHub.
3. Escolha **New → Web Service**.
4. Selecione o repositório `Lspbeto/proj003`.
5. Configure a branch `main).
6. Configure o diretório raiz como a raiz do repositório.
7. Build Command: `npm install`.
8. Start Command: `npm start`.
9. Selecione o plano disponível que deseja usar.
10. Cadastre as variáveis de ambiente, se necessárias.
11. Crie o serviço e acompanhe os logs.

O servidor atual usa a porta informada pelo ambiente em `PORT`, com padrão 3000.

**Atenção:** publicar o servidor no Render não resolve a conexão com Ollama. O endereço padrão `127.0.0.1:11434` apontará para o contêiner do Render. É preciso hospedar o modelo de IA separadamente ou trocar a integração para uma API externa.

## 8.2 Opção 2 — Google Cloud Run

Site: https://cloud.google.com/run

O Cloud Run executa contêineres e aplicações web. Há uma faixa de uso gratuito mensal em determinadas condições, mas exige configurar um projeto Google Cloud e uma conta de faturamento. Uso acima das cotas pode gerar cobrança.

Passos gerais:

1. Crie um projeto no Google Cloud.
2. Ative a API Cloud Run e os serviços necessários para construir/publicar a aplicação.
3. Configure o faturamento e alertas de orçamento.
4. Instale e configure o Google Cloud CLI: https://cloud.google.com/sdk/docs/install
5. Entre no terminal e autentique:

```bat
gcloud auth login
```

Esse comando abre a autenticação da conta Google no navegador.

Selecione o projeto:

```bat
gcloud config set project ID_DO_SEU_PROJETO
```

Substitua `ID_DO_SEU_PROJETO` pelo ID verdadeiro do projeto. O comando seleciona o projeto que receberá a publicação.

A partir da pasta do Alfredo, publique a aplicação usando o fluxo de deploy por código-fonte do Cloud Run, conforme o assistente oficial. Revise região, memória, CPU, autenticação e limites antes de confirmar.

**Importante:** não execute comandos de deploy sem escolher o projeto e revisar a tela de custos. O Cloud Run pode ser econômico e ter cota gratuita, mas não é uma promessa de hospedagem ilimitada e sem cobrança.

## 8.3 Opção 3 — Vercel (alternativa com funções)

Site: https://vercel.com/

A Vercel oferece plano Hobby gratuito sujeito às condições de uso e limites do plano. É mais voltada a frontend e funções serverless. Um servidor Express tradicional pode precisar de adaptação para funções serverless.

Passos gerais:

1. Crie uma conta.
2. Conecte o GitHub.
3. Importe `Lspbeto/proj003`.
4. Confira as configurações de build e diretórios.
5. Não presuma que o comando `npm start` ficará executando como um servidor permanente.
6. Adapte as rotas de API para o formato de funções da Vercel antes de depender delas.
7. Cadastre segredos nas configurações Environment Variables, nunca no código público.

**Não escolha Vercel como substituição direta do Render sem adaptar e testar o servidor.**

## 8.4 Qual opção escolher?

| Serviço | Tipo | Observação |
|---|---|---|
| Render | Servidor web Node | Mais próximo do modelo atual; plano gratuito pode suspender e tem limites. |
| Google Cloud Run | Contêiner/serviço web | Possui cota gratuita condicionada; exige faturamento configurado e atenção a custos. |
| Vercel | Frontend e funções | Boa alternativa para frontend; servidor Express precisa de adaptação. |

Para começar, mantenha o frontend no GitHub Pages e teste o backend no Render. Se o serviço gratuito não atender, compare Cloud Run e outras opções antes de migrar.

---

# PARTE 9 — BANCO DE DADOS: OPÇÕES GRATUITAS E DIFERENÇAS

## 9.1 Situação atual do Alfredo

O código atual **não utiliza MongoDB, Supabase, Neon ou outro banco de dados**. O histórico fica no navegador. O servidor não possui modelos de dados nem conexão persistente com banco.

Não crie um banco esperando que o Alfredo passe a salvar conversas automaticamente: isso exige desenvolvimento para conectar a aplicação ao banco.

## 9.2 Opção 1 — MongoDB Atlas (M0 gratuito)

Site: https://www.mongodb.com/atlas

MongoDB Atlas é um banco MongoDB hospedado na nuvem. O plano M0 é uma opção gratuita com limites de armazenamento, desempenho e recursos.

Passos gerais:

1. Crie uma conta no MongoDB Atlas.
2. Crie um projeto.
3. Crie um cluster no nível gratuito M0, se disponível.
4. Crie usuário e senha para o banco.
5. Configure o acesso de rede com o menor alcance necessário.
6. Copie a string de conexão.
7. Guarde a string como segredo na hospedagem do backend.

O Alfredo atual ainda não possui integração MongoDB. Para usar Atlas, será preciso adicionar o driver oficial `mongodb` ou o Mongoose, criar a conexão no servidor e implementar as operações de gravação e leitura.

## 9.3 Opção 2 — Supabase (PostgreSQL)

Site: https://supabase.com/

Supabase oferece banco PostgreSQL e serviços adicionais, com plano gratuito limitado.

É uma alternativa, mas não é MongoDB. Para usar, o código deve ser adaptado para PostgreSQL ou para a API/cliente do Supabase. Não basta copiar a URL do Supabase para uma variável `MONGODB_URI`.

## 9.4 Opção 3 — Neon (PostgreSQL)

Site: https://neon.com/

Neon oferece PostgreSQL gerenciado e um plano gratuito com limites. Também exige adaptar o código para banco relacional, pois não é MongoDB.

## 9.5 Comparação de bancos

| Serviço | Tecnologia | Integração com o código atual |
|---|---|---|
| MongoDB Atlas M0 | MongoDB | Exige implementar conexão e persistência; combina com uma futura integração MongoDB. |
| Supabase | PostgreSQL | Exige implementar acesso a PostgreSQL ou API Supabase. |
| Neon | PostgreSQL | Exige implementar acesso a PostgreSQL. |

**Recomendação técnica:** se a intenção for adicionar banco ao Alfredo sem trocar a tecnologia de dados, comece avaliando MongoDB Atlas M0. Se preferir PostgreSQL, Supabase e Neon são alternativas, mas exigem uma implementação diferente.

## 9.6 MongoDB local como alternativa de desenvolvimento

Também é possível instalar MongoDB Community no computador para testes locais:

https://www.mongodb.com/try/download/community

Isso não é hospedagem em nuvem. O banco só fica disponível enquanto o computador e o serviço estiverem ligados, a menos que seja configurada uma infraestrutura própria.

---

# PARTE 10 — SERVIÇO DE IA: OPÇÕES PARA O ALFREDO

O servidor atual foi preparado para Ollama. Para disponibilizar a IA sem depender do notebook ligado, é preciso escolher uma arquitetura.

## 10.1 Opção A — Ollama local

Site: https://ollama.com/

Vantagens:
- Pode executar modelos sem pagar por chamada de API.
- Os dados do prompt podem permanecer no computador local.
- Serve para desenvolvimento e testes.

Limitações:
- O computador precisa ficar ligado.
- O desempenho depende do processador, memória e GPU.
- O GitHub Pages não executa Ollama.

## 10.2 Opção B — Google AI Studio / Gemini API

Site: https://aistudio.google.com/

O Google AI Studio disponibiliza acesso à API Gemini com condições e limites gratuitos para determinados modelos e regiões. Limites, modelos disponíveis e regras de uso podem mudar.

Para integrar:

1. Acesse o AI Studio.
2. Crie uma chave de API.
3. Guarde a chave como variável secreta no backend.
4. Crie no servidor uma rota que envie as mensagens à API Gemini.
5. Faça o frontend chamar somente o backend.
6. Nunca coloque a chave no `public/app.js`, no HTML ou em repositório público.

A chave deve ficar no servidor. Não publique a chave em arquivo JavaScript que o navegador baixa.

## 10.3 Opção C — GroqCloud

Site: https://console.groq.com/

Groq oferece APIs de inferência e pode disponibilizar uso gratuito limitado para desenvolvimento, sujeito a limites e políticas vigentes.

A integração também precisa ser feita no backend. Não coloque a chave no frontend.

## 10.4 Decisão de arquitetura

| Alternativa | Onde a IA executa | Precisa notebook ligado? |
|---|---|---|
| Ollama local | No computador que executa Ollama | Sim, se esse computador for o servidor. |
| Gemini API | Infraestrutura Google | Não. |
| Groq API | Infraestrutura Groq | Não. |

A integração atual não está pronta para Gemini ou Groq. É necessário programar o conector, validar erros e limites, proteger a chave e ligar a interface à rota do servidor.

---

# PARTE 11 — COMO CONFIGURAR VARIÁVEIS DE AMBIENTE NO WINDOWS

O arquivo `.env.example` atual contém:

```env
PORT=3000
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
```

Esses são exemplos de configurações, não senhas.

Como o código atual não carrega `.env` automaticamente, uma forma de configurar variáveis temporárias no CMD é:

```bat
set PORT=3000
set OLLAMA_URL=http://127.0.0.1:11434
set OLLAMA_MODEL=qwen2.5:3b
npm start
```

Explicação:

- `set` define uma variável de ambiente para a janela atual do CMD.
- `PORT` define a porta.
- `OLLAMA_URL` define onde o servidor procura o Ollama.
- `OLLAMA_MODEL` define o modelo.
- `npm start` inicia o servidor com essas configurações.

Essas variáveis temporárias deixam de existir quando a janela é fechada.

No PowerShell, a forma equivalente é:

```powershell
$env:PORT = "3000"
$env:OLLAMA_URL = "http://127.0.0.1:11434"
$env:OLLAMA_MODEL = "qwen2.5:3b"
npm start
```

O prefixo `$env:` define uma variável de ambiente na sessão do PowerShell.

Para produção, cadastre as variáveis na área Environment/Variables do provedor de hospedagem.

---

# PARTE 12 — SEGURANÇA ANTES DE ABRIR A API NA INTERNET

Antes de permitir que qualquer pessoa use uma rota de IA hospedada publicamente, implemente:

1. Autenticação de usuários.
2. Limite de requisições por usuário e por IP.
3. Limite de tamanho das mensagens e documentos.
4. Proteção contra abuso e custos inesperados.
5. Validação de entradas.
6. Registro de erros sem armazenar senhas ou chaves.
7. Política de privacidade e informação sobre envio de conteúdo a provedores de IA.
8. Proteção das chaves de API por variáveis secretas.
9. CORS configurado somente para os endereços autorizados.
10. Limites de tempo e tratamento de indisponibilidade do modelo.

O servidor atual ainda não implementa todas essas proteções. Não o publique como uma API aberta de IA para uso irrestrito.

---

# PARTE 13 — ENVIAR ALTERAÇÕES PARA O GITHUB

Sempre trabalhe dentro da pasta `proj003`.

Confira a situação:

```bat
git status
```

Atualize a cópia local antes de começar, se necessário:

```bat
git pull
```

Depois de editar e testar, veja as diferenças:

```bat
git diff
```

Prepare os arquivos:

```bat
git add .
```

Registre as alterações:

```bat
git commit -m "Descreva a alteração"
```

Envie:

```bat
git push
```

Explicação:
- `git status`: mostra arquivos alterados.
- `git pull`: baixa alterações do GitHub.
- `git diff`: mostra o conteúdo das mudanças.
- `git add .`: prepara os arquivos.
- `git commit -m`: registra a mudança.
- `git push`: envia o registro para o GitHub.

**Nunca envie o arquivo `.env`, chaves de API, senhas ou dados pessoais.** O arquivo `.gitignore` já exclui `.env` e `node_modules`; não remova essa proteção.

---

# PARTE 14 — TESTAR A SINTAXE E A PUBLICAÇÃO

Na pasta principal do repositório, execute:

```bat
node --check server.js
```

Esse comando verifica a sintaxe do servidor sem executá-lo.

Depois:

```bat
node --check public\app.js
```

Esse comando verifica a sintaxe do JavaScript do navegador.

Se os comandos terminarem sem mensagem de erro, a sintaxe dos arquivos passou nessa verificação. Isso não garante que todos os botões e fluxos estejam funcionando; testes no navegador continuam necessários.

No GitHub:

1. Abra a aba **Actions**.
2. Veja a execução **Verificar Alfredo**.
3. Veja a execução **Publicar Alfredo no GitHub Pages**.
4. Confirme que os dois workflows terminaram com sucesso.

---

# PARTE 15 — ROTEIRO RECOMENDADO PARA EVOLUIR O ALFREDO

A ordem abaixo evita contratar serviços antes de o código estar pronto:

1. Manter a versão estática atual funcionando no GitHub Pages.
2. Corrigir a rolagem e testar a ordem das mensagens em celular.
3. Corrigir o cálculo de início da leitura em documentos com parágrafos separados por várias linhas.
4. Ajustar o status da interface para informar corretamente se a IA está conectada.
5. Escolher a IA: Ollama local, Gemini API ou Groq API.
6. Implementar uma rota segura no backend para a IA escolhida.
7. Conectar o frontend à rota do backend.
8. Configurar CORS para o endereço do GitHub Pages.
9. Adicionar autenticação e limites de uso antes de liberar publicamente.
10. Decidir se haverá histórico sincronizado entre aparelhos.
11. Se houver histórico compartilhado, escolher o banco (MongoDB Atlas, Supabase ou Neon) e implementar gravação e leitura.
12. Testar em computador e celular.
13. Publicar o frontend no GitHub Pages e o backend no provedor escolhido.
14. Monitorar erros, limites gratuitos e possíveis cobranças.

---

# PARTE 16 — LINKS OFICIAIS DOS SERVIÇOS

- Git: https://git-scm.com/downloads
- Node.js: https://nodejs.org/
- Visual Studio Code: https://code.visualstudio.com/
- GitHub: https://github.com/
- GitHub Pages: https://docs.github.com/pages
- Render: https://render.com/
- Google Cloud Run: https://cloud.google.com/run
- Vercel: https://vercel.com/
- MongoDB Atlas: https://www.mongodb.com/atlas
- MongoDB Community: https://www.mongodb.com/try/download/community
- Supabase: https://supabase.com/
- Neon: https://neon.com/
- Ollama: https://ollama.com/
- Google AI Studio: https://aistudio.google.com/
- GroqCloud: https://console.groq.com/

**Aviso sobre planos gratuitos:** “gratuito” não significa ilimitado ou permanente. Alguns serviços exigem cartão, têm cotas mensais, suspendem recursos inativos ou cobram quando o consumo excede a franquia. Leia a página oficial de preços e configure alertas de orçamento antes de colocar o aplicativo em produção.

---

# CONCLUSÃO

O Alfredo atual já tem uma interface funcional para leitura de PDFs digitais, leitura em voz alta, entrada por voz compatível, histórico local, modos de uso e pesquisa básica pela Wikipédia.

O repositório também contém um servidor Node/Express preparado para conversar com Ollama local, mas a interface ainda não está ligada a esse servidor. Não existe banco de dados conectado e o histórico ainda não sincroniza entre dispositivos.

Este documento registra a estrutura encontrada e orienta a instalação, os testes, a publicação e as alternativas de hospedagem. Ele não afirma que recursos ainda não implementados estejam funcionando. A próxima etapa técnica mais importante é ligar a interface a um backend protegido e escolher a solução de IA e, se desejado, o banco de dados.


---

# ADENDO — CONDIÇÕES DOS PLANOS GRATUITOS CONFERIDAS NAS PÁGINAS OFICIAIS

Este adendo complementa a seção de hospedagem. Os provedores alteram planos e limites; confirme novamente antes de criar o serviço.

## Render

A documentação oficial informa que serviços web gratuitos podem ser publicados sem pagamento inicial, mas entram em suspensão após 15 minutos sem tráfego e levam algum tempo para voltar quando recebem nova requisição. O plano gratuito de Web Service informa 512 MB de RAM e 0,1 CPU. Isso é adequado para testes pequenos, não para executar um modelo de linguagem pesado no mesmo serviço.

- Guia oficial: https://render.com/docs/your-first-deploy
- Planos: https://render.com/pricing
- Limitações: https://render.com/docs/compute-plans

## MongoDB Atlas Free

A documentação oficial chama a camada gratuita de **Free cluster** (antes chamada M0). Ela oferece até 0,5 GB de armazenamento de dados e tem limites de operações e transferência. O Atlas pode pausar automaticamente clusters gratuitos depois de 30 dias sem conexões. É indicado para aprendizado e protótipos pequenos, não deve ser tratado como armazenamento ilimitado ou substituto de backups.

- Criar cluster gratuito: https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/
- Limites oficiais: https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/

## Supabase Free

A página de preços consultada informa plano Free de US$ 0, com 500 MB de banco de dados, 50.000 usuários ativos mensais e pausa de projetos após uma semana de inatividade. É PostgreSQL, não MongoDB. Confira a página para os demais limites e condições.

- Preços oficiais: https://supabase.com/pricing

## Observação sobre Cloud Run e Vercel

Cloud Run pode ter uma franquia gratuita condicionada ao uso, região e configuração de faturamento; configure alertas e limites de orçamento. Vercel Hobby tem limites próprios e o servidor Express deste projeto não deve ser considerado compatível com implantação tradicional sem adaptação para funções serverless.

- Cloud Run: https://cloud.google.com/run/pricing
- Vercel Hobby: https://vercel.com/docs/plans/hobby

**Recomendação para o Alfredo neste momento:** manter a página estática no GitHub Pages; testar o pequeno servidor Express no Render; usar MongoDB Atlas Free somente depois de implementar a persistência no código. Não hospede Ollama/Qwen no Render gratuito: a memória e CPU gratuitas não são adequadas para isso. Para IA na nuvem, avalie uma API externa com cota gratuita, mantendo a chave exclusivamente no backend.
