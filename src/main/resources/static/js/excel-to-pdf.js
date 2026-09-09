/* ============================================================
   EXCEL TO PDF CONVERTER
   ============================================================ */

/* ===========================
   ELEMENTS
=========================== */

const excelFiles =
    document.getElementById("excelFiles");

const dropZone =
    document.getElementById("dropZone");

const summaryCard =
    document.getElementById("summaryCard");

const fileListContainer =
    document.getElementById("fileListContainer");

const totalFiles =
    document.getElementById("totalFiles");

const totalSize =
    document.getElementById("totalSize");

const excelToPdfForm =
    document.getElementById("excelToPdfForm");

const convertBtn =
    document.getElementById("convertBtn");

const progressContainer =
    document.getElementById("progressContainer");

const progressBar =
    document.getElementById("progressBar");

let selectedFiles = [];


/* ============================================================
   FILE SELECT
============================================================ */

excelFiles.addEventListener(
    "change",
    function () {

        let duplicateFiles = [];

        Array.from(this.files).forEach(file => {

            const exists =
                selectedFiles.some(
                    f =>
                        f.name === file.name &&
                        f.size === file.size
                );

            if (exists) {

                duplicateFiles.push(
                    file.name
                );

                return;
            }

            selectedFiles.push(file);

        });

        if (duplicateFiles.length > 0) {

            alert(
                "These files already exist:\n\n" +
                [...new Set(duplicateFiles)]
                    .join("\n")
            );
        }

        renderFiles();

        /*
         * Reset input so the same file can be selected again.
         */
        this.value = "";

    }
);


/* ============================================================
   DRAG & DROP
============================================================ */

dropZone.addEventListener(
    "dragover",
    function (e) {

        e.preventDefault();

        dropZone.classList.add(
            "drag-over"
        );

    }
);

dropZone.addEventListener(
    "dragleave",
    function () {

        dropZone.classList.remove(
            "drag-over"
        );

    }
);

dropZone.addEventListener(
    "drop",
    function (e) {

        e.preventDefault();

        dropZone.classList.remove(
            "drag-over"
        );

        let duplicateFiles = [];

        Array.from(
            e.dataTransfer.files
        ).forEach(file => {

            const exists =
                selectedFiles.some(
                    f =>
                        f.name === file.name &&
                        f.size === file.size
                );

            if (exists) {

                duplicateFiles.push(
                    file.name
                );

                return;
            }

            selectedFiles.push(file);

        });

        if (duplicateFiles.length > 0) {

            alert(
                "These files already exist:\n\n" +
                [...new Set(duplicateFiles)]
                    .join("\n")
            );
        }

        renderFiles();

    }
);


/* ============================================================
   RENDER FILES
============================================================ */

function renderFiles() {

    if (selectedFiles.length === 0) {

        summaryCard.style.display =
            "none";

        fileListContainer.innerHTML =
            "";

        return;
    }

    summaryCard.style.display =
        "flex";

    let totalBytes = 0;

    fileListContainer.innerHTML =
        "";

    selectedFiles.forEach(
        (file, index) => {

            totalBytes += file.size;

            fileListContainer.innerHTML += `

                <div class="card">

                    <div class="card-body">

                        <div class="row align-items-center">

                            <div class="col-md-5 file-row-name">

                                <i class="bi bi-file-earmark-excel-fill"></i>

                                ${escapeHtml(file.name)}

                            </div>

                            <div class="col-md-2 text-center">

                                ${(file.size / 1024 / 1024).toFixed(2)} MB

                            </div>

                            <div class="col-md-2 text-center">

                                <button
                                    type="button"
                                    class="btn btn-primary btn-sm"
                                    onclick="previewExcel(${index})">

                                    Preview

                                </button>

                            </div>

                            <div class="col-md-3 text-center">

                                <button
                                    type="button"
                                    class="btn btn-danger btn-sm"
                                    onclick="deleteFile(${index})">

                                    Delete

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            `;
        }
    );

    totalFiles.innerHTML =
        selectedFiles.length;

    totalSize.innerHTML =
        (
            totalBytes /
            1024 /
            1024
        ).toFixed(2) +
        " MB";
}


/* ============================================================
   DELETE FILE
============================================================ */

function deleteFile(index) {

    if (
        index < 0 ||
        index >= selectedFiles.length
    ) {
        return;
    }

    selectedFiles.splice(
        index,
        1
    );

    renderFiles();

    if (
        selectedFiles.length === 0
    ) {

        excelFiles.value = "";

    }
}


/* ============================================================
   EXCEL PREVIEW
============================================================ */

