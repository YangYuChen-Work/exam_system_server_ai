package org.practicedemo.exam.exceptionhandlers;

import lombok.extern.slf4j.Slf4j;
import org.practicedemo.exam.common.Result;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public Result handleException(Exception e) {
        log.error("Exception: ", e);
        return Result.error(e.getMessage());
    }
}
