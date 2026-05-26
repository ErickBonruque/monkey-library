package br.edu.utfpr.tds.api.repository;

import br.edu.utfpr.tds.api.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long>, JpaSpecificationExecutor<Avaliacao> {

    @Query("SELECT AVG(a.notaGeral) FROM Avaliacao a WHERE a.banheiro.id = :banheiroId")
    Optional<Double> calcularNotaMedia(Long banheiroId);
}
