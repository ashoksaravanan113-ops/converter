/* ===========================
   ELEMENTS
=========================== */

const pdfFiles =
    document.getElementById(
        "pdfFiles"
    );

const pdfPreviewFrame =
    document.getElementById(
        "pdfPreviewFrame"
    );

const dropZone =
    document.getElementById(
        "dropZone"
    );

const addFilesBtn =
    document.getElementById(
        "addFilesBtn"
    );

const uploadSection =
    document.getElementById(
        "uploadSection"
    );

const toolOptions =
    document.getElementById(
        "toolOptions"
    );

const summaryCard =
    document.getElementById(
        "summaryCard"
    );

const fileListContainer =
    document.getElementById(
        "fileListContainer"
    );

const totalFiles =
    document.getElementById(
        "totalFiles"
    );

const totalSize =
    document.getElementById(
        "totalSize"
    );

const pageNumberForm =
    document.getElementById(
        "pageNumberForm"
    );

const addPageNumbersBtn =
    document.getElementById(
        "addPageNumbersBtn"
    );

const progressSection =
    document.getElementById(
        "progressSection"
    );

const progressBar =
    document.getElementById(
        "progressBar"
    );

const resultCard =
    document.getElementById(
        "resultCard"
    );

const pdfName =
    document.getElementById(
        "pdfName"
    );

const pdfSize =
    document.getElementById(
        "pdfSize"
    );

const previewBtn =
    document.getElementById(
        "previewBtn"
    );

const downloadBtn =
    document.getElementById(
        "downloadBtn"
    );

const convertMoreBtn =
    document.getElementById(
        "convertMoreBtn"
    );

let selectedFiles = [];

/* ===========================
   RESET / CONVERT MORE
=========================== */

function resetPageNumbersTool() {

    console.log("Convert More button clicked");

    /* -------------------------
       Hide result
    ------------------------- */

    if (resultCard) {
        resultCard.style.display = "none";
    }


    /* -------------------------
       Hide progress
    ------------------------- */

    if (progressSection) {
        progressSection.style.display = "none";
    }


    /* -------------------------
       Show upload section
    ------------------------- */

    if (uploadSection) {
        uploadSection.style.display = "block";
    }


    /* -------------------------
       Clear selected files
    ------------------------- */

    selectedFiles = [];


    /* -------------------------
       Clear file input
    ------------------------- */

    if (pdfFiles) {
        pdfFiles.value = "";
    }


    /* -------------------------
       Clear file list
    ------------------------- */

    if (fileListContainer) {
        fileListContainer.innerHTML = "";
    }


    /* -------------------------
       Reset summary
    ------------------------- */

    if (summaryCard) {
        summaryCard.classList.add("d-none");
        summaryCard.style.display = "none";
    }

    if (totalFiles) {
        totalFiles.textContent = "0";
    }

    if (totalSize) {
        totalSize.textContent = "0 MB";
    }


    /* -------------------------
       Hide Add More Files
    ------------------------- */

    if (addFilesBtn) {
        addFilesBtn.style.display = "none";
    }


    /* -------------------------
       Reset progress
    ------------------------- */

    if (progressBar) {

        progressBar.style.width = "0%";
        progressBar.textContent = "0%";

        progressBar.setAttribute(
            "aria-valuenow",
            "0"
        );
    }


    /* -------------------------
       Reset Add Page Numbers
    ------------------------- */

    if (addPageNumbersBtn) {

        addPageNumbersBtn.disabled = false;

        addPageNumbersBtn.innerHTML =
            "Add Page Numbers";
    }


    /* -------------------------
       Remove processing state
    ------------------------- */

    document.body.classList.remove(
        "conversion-active"
    );


    /* -------------------------
       Reset result counters
    ------------------------- */

    const resultFiles =
        document.getElementById("resultFiles");

    const resultSuccess =
        document.getElementById("resultSuccess");

    if (resultFiles) {
        resultFiles.textContent = "0";
    }

    if (resultSuccess) {
        resultSuccess.textContent = "0";
    }


    /* -------------------------
       Clear result files
    ------------------------- */

    const resultFilesContainer =
        document.getElementById(
            "resultFilesContainer"
        );

    if (resultFilesContainer) {
        resultFilesContainer.innerHTML = "";
    }


    /* -------------------------
       Clean server files
       WITHOUT waiting
    ------------------------- */

    fetch(
        "/delete-numbered-pdf",
        {
            method: "POST"
        }
    ).catch(function () {
        console.log(
            "Server cleanup failed, continuing."
        );
    });


    /* -------------------------
       Scroll to upload section
    ------------------------- */

    setTimeout(function () {

        if (uploadSection) {

            const navbar =
                document.querySelector(".navbar");

            const navbarHeight =
                navbar
                    ? navbar.offsetHeight
                    : 0;

            const position =
                uploadSection.getBoundingClientRect().top +
                window.pageYOffset -
                navbarHeight -
                15;

            window.scrollTo({
                top: Math.max(0, position),
                behavior: "smooth"
            });

        }

    }, 150);

}

