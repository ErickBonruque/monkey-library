package br.edu.utfpr.tds.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "localizacao")
@JsonIgnoreProperties(ignoreUnknown = false)
public class Localizacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "campus_id")
    private Campus campus;

    @NotNull
    @Enumerated(EnumType.STRING)
    private LocalizacaoTipo tipo;

    @NotBlank
    private String nome;

    private String descricao;

    private Boolean ativo = true;

    public enum LocalizacaoTipo {
        PREDIO, BLOCO, AREA_EXTERNA, CONTAINER, GINASIO, BIBLIOTECA, OUTRO
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Campus getCampus() { return campus; }
    public void setCampus(Campus campus) { this.campus = campus; }

    public LocalizacaoTipo getTipo() { return tipo; }
    public void setTipo(LocalizacaoTipo tipo) { this.tipo = tipo; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}
