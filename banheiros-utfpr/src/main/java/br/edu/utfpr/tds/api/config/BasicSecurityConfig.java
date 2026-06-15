package br.edu.utfpr.tds.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuracao alternativa de seguranca usando HTTP Basic.
 * Ativada apenas com o profile "basic-security"
 * (ex.: mvn spring-boot:run -Dspring-boot.run.profiles=basic-security).
 *
 * Demonstra a troca do tipo de seguranca por Profile sem alterar o restante
 * da aplicacao. As credenciais sao as mesmas da base (UserDetailsService).
 */
@Configuration
@EnableWebSecurity
@Profile("basic-security")
public class BasicSecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            .authorizeRequests()
                .anyRequest().authenticated()
            .and()
            .httpBasic();

        return http.build();
    }
}
