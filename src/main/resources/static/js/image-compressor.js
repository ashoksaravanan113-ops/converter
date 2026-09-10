/* =========================================================
   IMAGE COMPRESSOR - CONVERTNOVA
   ========================================================= */

const imageFiles =
    document.getElementById("imageFiles");

const compressionLevel =
    document.getElementById("compressionLevel");

const dropZone =
    document.getElementById("dropZone");

const compressForm =
    document.getElementById("compressForm");

const uploadSection =
    document.getElementById("uploadSection");

const resultCard =
    document.getElementById("resultCard");

const summaryCard =
    document.getElementById("summaryCard");

const fileListContainer =
    document.getElementById("fileListContainer");

const totalFiles =
    document.getElementById("totalFiles");

const totalSize =
    document.getElementById("totalSize");


/*
 * IMPORTANT:
 * HTML uses progressContainer.
 * Do NOT use progressSection as the HTML ID.
 */
const progressSection =
    document.getElementById("progressContainer");

const progressBar =
    document.getElementById("progressBar");

const quality =
    document.getElementById("quality");

const qualityValue =
    document.getElementById("qualityValue");


let selectedFiles = [];


/* =========================================================
   QUALITY
   ========================================================= */

if (quality && qualityValue) {

    quality.addEventListener(
        "input",
        function () {

            qualityValue.textContent =
                this.value + "%";

        }
    );

}


/* =========================================================
   HELPERS
   ========================================================= */

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null
            ? ""
            : String(value);

    return div.innerHTML;
}


function formatMB(bytes) {

    return (
        bytes /
        1024 /
        1024
    ).toFixed(2) + " MB";

}


/* =========================================================
   BUTTON / UI STATE
   ========================================================= */

function setButtonProcessing(
    processing
) {

    const submitButton =
        compressForm
            ? compressForm.querySelector(
                'button[type="submit"]'
            )
            : null;


    if (submitButton) {

        submitButton.disabled =
            processing;

        submitButton.textContent =
            processing
                ? "Compressing..."
                : "Compress Images";

    }


    if (imageFiles) {

        imageFiles.disabled =
            processing;

    }


    if (quality) {

        quality.disabled =
            processing;

    }


    if (compressionLevel) {

        compressionLevel.disabled =
            processing;

    }


    document
        .querySelectorAll(
            ".btn-danger"
        )
        .forEach(
            btn => {

                btn.disabled =
                    processing;

            }
        );

}


/* =========================================================
   PROGRESS
   ========================================================= */

function showProgress() {

    if (progressSection) {

        progressSection.style.display =
            "block";

        progressSection.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

    updateProgress(
        0,
        "0%"
    );

}


function updateProgress(
    percent,
    text
) {

    if (!progressBar) {

        return;

    }


    percent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );


    progressBar.style.width =
        percent + "%";


    progressBar.textContent =
        text ||
        percent + "%";


    progressBar.setAttribute(
        "aria-valuenow",
        String(percent)
    );

}


function hideProgress() {

    if (progressSection) {

        progressSection.style.display =
            "none";

    }


    updateProgress(
        0,
        "0%"
    );

}


function resetUIAfterError() {

    setButtonProcessing(
        false
    );


    hideProgress();


    if (uploadSection) {

        uploadSection.style.display =
            "block";

    }


    if (summaryCard) {

        summaryCard.style.display =
            selectedFiles.length > 0
                ? "flex"
                : "none";

    }

}


function showError(message) {

    resetUIAfterError();


    alert(
        message ||
        "Compression failed. Please try again."
    );

}


/* =========================================================
   VALIDATION
   ========================================================= */

