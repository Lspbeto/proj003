# ALFREDO — MANUAL COMPLETO DE INSTALAÇÃO, CONFIGURAÇÃO E PUBLICAÇÃO

**Repositório:** https://github.com/Lspbeto/proj003  
**Aplicativo publicado:** https://lspbeto.github.io/proj003/  
**Branch analisada:** `main`  
**Revisão da estrutura:** 28/11/2026

Este manual explica como preparar um computador Windows, baixar o Alfredo, entender os arquivos, executar a versão local, configurar os serviços externos e publicar atualizações. Cada comando é explicado em linguagem simples.

> **Leia antes de começar:** o Alfredo tem uma versão estática publicada no GitHub Pages e um servidor Node.js opcional. A versão estática atual não precisa de Render, MongoDB ou notebook ligado para abrir a interface. O servidor Node/Ollama que existe no repositório é uma estrutura separada e, na versão revisada, o navegador ainda não chama essa API para enviar as conversas. Isso é explicado na revisão técnica, mais adiante.

---

# PARTE 1 — ENTENDER COMO O ALFREDO ESTÁ ORGANIZADO

## 1. Os endereços

| Recurso | Endereço | Função |
|---|---|---|
| Código-fonte | https://github.com/Lspbeto/proj003 | Arquivos do Alfredo |
| Aplicativo publicado | https://lspbeto.github.io/proj003/ | Página que abre no navegador |
| GitHub Actions | https://github.com/Lspbeto/proj003/actions | Histórico de verificações e publicações |
| Node.js | https://nodejs.org/ | Programa necessário para executar o servidor |
| Git | https://git-scm.com/downloads | Programa para baixar e enviar código |
| Ollama | https://ollama.com/download | Programa para executar modelos de IA localmente |

O endereço do GitHub Pages publica o conteúdo da pasta `public`, conforme o arquivo `.github/workflows/pages.yml`.

## 2. O que o Alfredo faz hoje

A interface atual contém:

- Três modos: Conversar, Professor e Leitura.
- Abertura de PDFs digitais e extração do texto pelo navegador usando PDF.js.
- Colagem de textos para leitura e estudo.
- Leitura em voz alta com a função de voz do navegador/aparelho.
- Reconhecimento de voz quando o navegador oferece suporte.
- Pesquisa integrada baseada em consulta à Wikipédia em português.
- Histórico local de até 80 mensagens, com data e hora.
- Botão para apagar o histórico local.
- Leitura iniciada ao tocar em um parágrafo do texto.
- Instalação como PWA em navegadores compatíveis e cache básico.

**Limitações atuais confirmadas pelo código:**

- A pesquisa integrada consulta a Wikipédia; não é um mecanismo que lê e resume qualquer página da internet.
- O modo Professor usa regras e trechos do texto para montar explicações e perguntas. Ainda não usa uma IA remota conectada.
- O modo Conversar responde com trechos do documento ou com os resultados da pesquisa integrada. Ainda não é uma conversa livre com um modelo de IA.
- O modo Leitura usa a voz disponível no dispositivo. A naturalidade e as vozes dependem do navegador e do sistema operacional.
- PDFs digitalizados como imagens não têm OCR implementado; o texto não será extraído desses documentos.
- O histórico fica no armazenamento local do navegador. Não sincroniza automaticamente entre celular e computador.
- O PDF.js é carregado por CDN; para abrir PDF é necessário que esse recurso externo esteja acessível.
- A versão do GitHub Pages é estática e não executa o servidor Node nem o Ollama.

## 3. Estrutura real dos arquivos revisados

A estrutura da branch `main` é:

```text
proj003/
|-- .env.example
|-- .gitignore
|-- README.md
|-- DEPLOYMENT.md
|-- package.json
|-- server.js
|-- iniciar-alfredo.bat
|-- index.html
|-- public/
|   |-- index.html
|   |-- app.js
|   |-- styles.css
|   |-- sw.js
|   |-- manifest.webmanifest
|-- .github/
    |-- workflows/
        |-- check.yml
        |-- pages.yml
```

### Para que serve cada arquivo

| Arquivo | Explicação |
|---|---|
| `README.md` | Apresenta a versão publicada, o que funciona e suas limitações. |
| `DEPLOYMENT.md` | Explica a publicação pelo GitHub Pages. |
| `package.json` | Define o nome do projeto, versão, scripts, versão mínima do Node e dependências. |
| `server.js` | Servidor Express opcional. Serve a pasta public e disponibiliza endpoints de saúde e conversa com Ollama. |
| `iniciar-alfredo.bat` | Atalho para Windows: verifica Node, instala dependências se necessário e inicia o servidor local. |
| `.env.example` | Modelo de variáveis de configuração do servidor/Ollama. |
| `.gitignore` | Impede que `node_modules` e `.env` sejam enviados pelo Git. |
| `index.html` | Redireciona para `public/` quando o repositório é servido como uma pasta de projeto. |
| `public/index.html` | Tela HTML principal que o navegador abre. |
| `public/app.js` | Lógica da interface, histórico, leitura, PDF, voz, modos e pesquisa. |
| `public/styles.css` | Aparência e adaptação para celular/computador. |
| `public/sw.js` | Service Worker: cacheia arquivos para ajudar a abrir o aplicativo após a primeira visita. |
| `public/manifest.webmanifest` | Nome, ícone/tema, modo de exibição e endereço inicial da instalação PWA. |
| `.github/workflows/check.yml` | Verifica a sintaxe de `server.js` e `public/app.js` no GitHub Actions. |
| `.github/workflows/pages.yml` | Publica a pasta `public` no GitHub Pages a cada atualização da branch main ou execução manual. |

