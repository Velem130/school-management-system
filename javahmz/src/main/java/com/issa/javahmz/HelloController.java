package com.issa.javahmz;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// This annotation tells Spring that this class handles web requests
@RestController
public class HelloController {

    // This annotation maps HTTP GET requests to the root path ("/")
    @GetMapping("/")
    public String home() {
        return "Hello from Spring Boot pliz dont kill issa velem is my only hope . issa.come.. .";
    }

    // You can add another path to test
    @GetMapping("/test")
    public String test() {
        return "This is a second test endpoint, issa where are you.";
    }


       // This annotation maps HTTP GET requests to the root path ("/")
    @GetMapping("/issa")
    public String issa() {
        return "Morning isaac Spring Boot dont be issa velem.... .";
    }

}
