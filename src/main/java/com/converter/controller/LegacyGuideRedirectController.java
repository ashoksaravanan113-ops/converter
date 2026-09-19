package com.converter.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class LegacyGuideRedirectController {

    @GetMapping("/pdf-to-word-guide")
    public RedirectView r1() { return new RedirectView("/blog/pdf-to-word-guide", true); }

    @GetMapping("/pdf-unlocker-guide")
    public RedirectView r2() { return new RedirectView("/blog/pdf-unlocker-guide", true); }

    @GetMapping("/pdf-extract-text-guide")
    public RedirectView r3() { return new RedirectView("/blog/pdf-extract-text-guide", true); }

    @GetMapping("/pdf-compressor-guide")
    public RedirectView r4() { return new RedirectView("/blog/pdf-compressor-guide", true); }

    @GetMapping("/pdf-to-image-guide")
    public RedirectView r5() { return new RedirectView("/blog/pdf-to-image-guide", true); }

    @GetMapping("/word-to-pdf-guide")
    public RedirectView r6() { return new RedirectView("/blog/word-to-pdf-guide", true); }

    @GetMapping("/pdf-rotator-guide")
    public RedirectView r7() { return new RedirectView("/blog/pdf-rotator-guide", true); }

    @GetMapping("/pdf-page-numbers-guide")
    public RedirectView r8() { return new RedirectView("/blog/pdf-page-numbers-guide", true); }

    @GetMapping("/excel-to-pdf-guide")
    public RedirectView r9() { return new RedirectView("/blog/excel-to-pdf-guide", true); }

    @GetMapping("/pdf-crop-guide")
    public RedirectView r10() { return new RedirectView("/blog/pdf-crop-guide", true); }

    @GetMapping("/image-resizer-guide")
    public RedirectView r11() { return new RedirectView("/blog/image-resizer-guide", true); }

    @GetMapping("/pdf-splitter-guide")
    public RedirectView r12() { return new RedirectView("/blog/pdf-splitter-guide", true); }

    @GetMapping("/pdf-page-remover-guide")
    public RedirectView r13() { return new RedirectView("/blog/pdf-page-remover-guide", true); }

    @GetMapping("/image-to-pdf-guide")
    public RedirectView r14() { return new RedirectView("/blog/image-to-pdf-guide", true); }

    @GetMapping("/powerpoint-to-pdf-guide")
    public RedirectView r15() { return new RedirectView("/blog/powerpoint-to-pdf-guide", true); }

    @GetMapping("/pdf-protector-guide")
    public RedirectView r16() { return new RedirectView("/blog/pdf-protector-guide", true); }

    @GetMapping("/jpg-png-converter-guide")
    public RedirectView r17() { return new RedirectView("/blog/jpg-png-converter-guide", true); }

    @GetMapping("/image-compressor-guide")
    public RedirectView r18() { return new RedirectView("/blog/image-compressor-guide", true); }
}
