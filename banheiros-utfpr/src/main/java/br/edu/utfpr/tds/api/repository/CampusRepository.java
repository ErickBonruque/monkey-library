package br.edu.utfpr.tds.api.repository;

import br.edu.utfpr.tds.api.model.Campus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampusRepository extends JpaRepository<Campus, Long> {
}
