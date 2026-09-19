package com.converter.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class CompatibilityRedirectController {

    @GetMapping("/blog")
    public RedirectView blog() { return new RedirectView("/blogsection/blog", true); }

    @GetMapping("/blog/image")
    public RedirectView blog_image() { return new RedirectView("/blogsection/image", true); }

    @GetMapping("/blog/office")
    public RedirectView blog_office() { return new RedirectView("/blogsection/office", true); }

    @GetMapping("/blog/security")
    public RedirectView blog_security() { return new RedirectView("/blogsection/security", true); }

    @GetMapping("/pdf-to-jpg")
    public RedirectView pdf_to_jpg() { return new RedirectView("/pdf-to-image", true); }

    @GetMapping("/blog/pdf-to-jpg-guide")
    public RedirectView blog_pdf_to_jpg_guide() { return new RedirectView("/blog/pdf-to-image-guide", true); }

    @GetMapping("/blog/webp-converter-guide")
    public RedirectView blog_webp_converter_guide() { return new RedirectView("/blogsection/image", true); }

    @GetMapping("/pdf-extract-pages")
    public RedirectView pdf_extract_pages() { return new RedirectView("/pdf-splitter", true); }

}
