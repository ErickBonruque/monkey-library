package br.edu.utfpr.tds.api.config;

import br.edu.utfpr.tds.api.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuracao de seguranca padrao baseada em JWT (stateless).
 * Ativada em todos os perfis exceto "basic-security".
 */
@Configuration
@EnableWebSecurity
@Profile("!basic-security")
public class SecurityConfig {

    @Value("${banheiros.cors.allowed-origins}")
    private List<String> allowedOrigins;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            .authorizeRequests()
                // Endpoints de autenticacao
                .antMatchers("/oauth/token", "/oauth/token/refresh").permitAll()
                .antMatchers(HttpMethod.DELETE, "/oauth/token").permitAll()
                // Cadastro publico de usuario
                .antMatchers(HttpMethod.POST, "/usuarios").permitAll()
                // Leitura publica (navegacao no app)
                .antMatchers(HttpMethod.GET,
                        "/campus/**", "/localizacoes/**", "/banheiros/**", "/avaliacoes/**").permitAll()
                // Estrutura (campus, localizacoes, banheiros): somente ADMIN escreve
                .antMatchers(HttpMethod.POST, "/campus/**", "/localizacoes/**", "/banheiros/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.PUT, "/campus/**", "/localizacoes/**", "/banheiros/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.PATCH, "/campus/**", "/localizacoes/**", "/banheiros/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.DELETE, "/campus/**", "/localizacoes/**", "/banheiros/**").hasRole("ADMIN")
                // Gestao de usuarios (exceto cadastro publico): somente ADMIN
                .antMatchers("/usuarios/**").hasRole("ADMIN")
                // Avaliacoes: qualquer usuario autenticado cria; remover so ADMIN
                .antMatchers(HttpMethod.POST, "/avaliacoes").authenticated()
                .antMatchers(HttpMethod.DELETE, "/avaliacoes/**").hasRole("ADMIN")
                .anyRequest().authenticated();

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        config.setExposedHeaders(Arrays.asList("Location"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
