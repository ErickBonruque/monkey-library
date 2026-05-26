package br.edu.utfpr.tds.api.resource;

import br.edu.utfpr.tds.api.event.RecursoCriadoEvent;
import br.edu.utfpr.tds.api.model.Banheiro;
import br.edu.utfpr.tds.api.repository.BanheiroRepository;
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
@RequestMapping("/banheiros")
public class BanheiroResource {

    @Autowired
    private BanheiroRepository banheiroRepository;

    @Autowired
    private ApplicationEventPublisher publisher;

    @GetMapping
    public List<Banheiro> listar(@RequestParam(required = false) Long localizacaoId) {
        if (localizacaoId != null) {
            return banheiroRepository.findByLocalizacaoId(localizacaoId);
        }
        return banheiroRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banheiro> buscar(@PathVariable Long id) {
        Optional<Banheiro> banheiro = banheiroRepository.findById(id);
        return banheiro.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Banheiro> criar(@Valid @RequestBody Banheiro banheiro, HttpServletResponse response) {
        Banheiro salvo = banheiroRepository.save(banheiro);
        publisher.publishEvent(new RecursoCriadoEvent(this, response, salvo.getId()));
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banheiro> atualizar(@PathVariable Long id, @Valid @RequestBody Banheiro banheiro) {
        Optional<Banheiro> existente = banheiroRepository.findById(id);
        if (!existente.isPresent()) return ResponseEntity.notFound().build();

        BeanUtils.copyProperties(banheiro, existente.get(), "id", "notaMedia", "totalAvaliacoes");
        Banheiro atualizado = banheiroRepository.save(existente.get());
        return ResponseEntity.ok(atualizado);
    }

    @PatchMapping("/{id}/ativo")
    public ResponseEntity<Void> atualizarAtivo(@PathVariable Long id, @RequestBody Boolean ativo) {
        Optional<Banheiro> existente = banheiroRepository.findById(id);
        if (!existente.isPresent()) return ResponseEntity.notFound().build();

        existente.get().setAtivo(ativo);
        banheiroRepository.save(existente.get());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) {
        banheiroRepository.deleteById(id);
    }

    @GetMapping("/ranking")
    public List<Banheiro> ranking() {
        return banheiroRepository.findRanking();
    }
}
