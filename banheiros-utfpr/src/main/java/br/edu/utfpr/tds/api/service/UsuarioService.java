package br.edu.utfpr.tds.api.service;

import br.edu.utfpr.tds.api.model.Usuario;
import br.edu.utfpr.tds.api.repository.UsuarioRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Cadastro publico de usuario. A role enviada pelo cliente e ignorada
     * (sempre USER) para evitar escalonamento de privilegio. A senha e
     * sempre gravada com hash BCrypt.
     */
    public Usuario cadastrar(Usuario usuario) {
        usuario.setId(null);
        usuario.setRole(Usuario.UsuarioRole.USER);
        usuario.setAtivo(true);
        usuario.setDataCriacao(LocalDate.now());
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return usuarioRepository.save(usuario);
    }

    /**
     * Atualizacao por ADMIN. Mantem a senha atual quando nao informada e
     * a recodifica quando uma nova senha e enviada.
     */
    public Optional<Usuario> atualizar(Long id, Usuario usuario) {
        return usuarioRepository.findById(id).map(existente -> {
            String senhaNova = usuario.getSenha();
            BeanUtils.copyProperties(usuario, existente, "id", "dataCriacao", "senha");
            if (senhaNova != null && !senhaNova.isBlank()) {
                existente.setSenha(passwordEncoder.encode(senhaNova));
            }
            return usuarioRepository.save(existente);
        });
    }
}