---

# PARTE 2 — PREPARAR O WINDOWS

## 4. Abrir o terminal

O terminal é uma janela em que digitamos instruções para o computador.

### Abrir o CMD (Prompt de Comando)

1. Pressione **Windows + R** no teclado.
2. Na janela Executar, digite:

```bat
cmd
```

3. Pressione Enter.

Será aberta uma janela preta. Ela é o Prompt de Comando, chamado CMD.

### Abrir o PowerShell

1. Clique no botão Iniciar.
2. Digite `PowerShell`.
3. Abra Windows PowerShell ou Terminal.

Neste manual, os comandos identificados como **CMD** são próprios do Prompt de Comando. Os comandos identificados como **PowerShell** devem ser usados no PowerShell.

## 5. Aprender os comandos básicos

### Entrar no disco C

**CMD ou PowerShell:**

```bat
cd /d C:\
```

Explicação:

- `cd` significa mudar de pasta.
- `/d` permite mudar também de unidade.
- `C:\` representa a raiz do disco C.

Resultado esperado: o terminal passa a mostrar `C:\>`.

### Criar uma pasta

```bat
mkdir Projetos
```

- `mkdir` significa criar uma pasta.
- `Projetos` é o nome da pasta.

### Entrar na pasta

```bat
cd Projetos
```

O comando entra na pasta chamada Projetos.

### Ver os arquivos e pastas

```bat
dir
```

`dir` mostra o conteúdo do local atual.

### Voltar uma pasta

```bat
cd ..
```

Os dois pontos significam voltar para a pasta imediatamente acima.

### Limpar a tela

```bat
cls
```

Limpa somente o que aparece na janela. Não apaga arquivos.

### Abrir uma pasta no Explorador de Arquivos

```bat
explorer .
```

- `explorer` abre o Explorador de Arquivos.
- O ponto significa abrir a pasta atual.

## 6. Instalar Git e Node.js

São dois programas diferentes:

- **Git:** baixa o projeto do GitHub e envia suas alterações.
- **Node.js:** executa o servidor JavaScript do Alfredo.
- **npm:** instala bibliotecas do projeto e executa os scripts. É instalado junto com Node.js.

Baixe e instale:

1. Git: https://git-scm.com/downloads
2. Node.js: https://nodejs.org/ — escolha uma versão LTS compatível com o projeto.

Durante a instalação, mantenha as opções padrão. Depois feche o terminal e abra novamente.

### Verificar Git

```bat
git --version
```

O comando mostra a versão do Git. Deve aparecer algo parecido com `git version 2.x`.

### Verificar Node

```bat
node --version
```

O comando mostra a versão do Node.js. O `package.json` atual declara Node `>=20`.

### Verificar npm

```bat
npm --version
```

O comando mostra a versão do npm.

Se algum deles disser que não é reconhecido, confirme a instalação e abra novamente o terminal.

---

# PARTE 3 — BAIXAR O ALFREDO

## 7. Criar uma pasta para o projeto

No CMD, execute uma linha de cada vez:

```bat
cd /d C:\
mkdir Projetos
cd Projetos
mkdir Alfredo
cd Alfredo
```

Explicação de cada linha:

1. `cd /d C:\`: entra no disco C.
2. `mkdir Projetos`: cria a pasta Projetos.
3. `cd Projetos`: entra nela.
4. `mkdir Alfredo`: cria a pasta Alfredo.
5. `cd Alfredo`: entra na pasta Alfredo.

## 8. Baixar o repositório pelo Git

Digite:

```bat
git clone https://github.com/Lspbeto/proj003.git
```

Explicação:

- `git` chama o programa Git.
- `clone` significa criar uma cópia local do repositório.
- O endereço identifica o repositório proj003.
- O Git cria uma pasta chamada `proj003`.

Entre na pasta:

```bat
cd proj003
```

Confira os arquivos:

```bat
dir
```

Você deverá ver arquivos como `package.json`, `server.js`, `README.md` e a pasta `public`.

**Se o Git informar que a pasta já existe:** não repita o clone dentro dela. Entre na pasta existente e use `git pull` para atualizar, depois de conferir que não há alterações locais que precisam ser preservadas.

## 9. Atualizar uma cópia que já existe

Se você já baixou o Alfredo anteriormente, entre na pasta do projeto:

```bat
cd /d C:\Projetos\Alfredo\proj003
```

Confira o estado:

```bat
git status
```

- `git status` mostra se você alterou algum arquivo localmente.

Se não houver alterações locais pendentes, atualize:

```bat
git pull
```

- `git pull` baixa e integra as atualizações do GitHub na cópia local.

Se houver alterações locais, não descarte nada automaticamente. Faça uma cópia de segurança ou revise as alterações antes de atualizar.

---

# PARTE 4 — EXECUTAR O ALFREDO NO COMPUTADOR

## 10. Instalar as dependências

Entre na pasta que contém o `package.json`:

```bat
cd /d C:\Projetos\Alfredo\proj003
```

Confira se o arquivo existe:

```bat
dir package.json
```

Instale as dependências:

```bat
npm install
```

Explicação:

- `npm` é o gerenciador de pacotes.
- `install` manda instalar as bibliotecas listadas no package.json.
- O projeto atual usa Express, uma biblioteca para criar o servidor HTTP.
- O npm cria a pasta `node_modules`.

Aguarde a instalação terminar. Não feche a janela enquanto o comando estiver executando.

## 11. Iniciar pelo arquivo de atalho

O repositório contém o arquivo `iniciar-alfredo.bat`.

No Explorador de Arquivos, abra a pasta `proj003` e dê dois cliques em `iniciar-alfredo.bat`.

O que esse arquivo faz:

1. Desliga a exibição de cada comando com `@echo off`.
2. Dá o título “Alfredo - Assistente pessoal” à janela.
3. Entra automaticamente na pasta onde o arquivo .bat está salvo.
4. Verifica se o comando `node` existe.
5. Se não existir, mostra o endereço do instalador do Node.js.
6. Se a pasta `node_modules` não existir, executa `npm install`.
7. Executa `npm start`.
8. Mantém a janela aberta com `pause` para mostrar mensagens.

### Iniciar manualmente pelo terminal

Na pasta do projeto, digite:

```bat
npm start
```

O script `start` definido no package.json executa:

```bat
node server.js
```

O terminal deve mostrar uma mensagem semelhante a:

```text
Alfredo disponível em http://localhost:3000
```

Abra o navegador e acesse:

http://localhost:3000

**Não feche a janela do terminal enquanto estiver usando o servidor.** Para parar, volte à janela e pressione Ctrl + C.

## 12. Abrir o Alfredo no celular pela rede Wi-Fi local

Esse procedimento só funciona quando o computador e o celular estão conectados à mesma rede Wi-Fi.

1. No computador, mantenha o servidor iniciado.
2. Abra uma segunda janela do CMD.
3. Digite:

```bat
ipconfig
```

- `ipconfig` mostra as configurações de rede do Windows.
- Procure o adaptador Wi-Fi.
- Localize o campo **Endereço IPv4**. Ele costuma ter formato semelhante a `192.168.1.25`, mas use o número que aparecer no seu computador.

No navegador do celular, digite o endereço IP encontrado seguido de `:3000`.

Exemplo ilustrativo:

```text
http://192.168.1.25:3000
```

Troque o IP do exemplo pelo IP real do seu computador.

Se não abrir:

- Confirme que os dois aparelhos estão na mesma rede Wi-Fi.
- Confirme que o terminal ainda está mostrando o servidor ativo.
- Autorize o Node.js no Firewall do Windows somente para redes privadas confiáveis, se o Windows perguntar.
- Não exponha a porta do computador diretamente na internet.

---

# PARTE 5 — ENTENDER O SERVIDOR E O OLLAMA

## 13. O que existe no servidor.js

O arquivo `server.js` contém:

- Importação do Express e do módulo path.
- Definição da porta pelo ambiente ou pela porta 3000.
- Definição do endereço do Ollama e do nome do modelo.
- Middleware para interpretar JSON com limite de 12 MB.
- Servimento dos arquivos estáticos da pasta public.
- Rota `GET /api/health`, que verifica se o Ollama responde.
- Rota `POST /api/chat`, que envia mensagens ao Ollama.
- Rota final que devolve a página principal.
- Inicialização do servidor ouvindo em `0.0.0.0`.

### Verificar o servidor

Com o servidor ativo, abra outro terminal ou outra aba do navegador e acesse:

```text
http://localhost:3000/api/health
```

A resposta JSON deve informar `ok` e o estado de conexão do Ollama. Se `ollama` vier como falso, o servidor web está ativo, mas não conseguiu alcançar o Ollama.

## 14. Ollama: executar IA no próprio computador

O Ollama permite baixar e executar modelos de linguagem no computador. O modelo não fica hospedado no GitHub Pages.

1. Instale o Ollama: https://ollama.com/download
2. Abra o aplicativo Ollama.
3. Abra o CMD ou PowerShell.
4. Baixe o modelo que o arquivo .env.example sugere:

```bat
ollama pull qwen2.5:3b
```

- `ollama` chama o programa.
- `pull` baixa o modelo.
- `qwen2.5:3b` é o nome do modelo configurado como padrão no exemplo.

Para conversar no terminal e confirmar que o modelo foi instalado:

```bat
ollama run qwen2.5:3b
```

Para sair da conversa do Ollama, use `/bye`.

### Configuração do servidor

O arquivo `.env.example` contém:

```env
PORT=3000
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
```

O arquivo `.env.example` é um modelo. Para criar sua configuração local, no CMD:

```bat
copy .env.example .env
```

Para editar:

```bat
notepad .env
```

Explicação:

- `copy` faz uma cópia.
- `.env.example` é o modelo público.
- `.env` será a configuração privada.
- `notepad` abre o Bloco de Notas.

O servidor atual usa `process.env`, mas não carrega explicitamente o arquivo .env por meio de uma biblioteca como dotenv. Portanto, criar o arquivo .env sozinho não garante que o Node carregue essas variáveis. No Windows, para testar sem modificar o código, pode definir as variáveis na janela PowerShell antes de iniciar o Node:

**PowerShell:**

```powershell
$env:PORT="3000"
$env:OLLAMA_URL="http://127.0.0.1:11434"
$env:OLLAMA_MODEL="qwen2.5:3b"
npm start
```

Cada linha define uma variável apenas para aquela sessão do PowerShell e depois inicia o servidor. Fechar a janela encerra essas variáveis de sessão.

**Importante:** a interface atual `public/app.js` não faz chamadas a `/api/chat`. Instalar o Ollama e iniciar o servidor não transforma automaticamente os modos da interface em uma conversa com IA. A ligação entre a interface e a API precisa ser implementada e testada antes de anunciar essa função como ativa.

---

# PARTE 6 — PUBLICAR NO GITHUB PAGES

## 15. Como a publicação funciona

O GitHub Pages hospeda os arquivos estáticos do Alfredo. O workflow `.github/workflows/pages.yml`:

1. Baixa o repositório.
2. Configura o GitHub Pages.
3. Prepara como artefato somente a pasta `public`.
4. Publica o artefato no GitHub Pages.

O workflow é executado quando há push na branch `main` ou quando alguém o inicia manualmente.

### Conferir a configuração do Pages

1. Abra https://github.com/Lspbeto/proj003
2. Entre em **Settings**.
3. Abra **Pages**.
4. Em **Build and deployment**, confirme **GitHub Actions** como Source.
5. Abra a aba **Actions** e acompanhe “Publicar Alfredo no GitHub Pages”.

Quando o workflow terminar com sucesso, abra:

https://lspbeto.github.io/proj003/

### Fazer uma atualização no site

Primeiro entre na pasta local:

```bat
cd /d C:\Projetos\Alfredo\proj003
```

Confira as mudanças:

```bat
git status
```

Veja as diferenças dos arquivos:

```bat
git diff
```

- `git diff` mostra o que foi alterado em relação à versão registrada.

Prepare as alterações:

```bat
git add .
```

- `git add .` prepara todas as alterações da pasta atual.
- Antes de usar, confirme que não está adicionando segredos, senhas ou arquivos privados.

Registre a alteração:

```bat
git commit -m "Atualiza o Alfredo"
```

- `git commit` cria um registro local.
- `-m` permite escrever a descrição do registro.

Envie ao GitHub:

```bat
git push
```

- `git push` envia os commits à branch remota configurada.

Depois abra a aba Actions. Aguarde o workflow de publicação terminar. Atualize a página no navegador. Se o celular mostrar uma versão antiga, feche e reabra o aplicativo ou limpe os dados/cache do site. O Service Worker mantém arquivos em cache.

---

# PARTE 7 — HOSPEDAR O SERVIDOR EM OUTRO SERVIÇO

## 16. Antes de escolher: o que pode e o que não pode ir para a nuvem

- **GitHub Pages:** hospeda HTML, CSS e JavaScript. Não executa Node.js nem Ollama.
- **Render:** pode executar o servidor Node.js. O plano gratuito pode dormir quando fica sem acesso.
- **Google Cloud Run:** executa contêineres e tem uma faixa mensal gratuita, mas exige conta de faturamento e pode cobrar se o uso exceder os limites.
- **Ollama local:** executa o modelo no computador do usuário. O servidor na nuvem não consegue acessar o Ollama que está instalado em outro computador pela URL local `127.0.0.1`.

Para colocar uma IA na nuvem, é necessário escolher entre:
1. Manter o Ollama no seu próprio computador e usar o Alfredo localmente.
2. Configurar um provedor de IA por API, como Google Gemini, mantendo a chave somente no backend.
3. Hospedar um modelo em uma máquina/serviço com recursos suficientes. Isso normalmente deixa de ser gratuito quando precisa de memória e processamento maiores.

**Não publique uma chave de IA no arquivo JavaScript do navegador ou em um repositório público.**

## 17. Opção A — Render (mais simples para começar)

Site: https://render.com/

O Render oferece hospedagem gratuita para alguns serviços web, mas a instância gratuita pode desligar após 15 minutos sem tráfego e leva aproximadamente um minuto para acordar. O sistema de arquivos local é temporário. Não use o disco do serviço gratuito para guardar conversas ou arquivos importantes. Consulte os limites antes de publicar. Fonte oficial: https://render.com/docs/free

### Preparar o repositório

O Alfredo já tem:

- `package.json`
- `server.js`
- `public/`
- script `start` que executa `node server.js`

Isso é suficiente para iniciar a aplicação Node no Render.

### Criar o serviço

1. Entre em https://render.com/.
2. Crie sua conta ou entre.
3. Escolha **New → Web Service**.
4. Conecte sua conta GitHub.
5. Selecione o repositório `Lspbeto/proj003`.
6. Configure a branch `main`.
7. Em **Root Directory**, deixe vazio, pois o `package.json` está na raiz.
8. Em **Build Command**, informe:

```text
npm install
```

9. Em **Start Command**, informe:

```text
npm start
```

10. Escolha o plano Free, se estiver disponível para sua conta/região.
11. Clique para criar o serviço e aguarde o deploy.

O Render define a variável `PORT` para o serviço. O código já usa `process.env.PORT`.

### Conferir a publicação

Quando o Render mostrar a URL pública do serviço, abra:

```text
https://SEU-SERVICO.onrender.com/api/health
```

Substitua `SEU-SERVICO` pelo nome real que o Render forneceu.

**Limitação importante:** o endpoint de saúde verifica o Ollama configurado em `OLLAMA_URL`. Se o Ollama não estiver instalado no mesmo ambiente de nuvem, o status `ollama` será falso. O Render gratuito não é adequado para hospedar um modelo Ollama grande junto com a aplicação. A interface publicada também ainda precisa ser ligada à API.

## 18. Opção B — Google Cloud Run (alternativa ao Render)

Site: https://cloud.google.com/run

O Cloud Run executa aplicações em contêineres. A tabela oficial inclui uma faixa gratuita mensal para CPU, memória e requisições em determinadas regiões e configurações. É necessário configurar uma conta de faturamento; uso além da franquia pode gerar cobrança. Fonte oficial: https://cloud.google.com/run/pricing

Esta opção exige um pouco mais de configuração que o Render.

### Etapa 1 — Instalar Docker Desktop

1. Baixe em https://www.docker.com/products/docker-desktop/.
2. Instale o Docker Desktop para Windows.
3. Reinicie o computador se o instalador solicitar.
4. Abra Docker Desktop e aguarde ficar pronto.

Confira pelo terminal:

```bat
docker --version
```

O comando mostra a versão do Docker.

### Etapa 2 — Criar o Dockerfile

Na pasta `proj003`, abra o Bloco de Notas:

```bat
notepad Dockerfile
```

Se o Windows perguntar se deseja criar um arquivo novo, confirme.

Cole o conteúdo:

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
ENV NODE_ENV=production
CMD ["npm", "start"]
```

