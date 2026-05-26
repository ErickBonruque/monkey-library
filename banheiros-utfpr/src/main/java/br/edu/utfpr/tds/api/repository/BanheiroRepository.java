package br.edu.utfpr.tds.api.repository;

import br.edu.utfpr.tds.api.model.Banheiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BanheiroRepository extends JpaRepository<Banheiro, Long> {

    List<Banheiro> findByLocalizacaoId(Long localizacaoId);

    @Query("SELECT b FROM Banheiro b ORDER BY b.notaMedia DESC")
    List<Banheiro> findRanking();
}
