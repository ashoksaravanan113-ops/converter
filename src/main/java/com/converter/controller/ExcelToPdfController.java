package com.converter.controller;

import com.converter.service.ExcelToPdfService;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@Controller
public class ExcelToPdfController {

    @Autowired
    private ExcelToPdfService excelToPdfService;

    /*
     * ===========================
     * PAGE
     * ===========================
     */

    @GetMapping("/excel-to-pdf")
    public String excelToPdfPage() {
        return "excel-to-pdf";
    }

    /*
     * ===========================
     * CONVERT EXCEL TO PDF
     * ===========================
     */

    @PostMapping("/excel-to-pdf-ajax")
    @ResponseBody
    public Map<String, Object> convertExcelToPdf(

            @RequestParam("excelFiles") MultipartFile[] excelFiles,
            @RequestParam("orientation") String orientation,
            @RequestParam("paperSize") String paperSize,
            @RequestParam("scaling") String scaling,
            @RequestParam("quality") String quality

    ) {

        if (excelFiles == null || excelFiles.length == 0) {
            return Map.of(
                    "success", false,
                    "message", "Please upload at least one Excel file.");
        }

        for (MultipartFile file : excelFiles) {

            if (file.isEmpty()) {
                return Map.of(
                        "success", false,
                        "message", "One of the uploaded files is empty.");
            }

            String fileName = file.getOriginalFilename();

            if (fileName == null) {
                return Map.of(
                        "success", false,
                        "message", "Invalid file.");
            }

            fileName = fileName.toLowerCase();

            if (!fileName.endsWith(".xls") && !fileName.endsWith(".xlsx")) {
                return Map.of(
                        "success", false,
                        "message", file.getOriginalFilename() + " is not a valid Excel file.");
            }

            if (file.getSize() > 50 * 1024 * 1024) {
                return Map.of(
                        "success", false,
                        "message", file.getOriginalFilename() + " exceeds 50 MB.");
            }
        }

        try {

            return excelToPdfService.convertExcelToPdf(
                    excelFiles, orientation, paperSize, scaling, quality);

        } catch (Exception e) {

            return Map.of(
                    "success", false,
                    "message", e.getMessage());
        }
    }

    /*
     * ===========================
     * DOWNLOAD PDF
     * ===========================
     */

    @GetMapping("/download-converted-pdf")
    public ResponseEntity<Resource> downloadPdf(@RequestParam("fileName") String fileName) {

        try {

            Path file = excelToPdfService.resolveOutputFile(fileName);

            if (!Files.exists(file)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + file.getFileName() + "\"")
                    .contentLength(Files.size(file))
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);

        } catch (SecurityException e) {

            return ResponseEntity.badRequest().build();

        } catch (Exception e) {

            return ResponseEntity.notFound().build();
        }
    }

    /*
     * ===========================
     * PREVIEW PDF
     * ===========================
     */

    @GetMapping("/preview-converted-pdf")
    public ResponseEntity<Resource> previewPdf(@RequestParam("fileName") String fileName) {

        try {

            Path file = excelToPdfService.resolveOutputFile(fileName);

            if (!Files.exists(file)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + file.getFileName() + "\"")
                    .contentLength(Files.size(file))
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);

        } catch (SecurityException e) {

            return ResponseEntity.badRequest().build();

        } catch (Exception e) {

            return ResponseEntity.notFound().build();
        }
    }

    /*
     * ===========================
     * DELETE TEMP FILES
     * ===========================
     */

    @PostMapping("/delete-temp-files")
    @ResponseBody
    public Map<String, Object> deleteTempFiles() {

        try {

            excelToPdfService.deleteTempFiles();
            return Map.of("success", true);

        } catch (Exception e) {

            return Map.of(
                    "success", false,
                    "message", e.getMessage());
        }
    }
}