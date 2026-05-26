package br.edu.utfpr.tds.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "banheiro")
@JsonIgnoreProperties(ignoreUnknown = false)
public class Banheiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "localizacao_id")
    private Localizacao localizacao;

    @NotBlank
    private String identificador;

    private Integer andar;

    @NotNull
    @Enumerated(EnumType.STRING)
    private BanheiroTipo tipo;

    private String descricao;
    private String foto;

    @Min(1)
    private Integer qtdCabines;

    private Boolean acessivel = false;

    private Double notaMedia = 0.0;

    private Integer totalAvaliacoes = 0;

    private Boolean ativo = true;

    public enum BanheiroTipo {
        M, F, UNISSEX, PCD
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Localizacao getLocalizacao() { return localizacao; }
    public void setLocalizacao(Localizacao localizacao) { this.localizacao = localizacao; }

    public String getIdentificador() { return identificador; }
    public void setIdentificador(String identificador) { this.identificador = identificador; }

    public Integer getAndar() { return andar; }
    public void setAndar(Integer andar) { this.andar = andar; }

    public BanheiroTipo getTipo() { return tipo; }
    public void setTipo(BanheiroTipo tipo) { this.tipo = tipo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }

    public Integer getQtdCabines() { return qtdCabines; }
    public void setQtdCabines(Integer qtdCabines) { this.qtdCabines = qtdCabines; }

    public Boolean getAcessivel() { return acessivel; }
    public void setAcessivel(Boolean acessivel) { this.acessivel = acessivel; }

    public Double getNotaMedia() { return notaMedia; }
    public void setNotaMedia(Double notaMedia) { this.notaMedia = notaMedia; }

    public Integer getTotalAvaliacoes() { return totalAvaliacoes; }
    public void setTotalAvaliacoes(Integer totalAvaliacoes) { this.totalAvaliacoes = totalAvaliacoes; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}