Salve como `Dockerfile` sem extensão .txt. No Bloco de Notas, escolha “Todos os arquivos” no tipo de arquivo para evitar que o Windows crie `Dockerfile.txt`.

Explicação:

- `FROM`: escolhe uma imagem base com Node 20.
- `WORKDIR`: define a pasta de trabalho dentro do contêiner.
- `COPY package*.json ./`: copia os arquivos de dependências.
- `RUN npm install --omit=dev`: instala somente dependências necessárias para execução.
- `COPY . .`: copia os demais arquivos do projeto.
- `ENV`: define o ambiente como produção.
- `CMD`: inicia o servidor.

### Etapa 3 — Criar e testar a imagem local

Na pasta do projeto:

```bat
docker build -t alfredo .
```

- `docker build` constrói a imagem.
- `-t alfredo` dá o nome alfredo à imagem.
- O ponto indica que o Dockerfile e os arquivos estão na pasta atual.

Executar localmente:

```bat
docker run --rm -p 8080:3000 alfredo
```

- `docker run` inicia um contêiner.
- `--rm` remove o contêiner quando ele parar.
- `-p 8080:3000` liga a porta 8080 do computador à porta 3000 do contêiner.
- `alfredo` é a imagem que será executada.

Abra http://localhost:8080.

Para parar, pressione Ctrl + C no terminal.

