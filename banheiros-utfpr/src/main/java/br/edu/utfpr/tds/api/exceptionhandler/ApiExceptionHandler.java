package br.edu.utfpr.tds.api.exceptionhandler;

import br.edu.utfpr.tds.api.service.BanheiroInativoException;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatus status,
            WebRequest request) {

        BindingResult bindingResult = ex.getBindingResult();

        List<Problema.Erro> erros = bindingResult.getFieldErrors().stream()
                .map(fe -> new Problema.Erro(fe.getField(), fe.getDefaultMessage()))
                .collect(Collectors.toList());

        return handleExceptionInternal(ex, new Problema(erros), headers, HttpStatus.BAD_REQUEST, request);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex,
            HttpHeaders headers,
            HttpStatus status,
            WebRequest request) {

        String mensagem;
        if (ex.getCause() instanceof UnrecognizedPropertyException) {
            UnrecognizedPropertyException upe = (UnrecognizedPropertyException) ex.getCause();
            mensagem = "Propriedade desconhecida: " + upe.getPropertyName();
        } else {
            mensagem = "Corpo da requisição inválido ou mal-formado.";
        }

        List<Problema.Erro> erros = List.of(new Problema.Erro("corpo", mensagem));
        return handleExceptionInternal(ex, new Problema(erros), headers, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(EmptyResultDataAccessException.class)
    public ResponseEntity<Object> handleEmptyResultDataAccess(EmptyResultDataAccessException ex) {
        List<Problema.Erro> erros = List.of(new Problema.Erro("id", "Recurso não encontrado."));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new Problema(erros));
    }

    @ExceptionHandler(BanheiroInativoException.class)
    public ResponseEntity<Object> handleBanheiroInativo(BanheiroInativoException ex) {
        List<Problema.Erro> erros = List.of(new Problema.Erro("banheiro", ex.getMessage()));
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(new Problema(erros));
    }
}
