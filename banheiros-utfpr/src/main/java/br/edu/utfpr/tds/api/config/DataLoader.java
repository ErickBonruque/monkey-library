package br.edu.utfpr.tds.api.config;

import br.edu.utfpr.tds.api.model.Usuario;
import br.edu.utfpr.tds.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Cria um usuario ADMIN inicial caso a tabela de usuarios esteja vazia,
 * permitindo o primeiro login e a configuracao da base.
 */
@Component
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminSenha;

    public DataLoader(UsuarioRepository usuarioRepository,
                      PasswordEncoder passwordEncoder,
                      @Value("${banheiros.admin.email}") String adminEmail,
                      @Value("${banheiros.admin.senha}") String adminSenha) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminSenha = adminSenha;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return;
        }

        Usuario admin = new Usuario();
        admin.setNome("Administrador");
        admin.setEmail(adminEmail);
        admin.setSenha(passwordEncoder.encode(adminSenha));
        admin.setRole(Usuario.UsuarioRole.ADMIN);
        admin.setAtivo(true);
        admin.setDataCriacao(LocalDate.now());

        usuarioRepository.save(admin);
    }
}
