# Alfredo — versão independente para GitHub Pages

O Alfredo pode abrir e executar sua interface sem Render, servidor Node, MongoDB ou notebook ligado. A hospedagem é feita pelo GitHub Pages; as ferramentas de documentos são executadas no navegador do usuário.

## Publicação

1. Abra Settings do repositório.
2. Entre em Pages.
3. Em Build and deployment, escolha **GitHub Actions** como Source.
4. O workflow `.github/workflows/pages.yml` publica automaticamente a pasta `public` a cada atualização da branch `main`.
5. Site: https://lspbeto.github.io/proj003/

## O que esta edição oferece

- Interface adaptada a celular e computador.
- Modos Conversar, Professor e Leitura, com respostas locais baseadas no texto carregado.
- Leitura em voz alta e entrada por voz quando suportadas pelo navegador.
- Abrir PDF digital e extrair texto com PDF.js.
- Histórico local no navegador (localStorage), sem conta ou banco de dados.
- Editor de texto com rascunho salvo localmente.
- Dividir PDF por intervalo de páginas.
- Mesclar vários PDFs.
- Digitalizar páginas usando a câmera/arquivos de imagem e criar PDF.
- OCR em imagens usando Tesseract.js (biblioteca carregada pela internet na primeira utilização).
- Comprimir imagens e criar JPG menor.
- Conversões: DOCX para PDF; XLSX/XLS/CSV para PDF; PDF para DOCX (texto extraído); PDF para XLSX (texto por página); CSV para XLSX; PDF para TXT.
- Regravar/otimizar estrutura de PDF.

## Limitações importantes

- GitHub Pages não executa IA de servidor. O modo Conversar/Professor nesta edição não é um modelo generativo: usa o conteúdo local, regras simples e pesquisa externa disponível.
- Pesquisa na web depende de internet e consulta fontes externas; o aplicativo não pesquisa quando está sem conexão.
- Bibliotecas de PDF, Word, Excel e OCR são carregadas de CDNs. Para usar essas ferramentas pela primeira vez, precisa de internet. O conteúdo dos arquivos é processado no aparelho, mas o código das bibliotecas vem dessas fontes externas.
- OCR é reconhecimento automático e pode cometer erros, especialmente em fotos inclinadas, letras pequenas ou baixa iluminação.
- PDF para Word/Excel extrai texto; não preserva fielmente colunas, imagens, tabelas complexas, fontes ou layout original. PDF para Excel cria uma planilha simples com texto por página, não reconstrói tabelas complexas.
- Conversão Word aceita DOCX. O formato antigo DOC não é suportado diretamente.
- A conversão de planilha para PDF produz uma representação textual das células; gráficos, fórmulas e formatação avançada podem não ser preservados.
- A otimização de PDF regrava sua estrutura, mas não garante redução. Para fotos, comprima as imagens antes de montar o PDF.
- O histórico fica no armazenamento do navegador, não sincroniza entre dispositivos e pode ser apagado ao limpar os dados do site. Faça cópias dos arquivos importantes.
- O modo offline pode abrir a interface já armazenada em cache, mas ferramentas que dependem de bibliotecas CDN, OCR, pesquisa e voz podem precisar de internet.
- Nenhuma chave privada ou senha deve ser colocada no repositório público.

## Armazenamento local

As conversas e rascunhos usam localStorage do navegador. Isso é suficiente para uso pessoal simples, mas não é um banco de dados com sincronização ou backup. Arquivos de entrada são processados no navegador e os arquivos convertidos são baixados para o aparelho.

## Backend antigo

Os arquivos `server.js` e `package.json` permanecem no repositório para possível adaptação futura. Eles não são necessários para o site estático no GitHub Pages. Não é preciso contratar Render ou configurar MongoDB para usar as ferramentas locais desta versão.
