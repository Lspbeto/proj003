# Alfredo — versão GitHub Pages

O Alfredo está sendo preparado para abrir diretamente pelo GitHub Pages, sem Render, servidor Node, banco de dados ou notebook ligado.

## O que funciona nesta versão estática

- Interface adaptada para celular e computador.
- Instalação como atalho PWA em navegadores compatíveis.
- Abrir PDFs digitais e extrair o texto no navegador.
- Colar textos para leitura.
- Leitura em voz alta usando as vozes disponíveis no aparelho.
- Pesquisa externa pelo DuckDuckGo.
- Histórico de mensagens salvo localmente no navegador.
- Cache básico para abrir a estrutura do aplicativo depois da primeira visita.

## Publicar pelo GitHub Pages

1. Abra Settings do repositório.
2. Entre em Pages.
3. Em Build and deployment, escolha **GitHub Actions** como Source.
4. O workflow `.github/workflows/pages.yml` publicará automaticamente o conteúdo da pasta `public` a cada atualização da branch `main`.
5. Depois da conclusão, o endereço será `https://lspbeto.github.io/proj003/`.

## Limitações importantes

GitHub Pages hospeda arquivos estáticos. Ele não executa Node.js, Ollama ou um modelo de IA no servidor e não oferece banco de dados. Por isso, a conversa inteligente e o ensino interativo por IA ainda não estão ativos nesta edição. Para manter o projeto sem outros serviços, a próxima opção a avaliar é executar um modelo diretamente no navegador; isso exige baixar modelos grandes e depende da memória e compatibilidade do celular.

A pesquisa abre o DuckDuckGo em outra aba; o Alfredo ainda não coleta, lê e resume resultados automaticamente. PDFs escaneados como imagem ainda precisam de OCR. O histórico fica no armazenamento local do navegador, não sincroniza entre aparelhos e pode ser apagado ao limpar os dados do navegador.

Nenhuma chave privada ou senha deve ser colocada neste repositório público.
