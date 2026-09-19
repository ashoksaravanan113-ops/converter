package com.converter.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class FormEndpointController {

    @PostMapping("/contact")
    public RedirectView contact(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String message) {

        if (isBlank(name) || isBlank(email) || isBlank(message)) {
            return new RedirectView("/contact-us?error=invalid", true);
        }

        return new RedirectView("/contact-us?submitted=true", true);
    }

    @PostMapping("/subscribe")
    public RedirectView subscribe(
            @RequestParam(required = false) String email) {

        if (isBlank(email)) {
            return new RedirectView("/blogsection/blog?subscribed=invalid", true);
        }

        return new RedirectView("/blogsection/blog?subscribed=true", true);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
