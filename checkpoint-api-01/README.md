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

<div style="text-align: center;">
  <img src="[https://i.pinimg.com/736x/43/ac/52/43ac52b7eaa8990b593006daf2297103.jpg](https://i.pinimg.com/1200x/c2/d3/1c/c2d31c853267377039d2fcc2dfd11376.jpg)" alt="Projeto Web" style="width: 900px; height: 900px; object-fit: cover; border-radius: 8px;">
</div>
