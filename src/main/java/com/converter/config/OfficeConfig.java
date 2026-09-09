package com.converter.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Resolves the LibreOffice executable and the converter's working
 * directory for whichever OS the app is currently running on.
 *
 * Dev machine: Windows, LibreOffice installed under Program Files.
 * Production: Railway container (Linux), LibreOffice installed via
 * apt in the Dockerfile — see Dockerfile note below.
 *
 * NOTE: This class no longer configures a JODConverter OfficeManager
 * bean. ExcelToPdfService shells out to `soffice` directly per request,
 * so JODConverter's LocalOfficeManager isn't used. Kept as a plain
 * utility rather than deleted, since ExcelToPdfService depends on it
 * for path resolution.
 */
public final class OfficeConfig {

    private OfficeConfig() {
    }

    private static final boolean IS_WINDOWS =
            System.getProperty("os.name", "").toLowerCase().contains("win");

    /**
     * Working directory for uploads / conversions / LO profiles.
     * Windows dev: D:\converter (existing convention).
     * Linux/Railway: relative "converter" folder under the app's
     * working directory (Railway's ephemeral writable filesystem).
     */
    public static Path baseDir() {
        if (IS_WINDOWS) {
            return Paths.get("D:\\converter");
        }
        return Paths.get(System.getProperty("user.dir"), "converter");
    }

    /**
     * Path (or bare command) to invoke for the soffice binary.
     * On Linux this tries a couple of common install locations before
     * falling back to "soffice" and relying on PATH.
     */
    public static String sofficeExecutable() {
        if (IS_WINDOWS) {
            return "C:\\Program Files\\LibreOffice\\program\\soffice.com";
        }

        String[] candidates = {
                "/usr/bin/soffice",
                "/usr/lib/libreoffice/program/soffice"
        };

        for (String candidate : candidates) {
            if (Files.exists(Paths.get(candidate))) {
                return candidate;
            }
        }

        // Fall back to PATH lookup.
        return "soffice";
    }
}