### Etapa 4 — Instalar Google Cloud CLI

Instruções oficiais: https://cloud.google.com/sdk/docs/install

Depois de instalar, abra um novo terminal e execute:

```bat
gcloud --version
```

Isso confirma que o Google Cloud CLI está disponível.

### Etapa 5 — Entrar na conta e selecionar o projeto

```bat
gcloud auth login
```

Abre o fluxo de autenticação Google no navegador.

```bat
gcloud config set project ID_DO_SEU_PROJETO
```

Substitua `ID_DO_SEU_PROJETO` pelo identificador real do projeto Google Cloud.

### Etapa 6 — Publicar no Cloud Run

```bat
gcloud run deploy alfredo --source . --region southamerica-east1 --allow-unauthenticated
```

Explicação:

- `gcloud run deploy`: solicita a publicação no Cloud Run.
- `alfredo`: nome do serviço.
- `--source .`: usa os arquivos da pasta atual para construir a aplicação.
- `--region southamerica-east1`: seleciona a região de São Paulo.
- `--allow-unauthenticated`: permite acesso público ao site/API.

**Segurança:** só use acesso público depois de proteger endpoints que executam IA. A rota `/api/chat` atual não tem autenticação nem limitação de uso. Se ficar aberta na internet, terceiros podem consumir recursos. Não publique o endpoint de IA sem proteção.

