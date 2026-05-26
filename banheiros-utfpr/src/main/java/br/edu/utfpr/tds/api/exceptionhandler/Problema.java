package br.edu.utfpr.tds.api.exceptionhandler;

import java.util.List;

public class Problema {

    private List<Erro> erros;

    public Problema(List<Erro> erros) {
        this.erros = erros;
    }

    public List<Erro> getErros() { return erros; }

    public static class Erro {
        private String campo;
        private String mensagem;

        public Erro(String campo, String mensagem) {
            this.campo = campo;
            this.mensagem = mensagem;
        }

        public String getCampo() { return campo; }
        public String getMensagem() { return mensagem; }
    }
}
