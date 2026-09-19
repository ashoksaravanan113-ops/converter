
package com.converter.controller;

import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    /*
     * ===========================
     * HOME PAGE
     * ===========================
     */

    @GetMapping("/")
    public String homePage() {

        return "indexhome";

    }

    /*
     * ===========================
     * ALL TOOLS
     * ===========================
     */

    @GetMapping("/tools")
    public String toolsPage() {

        return "tools";

    }

    /*
     * ===========================
     * PDF TOOLS
     * ===========================
     */

    @GetMapping("/pdf-tools")
    public String pdfToolsPage() {

        return "pdf-tools";

    }

    /*
     * ===========================
     * IMAGE TOOLS
     * ===========================
     */

    @GetMapping("/image-tools")
    public String imageToolsPage() {

        return "image-tools";

    }

    /*
     * ===========================
     * OFFICE TOOLS
     * ===========================
     */

    @GetMapping("/office-tools")
    public String officeToolsPage() {

        return "office-tools";

    }

    /*
     * ===========================
     * SECURITY TOOLS
     * ===========================
     */

    @GetMapping("/security-tools")
    public String securityToolsPage() {

        return "security-tools";

    }

    /*
     * ===========================
     * ABOUT US
     * ===========================
     */

    @GetMapping("/about-us")
    public String aboutUsPage() {

        return "about-us";

    }

    /*
     * ===========================
     * CONTACT US
     * ===========================
     */

    @GetMapping("/contact-us")
    public String contactUsPage() {

        return "contact-us";

    }

    /*
     * ===========================
     * PRIVACY POLICY
     * ===========================
     */

    @GetMapping("/privacy-policy")
    public String privacyPolicyPage() {

        return "privacy-policy";

    }

    /*
     * ===========================
     * TERMS & CONDITIONS
     * ===========================
     */

    @GetMapping("/terms-and-conditions")
    public String termsAndConditionsPage() {

        return "terms-and-conditions";

    }

    @GetMapping("/disclaimer")
    public String disclaimerPage() {

        return "disclaimer";

    }

    @GetMapping("/test404")
    public String test404() {
        return "error/404";
    }

}
