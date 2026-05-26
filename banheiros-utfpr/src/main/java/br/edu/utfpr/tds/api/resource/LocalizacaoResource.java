package br.edu.utfpr.tds.api.resource;

import br.edu.utfpr.tds.api.event.RecursoCriadoEvent;
import br.edu.utfpr.tds.api.model.Localizacao;
import br.edu.utfpr.tds.api.repository.LocalizacaoRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/localizacoes")
public class LocalizacaoResource {

    @Autowired
    private LocalizacaoRepository localizacaoRepository;

    @Autowired
    private ApplicationEventPublisher publisher;

    @GetMapping
    public List<Localizacao> listar(@RequestParam(required = false) Long campusId) {
        if (campusId != null) {
            return localizacaoRepository.findByCampusId(campusId);
        }
        return localizacaoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Localizacao> buscar(@PathVariable Long id) {
        Optional<Localizacao> loc = localizacaoRepository.findById(id);
        return loc.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Localizacao> criar(@Valid @RequestBody Localizacao localizacao, HttpServletResponse response) {
        Localizacao salva = localizacaoRepository.save(localizacao);
        publisher.publishEvent(new RecursoCriadoEvent(this, response, salva.getId()));
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Localizacao> atualizar(@PathVariable Long id, @Valid @RequestBody Localizacao localizacao) {
        Optional<Localizacao> existente = localizacaoRepository.findById(id);
        if (!existente.isPresent()) return ResponseEntity.notFound().build();

        BeanUtils.copyProperties(localizacao, existente.get(), "id");
        Localizacao atualizada = localizacaoRepository.save(existente.get());
        return ResponseEntity.ok(atualizada);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) {
        localizacaoRepository.deleteById(id);
    }
}
