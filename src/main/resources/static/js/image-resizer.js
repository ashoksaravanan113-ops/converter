/* ===========================
   ELEMENTS
=========================== */

const imageFiles =
    document.getElementById(
        "imageFiles"
    );

const dropZone =
    document.getElementById(
        "dropZone"
    );

const resizeForm =
    document.getElementById(
        "resizeForm"
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

const widthInput =
    document.getElementById(
        "width"
    );

const heightInput =
    document.getElementById(
        "height"
    );

const maintainAspectRatio =
    document.getElementById(
        "maintainAspectRatio"
    );

let selectedFiles = [];

/* ===========================
   FILE SELECT
=========================== */

imageFiles.addEventListener(
    "change",
    function () {

        const newFiles =
            Array.from(
                this.files
            );

        const duplicateNames = [];

        const invalidFiles = [];

        const filesToAdd = [];

        newFiles.forEach(
            file => {

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    invalidFiles.push(
                        file.name
                    );

                    return;

                }

                const alreadyExists =
                    selectedFiles.some(
                        existingFile =>
                            existingFile.name === file.name
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
                "Invalid files:\n\n"
                +
                invalidFiles.join(
                    "\n"
                )
            );

        }

        if (
            duplicateNames.length > 0
        ) {

            alert(
                "Duplicate files:\n\n"
                +
                duplicateNames.join(
                    "\n"
                )
            );

        }

        if (
            filesToAdd.length > 0
        ) {

            showFiles();

        }

        this.value = "";

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

        const newFiles =
            Array.from(
                e.dataTransfer.files
            );

        const duplicateNames = [];

        const invalidFiles = [];

        const filesToAdd = [];

        newFiles.forEach(
            file => {

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    invalidFiles.push(
                        file.name
                    );

                    return;

                }

                const alreadyExists =
                    selectedFiles.some(
                        existingFile =>
                            existingFile.name === file.name
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
                "Invalid files:\n\n"
                +
                invalidFiles.join(
                    "\n"
                )
            );

        }

        if (
            duplicateNames.length > 0
        ) {

            alert(
                "Duplicate files:\n\n"
                +
                duplicateNames.join(
                    "\n"
                )
            );

        }

        if (
            filesToAdd.length > 0
        ) {

            showFiles();

        }

    }
);
/* ===========================
   SHOW FILES
=========================== */

function showFiles() {

    if (selectedFiles.length === 0) {

        summaryCard.style.display = "none";

        fileListContainer.innerHTML = "";

        return;

    }

    summaryCard.style.display = "flex";

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

            fileListContainer.innerHTML += `

            <div class="card">

                <div class="card-body">

                    <div class="row align-items-center">

                        <div class="col-md-5 file-row-name">

                            <i class="bi bi-image-fill"></i>

                            ${file.name}

                        </div>

                        <div class="col-md-2 text-center file-row-size">

                            ${(file.size / 1024 / 1024).toFixed(2)} MB

                        </div>

                        <div class="col-md-2 text-center">

                            <button
                                type="button"
                                class="btn btn-primary btn-sm"
                                onclick="previewImage(${index})">

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
            totalBytes
            /
            1024
            /
            1024
        ).toFixed(2)
        + " MB";

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

        imageFiles.value =
            "";

        return;

    }

    showFiles();

}

/* ===========================
   PREVIEW ORIGINAL IMAGE
=========================== */

function previewImage(index) {

    const file =
        selectedFiles[index];

    const url =
        URL.createObjectURL(
            file
        );

    document.getElementById(
        "previewImage"
    ).src =
        url;

    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "imagePreviewModal"
            )
        );

    modal.show();

}

/* ===========================
   PREVIEW RESIZED IMAGE
=========================== */

function previewResizedImage(
    fileName
) {

    document.getElementById(
        "previewImage"
    ).src =
        "/preview-resized-image?fileName="
        +
        encodeURIComponent(
            fileName
        );

    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "imagePreviewModal"
            )
        );

    modal.show();

}

/* ===========================
   AUTO ASPECT RATIO
=========================== */

let originalWidth = 0;

let originalHeight = 0;

imageFiles.addEventListener(
    "change",
    function () {

        if (
            this.files.length > 0
        ) {

            const file =
                this.files[0];

            const image =
                new Image();

            image.onload =
                function () {

                    originalWidth =
                        image.width;

                    originalHeight =
                        image.height;

                };

            image.src =
                URL.createObjectURL(
                    file
                );

        }

    }
);

widthInput.addEventListener(
    "input",
    function () {

        if (
            !maintainAspectRatio.checked
        ) {

            return;

        }

        if (
            originalWidth === 0
            ||
            originalHeight === 0
        ) {

            return;

        }

        const ratio =
            originalHeight
            /
            originalWidth;

        heightInput.value =
            Math.round(
                this.value
                *
                ratio
            );

    }
);

heightInput.addEventListener(
    "input",
    function () {

        if (
            !maintainAspectRatio.checked
        ) {

            return;

        }

        if (
            originalWidth === 0
            ||
            originalHeight === 0
        ) {

            return;

        }

        const ratio =
            originalWidth
            /
            originalHeight;

        widthInput.value =
            Math.round(
                this.value
                *
                ratio
            );

    }
);

/* ===========================
   RESIZE IMAGES
=========================== */

resizeForm.addEventListener(
    "submit",
    function (e) {

        e.preventDefault();

        if (
            !validateFiles(selectedFiles)
        ) {
            return;
        }

        if (
            selectedFiles.length === 0
        ) {

            alert(
                "Please select images."
            );

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
            "width",
            widthInput.value
        );

        formData.append(
            "height",
            heightInput.value
        );

        formData.append(
            "maintainAspectRatio",
            maintainAspectRatio.checked
        );

        /* Freeze UI */

        imageFiles.disabled =
            true;

        widthInput.disabled =
            true;

        heightInput.disabled =
            true;

        maintainAspectRatio.disabled =
            true;

        document
            .querySelectorAll(
                ".btn-danger"
            )
            .forEach(
                btn =>
                    btn.disabled =
                    true
            );

        document
            .querySelectorAll(
                ".btn-primary"
            )
            .forEach(
                btn =>
                    btn.disabled =
                    true
            );

        document.getElementById(
            "uploadSection"
        ).style.display =
            "none";

        progressSection.style.display =
            "block";

        progressSection.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        progressBar.style.width =
            "0%";

        progressBar.innerHTML =
            "0%";

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
                                event.loaded
                                /
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

        xhr.onreadystatechange =
            function () {

                if (
                    xhr.readyState === 4
                    &&
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

                        setTimeout(
                            () => {

                                progressSection.style.display =
                                    "none";

                                progressBar.style.width =
                                    "0%";

                                progressBar.innerHTML =
                                    "0%";

                                const resultCard =
                                    document.getElementById(
                                        "resultCard"
                                    );

                                if (resultCard) {
                                    resultCard.style.display =
                                        "block";

                                    resultCard.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start"
                                    });
                                }

                                buildResultTable(
                                    result
                                );

                            },
                            500
                        );

                    }
                    else {

                        imageFiles.disabled =
                            false;

                        widthInput.disabled =
                            false;

                        heightInput.disabled =
                            false;

                        maintainAspectRatio.disabled =
                            false;

                        document.getElementById(
                            "uploadSection"
                        ).style.display =
                            "block";

                        document
                            .querySelectorAll(
                                ".btn-danger"
                            )
                            .forEach(
                                btn =>
                                    btn.disabled =
                                    false
                            );

                        document
                            .querySelectorAll(
                                ".btn-primary"
                            )
                            .forEach(
                                btn =>
                                    btn.disabled =
                                    false
                            );

                        progressSection.style.display =
                            "none";

                        progressBar.style.width =
                            "0%";

                        progressBar.innerHTML =
                            "0%";

                        alert(
                            result.message
                        );

                    }

                }

            };

        xhr.onerror =
            function () {

                imageFiles.disabled =
                    false;

                widthInput.disabled =
                    false;

                heightInput.disabled =
                    false;

                maintainAspectRatio.disabled =
                    false;

                document.getElementById(
                    "uploadSection"
                ).style.display =
                    "block";

                document
                    .querySelectorAll(
                        ".btn-danger"
                    )
                    .forEach(
                        btn =>
                            btn.disabled =
                            false
                    );

                document
                    .querySelectorAll(
                        ".btn-primary"
                    )
                    .forEach(
                        btn =>
                            btn.disabled =
                            false
                    );

                progressSection.style.display =
                    "none";

                progressBar.style.width =
                    "0%";

                progressBar.innerHTML =
                    "0%";

                alert(
                    "Image resizing failed. Please try again."
                );

            };

        xhr.open(
            "POST",
            "/image-resizer-ajax"
        );

        xhr.send(
            formData
        );

    }
);
/* ===========================
   RESULT TABLE
=========================== */

function buildResultTable(
    result
) {

    const container =
        document.getElementById(
            "resizedFilesContainer"
        );

    container.innerHTML =
        "";

    let totalOriginal = 0;

    let totalResized = 0;

    result.files.forEach(
        file => {

            totalOriginal +=
                parseFloat(
                    file.originalSize
                );

            totalResized +=
                parseFloat(
                    file.resizedSize
                );

            container.innerHTML += `

            <div class="card mb-2">

                <div class="card-body">

                    <div class="row text-center align-items-center">

                        <div class="col-md-3">

                            ${file.name}

                        </div>

                        <div class="col-md-2">

                            ${file.originalSize}

                        </div>

                        <div class="col-md-2">

                            ${file.resizedSize}

                        </div>

                        <div class="col-md-2">

                            ${file.dimensions}

                        </div>

                        <div class="col-md-1">

                            <button
                                type="button"
                                class="btn btn-primary btn-sm"
                                onclick="previewResizedImage('${file.name}')">

                                Preview

                            </button>

                        </div>

                        <div class="col-md-2">

                           <a
                                class="btn btn-success btn-sm download-btn"
                                href="/download-resized-image?fileName=${file.name}">

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
        "resultOriginalSize"
    ).innerHTML =
        totalOriginal.toFixed(2)
        + " MB";

    document.getElementById(
        "resultResizedSize"
    ).innerHTML =
        totalResized.toFixed(2)
        + " MB";

}

/* ===========================
   RESIZE MORE
=========================== */

document.getElementById(
    "resizeMoreBtn"
).addEventListener(
    "click",
    function () {

        fetch(
            "/delete-image-resizer-temp-files",
            {
                method: "POST"
            }
        )
            .finally(
                () => {

                    location.reload();

                }
            );

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