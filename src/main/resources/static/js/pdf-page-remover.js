/* ===========================
   ELEMENTS
=========================== */

const pdfFiles =
    document.getElementById(
        "pdfFiles"
    );

const dropZone =
    document.getElementById(
        "dropZone"
    );

const removeForm =
    document.getElementById(
        "removeForm"
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

const progressSection =
    document.getElementById(
        "progressSection"
    );

const progressBar =
    document.getElementById(
        "progressBar"
    );

const uploadSection =
    document.getElementById(
        "uploadSection"
    );

const removeBtn =
    document.getElementById(
        "removeBtn"
    );

const resultCard =
    document.getElementById(
        "resultCard"
    );

const removeMoreBtn =
    document.getElementById(
        "removeMoreBtn"
    );

const processedFilesContainer =
    document.getElementById(
        "processedFilesContainer"
    );

const pagesToRemove =
    document.getElementById(
        "pagesToRemove"
    );

const previewFrame =
    document.getElementById(
        "previewFrame"
    );

let selectedFiles = [];

let savedScrollY = 0;
let scrollLocked = false;

function saveScrollPosition() {
    savedScrollY = window.scrollY;
    scrollLocked = true;

    document.documentElement.style.overflowAnchor = "none";
}

function restoreScrollPosition() {
    if (!scrollLocked) return;

    window.scrollTo(0, savedScrollY);

    requestAnimationFrame(() => {
        window.scrollTo(0, savedScrollY);
    });
}
/* ===========================
   ADD MORE + FILE SELECT
=========================== */

document.getElementById(
    "addMoreBtn"
).addEventListener(
    "click",
    function () {

        pdfFiles.value = "";

        pdfFiles.click();

    }
);

pdfFiles.addEventListener(
    "change",
    function () {

        const incoming =
            Array.from(
                this.files
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

        showFiles();

        pdfFiles.value = "";

    }
);

/* ===========================
   DRAG & DROP
=========================== */

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

        showFiles();

    }
);
/* ===========================
   SHOW FILES
=========================== */