function previewExcel(index) {

    const file =
        selectedFiles[index];

    if (!file) {

        return;
    }

    const reader =
        new FileReader();

    reader.onload =
        function (e) {

            try {

                const data =
                    new Uint8Array(
                        e.target.result
                    );

                const workbook =
                    XLSX.read(
                        data,
                        {
                            type: "array"
                        }
                    );

                if (
                    !workbook.SheetNames ||
                    workbook.SheetNames.length === 0
                ) {

                    throw new Error(
                        "No worksheet was found in this Excel file."
                    );
                }

                const firstSheet =
                    workbook.SheetNames[0];

                const worksheet =
                    workbook.Sheets[firstSheet];

                const html =
                    XLSX.utils.sheet_to_html(
                        worksheet
                    );

                document.querySelector(
                    "#pdfPreviewModal .modal-title"
                ).innerHTML =
                    escapeHtml(file.name);

                document.getElementById(
                    "excelPreviewContainer"
                ).style.display =
                    "block";

                document.getElementById(
                    "pdfPreviewFrame"
                ).style.display =
                    "none";

                document.getElementById(
                    "excelPreviewContainer"
                ).innerHTML =
                    html;

                const modal =
                    new bootstrap.Modal(
                        document.getElementById(
                            "pdfPreviewModal"
                        )
                    );

                modal.show();

            } catch (error) {

                console.error(
                    "Excel preview error:",
                    error
                );

                alert(
                    "Unable to preview this Excel file."
                );
            }
        };

    reader.onerror =
        function () {

            alert(
                "Unable to read the Excel file."
            );

        };

    reader.readAsArrayBuffer(file);
}


/* ============================================================
   SUBMIT / CONVERT
============================================================ */

excelToPdfForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();

        /*
         * --------------------------------------------------------
         * BASIC VALIDATION
         * --------------------------------------------------------
         */

        if (
            selectedFiles.length === 0
        ) {

            alert(
                "Please select Excel files."
            );

            return;
        }

        if (
            !validateFiles(
                selectedFiles
            )
        ) {

            return;
        }

        /*
         * --------------------------------------------------------
         * GET OPTIONS SAFELY
         * --------------------------------------------------------
         */

        const orientation =
            document.querySelector(
                'input[name="orientation"]:checked'
            );

        const paperSize =
            document.querySelector(
                'input[name="paperSize"]:checked'
            );

        const scaling =
            document.querySelector(
                'input[name="scaling"]:checked'
            );

        const quality =
            document.querySelector(
                'input[name="quality"]:checked'
            );

        if (
            !orientation ||
            !paperSize ||
            !scaling ||
            !quality
        ) {

            alert(
                "Please select all PDF conversion options."
            );

            return;
        }

        /*
         * --------------------------------------------------------
         * FORM DATA
         * --------------------------------------------------------
         */

        const formData =
            new FormData();

        selectedFiles.forEach(
            file => {

                formData.append(
                    "excelFiles",
                    file
                );

            }
        );

        formData.append(
            "orientation",
            orientation.value
        );

        formData.append(
            "paperSize",
            paperSize.value
        );

        formData.append(
            "scaling",
            scaling.value
        );

        formData.append(
            "quality",
            quality.value
        );


        /*
         * --------------------------------------------------------
         * DISABLE UI
         * --------------------------------------------------------
         */

        setConversionState(
            true
        );


        /*
         * --------------------------------------------------------
         * SHOW PROGRESS
         * --------------------------------------------------------
         */

        showProgress(
            5,
            "Uploading files..."
        );


        /*
         * --------------------------------------------------------
         * START REQUEST
         *
         * No artificial setTimeout.
         * --------------------------------------------------------
         */

        try {

            showProgress(
                10,
                "Sending files to server..."
            );


            const response =
                await fetch(
                    "/excel-to-pdf-ajax",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            /*
             * ----------------------------------------------------
             * HTTP ERROR
             * ----------------------------------------------------
             */

            if (!response.ok) {

                let message =
                    "Server error (" +
                    response.status +
                    ").";

                try {

                    const errorText =
                        await response.text();

                    if (
                        errorText &&
                        errorText.trim()
                    ) {

                        message =
                            errorText;
                    }

                } catch (ignore) {
                    // Keep default message.
                }

                throw new Error(
                    message
                );
            }


            /*
             * ----------------------------------------------------
             * READ JSON
             * ----------------------------------------------------
             */

            showProgress(
                85,
                "Preparing converted PDF..."
            );

            const result =
                await response.json();


            /*
             * ----------------------------------------------------
             * BACKEND FAILURE
             * ----------------------------------------------------
             */

            if (
                !result ||
                result.success !== true
            ) {

                throw new Error(
                    result &&
                    result.message
                        ? result.message
                        : "Excel to PDF conversion failed."
                );
            }


            /*
             * ----------------------------------------------------
             * SUCCESS
             * ----------------------------------------------------
             */

            showProgress(
                100,
                "Conversion complete!"
            );


            /*
             * Give the browser a moment to
             * display 100%.
             */

            await sleep(
                400
            );


            hideProgress();

            buildResult(
                result
            );


        } catch (error) {

            console.error(
                "Excel to PDF conversion error:",
                error
            );

            hideProgress();

            setConversionState(
                false
            );

            document.getElementById(
                "uploadSection"
            ).style.display =
                "block";

            /*
             * Show the actual backend error.
             */

            alert(
                error &&
                error.message
                    ? error.message
                    : "Conversion failed. Please try again."
            );
        }

    }
);


