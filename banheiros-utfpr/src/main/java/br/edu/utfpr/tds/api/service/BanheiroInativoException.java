package br.edu.utfpr.tds.api.service;

public class BanheiroInativoException extends RuntimeException {

    public BanheiroInativoException() {
        super("Não é possível registrar avaliação para um banheiro inativo.");
    }
}
