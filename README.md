# 🧩 Sudoku de Formas e Cores

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222222?logo=githubpages&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

Um jogo educativo client-side que adapta a lógica do Sudoku para uma experiência visual com **formas geométricas coloridas** e **números coloridos**. A ideia é tornar conceitos de organização espacial, comparação, reconhecimento de padrões e raciocínio lógico mais acessíveis para crianças em fase inicial de aprendizagem matemática.

## ✨ Propósito

O projeto parte da ideia de que jogos digitais podem apoiar a aprendizagem matemática quando combinam regras simples, feedback visual e participação ativa. A proposta é oferecer uma atividade reutilizável e lúdica para ajudar professores a explorar matemática de forma mais visual e participativa.

Aqui, o Sudoku pode deixar de ser um desafio baseado apenas em números e passar a usar símbolos familiares para crianças: círculo, triângulo, quadrado, retângulo, pentágono e hexágono. O jogo também permite alternar para números coloridos, apoiando a transição entre representação visual e representação numérica.

## 🎯 Objetivos Educacionais

- Estimular raciocínio lógico por meio de escolhas e correções.
- Apoiar o reconhecimento de formas geométricas planas.
- Relacionar formas e números por meio de representações coloridas.
- Trabalhar linhas, colunas e regiões em uma malha 6x6.
- Incentivar observação, comparação e tomada de decisão.
- Oferecer um recurso digital simples para sala de aula, estudo remoto ou reforço.
- Aproximar o conteúdo matemático de uma experiência interativa e visual.

## 🕹️ Como Jogar

O tabuleiro tem **6 linhas**, **6 colunas** e blocos internos de **2x3**.

A missão é preencher as casas vazias usando as seis formas disponíveis, respeitando três regras:

- não repetir a mesma forma na linha;
- não repetir a mesma forma na coluna;
- não repetir a mesma forma no bloco.

O jogo mostra quando há repetição e dá retornos visuais simples para orientar a criança durante a partida.

Também é possível alternar a representação das peças entre formas geométricas e números coloridos. As regras continuam as mesmas: cada número corresponde a uma forma e não pode se repetir na mesma linha, coluna ou bloco.

## 👩‍🏫 Público-Alvo

Este objeto de aprendizagem pode ser usado com:

- crianças da Educação Infantil, com mediação docente;
- estudantes dos anos iniciais do Ensino Fundamental;
- atividades introdutórias de geometria, lógica e organização espacial;
- práticas pedagógicas com jogos, recursos digitais ou materiais manipuláveis.

## 🧰 Tecnologias

- **React** para a interface.
- **TypeScript** para tipagem e organização da lógica.
- **Vite** para desenvolvimento e build.
- **Tailwind CSS** para estilos.
- **shadcn/ui** como referência para componentes.
- **Lucide React** para ícones.
- **GitHub Pages** para hospedagem estática.

## 🚀 Rodando Localmente

Instale as dependências:

```bash
pnpm install
```

Inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

Gere o build de produção:

```bash
pnpm build
```

Pré-visualize o build:

```bash
pnpm preview
```

## 🌐 Deploy

O projeto está preparado para publicação no **GitHub Pages**.

O workflow em `.github/workflows/deploy.yml` executa o build e publica a pasta `dist` quando há push na branch `main`.

Como o repositório será publicado em um subcaminho, o Vite usa:

```txt
/sudoku-formas-e-cores/
```

## 🗂️ Estrutura

```txt
src/
  components/
    AppHeader.tsx
    Piece.tsx
    GameStatus.tsx
    ShapePicker.tsx
    MusicControls.tsx
    SudokuBoard.tsx
    ui/
      button.tsx
  lib/
    assets.ts
    sudoku/
      index.ts
  App.tsx
  main.tsx
  styles.css
```

## 📚 Base Conceitual

A aplicação se apoia em discussões da Educação Matemática sobre jogos, recursos digitais e objetos de aprendizagem. O foco é oferecer uma ferramenta prática: pequena, acessível, visual e fácil de reutilizar em diferentes contextos de ensino.

O resultado é um Sudoku adaptado para formas geométricas, pensado para favorecer descoberta, experimentação e participação ativa.

## 🎵 Música

A trilha usada no jogo é **Cozy Puzzle In-Game 3**, de **MintoDog**, disponibilizada no OpenGameArt sob licença **CC0**.

Fonte: https://opengameart.org/content/cozy-puzzle-in-game-3

Efeitos sonoros:

- **Error**, de **EZduzziteh** — CC0: https://opengameart.org/content/error
- **Win sound effect**, de **Listener** — CC0: https://opengameart.org/content/win-sound-effect
