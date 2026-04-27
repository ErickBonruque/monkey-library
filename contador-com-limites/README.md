# Contador com Limites e Step

Componente React de contador com controle completo de limites, incremento e reset.

## Requisitos Implementados

- Estado inicial: contador começa em 0
- Incrementar: soma o valor do step sem passar do máximo
- Decrementar: subtrai o step sem ir abaixo do mínimo
- Resetar: volta para o mínimo definido
- Step: input numérico (> 0) para definir o incremento
- Limites: inputs de mínimo e máximo (mín ≤ máx)
- Validação: ajusta o contador automaticamente se sair do intervalo

## Como Usar

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra o navegador em `http://localhost:5173`

## Funcionalidades

- **Botão Decrementar**: reduz o contador pelo valor do step
- **Botão Resetar**: retorna o contador ao valor mínimo
- **Botão Incrementar**: aumenta o contador pelo valor do step
- **Configuração de Step**: define o incremento/decremento (mínimo 1)
- **Configuração de Limites**: define o intervalo mínimo e máximo
- **Validação em Tempo Real**: ajusta automaticamente se os limites forem alterados

## Tecnologias

- React + Vite
- CSS

