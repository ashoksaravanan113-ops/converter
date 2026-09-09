package com.converter.service;

import org.apache.poi.ss.usermodel.PrintSetup;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ExcelToPdfService {

    // ============================================================
    // DIRECTORIES
    // ============================================================
    // NOTE: still hardcoded to Windows paths, matching the original
    // service. Revisit this once you settle the Windows-vs-Linux
    // deployment question (see OfficeConfig).

    private static final Path BASE_DIR = Paths.get(System.getProperty("java.io.tmpdir"), "converter");

    private static final Path UPLOAD_DIR = BASE_DIR.resolve("uploaded-excel");

    private static final Path OUTPUT_DIR = BASE_DIR.resolve("converted-pdfs");

    private static final Path LO_PROFILE_DIR = BASE_DIR.resolve("lo-profiles");

    private static final String LIBREOFFICE =
        System.getProperty("os.name").toLowerCase().contains("win")
                ? "C:\\Program Files\\LibreOffice\\program\\soffice.com"
                : "soffice";

    private static final long MAX_FILE_SIZE = 50L * 1024 * 1024;

    // ============================================================
    // MAIN CONVERSION METHOD (matches ExcelToPdfController)
    // ============================================================

    public Map<String, Object> convertExcelToPdf(
            MultipartFile[] excelFiles,
            String orientation,
            String paperSize,
            String scaling,
            String quality) throws Exception {

        

        Files.createDirectories(UPLOAD_DIR);
        Files.createDirectories(OUTPUT_DIR);
        Files.createDirectories(LO_PROFILE_DIR);

        List<Map<String, Object>> convertedFiles = new ArrayList<>();

        for (MultipartFile file : excelFiles) {
            Path pdf = convertSingleFile(file, orientation, paperSize, scaling, quality);

            convertedFiles.add(Map.of(
                    "name", pdf.getFileName().toString(),
                    "size", formatSize(Files.size(pdf))));
        }

        return Map.of(
                "success", true,
                "files", convertedFiles);
    }

    // ============================================================
    // SINGLE FILE CONVERSION
    // ============================================================

    private Path convertSingleFile(
            MultipartFile file,
            String orientation,
            String paperSize,
            String scaling,
            String quality) throws Exception {

        String originalName = file.getOriginalFilename();
        if (originalName == null ||
                !(originalName.toLowerCase().endsWith(".xlsx")
                        || originalName.toLowerCase().endsWith(".xls"))) {
            throw new IllegalArgumentException(
                    "Only Excel files (.xlsx or .xls) are supported: " + originalName);
        }

        String extension = originalName.toLowerCase().endsWith(".xlsx") ? ".xlsx" : ".xls";

        String conversionId = UUID.randomUUID().toString();
        Path conversionDir = UPLOAD_DIR.resolve("conversion-" + conversionId);
        Files.createDirectories(conversionDir);

        // 1. Save the uploaded file as-is
        Path rawInputFile = conversionDir.resolve("input-raw" + extension);
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, rawInputFile, StandardCopyOption.REPLACE_EXISTING);
        }

        // 2. Apply page setup (orientation / paper size / scaling) via POI,
        // then re-save. This is what LibreOffice's PDF export will honor,
        // since the CLI convert-to filter itself has no such options.
        Path preparedInputFile = conversionDir.resolve("input" + extension);
        applyPageSetup(rawInputFile, preparedInputFile, orientation, paperSize, scaling);

        // 3. Convert with LibreOffice into an isolated temp dir + profile
        Path tempPdfDir = OUTPUT_DIR.resolve("temp-" + conversionId);
        Files.createDirectories(tempPdfDir);

        Path loProfile = LO_PROFILE_DIR.resolve("profile-" + conversionId);
        Files.createDirectories(loProfile);

        Path tempPdf = tempPdfDir.resolve(stripExtension(preparedInputFile.getFileName().toString()) + ".pdf");

        try {
            runLibreOfficeConversion(preparedInputFile, tempPdfDir, loProfile, quality);

            if (!waitForFile(tempPdf, 20, 500)) {
                Path found = findAnyPdf(tempPdfDir);
                if (found == null) {
                    throw new RuntimeException(
                            "LibreOffice finished, but no PDF was generated for " + originalName);
                }
                tempPdf = found;
            }

            String baseName = stripExtension(originalName);
            Path finalPdf = OUTPUT_DIR.resolve(baseName + "-" + conversionId.substring(0, 8) + ".pdf");
            Files.copy(tempPdf, finalPdf, StandardCopyOption.REPLACE_EXISTING);

            if (!Files.exists(finalPdf) || Files.size(finalPdf) == 0) {
                throw new RuntimeException("Conversion produced an empty PDF for " + originalName);
            }

            return finalPdf;

        } finally {
            cleanupDirectory(loProfile);
            cleanupDirectory(tempPdfDir);
            cleanupDirectory(conversionDir);
        }
    }

    // ============================================================
    // PAGE SETUP (orientation / paper size / scaling) VIA APACHE POI
    // ============================================================

    private void applyPageSetup(
            Path inputFile,
            Path outputFile,
            String orientation,
            String paperSize,
            String scaling) throws Exception {

        try (InputStream in = Files.newInputStream(inputFile);
                Workbook workbook = WorkbookFactory.create(in)) {

            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                PrintSetup printSetup = sheet.getPrintSetup();

                // Orientation
                printSetup.setLandscape("landscape".equalsIgnoreCase(orientation));

                // Paper size
                printSetup.setPaperSize(resolvePaperSize(paperSize));

                // Scaling
                if ("fit-page".equalsIgnoreCase(scaling)) {
                    sheet.setAutobreaks(true);
                    printSetup.setFitWidth((short) 1);
                    printSetup.setFitHeight((short) 1);
                    sheet.setFitToPage(true);
                } else if ("actual-size".equalsIgnoreCase(scaling)) {
                    sheet.setFitToPage(false);
                    printSetup.setScale((short) 100);
                } else {
                    // treat anything else as a numeric percentage, e.g. "75"
                    short percent = parseScalePercent(scaling);
                    sheet.setFitToPage(false);
                    printSetup.setScale(percent);
                }
            }

            try (var out = Files.newOutputStream(outputFile)) {
                workbook.write(out);
            }
        }
    }

    private short resolvePaperSize(String paperSize) {
        if (paperSize == null)
            return PrintSetup.A4_PAPERSIZE;
        return switch (paperSize.toLowerCase()) {
            case "letter" -> PrintSetup.LETTER_PAPERSIZE;
            case "legal" -> PrintSetup.LEGAL_PAPERSIZE;
            default -> PrintSetup.A4_PAPERSIZE;
        };
    }

    private short parseScalePercent(String scaling) {
        try {
            int value = Integer.parseInt(scaling.replaceAll("[^0-9]", ""));
            return (short) Math.max(10, Math.min(400, value));
        } catch (Exception e) {
            return 100;
        }
    }

    // ============================================================
    // LIBREOFFICE INVOCATION
    // ============================================================

    private void runLibreOfficeConversion(
            Path inputFile,
            Path outDir,
            Path loProfile,
            String quality) throws IOException, InterruptedException {

        String filterOptions = buildFilterOptions(quality);
        String convertTarget = "pdf:calc_pdf_Export:" + filterOptions;

        ProcessBuilder processBuilder = new ProcessBuilder(
                LIBREOFFICE,
                "--headless",
                "--invisible",
                "--nodefault",
                "--nologo",
                "--nofirststartwizard",
                "--norestore",
                "--nolockcheck",
                "-env:UserInstallation=" + loProfile.toUri().toString(),
                "--convert-to", convertTarget,
                "--outdir", outDir.toString(),
                inputFile.toString());

        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        String output;
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            output = reader.lines().collect(Collectors.joining(System.lineSeparator()));
        }

        boolean finished = process.waitFor(120, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("LibreOffice conversion timed out after 120 seconds.");
        }

        int exitCode = process.exitValue();
        if (exitCode != 0) {
            throw new RuntimeException(
                    "LibreOffice exited with code " + exitCode + ".\n" + output);
        }
    }

    /**
     * Maps the "quality" option to Calc PDF export FilterData properties.
     * Encoded as the JSON-ish syntax soffice's --convert-to accepts.
     */
    private String buildFilterOptions(String quality) {
        boolean reduceResolution;
        int maxResolution;

        switch (quality == null ? "high" : quality.toLowerCase()) {
            case "low" -> {
                reduceResolution = true;
                maxResolution = 75;
            }
            case "medium" -> {
                reduceResolution = true;
                maxResolution = 150;
            }
            default -> {
                reduceResolution = false;
                maxResolution = 300;
            }
        }

        return "{\"ReduceImageResolution\":{\"type\":\"boolean\",\"value\":\"" + reduceResolution + "\"},"
                + "\"MaxImageResolution\":{\"type\":\"long\",\"value\":\"" + maxResolution + "\"}}";
    }

    // ============================================================
    // SAFE PATH RESOLUTION (used by download/preview endpoints)
    // ============================================================

    /**
     * Resolves a converted PDF's file name against OUTPUT_DIR, rejecting
     * any name that would escape that directory (path traversal).
     */
    public Path resolveOutputFile(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("Missing file name.");
        }

        Path resolved = OUTPUT_DIR.resolve(fileName).normalize();

        if (!resolved.startsWith(OUTPUT_DIR)) {
            throw new SecurityException("Invalid file name.");
        }

        return resolved;
    }

    // ============================================================
    // CLEANUP (called by /delete-temp-files)
    // ============================================================

    public void deleteTempFiles() throws IOException {
        clearDirectoryContents(UPLOAD_DIR);
        clearDirectoryContents(OUTPUT_DIR);
        clearDirectoryContents(LO_PROFILE_DIR);
    }

    private void clearDirectoryContents(Path directory) throws IOException {
        if (directory == null || !Files.exists(directory)) {
            return;
        }
        try (var entries = Files.list(directory)) {
            entries.forEach(this::cleanupDirectory);
        }
    }

    private void cleanupDirectory(Path directory) {
        if (directory == null || !Files.exists(directory)) {
            return;
        }
        try {
            if (Files.isDirectory(directory)) {
                Files.walk(directory)
                        .sorted(Comparator.reverseOrder())
                        .forEach(path -> {
                            try {
                                Files.deleteIfExists(path);
                            } catch (IOException ignored) {
                            }
                        });
            } else {
                Files.deleteIfExists(directory);
            }
        } catch (IOException ignored) {
        }
    }

    // ============================================================
    // SMALL HELPERS
    // ============================================================

    private boolean waitForFile(Path file, int attempts, long delayMs) throws InterruptedException {
        for (int i = 0; i < attempts; i++) {
            try {
                if (Files.exists(file) && Files.size(file) > 0) {
                    return true;
                }
            } catch (IOException ignored) {
            }
            Thread.sleep(delayMs);
        }
        return false;
    }

    private Path findAnyPdf(Path dir) throws IOException {
        try (var files = Files.list(dir)) {
            return files
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().toLowerCase().endsWith(".pdf"))
                    .filter(p -> {
                        try {
                            return Files.size(p) > 1000;
                        } catch (IOException e) {
                            return false;
                        }
                    })
                    .findFirst()
                    .orElse(null);
        }
    }

    private String stripExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot > 0 ? fileName.substring(0, dot) : fileName;
    }

    private String formatSize(long bytes) {
        double mb = bytes / 1024.0 / 1024.0;
        return String.format("%.2f MB", mb);
    }
}