function validateFiles(
    files
) {

    if (
        !files ||
        files.length === 0
    ) {

        alert(
            "Please select at least one image."
        );

        return false;

    }


    const maxFileSize =
        50 * 1024 * 1024;


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    const invalidFiles = [];

    const oversizedFiles = [];


    files.forEach(
        file => {

            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                invalidFiles.push(
                    file.name
                );

                return;

            }


            if (
                file.size >
                maxFileSize
            ) {

                oversizedFiles.push(
                    file.name
                );

            }

        }
    );


    if (
        invalidFiles.length > 0
    ) {

        alert(
            "Unsupported or invalid image files:\n\n" +
            invalidFiles.join("\n") +
            "\n\nSupported formats: JPG, PNG and WEBP."
        );

        return false;

    }


    if (
        oversizedFiles.length > 0
    ) {

        alert(
            "The following files exceed the 50 MB limit:\n\n" +
            oversizedFiles.join("\n")
        );

        return false;

    }


    return true;

}


/* =========================================================
   ADD FILES
   ========================================================= */

function addFiles(
    fileList
) {

    const duplicateNames = [];

    const invalidFiles = [];

    const filesToAdd = [];


    Array.from(
        fileList || []
    ).forEach(
        file => {

            if (
                !file.type.startsWith(
                    "image/"
                ) ||
                file.size >
                50 * 1024 * 1024
            ) {

                invalidFiles.push(
                    file.name
                );

                return;

            }


            const alreadyExists =
                selectedFiles.some(
                    existingFile =>

                        existingFile.name ===
                        file.name &&

                        existingFile.size ===
                        file.size &&

                        existingFile.lastModified ===
                        file.lastModified
                );


            if (
                alreadyExists
            ) {

                duplicateNames.push(
                    file.name
                );

            }
            else {

                filesToAdd.push(
                    file
                );

            }

        }
    );


    selectedFiles.push(
        ...filesToAdd
    );


    if (
        invalidFiles.length > 0
    ) {

        alert(
            "Invalid or oversized files:\n\n" +
            invalidFiles.join("\n") +
            "\n\nOnly JPG, PNG and WEBP images up to 50 MB are supported."
        );

    }


    if (
        duplicateNames.length > 0
    ) {

        alert(
            "Duplicate files:\n\n" +
            duplicateNames.join("\n")
        );

    }


    if (
        filesToAdd.length > 0
    ) {

        showFiles();

    }

}


/* =========================================================
   FILE SELECT
   ========================================================= */

if (imageFiles) {

    imageFiles.addEventListener(
        "change",
        function () {

            addFiles(
                this.files
            );


            /*
             * Allows the same file to be
             * selected again.
             */
            this.value = "";

        }
    );

}


/* =========================================================
   DRAG & DROP
   ========================================================= */

if (dropZone) {

    dropZone.addEventListener(
        "dragover",
        function (e) {

            e.preventDefault();

            dropZone.classList.add(
                "drag-active"
            );

        }
    );


    dropZone.addEventListener(
        "dragleave",
        function () {

            dropZone.classList.remove(
                "drag-active"
            );

        }
    );


    dropZone.addEventListener(
        "drop",
        function (e) {

            e.preventDefault();


            dropZone.classList.remove(
                "drag-active"
            );


            if (
                e.dataTransfer &&
                e.dataTransfer.files
            ) {

                addFiles(
                    e.dataTransfer.files
                );

            }

        }
    );

}


/* =========================================================
   SHOW FILES
   ========================================================= */

function showFiles() {

    if (
        !summaryCard ||
        !fileListContainer
    ) {

        return;

    }


    summaryCard.style.display =
        "flex";


    fileListContainer.innerHTML =
        "";


    let totalBytes = 0;


    selectedFiles.forEach(
        (
            file,
            index
        ) => {

            totalBytes +=
                file.size;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card";


            card.innerHTML = `

                <div class="card-body">

                    <div class="row align-items-center">

                        <div class="col-md-5 file-row-name">

                            <i class="bi bi-image-fill"></i>

                            ${escapeHtml(file.name)}

                        </div>

                        <div class="col-md-2 text-center file-row-size">

                            ${formatMB(file.size)}

                        </div>

                        <div class="col-md-2 text-center">

                            <button
                                type="button"
                                class="btn btn-primary btn-sm preview-original-btn">

                                Preview

                            </button>

                        </div>

                        <div class="col-md-3 text-center">

                            <button
                                type="button"
                                class="btn btn-danger btn-sm delete-file-btn">

                                Delete

                            </button>

                        </div>

                    </div>

                </div>

            `;


            card
                .querySelector(
                    ".preview-original-btn"
                )
                .addEventListener(
                    "click",
                    function () {

                        previewImage(
                            index
                        );

                    }
                );


            card
                .querySelector(
                    ".delete-file-btn"
                )
                .addEventListener(
                    "click",
                    function () {

                        deleteFile(
                            index
                        );

                    }
                );


            fileListContainer.appendChild(
                card
            );

        }
    );


    if (totalFiles) {

        totalFiles.textContent =
            selectedFiles.length;

    }


    if (totalSize) {

        totalSize.textContent =
            formatMB(
                totalBytes
            );

    }

}


