# Publicação independente do Alfredo pelo GitHub Pages

Esta versão utiliza apenas arquivos estáticos na pasta `public`. Não precisa de Render, Node.js, Ollama, MongoDB ou outro banco hospedado para abrir a interface e executar as ferramentas locais.

1. No repositório, abra **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Salve a configuração.
4. Acesse a aba **Actions** e acompanhe o workflow “Publicar Alfredo no GitHub Pages”.
5. Quando terminar com sucesso, abra https://lspbeto.github.io/proj003/

O frontend e as ferramentas de documentos executam no navegador. Histórico e rascunhos são guardados no localStorage daquele navegador. A primeira utilização das bibliotecas de PDF, Word, Excel e OCR requer conexão para carregar as bibliotecas externas.

## O que não está incluído nesta edição

O GitHub Pages não executa a API de IA. O modo de conversa e professor é local e baseado em regras e conteúdo carregado; não é uma IA generativa completa. A integração futura com Render, MongoDB ou outro serviço pode ser feita sem impedir o uso desta versão independente.
