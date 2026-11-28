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

## Uso no iPhone/iPad, Android e Windows

- iPhone/iPad: abrir no Safari e, se desejar, usar Compartilhar → Adicionar à Tela de Início. Ao salvar arquivos, use Compartilhar → Salvar em Arquivos quando o Safari mostrar uma prévia.
- Android: abrir no Chrome; a seleção de imagem pode oferecer câmera ou galeria.
- Windows: abrir no Chrome, Edge ou Firefox atualizado.

Câmera e microfone dependem de permissões do navegador. A leitura em voz alta utiliza as vozes do sistema. Reconhecimento de fala no iOS pode não ser oferecido pela API web; nesse caso, use o Ditado do teclado do iPhone/iPad. O modo offline depende de cache prévio e não garante funcionamento das bibliotecas externas sem internet.