/* =========================================================
   DELETE FILE
   ========================================================= */

function deleteFile(
    index
) {

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


    if (
        selectedFiles.length === 0
    ) {

        if (summaryCard) {

            summaryCard.style.display =
                "none";

        }


        if (fileListContainer) {

            fileListContainer.innerHTML =
                "";

        }


        if (imageFiles) {

            imageFiles.value =
                "";

        }


        return;

    }


    showFiles();

}


/* =========================================================
   PREVIEW ORIGINAL IMAGE
   ========================================================= */

function previewImage(
    index
) {

    const file =
        selectedFiles[index];


    const previewElement =
        document.getElementById(
            "previewImage"
        );


    const modalElement =
        document.getElementById(
            "imagePreviewModal"
        );


    if (
        !file ||
        !previewElement ||
        !modalElement
    ) {

        return;

    }


    const url =
        URL.createObjectURL(
            file
        );


    previewElement.src =
        url;


    previewElement.onload =
        function () {

            URL.revokeObjectURL(
                url
            );

        };


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();

}


/* =========================================================
   PREVIEW COMPRESSED IMAGE
   ========================================================= */

function previewCompressedImage(
    fileName
) {

    const previewElement =
        document.getElementById(
            "previewImage"
        );


    const modalElement =
        document.getElementById(
            "imagePreviewModal"
        );


    if (
        !previewElement ||
        !modalElement
    ) {

        return;

    }


    previewElement.src =
        "/preview-compressed-image?fileName=" +
        encodeURIComponent(
            fileName
        );


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();

}


/* =========================================================
   COMPRESS IMAGES
   ========================================================= */

