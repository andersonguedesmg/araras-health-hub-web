# Araras Health Hub

### Descrição

O **Araras Health Hub Web** é a interface do usuário (UI) da plataforma de gestão da cadeia de suprimentos municipais. Desenvolvido como uma Single Page Application (SPA), ele se comunica com a API Araras Health Hub para gerenciar o fluxo completo de estoque, pedidos, recebimento e dispensação de medicamentos e insumos nas unidades de saúde.
O foco principal é oferecer uma experiência de usuário eficiente, responsiva e acessível, utilizando componentes de alta qualidade e um design moderno.

### Arquitetura

O projeto adota uma Arquitetura Orientada a Componentes (Component-Based Architecture), onde cada funcionalidade é construída a partir de componentes encapsulados e reutilizáveis.
A responsabilidade de acesso a dados e regras de negócio é estritamente delegada a Services dedicados, seguindo a separação de Smart (Container) e Dumb (Presentation) Components. O fluxo de dados assíncrono é gerenciado de forma reativa, utilizando o poder do RxJS, garantindo um estado de aplicação previsível e uma alta performance na interface.

### Tecnologias

- [Angular v19.2.0](https://v19.angular.dev/overview)
- [TypeScript v5.7](https://www.typescriptlang.org/)
- [PrimeNG v19.0.2](https://primeng.org/)
- [Tailwind CSS v3.4](https://tailwindcss.com/)
- [tailwindcss-primeui](https://github.com/primefaces/tailwindcss-primeui)
- [Chart.js v4.4](https://www.chartjs.org/)
- [jwt-decode v4.0](https://www.jwt.io/introduction)

### Pré-requisitos

Antes de começar, certifique-se de ter o ambiente de desenvolvimento configurado:

- [Node.js v22.x](https://nodejs.org/pt)
- [npm v10.x](https://www.npmjs.com/)
- [Angular CLI](https://angular.dev/tools/cli)
- [Visual Studio Code](https://code.visualstudio.com/) _(Recomendado)_
- [API Araras Health Hub](https://github.com/andersonguedesmg/araras-health-hub-api) rodando localmente

### Rodando localmente

1. Clone o repositório

```bash
git clone https://github.com/andersonguedesmg/araras-health-hub-web.git
```

2. Acesse o diretório do projeto

```bash
cd araras-health-hub-web
```

3. Instale as dependências

```bash
npm install
```

4. Inicie o servidor de desenvolvimento

```bash
npm run start
```

5. Acesse no navegador:

```bash
http://localhost:4200/
```

### Scripts Disponíveis

No terminal, você pode executar os seguintes comandos cadastrados no `package.json`:

| Comando         | Descrição                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------- |
| `npm start`     | Executa o servidor de desenvolvimento (`ng serve`)                                            |
| `npm run build` | Compila o projeto para produção no diretório `dist/`                                          |
| `npm run watch` | Compila o projeto em modo de desenvolvimento com visualização contínua                        |
| `npm run test`  | Executa os testes unitários via Karma e Jasmine                                               |
| `npm run lint`  | Analisa os arquivos `.ts` e `.html` buscando erros de sintaxe ou violação de regras do ESLint |