/* ===========================
   ADD MORE
=========================== */

addFilesBtn.addEventListener(
    "click",
    () => {

        pdfFiles.value = "";

        pdfFiles.click();

    }
);



/* ===========================
   FILE SELECT
=========================== */

pdfFiles.addEventListener(
    "change",
    function () {

        const incoming =
            Array.from(this.files);

        let duplicateFiles = [];

        let invalidFiles = [];

        incoming.forEach(file => {

            if (
                file.type !== "application/pdf"
            ) {

                invalidFiles.push(
                    file.name
                );

                return;

            }

            const duplicate =
                selectedFiles.some(
                    existingFile =>

                        existingFile.name === file.name &&
                        existingFile.size === file.size
                );

            if (duplicate) {

                duplicateFiles.push(
                    file.name
                );

            } else {

                selectedFiles.push(
                    file
                );

            }

        });

        if (invalidFiles.length > 0) {

            alert(
                "Only PDF files are allowed.\n\n"
                +
                invalidFiles.join("\n")
            );

        }

        if (duplicateFiles.length > 0) {

            alert(
                "Duplicate file(s) skipped:\n\n"
                +
                duplicateFiles.join("\n")
            );

        }

        renderFiles();

        addFilesBtn.style.display =
            selectedFiles.length > 0
                ? "inline-block"
                : "none";

        pdfFiles.value = "";

    }
);

/* ===========================
   DRAG & DROP
=========================== */

dropZone.addEventListener(
    "dragover",
    e => {

        e.preventDefault();

        dropZone.classList.add(
            "drag-active"
        );

    }
);

dropZone.addEventListener(
    "dragleave",
    () => {

        dropZone.classList.remove(
            "drag-active"
        );

    }
);

dropZone.addEventListener(
    "drop",
    e => {

        e.preventDefault();

        dropZone.classList.remove(
            "drag-active"
        );

        const incoming =
            Array.from(
                e.dataTransfer.files
            );

        let duplicateFiles = [];

        let invalidFiles = [];

        incoming.forEach(file => {

            if (
                file.type !== "application/pdf"
            ) {

                invalidFiles.push(
                    file.name
                );

                return;

            }

            const duplicate =
                selectedFiles.some(
                    existingFile =>

                        existingFile.name === file.name &&
                        existingFile.size === file.size
                );

            if (duplicate) {

                duplicateFiles.push(
                    file.name
                );

            } else {

                selectedFiles.push(
                    file
                );

            }

        });

        if (invalidFiles.length > 0) {

            alert(
                "Only PDF files are allowed.\n\n"
                +
                invalidFiles.join("\n")
            );

        }

        if (duplicateFiles.length > 0) {

            alert(
                "Duplicate file(s) skipped:\n\n"
                +
                duplicateFiles.join("\n")
            );

        }

        renderFiles();

        addFilesBtn.style.display =
            selectedFiles.length > 0
                ? "inline-block"
                : "none";

    }
);
/* ===========================
   RENDER FILES
=========================== */