if (compressForm) {

    compressForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            if (
                selectedFiles.length === 0
            ) {

                alert(
                    "Please select at least one image."
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


            const formData =
                new FormData();


            selectedFiles.forEach(
                file => {

                    formData.append(
                        "imageFiles",
                        file
                    );

                }
            );


            formData.append(
                "compressionLevel",
                compressionLevel
                    ? compressionLevel.value
                    : "medium"
            );


            formData.append(
                "quality",
                quality
                    ? quality.value
                    : "80"
            );


            setButtonProcessing(
                true
            );


            if (uploadSection) {

                uploadSection.style.display =
                    "none";

            }

            if (resultCard) {

                resultCard.style.display =
                    "none";

            }

            showProgress();


            const xhr =
                new XMLHttpRequest();


            /* -----------------------------------------
               UPLOAD PROGRESS
               ----------------------------------------- */

            xhr.upload.addEventListener(
                "progress",
                function (event) {

                    if (
                        !event.lengthComputable
                    ) {

                        return;

                    }


                    const percent =
                        Math.round(
                            (
                                event.loaded /
                                event.total
                            ) * 100
                        );


                    if (
                        percent >= 100
                    ) {

                        /*
                         * Upload finished.
                         * Server may still be compressing.
                         */
                        updateProgress(
                            100,
                            "Compressing images..."
                        );

                    }
                    else {

                        updateProgress(
                            percent,
                            percent + "%"
                        );

                    }

                }
            );


            /* -----------------------------------------
               RESPONSE
               ----------------------------------------- */

            xhr.onreadystatechange =
                function () {

                    if (
                        xhr.readyState !== 4
                    ) {

                        return;

                    }


                    if (
                        xhr.status < 200 ||
                        xhr.status >= 300
                    ) {

                        let message =
                            "Compression failed. Please try again.";


                        if (
                            xhr.status === 413
                        ) {

                            message =
                                "The uploaded file is too large.";

                        }
                        else if (
                            xhr.status === 404
                        ) {

                            message =
                                "The image compression service was not found.";

                        }
                        else if (
                            xhr.status === 500
                        ) {

                            message =
                                "The server could not process the image.";

                        }


                        showError(
                            message
                        );


                        return;

                    }


                    let result;


                    try {

                        result =
                            JSON.parse(
                                xhr.responseText
                            );

                    }
                    catch (error) {

                        console.error(
                            "Invalid server response:",
                            error
                        );


                        showError(
                            "The server returned an invalid response. Please try again."
                        );


                        return;

                    }


                    if (
                        !result.success
                    ) {

                        showError(
                            result.message ||
                            "Compression failed."
                        );


                        return;

                    }


                    /*
                     * Compression has actually completed.
                     */
                    updateProgress(
                        100,
                        "100%"
                    );


                    buildResultTable(
                        result
                    );


                    setTimeout(
                        function () {

                            hideProgress();

                            if (resultCard) {

                                resultCard.style.display =
                                    "block";

                                resultCard.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start"
                                });

                            }

                            setButtonProcessing(
                                false
                            );

                        },
                        500
                    );

                };


            /* -----------------------------------------
               NETWORK ERROR
               ----------------------------------------- */

            xhr.onerror =
                function () {

                    console.error(
                        "Image compression XHR error."
                    );


                    showError(
                        "Compression failed because of a network or server error. Please try again."
                    );

                };


            /* -----------------------------------------
               TIMEOUT
               ----------------------------------------- */

            xhr.timeout =
                120000;


            xhr.ontimeout =
                function () {

                    showError(
                        "Compression is taking too long. Please try a smaller image or try again."
                    );

                };


            /* -----------------------------------------
               REQUEST
               ----------------------------------------- */

            xhr.open(
                "POST",
                "/image-compressor-ajax",
                true
            );


            xhr.send(
                formData
            );

        }
    );

}

/* =========================================================
   RESULT TABLE
   ========================================================= */