O Cloud Run exibirá a URL do serviço ao terminar.

### Observação sobre a IA

O contêiner não leva o modelo Ollama instalado no computador para a nuvem. A variável `OLLAMA_URL=http://127.0.0.1:11434` dentro do contêiner aponta para o próprio contêiner, não para seu notebook. Para IA na nuvem, integre um provedor de IA por API ou configure infraestrutura de modelo própria.

---

# PARTE 8 — BANCO DE DADOS E ARMAZENAMENTO

## 19. O Alfredo usa MongoDB hoje?

**Não.** Na revisão do código atual, não encontrei biblioteca MongoDB, conexão com banco ou modelos de dados. O histórico é guardado no `localStorage` do navegador. O arquivo `.env.example` contém somente PORT e variáveis do Ollama.

Portanto, criar um banco MongoDB hoje não fará o histórico aparecer em outros aparelhos. Para isso, será necessário desenvolver uma API de persistência, criar contas/identificação de usuário e gravar/consultar as mensagens no banco.

## 20. Opção de banco A — MongoDB Atlas M0 gratuito

Site: https://www.mongodb.com/atlas

O MongoDB Atlas oferece cluster Free (M0) para desenvolvimento e pequenos projetos. A documentação oficial informa que o cluster gratuito não expira, embora tenha limites de capacidade e recursos. Consulte os limites atuais antes de usar. Fonte: https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/

### Criar o banco pelo painel

1. Entre no MongoDB Atlas.
2. Crie uma conta ou entre.
3. Crie um projeto.
4. Escolha criar um cluster e selecione a opção Free/M0.
5. Escolha um provedor e uma região disponíveis.
6. Crie um usuário de banco com senha.
7. Adicione o endereço IP autorizado na lista de acesso.
8. Copie a string de conexão fornecida pelo Atlas.

A string terá um formato semelhante a:

