# Alfredo — assistente pessoal e professor

Primeira versão de um protótipo multiplataforma, com prioridade para celular. A interface funciona em navegadores modernos e pode ser instalada como PWA.

## Recursos desta versão

- Três modos: Conversar, Professor e Leitura.
- Interface responsiva para celular e computador.
- Importação de PDFs digitais e extração de texto no navegador usando PDF.js.
- Colar texto para leitura ou estudo.
- Leitura em voz alta usando a voz disponível no navegador/sistema, quando houver voz em português brasileiro.
- Entrada por voz nos navegadores compatíveis com Web Speech API.
- Histórico da conversa enquanto a página estiver aberta.
- Integração opcional com Ollama para IA local gratuita.
- Atalho de pesquisa que abre o DuckDuckGo. Para Alfredo analisar uma página, cole o texto ou envie o PDF.

## Executar no Windows 11

Requisitos: Node.js 20 ou superior e Ollama.

1. Instale Node.js em https://nodejs.org/
2. Instale Ollama em https://ollama.com/
3. Abra o PowerShell e execute: `ollama pull qwen2.5:3b`
4. Dentro da pasta do projeto, execute: `npm install`
5. Depois execute: `npm start`
6. No notebook, abra http://localhost:3000

O Ollama precisa estar em execução. Por padrão, o servidor usa http://127.0.0.1:11434 e o modelo qwen2.5:3b. O tamanho e a velocidade dependem da memória e do processador do computador.

## Acessar pelo celular na mesma rede Wi-Fi

1. Conecte notebook e celular à mesma rede Wi-Fi.
2. No PowerShell, execute `ipconfig` e anote o endereço IPv4 do notebook.
3. No celular, abra `http://IP-DO-NOTEBOOK:3000`.
4. Se o Firewall do Windows perguntar, permita o acesso na rede privada.

O acesso pela internet, com o notebook desligado, ainda não está configurado. Não exponha a porta do Ollama diretamente à internet.

## Configurações

- `PORT`: porta web (padrão 3000).
- `OLLAMA_URL`: endereço do Ollama (padrão http://127.0.0.1:11434).
- `OLLAMA_MODEL`: modelo (padrão qwen2.5:3b).

## Próximas etapas e limitações

- Google Drive ainda não conectado: exige OAuth e autorização explícita.
- Acesso a pastas locais é feito por seleção/importação de arquivos; acesso contínuo exigirá um agente local com permissões limitadas.
- PDFs digitalizados como imagem precisam de OCR.
- Leitura de páginas web diretamente por URL e pesquisa integrada com fontes ainda precisam ser desenvolvidas.
- Voz natural avançada depende das vozes instaladas no dispositivo ou de um provedor de voz; a leitura atual usa síntese do navegador.
- O modelo de IA local só responde enquanto o computador/servidor que o executa estiver ligado.
- A conversa fica na memória da página; armazenamento persistente será adicionado depois.

## Privacidade

O PDF é extraído no navegador e enviado ao servidor local apenas quando você pede uma resposta à IA. Esta versão não armazena arquivos em nuvem. Não envie documentos confidenciais para hospedagens públicas sem revisar a configuração.


## Publicação pela internet

Consulte [DEPLOYMENT.md](DEPLOYMENT.md) para criar o serviço no Render e entender as limitações da hospedagem gratuita. A publicação da interface não disponibiliza por si só um modelo de IA: a conexão com IA hospedada ainda precisa ser configurada.