/* ============================================================
   PROGRESS
============================================================ */

/*
 * The backend conversion does not currently provide
 * real-time percentage updates.
 *
 * Therefore we do NOT falsely show 25%, 75%, etc.
 *
 * Instead:
 *
 * 5%   Uploading
 * 10%  Sending
 * 10-85% Converting / waiting
 * 85% Preparing
 * 100% Complete
 */

let progressTimer = null;

function showProgress(
    percentage,
    message
) {

    if (!progressContainer) {

        return;
    }

    progressContainer.style.display =
        "block";

    if (progressBar) {

        progressBar.style.width =
            percentage + "%";

        progressBar.innerHTML =
            percentage + "%";

        progressBar.setAttribute(
            "aria-valuenow",
            percentage
        );

        progressBar.setAttribute(
            "aria-valuetext",
            message || percentage + "%"
        );
    }

    /*
     * Update text if your page has a
     * progress message element.
     */

    const progressMessage =
        document.getElementById(
            "progressMessage"
        );

    if (progressMessage) {

        progressMessage.textContent =
            message || "Processing...";
    }

    /*
     * When waiting for the backend,
     * slowly move the visual bar toward 80%.
     *
     * It never reaches 100% until the
     * backend actually returns success.
     */

    if (
        percentage >= 10 &&
        percentage < 85
    ) {

        startWaitingProgress(
            percentage
        );

    } else {

        stopWaitingProgress();

    }
}


function startWaitingProgress(
    startingPercentage
) {

    stopWaitingProgress();

    let current =
        Math.max(
            10,
            startingPercentage
        );

    progressTimer =
        setInterval(
            function () {

                if (
                    current >= 80
                ) {

                    return;
                }

                /*
                 * Slow movement.
                 *
                 * This prevents the bar from
                 * appearing frozen while Java
                 * is processing the Excel file.
                 */

                current += 1;

                if (
                    progressBar
                ) {

                    progressBar.style.width =
                        current + "%";

                    progressBar.innerHTML =
                        current + "%";

                    progressBar.setAttribute(
                        "aria-valuenow",
                        current
                    );
                }

            },
            1500
        );
}


function stopWaitingProgress() {

    if (
        progressTimer !== null
    ) {

        clearInterval(
            progressTimer
        );

        progressTimer =
            null;
    }
}


function hideProgress() {

    stopWaitingProgress();

    if (
        progressContainer
    ) {

        progressContainer.style.display =
            "none";
    }

    if (
        progressBar
    ) {

        progressBar.style.width =
            "0%";

        progressBar.innerHTML =
            "0%";

        progressBar.setAttribute(
            "aria-valuenow",
            "0"
        );
    }

    const progressMessage =
        document.getElementById(
            "progressMessage"
        );

    if (progressMessage) {

        progressMessage.textContent =
            "";
    }
}


/* ============================================================
   UI LOCK / UNLOCK
============================================================ */

function setConversionState(
    converting
) {

    if (
        convertBtn
    ) {

        convertBtn.disabled =
            converting;
    }

    if (
        excelFiles
    ) {

        excelFiles.disabled =
            converting;
    }

    document
        .querySelectorAll(
            ".btn-danger"
        )
        .forEach(
            btn => {

                btn.disabled =
                    converting;

            }
        );

    document
        .querySelectorAll(
            ".btn-primary"
        )
        .forEach(
            btn => {

                btn.disabled =
                    converting;

            }
        );

    const uploadSection =
        document.getElementById(
            "uploadSection"
        );

    if (
        uploadSection
    ) {

        uploadSection.style.display =
            converting
                ? "none"
                : "block";
    }
}


/* ============================================================
   RESULT
============================================================ */