```text
mongodb+srv://USUARIO:SENHA@cluster.exemplo.mongodb.net/alfredo
```

Troque os dados ilustrativos pelos dados reais do Atlas. Não publique essa string.

### Comando para guardar a conexão local

Quando o código do Alfredo for atualizado para usar MongoDB e receber a variável `MONGODB_URI`, a configuração poderá ser guardada no arquivo `.env`. Hoje essa variável ainda não é lida pelo servidor atual.

No CMD, para criar uma cópia do modelo:

```bat
copy .env.example .env
notepad .env
```

A linha de conexão, quando o código for preparado para usá-la, terá este formato:

```env
MONGODB_URI=mongodb+srv://USUARIO:SENHA@SEU_CLUSTER.mongodb.net/alfredo
```

**Não adianta apenas acrescentar a linha:** é necessário instalar um driver, conectar no servidor e programar as operações de salvar e carregar mensagens.

## 21. Opção de banco B — Supabase (PostgreSQL)

Site: https://supabase.com/

O Supabase oferece banco PostgreSQL no plano Free, com limites de armazenamento e projetos. A página oficial informa 500 MB de banco por projeto e pausa projetos gratuitos após uma semana de inatividade. Confira a página de preços porque os limites podem mudar. Fonte: https://supabase.com/pricing

Supabase usa PostgreSQL, não MongoDB. Não é uma troca direta: o código do Alfredo teria de ser programado para usar tabelas SQL.

Passos gerais:

1. Crie uma conta no Supabase.
2. Crie um projeto.
3. Guarde a senha do banco em local seguro.
4. Abra o SQL Editor.
5. Crie tabelas para usuários, conversas e mensagens quando a função de histórico em nuvem for desenvolvida.
6. Copie a URL de conexão ou as credenciais indicadas pelo painel.
7. Guarde as credenciais somente no backend, nunca no JavaScript público.

## 22. Opção de banco C — Neon (PostgreSQL)

Site: https://neon.com/

O Neon oferece PostgreSQL com plano gratuito e suspensão automática de recursos inativos. Limites de armazenamento, horas de computação e tráfego são definidos no plano e podem mudar. Consulte: https://neon.com/pricing

Passos gerais:

1. Crie uma conta.
2. Crie um projeto PostgreSQL.
3. Copie a string de conexão.
4. Guarde-a em uma variável privada do backend.
5. Programe a API do Alfredo para criar e consultar registros.

Neon também é PostgreSQL, não MongoDB. Exige alteração do código para usar banco relacional.

### Comparação rápida

| Serviço | Tipo | Plano gratuito | Atenção |
|---|---|---|---|
| MongoDB Atlas M0 | MongoDB | Sim, cluster Free | Pequena capacidade e recursos limitados. |
| Supabase | PostgreSQL | Sim | Projetos gratuitos podem pausar por inatividade. |
| Neon | PostgreSQL | Sim | Computação escala a zero e há limites mensais. |

**Recomendação técnica:** se a intenção for manter MongoDB, comece avaliando o Atlas M0. Se preferir tabelas SQL e autenticação/serviços integrados, avalie Supabase. Não contrate nem configure um banco antes de decidir como o Alfredo salvará conversas e documentos.

---

# PARTE 9 — SERVIÇOS DE IA COM FRANQUIA GRATUITA

## 23. Google Gemini API

Site: https://aistudio.google.com/  
Preços e limites: https://ai.google.dev/gemini-api/docs/pricing

O Google oferece uma faixa gratuita para determinados modelos e limites. A disponibilidade, os limites por minuto/dia e os modelos incluídos podem mudar. Na faixa gratuita, os dados enviados podem ser usados conforme os termos do serviço; leia as condições antes de enviar conteúdo privado. Fonte oficial: https://ai.google.dev/gemini-api/docs/pricing

Para usar no Alfredo seria necessário:

1. Criar uma chave no Google AI Studio.
2. Guardar a chave em uma variável privada do backend.
3. Criar no servidor uma rota que envie mensagens para a API Gemini.
4. Fazer o frontend chamar a rota do seu próprio servidor.
5. Tratar limites, erros e indisponibilidade.

**Nunca coloque a chave Gemini em `public/app.js`.** Qualquer visitante poderia visualizar a chave.

## 24. Ollama local

Ollama é uma alternativa sem cobrança por chamada de API, pois o modelo roda no computador do usuário. Porém, usa memória, processamento e espaço em disco do computador. Não é hospedagem gratuita na internet e não funciona automaticamente para todos os celulares.

Documentação: https://ollama.com/

## 25. Escolher a opção para o Alfredo

| Objetivo | Opção a avaliar |
|---|---|
| Publicar somente a interface | GitHub Pages (já configurado) |
| Hospedar Node de forma simples para teste | Render Free |
| Hospedar Node em contêiner com franquia mensal | Google Cloud Run |
| Usar banco MongoDB | MongoDB Atlas M0 |
| Usar banco PostgreSQL integrado | Supabase |
| Usar PostgreSQL com escala a zero | Neon |
| IA sem API remota, no computador | Ollama |
| IA por API com faixa gratuita | Gemini API |

Os planos gratuitos não significam serviço ilimitado nem garantia de funcionamento permanente. Confira sempre os limites, os termos de uso, a região e a política de cobrança antes de cadastrar cartão ou publicar uma aplicação acessível ao público.

---

# PARTE 10 — REVISÃO TÉCNICA DO CÓDIGO ATUAL

