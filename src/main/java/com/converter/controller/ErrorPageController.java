package com.converter.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ErrorPageController {

    @GetMapping("/404")
    public String error404() {
        return "error/404";
    }

    @GetMapping("/500")
    public String error500() {
        return "error/500";
    }

    @GetMapping("/413")
    public String error413() {
        return "error/413";
    }
}