function renderFiles() {

    fileListContainer.innerHTML = "";

    if (selectedFiles.length === 0) {

        summaryCard.classList.add(
            "d-none"
        );

        addFilesBtn.style.display =
            "none";

        return;

    }

    summaryCard.classList.remove(
        "d-none"
    );

    addFilesBtn.style.display =
        "inline-block";

    totalFiles.innerHTML =
        selectedFiles.length;

    let totalBytes = 0;

    selectedFiles.forEach(
        file => {

            totalBytes +=
                file.size;

        }
    );

    totalSize.innerHTML =
        (
            totalBytes /
            1024 /
            1024
        ).toFixed(2)
        + " MB";

    selectedFiles.forEach(
        (
            file,
            index
        ) => {

            fileListContainer.innerHTML += `

<div class="card mb-2 file-row">

    <div class="card-body">

        <div class="row align-items-center text-center">

            <div class="col-md-5 text-start file-row-name">

                <i class="bi bi-file-earmark-pdf-fill"></i>

                ${file.name}

            </div>

            <div class="col-md-2">

                ${(file.size / 1024 / 1024).toFixed(2)} MB

            </div>

            <div class="col-md-2">

                <button
                    type="button"
                    class="btn btn-primary preview-btn"
                    onclick="previewPdf(${index})">

                    Preview

                </button>

            </div>

            <div class="col-md-3">

                <button
                    type="button"
                    class="btn btn-danger delete-btn"
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

}

/* ===========================
   DELETE FILE
=========================== */

function deleteFile(index) {

    selectedFiles.splice(
        index,
        1
    );

    renderFiles();

}

/* ===========================
   PDF PREVIEW
=========================== */

function previewPdf(index) {

    const file =
        selectedFiles[index];

    const fileURL =
        URL.createObjectURL(
            file
        );

    document.getElementById(
        "pdfPreviewFrame"
    ).src =
        fileURL;

    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "pdfPreviewModal"
            )
        );

    modal.show();

}

/* ===========================
   SUBMIT
=========================== */

pageNumberForm.addEventListener(
    "submit",
    function (e) {

        e.preventDefault();

        if (selectedFiles.length === 0) {

            alert(
                "Please upload PDF files."
            );

            return;

        }

        if (
            !validateFiles(selectedFiles)
        ) {

            return;

        }

        const formData =
            new FormData();

        selectedFiles.forEach(
            file => {

                formData.append(
                    "pdfFiles",
                    file
                );

            }
        );

        formData.append(
            "startNumber",
            document.getElementById(
                "startNumber"
            ).value
        );

        formData.append(
            "fontSize",
            document.getElementById(
                "fontSize"
            ).value
        );

        formData.append(
            "position",
            document.querySelector(
                'input[name="position"]:checked'
            ).value
        );

        formData.append(
            "pageFormat",
            document.querySelector(
                'input[name="pageFormat"]:checked'
            ).value
        );

        /* Freeze UI */

        document.body.classList.add(
            "conversion-active"
        );

        uploadSection.style.display =
            "none";

        progressSection.style.display =
            "block";

        /* Scroll to progress */
        /* Scroll to progress */
        setTimeout(function () {

            if (progressSection) {

                const navbar =
                    document.querySelector(".navbar");

                const navbarHeight =
                    navbar
                        ? navbar.offsetHeight
                        : 0;

                const position =
                    progressSection.getBoundingClientRect().top +
                    window.pageYOffset -
                    navbarHeight -
                    15;

                window.scrollTo({
                    top: Math.max(0, position),
                    behavior: "smooth"
                });

            }

        }, 200);

        progressBar.style.width =
            "0%";

        progressBar.innerHTML =
            "0%";

        addPageNumbersBtn.disabled =
            true;

        addPageNumbersBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm"></span> Processing...';

        const xhr =
            new XMLHttpRequest();

        xhr.upload.addEventListener(
            "progress",
            function (event) {

                if (
                    event.lengthComputable
                ) {

                    const percent =
                        Math.round(
                            (
                                event.loaded /
                                event.total
                            ) * 100
                        );

                    progressBar.style.width =
                        percent + "%";

                    progressBar.innerHTML =
                        percent + "%";

                }

            }
        );

        let progress = 0;

        const fakeProgress =
            setInterval(() => {

                if (progress < 90) {

                    progress += 10;

                    progressBar.style.width =
                        progress + "%";

                    progressBar.innerHTML =
                        progress + "%";

                }

            }, 200);

        xhr.onreadystatechange =
            function () {

                if (
                    xhr.readyState !== 4
                ) {

                    return;

                }

                clearInterval(
                    fakeProgress
                );

                addPageNumbersBtn.disabled =
                    false;

                addPageNumbersBtn.innerHTML =
                    "Add Page Numbers";

                document.body.classList.remove(
                    "conversion-active"
                );

                if (
                    xhr.status === 200
                ) {

                    const result =
                        JSON.parse(
                            xhr.responseText
                        );

                    if (
                        result.success
                    ) {

                        progressBar.style.width =
                            "100%";

                        progressBar.innerHTML =
                            "100%";

                        setTimeout(() => {

                            progressSection.style.display =
                                "none";

                            resultCard.style.display =
                                "block";

                            buildResult(
                                result
                            );

                            /* Scroll to result */
                            /* Scroll to result */
                            setTimeout(function () {

                                if (resultCard) {

                                    const navbar =
                                        document.querySelector(".navbar");

                                    const navbarHeight =
                                        navbar
                                            ? navbar.offsetHeight
                                            : 0;

                                    const position =
                                        resultCard.getBoundingClientRect().top +
                                        window.pageYOffset -
                                        navbarHeight -
                                        15;

                                    window.scrollTo({
                                        top: Math.max(0, position),
                                        behavior: "smooth"
                                    });

                                }

                            }, 200);

                        }, 500);

                    } else {

                        alert(
                            result.message ||
                            "Failed to add page numbers."
                        );

                        uploadSection.style.display =
                            "block";

                        progressSection.style.display =
                            "none";

                    }

                } else {

                    alert(
                        "Server error while processing PDF."
                    );

                    uploadSection.style.display =
                        "block";

                    progressSection.style.display =
                        "none";

                }

            };

        xhr.open(
            "POST",
            "/page-numbers-pdf-ajax"
        );

        xhr.send(
            formData
        );

    }
);

/* ===========================
   RESULT
=========================== */

function buildResult(result) {

    const container =
        document.getElementById(
            "resultFilesContainer"
        );

    container.innerHTML = "";

    document.getElementById(
        "resultFiles"
    ).innerHTML =
        result.files.length;

    document.getElementById(
        "resultSuccess"
    ).innerHTML =
        result.files.length;

    result.files.forEach(
        file => {

            container.innerHTML += `

<div class="card mb-3">

    <div class="card-body">

        <div class="row align-items-center text-center">

            <div class="col-md-4 file-row-name">

                <i class="bi bi-file-earmark-pdf-fill"></i>

                ${file.name}

            </div>

            <div class="col-md-2">

                ${file.size}

            </div>

            <div class="col-md-3">

                <button
                    type="button"
                    class="btn btn-primary"

                    onclick="previewResultPdf('${file.name}')">

                    Preview

                </button>

            </div>

            <div class="col-md-3">

                <a
                    href="/download-numbered-pdf?downloadName=${encodeURIComponent(file.name)}"
                    class="btn btn-success">

                    Download

                </a>

            </div>

        </div>

    </div>

</div>

`;

        }
    );

}

function previewResultPdf(fileName) {

    document.getElementById(
        "pdfPreviewFrame"
    ).src =
        "/preview-numbered-pdf?fileName="
        +
        encodeURIComponent(
            fileName
        );

    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "pdfPreviewModal"
            )
        );

    modal.show();

}

/* ===========================
   DARK MODE
=========================== */

const darkModeBtn =
    document.getElementById("darkModeBtn");

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