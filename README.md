# Araras Health Hub

### Descrição

O **Araras Health Hub Web** é a interface do usuário (UI) da plataforma de gestão da cadeia de suprimentos municipais. Desenvolvido como uma Single Page Application (SPA), ele se comunica com a API Araras Health Hub para gerenciar o fluxo completo de estoque, pedidos, recebimento e dispensação de medicamentos e insumos nas unidades de saúde.
O foco principal é oferecer uma experiência de usuário eficiente, responsiva e acessível, utilizando componentes de alta qualidade e um design moderno.

### Arquitetura

O projeto adota uma Arquitetura Orientada a Componentes (Component-Based Architecture), onde cada funcionalidade é construída a partir de componentes encapsulados e reutilizáveis.
A responsabilidade de acesso a dados e regras de negócio é estritamente delegada a Services dedicados, seguindo a separação de Smart (Container) e Dumb (Presentation) Components. O fluxo de dados assíncrono é gerenciado de forma reativa, utilizando o poder do RxJS, garantindo um estado de aplicação previsível e uma alta performance na interface.

### Tecnologias

- [Angular v19.0.0](https://v19.angular.dev/overview)
- [TypeScript v5.6](https://www.typescriptlang.org/)
- [PrimeNG v19](https://primeng.org/)
- [PrimeIcons](https://primeng.org/icons)
- [Tailwind CSS](https://tailwindcss.com/)
- [jwt-decode](https://www.jwt.io/introduction)

### Pré-requisitos

Antes de começar, certifique-se de ter o ambiente de desenvolvimento configurado:

- [Node.js v22.12.0](https://nodejs.org/pt)
- [npm 10.9.0](https://www.npmjs.com/)
- [Angular CLI 20.0.0](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [API Araras Health Hub deve estar rodando e acessível](https://github.com/andersonguedesmg/araras-health-hub-api)

### Rodando localmente

Clone o repositório

```bash
git clone https://github.com/andersonguedesmg/araras-health-hub-web
```

Instale as dependências

```bash
npm install
```

Inicie o servidor de desenvolvimento

```bash
npm run start
ng serve
```

Acesse a plataforma

```bash
http://localhost:4200/
```
