package br.edu.utfpr.tds.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "avaliacao")
@JsonIgnoreProperties(ignoreUnknown = false)
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "banheiro_id")
    private Banheiro banheiro;

    @NotNull @Min(1) @Max(5)
    private Integer limpeza;

    @NotNull @Min(1) @Max(5)
    private Integer cheiro;

    @NotNull @Min(1) @Max(5)
    private Integer papelHigienico;

    @NotNull @Min(1) @Max(5)
    private Integer estadoPortas;

    @NotNull @Min(1) @Max(5)
    private Integer iluminacao;

    @NotNull @Min(1) @Max(5)
    private Integer silencio;

    @NotNull @Min(1) @Max(5)
    private Integer movimentacao;

    private Double notaGeral;

    private String comentario;
    private String foto;

    @NotNull
    @Column(name = "data_avaliacao")
    private LocalDate dataAvaliacao;

    @Column(name = "horario_avaliacao")
    private LocalTime horarioAvaliacao;

    @PrePersist
    @PreUpdate
    public void calcularNotaGeral() {
        this.notaGeral = (limpeza + cheiro + papelHigienico + estadoPortas + iluminacao + silencio + movimentacao) / 7.0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Banheiro getBanheiro() { return banheiro; }
    public void setBanheiro(Banheiro banheiro) { this.banheiro = banheiro; }

    public Integer getLimpeza() { return limpeza; }
    public void setLimpeza(Integer limpeza) { this.limpeza = limpeza; }

    public Integer getCheiro() { return cheiro; }
    public void setCheiro(Integer cheiro) { this.cheiro = cheiro; }

    public Integer getPapelHigienico() { return papelHigienico; }
    public void setPapelHigienico(Integer papelHigienico) { this.papelHigienico = papelHigienico; }

    public Integer getEstadoPortas() { return estadoPortas; }
    public void setEstadoPortas(Integer estadoPortas) { this.estadoPortas = estadoPortas; }

    public Integer getIluminacao() { return iluminacao; }
    public void setIluminacao(Integer iluminacao) { this.iluminacao = iluminacao; }

    public Integer getSilencio() { return silencio; }
    public void setSilencio(Integer silencio) { this.silencio = silencio; }

    public Integer getMovimentacao() { return movimentacao; }
    public void setMovimentacao(Integer movimentacao) { this.movimentacao = movimentacao; }

    public Double getNotaGeral() { return notaGeral; }
    public void setNotaGeral(Double notaGeral) { this.notaGeral = notaGeral; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }

    public LocalDate getDataAvaliacao() { return dataAvaliacao; }
    public void setDataAvaliacao(LocalDate dataAvaliacao) { this.dataAvaliacao = dataAvaliacao; }

    public LocalTime getHorarioAvaliacao() { return horarioAvaliacao; }
    public void setHorarioAvaliacao(LocalTime horarioAvaliacao) { this.horarioAvaliacao = horarioAvaliacao; }
}
