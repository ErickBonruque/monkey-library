package br.edu.utfpr.tds.api.resource;

import br.edu.utfpr.tds.api.security.JwtService;
import br.edu.utfpr.tds.api.security.dto.LoginRequest;
import br.edu.utfpr.tds.api.security.dto.TokenResponse;
import io.jsonwebtoken.JwtException;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Endpoints de autenticacao (OAuth2 Password Flow simplificado com JWT).
 *
 *  POST   /oauth/token          -> login: access token no corpo, refresh token em cookie HttpOnly
 *  POST   /oauth/token/refresh  -> novo access token a partir do refresh token (cookie)
 *  DELETE /oauth/token          -> logout: remove o cookie do refresh token
 */
@RestController
@RequestMapping("/oauth/token")
@Profile("!basic-security")
public class AuthResource {

    private static final String REFRESH_COOKIE = "refreshToken";
    private static final String COOKIE_PATH = "/oauth/token";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public AuthResource(AuthenticationManager authenticationManager,
                        JwtService jwtService,
                        UserDetailsService userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest login) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(login.getEmail(), login.getSenha()));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).build();
        }

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String accessToken = jwtService.gerarAccessToken(authentication.getName(), roles);
        String refreshToken = jwtService.gerarRefreshToken(authentication.getName());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, criarRefreshCookie(refreshToken, jwtService.getRefreshTokenExpiration()).toString())
                .body(new TokenResponse(accessToken, jwtService.getAccessTokenExpiration()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(HttpServletRequest request) {
        String refreshToken = lerRefreshCookie(request);
        if (refreshToken == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            if (!jwtService.isRefreshToken(refreshToken)) {
                return ResponseEntity.status(401).build();
            }
            String username = jwtService.getUsername(refreshToken);
            // Recarrega do banco para refletir roles atuais e bloquear usuario inativo
            UserDetails usuario = userDetailsService.loadUserByUsername(username);
            if (!usuario.isEnabled()) {
                return ResponseEntity.status(401).build();
            }
            List<String> roles = usuario.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
            String accessToken = jwtService.gerarAccessToken(username, roles);
            return ResponseEntity.ok(new TokenResponse(accessToken, jwtService.getAccessTokenExpiration()));
        } catch (JwtException | IllegalArgumentException | UsernameNotFoundException ex) {
            return ResponseEntity.status(401).build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, criarRefreshCookie("", 0).toString())
                .build();
    }

    private ResponseCookie criarRefreshCookie(String valor, long maxAgeSegundos) {
        return ResponseCookie.from(REFRESH_COOKIE, valor)
                .httpOnly(true)
                .secure(false) // em producao (HTTPS) deve ser true
                .path(COOKIE_PATH)
                .maxAge(maxAgeSegundos)
                .sameSite("Strict")
                .build();
    }

    private String lerRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (REFRESH_COOKIE.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
