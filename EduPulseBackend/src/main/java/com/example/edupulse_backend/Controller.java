package com.example.edupulse_backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Controller {

    @GetMapping("/hi")
    public String hello() {
        return "Hello World";
    }




}
