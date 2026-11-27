# Publicação do Alfredo pelo próprio GitHub

Esta versão usa GitHub Pages e GitHub Actions. Não depende de Render, banco de dados ou servidor Node para entregar a interface.

1. No repositório, abra **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Salve a configuração.
4. Acesse a aba **Actions** e acompanhe o workflow “Publicar Alfredo no GitHub Pages”.
5. Quando terminar com sucesso, abra:

https://lspbeto.github.io/proj003/

A primeira publicação pode levar alguns minutos. O endereço é público porque o repositório é público.

Observação: o GitHub Pages publica somente HTML, CSS e JavaScript. Não executa a API de IA do servidor nem armazena dados em banco. Nesta versão, PDF, leitura de voz, pesquisa externa e histórico local funcionam no navegador. A IA conversacional ainda precisa de uma solução que rode no próprio navegador ou de um serviço externo.
