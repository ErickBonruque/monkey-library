package br.edu.utfpr.tds.api.service;

import br.edu.utfpr.tds.api.model.Avaliacao;
import br.edu.utfpr.tds.api.model.Banheiro;
import br.edu.utfpr.tds.api.repository.AvaliacaoRepository;
import br.edu.utfpr.tds.api.repository.BanheiroRepository;
import br.edu.utfpr.tds.api.repository.specs.AvaliacaoSpecs;
import br.edu.utfpr.tds.api.repository.filter.AvaliacaoFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AvaliacaoService {

    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    @Autowired
    private BanheiroRepository banheiroRepository;

    public Avaliacao salvar(Avaliacao avaliacao) {
        Banheiro banheiro = avaliacao.getBanheiro();

        if (Boolean.FALSE.equals(banheiro.getAtivo())) {
            throw new BanheiroInativoException();
        }

        Avaliacao salva = avaliacaoRepository.save(avaliacao);
        atualizarEstatisticasBanheiro(banheiro.getId());

        return salva;
    }

    private void atualizarEstatisticasBanheiro(Long banheiroId) {
        AvaliacaoFilter filtro = new AvaliacaoFilter();
        filtro.setBanheiroId(banheiroId);

        long total = avaliacaoRepository.count(AvaliacaoSpecs.comFiltro(filtro));
        double media = avaliacaoRepository.calcularNotaMedia(banheiroId).orElse(0.0);

        banheiroRepository.findById(banheiroId).ifPresent(b -> {
            b.setNotaMedia(media);
            b.setTotalAvaliacoes((int) total);
            banheiroRepository.save(b);
        });
    }
}
