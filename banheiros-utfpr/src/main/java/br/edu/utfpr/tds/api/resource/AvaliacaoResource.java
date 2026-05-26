package br.edu.utfpr.tds.api.resource;

import br.edu.utfpr.tds.api.event.RecursoCriadoEvent;
import br.edu.utfpr.tds.api.model.Avaliacao;
import br.edu.utfpr.tds.api.repository.AvaliacaoRepository;
import br.edu.utfpr.tds.api.repository.filter.AvaliacaoFilter;
import br.edu.utfpr.tds.api.repository.specs.AvaliacaoSpecs;
import br.edu.utfpr.tds.api.service.AvaliacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoResource {

    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    @Autowired
    private AvaliacaoService avaliacaoService;

    @Autowired
    private ApplicationEventPublisher publisher;

    @GetMapping
    public Page<Avaliacao> pesquisar(AvaliacaoFilter filtro, Pageable pageable) {
        return avaliacaoRepository.findAll(AvaliacaoSpecs.comFiltro(filtro), pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Avaliacao> buscar(@PathVariable Long id) {
        Optional<Avaliacao> avaliacao = avaliacaoRepository.findById(id);
        return avaliacao.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Avaliacao> criar(@Valid @RequestBody Avaliacao avaliacao, HttpServletResponse response) {
        Avaliacao salva = avaliacaoService.salvar(avaliacao);
        publisher.publishEvent(new RecursoCriadoEvent(this, response, salva.getId()));
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) {
        avaliacaoRepository.deleteById(id);
    }
}