function buildResultTable(
    result
) {

    const container =
        document.getElementById(
            "compressedFilesContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !result ||
        !Array.isArray(
            result.files
        )
    ) {

        return;

    }


    let totalOriginal =
        0;


    let totalCompressed =
        0;


    let totalSaved =
        0;


    let weightedReduction =
        0;


    let reductionWeight =
        0;


    result.files.forEach(
        file => {

            const original =
                parseFloat(
                    file.originalSize
                ) || 0;


            const compressed =
                parseFloat(
                    file.compressedSize
                ) || 0;


            const saved =
                parseFloat(
                    file.saved
                ) ||
                Math.max(
                    0,
                    original -
                    compressed
                );


            const fileReduction =
                parseFloat(
                    String(
                        file.reduction ||
                        ""
                    ).replace(
                        "%",
                        ""
                    )
                );


            totalOriginal +=
                original;


            totalCompressed +=
                compressed;


            totalSaved +=
                saved;


            if (
                Number.isFinite(
                    fileReduction
                ) &&
                original > 0
            ) {

                weightedReduction +=
                    fileReduction *
                    original;


                reductionWeight +=
                    original;

            }


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card mb-2";


            card.innerHTML = `

                <div class="card-body">

                    <div class="row text-center align-items-center">

                        <div class="col-md-3">

                            ${escapeHtml(file.name)}

                        </div>


                        <div class="col-md-2">

                            ${escapeHtml(file.originalSize)}

                        </div>


                        <div class="col-md-2">

                            ${escapeHtml(file.compressedSize)}

                        </div>


                        <div class="col-md-1">

                            ${escapeHtml(file.saved)}

                        </div>


                        <div class="col-md-1">

                            ${escapeHtml(file.reduction)}

                        </div>


                        <div class="col-md-1">

                            <button
                                type="button"
                                class="btn btn-primary btn-sm compressed-preview-btn">

                                Preview

                            </button>

                        </div>


                        <div class="col-md-1">

                            <a
                                class="btn btn-success btn-sm download-btn"
                                href="/download-compressed-image?fileName=${encodeURIComponent(file.name)}">

                                Download

                            </a>

                        </div>

                    </div>

                </div>

            `;


            const previewButton =
                card.querySelector(
                    ".compressed-preview-btn"
                );


            if (previewButton) {

                previewButton.addEventListener(
                    "click",
                    function () {

                        previewCompressedImage(
                            file.name
                        );

                    }
                );

            }


            container.appendChild(
                card
            );

        }
    );


    /* =====================================================
       RESULT SUMMARY
       ===================================================== */


    /*
     * IMPORTANT:
     * Your HTML uses resultFilesCount.
     *
     * Old JS incorrectly used resultFiles.
     */
    const resultFiles =
        document.getElementById(
            "resultFiles"
        );

    const resultFilesCount =
        document.getElementById(
            "resultFilesCount"
        );


    const resultOriginalSize =
        document.getElementById(
            "resultOriginalSize"
        );


    const resultCompressedSize =
        document.getElementById(
            "resultCompressedSize"
        );


    const resultSaved =
        document.getElementById(
            "resultSaved"
        );


    const resultReduction =
        document.getElementById(
            "resultReduction"
        );


    /* =====================================================
       FILE COUNT
       ===================================================== */

    if (
        resultFiles
    ) {

        resultFiles.textContent =
            result.files.length;

    }

    if (
        resultFilesCount
    ) {

        resultFilesCount.textContent =
            result.files.length;

    }


    /* =====================================================
       ORIGINAL SIZE
       ===================================================== */

    if (
        resultOriginalSize
    ) {

        resultOriginalSize.textContent =
            totalOriginal.toFixed(2) +
            " MB";

    }


    /* =====================================================
       COMPRESSED SIZE
       ===================================================== */

    if (
        resultCompressedSize
    ) {

        resultCompressedSize.textContent =
            totalCompressed.toFixed(2) +
            " MB";

    }


    /* =====================================================
       SAVED
       ===================================================== */

    if (
        resultSaved
    ) {

        resultSaved.textContent =
            totalSaved.toFixed(2) +
            " MB";

    }


    /* =====================================================
       REDUCTION
       ===================================================== */

    let reduction =
        0;


    /*
     * Prefer weighted average of the backend's
     * individual reduction percentages.
     */
    if (
        reductionWeight > 0
    ) {

        reduction =
            weightedReduction /
            reductionWeight;

    }
    else if (
        totalOriginal > 0
    ) {

        reduction =
            (
                totalSaved /
                totalOriginal
            ) * 100;

    }


    if (
        resultReduction
    ) {

        resultReduction.textContent =
            reduction.toFixed(0) +
            "%";

    }

}


/* =========================================================
   COMPRESS MORE
   ========================================================= */

const compressMoreBtn =
    document.getElementById(
        "compressMoreBtn"
    );


if (compressMoreBtn) {

    compressMoreBtn.addEventListener(
        "click",
        function () {

            compressMoreBtn.disabled =
                true;


            fetch(
                "/delete-image-temp-files",
                {
                    method: "POST"
                }
            )
                .catch(
                    error => {

                        console.error(
                            "Temporary file cleanup failed:",
                            error
                        );

                    }
                )
                .finally(
                    function () {

                        location.reload();

                    }
                );

        }
    );

}


/* =========================================================
   OPTIONAL DARK MODE
   ========================================================= */

const darkModeBtn =
    document.getElementById(
        "darkModeBtn"
    );


/*
 * IMPORTANT:
 * The Image Compressor page does not currently
 * have darkModeBtn. Therefore we check first.
 */
if (darkModeBtn) {

    darkModeBtn.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "dark-mode"
            );

        }
    );

}


/* =========================================================
   INITIAL STATE
   ========================================================= */

if (progressSection) {

    progressSection.style.display =
        "none";

}


if (progressBar) {

    progressBar.style.width =
        "0%";


    progressBar.textContent =
        "0%";


    progressBar.setAttribute(
        "aria-valuenow",
        "0"
    );

}