function showFiles() {

    fileListContainer.innerHTML = "";

    if (selectedFiles.length === 0) {

        summaryCard.style.display =
            "none";

        return;

    }

    summaryCard.style.display =
        "flex";

    let totalBytes = 0;

    selectedFiles.forEach(
        (
            file,
            index
        ) => {

            totalBytes +=
                file.size;

            fileListContainer.innerHTML += `

<div class="card mb-2">

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
                    class="btn btn-primary btn-sm preview-btn"
                    onclick="previewPdf(${index})">

                    Preview

                </button>

            </div>

            <div class="col-md-3">

                <button
                    type="button"
                    class="btn btn-danger btn-sm delete-btn"
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
            totalBytes
            /
            1024
            /
            1024
        ).toFixed(2)
        +
        " MB";

}
/* ===========================
   DELETE FILE
=========================== */

function deleteFile(index) {

    selectedFiles.splice(
        index,
        1
    );

    if (
        selectedFiles.length === 0
    ) {

        summaryCard.style.display =
            "none";

        fileListContainer.innerHTML =
            "";

        pdfFiles.value =
            "";

        return;

    }

    showFiles();

}

/* ===========================
   PREVIEW ORIGINAL PDF
=========================== */

function previewPdf(index) {

    const file =
        selectedFiles[index];

    const url =
        URL.createObjectURL(
            file
        );

    document.getElementById(
        "previewFrame"
    ).src =
        url;

    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "pdfPreviewModal"
            )
        );

    modal.show();

}

/* ===========================
   PREVIEW PROCESSED PDF
=========================== */

function previewProcessedPdf(fileName) {

    previewFrame.src =
        "/preview-processed-pdf?fileName="
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

}/* ===========================
   REMOVE PAGES
=========================== */

removeForm.addEventListener(
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

        if (
            pagesToRemove.value.trim() === ""
        ) {

            alert(
                "Please enter the page numbers to remove."
            );

            return;

        }

        const formData =
            new FormData();

        /* SAVE USER'S CURRENT SCROLL POSITION */
        saveScrollPosition();

        selectedFiles.forEach(
            file => {

                formData.append(
                    "pdfFiles",
                    file
                );

            }
        );

        formData.append(
            "pagesToRemove",
            pagesToRemove.value.trim()
        );

        /* Freeze UI */

        document.body.classList.add(
            "conversion-active"
        );

        uploadSection.style.display =
            "none";

        summaryCard.style.display =
            "none";

        fileListContainer.style.display =
            "none";

        progressSection.style.display =
            "block";

        progressBar.style.width =
            "0%";

        progressBar.innerHTML =
            "0%";

        /* STOP PAGE FROM JUMPING TO PROGRESS BAR */
        restoreScrollPosition();

        removeBtn.disabled =
            true;

        removeBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm"></span> Removing...';

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

                            buildResultTable(
                                result
                            );

                            /* STOP PAGE FROM JUMPING TO RESULT */
                            restoreScrollPosition();

                        }, 500);

                    } else {

                        alert(
                            result.message ||
                            "Failed to remove PDF pages."
                        );

                        uploadSection.style.display =
                            "block";

                        summaryCard.style.display =
                            "";

                        fileListContainer.style.display =
                            "";

                        progressSection.style.display =
                            "none";

                    }

                } else {

                    alert(
                        "Server error while processing PDF."
                    );

                    uploadSection.style.display =
                        "block";

                    summaryCard.style.display =
                        "";

                    fileListContainer.style.display =
                        "";

                    progressSection.style.display =
                        "none";

                }

                removeBtn.disabled =
                    false;

                removeBtn.innerHTML =
                    "Remove Pages";

                document.body.classList.remove(
                    "conversion-active"
                );

                /* FINAL SCROLL RESTORE */
                restoreScrollPosition();

                scrollLocked = false;
                document.documentElement.style.overflowAnchor = "";

            };

        xhr.open(
            "POST",
            "/pdf-page-remover-ajax"
        );

        xhr.send(
            formData
        );

    }
);/* ===========================
   RESULT TABLE
=========================== */

function buildResultTable(result) {

    processedFilesContainer.innerHTML =
        "";

    let totalRemoved = 0;

    let totalRemaining = 0;

    result.files.forEach(
        file => {

            totalRemoved +=
                parseInt(
                    file.removedPages
                );

            totalRemaining +=
                parseInt(
                    file.finalPages
                );

            processedFilesContainer.innerHTML += `

<div class="card mb-2">

    <div class="card-body">

        <div class="row align-items-center text-center">

            <div class="col-md-3 file-row-name">

                <i class="bi bi-file-earmark-pdf-fill"></i>

                ${file.name}

            </div>

            <div class="col-md-2">

                ${file.originalPages}

            </div>

            <div class="col-md-2">

                ${file.removedPages}

            </div>

            <div class="col-md-2">

                ${file.finalPages}

            </div>

            <div class="col-md-1">

                <button
                    type="button"
                    class="btn btn-primary btn-sm preview-btn"
                    onclick="previewProcessedPdf('${file.name}')">

                    Preview

                </button>

            </div>

            <div class="col-md-2">

                <a
                    href="/download-processed-pdf?fileName=${encodeURIComponent(file.name)}"
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

    document.getElementById(
        "resultFiles"
    ).innerHTML =
        result.files.length;

    document.getElementById(
        "resultRemovedPages"
    ).innerHTML =
        totalRemoved;

    document.getElementById(
        "resultRemainingPages"
    ).innerHTML =
        totalRemaining;

}
/* ===========================
   REMOVE MORE
=========================== */

removeMoreBtn.addEventListener(
    "click",
    function () {

        fetch(
            "/delete-processed-pdf",
            {
                method: "POST"
            }
        ).finally(() => {

            location.reload();

        });

    }
);


/* ===========================
   DARK MODE
=========================== */

document.getElementById(
    "darkModeBtn"
).addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark-mode"
        );

    }
);

