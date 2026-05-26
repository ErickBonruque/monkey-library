package br.edu.utfpr.tds.api.repository.specs;

import br.edu.utfpr.tds.api.model.Avaliacao;
import br.edu.utfpr.tds.api.repository.filter.AvaliacaoFilter;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class AvaliacaoSpecs {

    public static Specification<Avaliacao> comFiltro(AvaliacaoFilter filtro) {
        return (root, query, cb) -> {
            List<Predicate> predicados = new ArrayList<>();

            if (filtro.getBanheiroId() != null) {
                predicados.add(cb.equal(root.get("banheiro").get("id"), filtro.getBanheiroId()));
            }
            if (filtro.getCampusId() != null) {
                predicados.add(cb.equal(
                        root.get("banheiro").get("localizacao").get("campus").get("id"),
                        filtro.getCampusId()
                ));
            }
            if (filtro.getDataDe() != null) {
                predicados.add(cb.greaterThanOrEqualTo(root.get("dataAvaliacao"), filtro.getDataDe()));
            }
            if (filtro.getDataAte() != null) {
                predicados.add(cb.lessThanOrEqualTo(root.get("dataAvaliacao"), filtro.getDataAte()));
            }

            return cb.and(predicados.toArray(new Predicate[0]));
        };
    }
}