## 26. Resultado da revisão dos arquivos

Foram lidos os arquivos da branch main: arquivos de configuração, documentação, servidor, script de inicialização, HTML, JavaScript, CSS, Service Worker, manifesto e workflows do GitHub Actions.

### Pontos positivos encontrados

- A interface separa HTML, CSS e JavaScript.
- O conteúdo publicado fica na pasta `public`.
- O GitHub Pages usa GitHub Actions para publicar a pasta correta.
- O histórico local guarda data e hora de cada mensagem.
- O histórico é limitado às últimas 80 mensagens.
- Há confirmação antes de apagar o histórico.
- O texto das mensagens é inserido com `textContent`, evitando interpretar o conteúdo como HTML.
- Há tratamento de falha para leitura de PDF, voz e pesquisa.
- O servidor usa a porta fornecida pelo ambiente, o que é adequado para plataformas de hospedagem.
- O script de Windows verifica Node e instala dependências se necessário.
- O arquivo `.gitignore` exclui `.env` e `node_modules`.

### Pontos que precisam de atenção

**1. O frontend não chama a API de IA**

O servidor possui `POST /api/chat`, mas o arquivo `public/app.js` não faz uma chamada a esse endpoint. Portanto, a conversa com Ollama não está conectada à interface.

**2. O servidor não carrega automaticamente o arquivo .env**

O servidor usa `process.env`, mas não importa a biblioteca `dotenv`. O arquivo `.env.example` serve como modelo, mas criar `.env` não faz as variáveis serem carregadas automaticamente no Node atual. É necessário configurar as variáveis no ambiente ou implementar o carregamento apropriado.

**3. Não existe banco de dados no código atual**

Não há driver, conexão, modelos ou rotas para MongoDB/Supabase/Neon. O histórico permanece no armazenamento local do navegador.

**4. A rota de IA não tem autenticação nem limite de uso**

Se o endpoint for publicado e ficar aberto, qualquer pessoa que descubra a URL poderá tentar usá-lo. Antes de disponibilizar IA publicamente, implementar autenticação, controle de requisições, limites de tamanho, proteção contra abuso e política de privacidade.

**5. CORS precisa ser considerado quando frontend e backend estiverem em domínios diferentes**

O servidor atual não configura CORS. Se o site GitHub Pages chamar uma API hospedada em outro domínio, o navegador pode bloquear a chamada. A API deverá permitir explicitamente a origem legítima do site.

**6. A URL local do Ollama não é endereço de nuvem**

`127.0.0.1` significa o próprio computador/contêiner onde o processo está executando. Quando o servidor é hospedado no Render ou Cloud Run, esse endereço não aponta para o notebook do usuário.

**7. O modo Professor ainda é baseado em regras simples**

O código seleciona parágrafos e procura palavras. Não é uma avaliação semântica feita por IA; a comparação de respostas é aproximada.

**8. A pesquisa integrada é limitada**

A pesquisa consulta a API da Wikipédia em português. Não é pesquisa universal na web e não lê automaticamente páginas de outros sites.

**9. PWA e cache**

O Service Worker usa estratégia de cache que pode mostrar arquivos antigos até a atualização ser aplicada. Ao mudar arquivos da interface, atualize a identificação do cache em `public/sw.js` para forçar a substituição do cache anterior.

**10. Testes automatizados são básicos**

O workflow `check.yml` verifica sintaxe do servidor e do JavaScript principal. Não testa os fluxos reais de PDF, voz, pesquisa, layout em celular, conexão com IA ou persistência.

**11. Manifesto sem ícones declarados**

O manifesto atual não declara ícones 192x192 e 512x512. A instalação PWA pode ter apresentação ou suporte diferente entre navegadores. Para uma experiência de instalação mais completa, incluir ícones nos tamanhos e formatos recomendados.

**12. PDF e serviços externos**

O PDF.js é carregado de um CDN externo. Se a conexão com esse domínio falhar, a leitura de PDF não estará disponível. PDFs que sejam somente imagens ainda precisam de OCR.

## 27. O que não foi alterado nesta revisão

Este documento registra a revisão técnica e explica como configurar o projeto. Não alterei a lógica do aplicativo, não conectei uma API de IA, não criei banco de dados e não cadastrei serviços externos. Essas tarefas exigem decisões de arquitetura e credenciais privadas. O objetivo foi não publicar uma promessa de funcionalidade que o código atual ainda não entrega.

---

# PARTE 11 — COMANDOS ÚTEIS E SOLUÇÃO DE PROBLEMAS

## 28. Lista de comandos do dia a dia

