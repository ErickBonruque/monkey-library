package br.edu.utfpr.tds.api.resource;

import br.edu.utfpr.tds.api.event.RecursoCriadoEvent;
import br.edu.utfpr.tds.api.model.Campus;
import br.edu.utfpr.tds.api.repository.CampusRepository;
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
@RequestMapping("/campus")
public class CampusResource {

    @Autowired
    private CampusRepository campusRepository;

    @Autowired
    private ApplicationEventPublisher publisher;

    @GetMapping
    public List<Campus> listar() {
        return campusRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Campus> buscar(@PathVariable Long id) {
        Optional<Campus> campus = campusRepository.findById(id);
        return campus.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Campus> criar(@Valid @RequestBody Campus campus, HttpServletResponse response) {
        Campus salvo = campusRepository.save(campus);
        publisher.publishEvent(new RecursoCriadoEvent(this, response, salvo.getId()));
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Campus> atualizar(@PathVariable Long id, @Valid @RequestBody Campus campus) {
        Optional<Campus> existente = campusRepository.findById(id);
        if (!existente.isPresent()) return ResponseEntity.notFound().build();

        BeanUtils.copyProperties(campus, existente.get(), "id");
        Campus atualizado = campusRepository.save(existente.get());
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) {
        campusRepository.deleteById(id);
    }
}
