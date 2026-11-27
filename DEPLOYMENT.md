# Publicar o Alfredo na internet

Este repositório já contém um arquivo `render.yaml` para facilitar a criação de um serviço web no Render.

## Atenção antes de publicar

O Render pode hospedar a interface e o servidor web, mas **não executa automaticamente o Ollama nem instala o modelo de IA**. Portanto, com a configuração atual, a página poderá abrir na internet, mas a conversa com IA ficará indisponível até conectarmos um provedor de IA compatível ou um servidor privado seguro.

O plano gratuito do Render também pode suspender o serviço após períodos sem uso e tem limites de recursos. Não é uma garantia de disponibilidade permanente.

## Criar o serviço

1. Entre em https://render.com/ e conecte sua conta GitHub.
2. Escolha criar um serviço do tipo Blueprint.
3. Selecione o repositório `Lspbeto/proj003`.
4. O Render identificará o arquivo `render.yaml`.
5. Confira as configurações antes de confirmar a criação.

O serviço usa Node, executa `npm install` e inicia com `npm start`.

## Variáveis

O arquivo `.env.example` é apenas um modelo para execução local. Não coloque senhas, chaves privadas ou tokens no GitHub. Segredos devem ser cadastrados no painel do serviço de hospedagem.

## Como ficará o acesso pelo celular

Depois que o serviço estiver publicado, o Render fornecerá um endereço HTTPS. Esse endereço poderá ser aberto no Android ou iPhone pelo navegador. A interface é responsiva e possui manifesto PWA, permitindo adicionar um atalho à tela inicial.

## Próxima etapa técnica necessária para IA online

Precisamos escolher e integrar um serviço de IA com camada gratuita ou conectar um servidor próprio protegido. Não se deve expor a API do Ollama diretamente à internet. Antes da integração, também será necessário limitar requisições e proteger o endpoint contra uso indevido.