| Comando | O que faz |
|---|---|
| `cd /d C:\` | Vai para a raiz do disco C. |
| `mkdir Alfredo` | Cria uma pasta Alfredo. |
| `cd Alfredo` | Entra na pasta Alfredo. |
| `cd ..` | Volta uma pasta. |
| `dir` | Lista arquivos e pastas. |
| `cls` | Limpa a tela do terminal. |
| `explorer .` | Abre a pasta atual no Explorador. |
| `git clone URL` | Baixa uma cópia do repositório. |
| `git status` | Mostra alterações locais. |
| `git pull` | Baixa atualizações do repositório remoto. |
| `git diff` | Mostra diferenças nos arquivos. |
| `git add .` | Prepara alterações para commit. |
| `git commit -m "mensagem"` | Registra alterações localmente. |
| `git push` | Envia commits ao GitHub. |
| `node --version` | Mostra versão do Node. |
| `npm --version` | Mostra versão do npm. |
| `npm install` | Instala dependências. |
| `npm start` | Inicia o servidor do Alfredo. |
| `npm run dev` | Inicia o script de desenvolvimento com Node watch. |
| `node --check server.js` | Verifica a sintaxe do servidor. |
| `node --check public\app.js` | Verifica a sintaxe do JavaScript do navegador. |
| `ipconfig` | Mostra dados da rede do computador. |
| `ollama pull qwen2.5:3b` | Baixa o modelo indicado. |
| `ollama run qwen2.5:3b` | Abre uma conversa local com o modelo. |

## 29. Erros comuns

### 'git' não é reconhecido

Instale Git, feche o terminal e abra novamente. Teste `git --version`.

### 'node' não é reconhecido

Instale Node.js LTS, feche o terminal e abra novamente. Teste `node --version`.

### 'Cannot find module express'

Entre na pasta que contém `package.json` e execute:

```bat
npm install
```

### Porta 3000 já está em uso

Outro programa pode estar usando a porta 3000. Feche o outro servidor ou defina outra porta antes de iniciar o Alfredo.

No PowerShell:

```powershell
$env:PORT="3001"
npm start
```

Nesse caso, abra http://localhost:3001.

### O Alfredo abre, mas a IA não responde

A interface atual não está conectada ao endpoint `/api/chat`. Verifique também se o Ollama está instalado, aberto e com o modelo baixado. A rota de IA precisa ser integrada ao frontend antes de funcionar como conversa inteligente.

### O PDF não abre

Verifique a internet, pois o PDF.js vem de CDN. Confirme que o arquivo é um PDF válido. Se for um documento escaneado como imagem, será necessário OCR, que não está implementado.

### A pesquisa não encontra resultados

A pesquisa integrada usa a API da Wikipédia. Verifique a internet, tente outro termo e lembre-se de que nem todo assunto tem resultado nessa fonte.

### O site mostra uma versão antiga

O Service Worker pode estar servindo cache anterior. Atualize a página, feche e abra novamente. Se persistir, limpe os dados do site no navegador.

### Git não permite enviar alterações

Execute `git status` e leia a mensagem. Pode ser necessário atualizar a cópia com `git pull` e resolver conflitos. Evite `git push --force`, pois pode apagar trabalho que já está no GitHub.

---

# PARTE 12 — SEGURANÇA E BOAS PRÁTICAS

1. Nunca coloque senhas, chaves de API ou tokens no repositório público.
2. Não coloque chaves secretas em `public/app.js`, `public/index.html` ou qualquer arquivo que o navegador baixa.
3. Mantenha segredos nas variáveis de ambiente do serviço de hospedagem.
4. Não use dados pessoais ou documentos sigilosos para testar serviços externos sem avaliar a política de privacidade.
5. Faça cópias de segurança antes de alterar ou migrar dados.
6. Não exponha o Ollama local diretamente à internet.
7. Proteja endpoints de IA com autenticação, limites e validação antes de abrir acesso público.
8. Confirme limites de cobrança dos serviços de nuvem.
9. Use o GitHub Actions para conferir a publicação.
10. Faça alterações pequenas e teste cada uma antes de publicar.

## 30. Sequência recomendada para começar

Para quem está começando, a ordem mais segura é:

1. Instalar Git e Node.js no Windows.
2. Baixar o repositório `Lspbeto/proj003`.
3. Executar `npm install`.
4. Executar `npm start`.
5. Abrir http://localhost:3000.
6. Testar abrir PDF, colar texto, leitura em voz alta, pesquisa e histórico.
7. Se quiser experimentar IA local, instalar Ollama e baixar o modelo.
8. Escolher se o servidor ficará local ou será publicado no Render/Cloud Run.
9. Somente depois decidir se precisa de MongoDB, Supabase ou Neon.
10. Para publicar mudanças, usar `git status`, `git diff`, `git add .`, `git commit` e `git push`.
11. Conferir a aba Actions e o endereço GitHub Pages.

---

## FONTES OFICIAIS E LINKS DE CONFIGURAÇÃO

- GitHub do Alfredo: https://github.com/Lspbeto/proj003
- Aplicativo: https://lspbeto.github.io/proj003/
- Git: https://git-scm.com/downloads
- Node.js: https://nodejs.org/
- Ollama: https://ollama.com/
- Render — plano gratuito e limitações: https://render.com/docs/free
- Google Cloud Run — preços e franquia gratuita: https://cloud.google.com/run/pricing
- MongoDB Atlas — cluster gratuito: https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/
- Supabase — preços e limites: https://supabase.com/pricing
- Neon — preços e limites: https://neon.com/pricing
- Google Gemini API — preços e modelos gratuitos: https://ai.google.dev/gemini-api/docs/pricing
- Docker Desktop: https://www.docker.com/products/docker-desktop/
- Google Cloud CLI: https://cloud.google.com/sdk/docs/install

**Data desta revisão:** 28/11/2026. Planos gratuitos, cotas, modelos e limites de fornecedores mudam. Confirme sempre a página oficial antes de cadastrar forma de pagamento ou colocar o aplicativo em uso público.

**Conclusão:** o Alfredo já tem uma interface estática publicada e um servidor Node/Ollama opcional no repositório. Para transformar o aplicativo em um assistente de IA completo, o próximo trabalho técnico é conectar o frontend à API, escolher um provedor de IA (Ollama local ou API remota), proteger a API e decidir se o histórico continuará local ou será armazenado em banco.
