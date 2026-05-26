package br.edu.utfpr.tds.api.repository;

import br.edu.utfpr.tds.api.model.Localizacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocalizacaoRepository extends JpaRepository<Localizacao, Long> {

    List<Localizacao> findByCampusId(Long campusId);
}