function buildResult(
    result
) {

    const uploadSection =
        document.getElementById(
            "uploadSection"
        );

    const resultCard =
        document.getElementById(
            "resultCard"
        );

    const container =
        document.getElementById(
            "resultFilesContainer"
        );

    if (
        uploadSection
    ) {

        uploadSection.style.display =
            "none";
    }

    if (
        resultCard
    ) {

        resultCard.style.display =
            "block";
    }

    if (
        !container
    ) {

        return;
    }

    container.innerHTML =
        "";

    if (
        !result.files ||
        !Array.isArray(result.files)
    ) {

        return;
    }


    result.files.forEach(
        file => {

            const encodedFileName =
                encodeURIComponent(
                    file.name
                );

            container.innerHTML += `

                <div class="card">

                    <div class="card-body">

                        <div class="row text-center align-items-center">

                            <div class="col-md-4">

                                ${escapeHtml(file.name)}

                            </div>

                            <div class="col-md-2">

                                ${escapeHtml(file.size)}

                            </div>

                            <div class="col-md-3">

                                <button
                                    type="button"
                                    class="btn btn-primary btn-sm"
                                    onclick="previewResultPdf('${escapeJsString(file.name)}')">

                                    Preview

                                </button>

                            </div>

                            <div class="col-md-3">

                                <a
                                   href="/download-converted-pdf?fileName=${encodedFileName}"
                                   class="btn btn-success btn-sm">

                                   Download

                                </a>

                            </div>

                        </div>

                    </div>

                </div>

            `;
        }
    );


    const resultFiles =
        document.getElementById(
            "resultFiles"
        );

    if (
        resultFiles
    ) {

        resultFiles.innerHTML =
            result.files.length;
    }


    const resultSuccess =
        document.getElementById(
            "resultSuccess"
        );

    if (
        resultSuccess
    ) {

        resultSuccess.innerHTML =
            result.files.length;
    }
}


/* ============================================================
   RESULT PDF PREVIEW
============================================================ */

function previewResultPdf(
    fileName
) {

    const excelPreviewContainer =
        document.getElementById(
            "excelPreviewContainer"
        );

    const pdfPreviewFrame =
        document.getElementById(
            "pdfPreviewFrame"
        );

    const modalElement =
        document.getElementById(
            "pdfPreviewModal"
        );

    if (
        excelPreviewContainer
    ) {

        excelPreviewContainer.style.display =
            "none";
    }

    if (
        pdfPreviewFrame
    ) {

        pdfPreviewFrame.style.display =
            "block";

        pdfPreviewFrame.src =
            "/preview-converted-pdf?fileName=" +
            encodeURIComponent(
                fileName
            );
    }

    if (
        modalElement
    ) {

        const modal =
            new bootstrap.Modal(
                modalElement
            );

        modal.show();
    }
}


/* ============================================================
   CONVERT MORE
============================================================ */

const convertMoreBtn =
    document.getElementById(
        "convertMoreBtn"
    );

if (
    convertMoreBtn
) {

    convertMoreBtn.addEventListener(
        "click",
        function () {

            convertMoreBtn.disabled =
                true;

            fetch(
                "/delete-temp-files",
                {
                    method: "POST"
                }
            )
                .catch(
                    error => {

                        console.error(
                            "Cleanup error:",
                            error
                        );

                    }
                )
                .finally(
                    () => {

                        location.reload();

                    }
                );

        }
    );
}


/* ============================================================
   DARK MODE
============================================================ */

const darkModeBtn =
    document.getElementById(
        "darkModeBtn"
    );

if (
    darkModeBtn
) {

    darkModeBtn.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "dark-mode"
            );

        }
    );
}


/* ============================================================
   FILE VALIDATION
============================================================ */

function validateFiles(
    files
) {

    for (
        const file of files
    ) {

        const fileName =
            file.name.toLowerCase();


        /*
         * Maximum 50 MB
         */

        if (
            file.size >
            50 * 1024 * 1024
        ) {

            alert(
                file.name +
                " exceeds 50 MB."
            );

            return false;
        }


        /*
         * MIME type
         */

        const validType =
            file.type ===
                "application/vnd.ms-excel"
            ||
            file.type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";


        /*
         * Extension
         */

        const validExtension =
            fileName.endsWith(
                ".xls"
            )
            ||
            fileName.endsWith(
                ".xlsx"
            );


        if (
            !validType &&
            !validExtension
        ) {

            alert(
                file.name +
                " is not a valid Excel file."
            );

            return false;
        }
    }

    return true;
}


/* ============================================================
   HELPERS
============================================================ */

function sleep(
    milliseconds
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


function escapeJsString(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }

    return String(value)
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        )
        .replace(
            /\r/g,
            "\\r"
        )
        .replace(
            /\n/g,
            "\\n"
        );
}