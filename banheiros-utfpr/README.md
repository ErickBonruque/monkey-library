# Checkpoint 1 - API Java + MySQL

Estrutura inicial de uma API com Spring Boot, Java 8 e conexao com MySQL.

## Requisitos

- Java 8
- Maven
- MySQL em execucao

## Principais Dependencias

- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-devtools
- mysql-connector-java

## Banco de Dados

Configurado em src/main/resources/application.properties:

- URL: jdbc:mysql://localhost:3306/tds_api?createDatabaseIfNotExist=true&serverTimezone=UTC
- Usuario: root
- Senha: em branco

## Como Rodar

No terminal, na raiz do projeto:

```bash
mvn spring-boot:run
```

Ou execute a classe CheckpointApi01Application pela IDE.

## Status

- Build validado com sucesso usando mvn test.

# Checkpoint 2 - API Funcionalidades

Implementacao das funcionalidades da API: recursos REST completos, validacoes,
tratamento de erros, eventos, regras de negocio, filtros e paginacao.

## Recursos (Endpoints)

- /campus - CRUD de campus
- /localizacoes - CRUD de localizacoes (filtro por campusId)
- /banheiros - CRUD de banheiros (filtro por localizacaoId, ranking por nota)
- /usuarios - CRUD de usuarios
- /avaliacoes - cadastro, busca, pesquisa com filtros e paginacao

## Funcionalidades Implementadas

- Modelos, repositorios e recursos para todas as entidades.
- Cadastro de recursos (POST) com retorno do header Location.
- Atualizacao total (PUT) e remocao (DELETE) de recursos.
- Atualizacao parcial (PATCH) do campo ativo em banheiros e usuarios.
- Validacao de atributos desconhecidos no corpo da requisicao.
- Tratamento centralizado de erros com RestControllerAdvice (classe Problema).
- Validacao de valores invalidos com Bean Validation.
- Tratamento de excecao para recurso nao encontrado (404).
- Controle de eventos da aplicacao (RecursoCriadoEvent / RecursoCriadoListener).
- Classe de Service para regras de negocio (AvaliacaoService).
- Relacionamentos entre recursos (ManyToOne) e datas com LocalDate.
- Regra de negocio: nao permite avaliar banheiro inativo (HTTP 422).
- Filtro na pesquisa de avaliacoes (banheiro, campus, periodo de datas).
- Paginacao na pesquisa de avaliacoes.

## Principais Dependencias Adicionais

- spring-boot-starter-validation

## Configuracoes Adicionais

Em src/main/resources/application.properties:

- spring.jackson.deserialization.fail-on-unknown-properties=true
- spring.jackson.serialization.write-dates-as-timestamps=false

## Status

- Build validado com sucesso usando mvn compile.

# Checkpoint 3 - API Seguranca

Implementacao da camada de seguranca da API com Spring Security e JWT
(autenticacao stateless), controle de acesso por perfil de usuario, CORS,
hash de senhas e logout.

## Pontos da API que passaram a exigir seguranca

Antes desta etapa todos os endpoints eram publicos. Os riscos corrigidos:

- Endpoints de escrita (POST/PUT/PATCH/DELETE) estavam abertos a qualquer um.
- Senha de usuario era gravada em texto puro.
- O cadastro de usuario permitia definir role=ADMIN (escalonamento de privilegio).
- Nao havia CORS, autenticacao, expiracao de sessao nem logout.

## Funcionalidades Implementadas

- Hash de senha com BCrypt (UsuarioService / DataLoader).
- Autenticacao via OAuth2 Password Flow simplificado retornando JWT.
- Access Token (curta duracao) e Refresh Token (longa duracao).
- Refresh Token armazenado em cookie HttpOnly (nao acessivel via JavaScript).
- Renovacao do Access Token a partir do Refresh Token enviado na requisicao.
- Logout removendo o cookie do Refresh Token.
- Usuarios carregados do banco de dados (UserDetailsService pelo e-mail).
- Permissoes de acesso por role (ADMIN e USER).
- Cadastro publico de usuario forca role USER (impede escalonamento).
- CORS configurado para o front-end (origens via application.properties).
- Troca do tipo de seguranca por Profile (JWT padrao ou HTTP Basic).

## Endpoints de Autenticacao

- POST   /oauth/token          - login (email + senha); retorna access token e seta refresh cookie
- POST   /oauth/token/refresh  - gera novo access token a partir do refresh cookie
- DELETE /oauth/token          - logout (remove o refresh cookie)

## Regras de Acesso

- Publico: POST /usuarios (cadastro) e GET de campus, localizacoes, banheiros e avaliacoes.
- Autenticado (USER ou ADMIN): POST /avaliacoes.
- Somente ADMIN: escrita em campus, localizacoes, banheiros; gestao de usuarios;
  remocao de avaliacoes.

## Principais Dependencias Adicionais

- spring-boot-starter-security
- io.jsonwebtoken: jjwt-api, jjwt-impl, jjwt-jackson (0.11.5)

## Configuracoes Adicionais

Em src/main/resources/application.properties:

- banheiros.jwt.secret (use a variavel de ambiente JWT_SECRET em producao)
- banheiros.jwt.access-token-expiration (segundos)
- banheiros.jwt.refresh-token-expiration (segundos)
- banheiros.cors.allowed-origins
- banheiros.admin.email / banheiros.admin.senha (admin inicial)

## Usuario Admin Inicial

Criado automaticamente se a tabela de usuarios estiver vazia:

- E-mail: admin@utfpr.edu.br
- Senha: admin123

## Perfil de Seguranca Alternativo (Basic Auth)

Para rodar com HTTP Basic em vez de JWT:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=basic-security
```

## Exemplo de Uso

```bash
# login
curl -i -X POST http://localhost:8080/oauth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@utfpr.edu.br","senha":"admin123"}'

# requisicao autenticada
curl http://localhost:8080/usuarios \
  -H "Authorization: Bearer <access_token>"
```

## Status

- Build validado com sucesso usando mvn compile.
