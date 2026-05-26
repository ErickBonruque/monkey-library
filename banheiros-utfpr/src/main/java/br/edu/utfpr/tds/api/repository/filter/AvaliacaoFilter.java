package br.edu.utfpr.tds.api.repository.filter;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public class AvaliacaoFilter {

    private Long banheiroId;
    private Long campusId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dataDe;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dataAte;

    public Long getBanheiroId() { return banheiroId; }
    public void setBanheiroId(Long banheiroId) { this.banheiroId = banheiroId; }

    public Long getCampusId() { return campusId; }
    public void setCampusId(Long campusId) { this.campusId = campusId; }

    public LocalDate getDataDe() { return dataDe; }
    public void setDataDe(LocalDate dataDe) { this.dataDe = dataDe; }

    public LocalDate getDataAte() { return dataAte; }
    public void setDataAte(LocalDate dataAte) { this.dataAte = dataAte; }
}
