// Frontend Javascript - Flipkart Order Excel Toolset
document.addEventListener('DOMContentLoaded', () => {
    // Custom Alert Modal Implementation to override native window.alert
    function showCustomAlert(title, message, type = 'success') {
        let modalBackdrop = document.getElementById('customAlertModalBackdrop');
        if (!modalBackdrop) {
            modalBackdrop = document.createElement('div');
            modalBackdrop.id = 'customAlertModalBackdrop';
            modalBackdrop.className = 'custom-modal-backdrop';
            modalBackdrop.style.cssText = "display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(5px); z-index: 99999999; align-items: center; justify-content: center;";
            
            modalBackdrop.innerHTML = `
                <div class="custom-modal-card" style="background: #ffffff; border-radius: 16px; width: 90%; max-width: 440px; padding: 28px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3); text-align: center; border: 1px solid #e2e8f0;">
                    <div id="customAlertModalIcon" style="margin: 0 auto 16px auto; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                    </div>
                    <h3 id="customAlertModalTitle" style="margin-bottom: 12px; font-size: 1.3rem; font-weight: 700; color: #1e293b; font-family: 'Outfit', sans-serif;"></h3>
                    <p id="customAlertModalBody" style="margin-bottom: 24px; font-size: 0.95rem; color: #475569; line-height: 1.5; font-family: 'Outfit', sans-serif;"></p>
                    <div class="custom-modal-footer" style="display: flex; justify-content: center;">
                        <button id="customAlertModalOkBtn" style="padding: 11px 40px; font-size: 1rem; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modalBackdrop);
            
            const okBtn = modalBackdrop.querySelector('#customAlertModalOkBtn');
            okBtn.addEventListener('click', () => {
                modalBackdrop.style.display = 'none';
            });
        }

        const iconDiv = modalBackdrop.querySelector('#customAlertModalIcon');
        const titleH3 = modalBackdrop.querySelector('#customAlertModalTitle');
        const bodyP = modalBackdrop.querySelector('#customAlertModalBody');

        if (type === 'success') {
            iconDiv.style.background = '#dcfce7';
            iconDiv.style.color = '#15803d';
            iconDiv.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        } else if (type === 'error') {
            iconDiv.style.background = '#fee2e2';
            iconDiv.style.color = '#b91c1c';
            iconDiv.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
        } else {
            iconDiv.style.background = '#fef3c7';
            iconDiv.style.color = '#d97706';
            iconDiv.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        }

        titleH3.textContent = title;
        bodyP.textContent = message;
        modalBackdrop.style.display = 'flex';
    }

    window.alert = function(message) {
        let title = "Notification";
        let type = "warning";
        const lowerMsg = String(message).toLowerCase();
        if (lowerMsg.includes("success") || lowerMsg.includes("completed") || lowerMsg.includes("done") || lowerMsg.includes("saved")) {
            title = "Success";
            type = "success";
        } else if (lowerMsg.includes("error") || lowerMsg.includes("failed") || lowerMsg.includes("invalid") || lowerMsg.includes("not supported")) {
            title = "Error";
            type = "error";
        }
        showCustomAlert(title, message, type);
    };
    // ----------------------------------------------------
    // TAB SYSTEM
    // ----------------------------------------------------
    const tabMergeBtn = document.getElementById('tabMergeBtn');
    const tabRenameBtn = document.getElementById('tabRenameBtn');
    const tabSplitBtn = document.getElementById('tabSplitBtn');
    const tabFolderBtn = document.getElementById('tabFolderBtn');
    const tabInvoiceBtn = document.getElementById('tabInvoiceBtn');
    const tabPartyBtn = document.getElementById('tabPartyBtn');
    const tabFlipkartErrorBtn = document.getElementById('tabFlipkartErrorBtn');
    const tabInvoiceErrorBtn = document.getElementById('tabInvoiceErrorBtn');
    const tabErrorTrackerBtn = document.getElementById('tabErrorTrackerBtn');
    const mergeSection = document.getElementById('mergeSection');
    const renameSection = document.getElementById('renameSection');
    const splitSection = document.getElementById('splitSection');
    const folderSection = document.getElementById('folderSection');
    const invoiceSection = document.getElementById('invoiceSection');
    const partySection = document.getElementById('partySection');
    const flipkartErrorSection = document.getElementById('flipkartErrorSection');
    const invoiceErrorSection = document.getElementById('invoiceErrorSection');
    const errorTrackerSection = document.getElementById('errorTrackerSection');

    function setActiveTab(activeBtn, activeSec) {
        [tabMergeBtn, tabRenameBtn, tabSplitBtn, tabFolderBtn, tabInvoiceBtn, tabPartyBtn, tabFlipkartErrorBtn, tabInvoiceErrorBtn, tabErrorTrackerBtn].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        [mergeSection, renameSection, splitSection, folderSection, invoiceSection, partySection, flipkartErrorSection, invoiceErrorSection, errorTrackerSection].forEach(sec => {
            if (sec) sec.classList.remove('active');
        });
        if (activeBtn) activeBtn.classList.add('active');
        if (activeSec) activeSec.classList.add('active');
    }

    if (tabMergeBtn) tabMergeBtn.addEventListener('click', () => setActiveTab(tabMergeBtn, mergeSection));
    if (tabRenameBtn) tabRenameBtn.addEventListener('click', () => {
        setActiveTab(tabRenameBtn, renameSection);
        checkMappingStatus();
    });
    if (tabSplitBtn) tabSplitBtn.addEventListener('click', () => setActiveTab(tabSplitBtn, splitSection));
    if (tabFolderBtn) tabFolderBtn.addEventListener('click', () => setActiveTab(tabFolderBtn, folderSection));
    if (tabInvoiceBtn) tabInvoiceBtn.addEventListener('click', () => setActiveTab(tabInvoiceBtn, invoiceSection));
    if (tabPartyBtn) tabPartyBtn.addEventListener('click', () => {
        setActiveTab(tabPartyBtn, partySection);
        fetchPartiesList();
    });
    if (tabFlipkartErrorBtn) tabFlipkartErrorBtn.addEventListener('click', () => setActiveTab(tabFlipkartErrorBtn, flipkartErrorSection));
    if (tabInvoiceErrorBtn) tabInvoiceErrorBtn.addEventListener('click', () => setActiveTab(tabInvoiceErrorBtn, invoiceErrorSection));
    if (tabErrorTrackerBtn) tabErrorTrackerBtn.addEventListener('click', () => {
        setActiveTab(tabErrorTrackerBtn, errorTrackerSection);
        renderErrorTracker();
    });

    // Global Loader
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const progressContainerGlobal = document.getElementById('progressContainerGlobal');
    const progressTextGlobal = document.getElementById('progressTextGlobal');
    const progressPercentNum = document.getElementById('progressPercentNum');
    const progressBarFill = document.getElementById('progressBarFill');

    let progressInterval = null;

    function showLoader(text) {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        if (progressContainerGlobal) {
            progressContainerGlobal.style.display = 'block';
            progressTextGlobal.textContent = text;
            
            let progressPercent = 10;
            progressBarFill.style.width = '10%';
            progressPercentNum.textContent = '10%';
            
            clearInterval(progressInterval);
            progressInterval = setInterval(() => {
                if (progressPercent < 95) {
                    progressPercent += Math.max(1, Math.floor((95 - progressPercent) / 12));
                    progressBarFill.style.width = progressPercent + '%';
                    progressPercentNum.textContent = progressPercent + '%';
                }
            }, 250);
        }
    }

    function hideLoader() {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        if (progressContainerGlobal) {
            clearInterval(progressInterval);
            progressBarFill.style.width = '100%';
            progressPercentNum.textContent = '100%';
            setTimeout(() => {
                progressContainerGlobal.style.display = 'none';
            }, 600);
        }
    }

    // Helper: format bytes into KB/MB
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }


    // ====================================================
    // TAB 1: MERGE & CLEAN ORDERS LOGIC (Excel & CSV)
    // ====================================================
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const filesList = document.getElementById('filesList');
    const filesListContainer = document.getElementById('filesListContainer');
    const fileCountSpan = document.getElementById('fileCount');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const processBtn = document.getElementById('processBtn');
    const resultCard = document.getElementById('resultCard');
    const successMessage = document.getElementById('successMessage');
    const previewTable = document.getElementById('previewTable');
    const tableHeaders = document.getElementById('tableHeaders');
    const tableBody = document.getElementById('tableBody');

    let selectedFiles = [];

    // Drag & Drop events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        }, false);
    });

    dropzone.addEventListener('click', (e) => {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
    dropzone.addEventListener('drop', (e) => handleFilesSelection(e.dataTransfer.files));
    fileInput.addEventListener('change', (e) => handleFilesSelection(e.target.files));

    function showLoader(text) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        if (loadingText && text) loadingText.textContent = text;
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
    }

    function hideLoader() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const progressContainerGlobal = document.getElementById('progressContainerGlobal');
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        if (progressContainerGlobal) progressContainerGlobal.style.display = 'none';
    }

    function showInvalidFileModal(message) {
        console.log("%c [VALIDATION POPUP TRIGGERED]", "background: red; color: white; font-size: 16px; font-weight: bold;");
        console.log("Modal message to display:", message);
        
        hideLoader();

        if (fileInput) fileInput.value = '';
        const renameFileInputEl = document.getElementById('renameFileInput');
        if (renameFileInputEl) renameFileInputEl.value = '';

        const textToShow = message || "Invalid file detected in Rename section. Please upload the correct Orders file.";

        let modalBackdrop = document.getElementById('invalidFileModalBackdrop');

        if (!modalBackdrop) {
            modalBackdrop = document.createElement('div');
            modalBackdrop.id = 'invalidFileModalBackdrop';
            modalBackdrop.className = 'custom-modal-backdrop';
            document.body.appendChild(modalBackdrop);
        }

        modalBackdrop.innerHTML = `
            <div class="custom-modal-card" style="background: #ffffff !important; border-radius: 20px !important; width: 90% !important; max-width: 440px !important; padding: 32px 28px !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0,0,0,0.05) !important; text-align: center !important; margin: auto !important; position: relative !important; z-index: 2147483647 !important;">
                <div style="margin: 0 auto 18px auto; width: 64px; height: 64px; border-radius: 50%; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 2rem; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.15);">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h3 style="margin: 0 0 10px 0; font-size: 1.35rem; font-weight: 800; color: #0f172a; font-family: 'Outfit', sans-serif;">Invalid File Detected</h3>
                <p style="margin: 0 0 26px 0; font-size: 0.98rem; color: #475569; line-height: 1.6; font-family: 'Outfit', sans-serif; font-weight: 500;">${textToShow}</p>
                <div style="display: flex; justify-content: center;">
                    <button id="invalidFileModalOkBtn" style="padding: 12px 46px; font-size: 1rem; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); transition: transform 0.15s ease;">OK</button>
                </div>
            </div>
        `;

        modalBackdrop.classList.add('show');
        modalBackdrop.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(15, 23, 42, 0.85) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important; z-index: 2147483647 !important; display: flex !important; align-items: center !important; justify-content: center !important; opacity: 1 !important; pointer-events: auto !important;';

        const okBtn = document.getElementById('invalidFileModalOkBtn');
        if (okBtn) {
            okBtn.onclick = function(ev) {
                if (ev) { ev.preventDefault(); ev.stopPropagation(); }
                console.log("[OK CLICKED] Reloading page...");
                modalBackdrop.classList.remove('show');
                modalBackdrop.style.display = 'none';
                window.location.reload();
            };
        }
    }

    async function handleFilesSelection(files) {
        console.log("%c [Merge Tab handleFilesSelection]", "background: blue; color: white; font-size: 14px;", files);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`Merge tab processing file #${i+1}: ${file.name}`);
            const ext = file.name.split('.').pop().toLowerCase();
            
            if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
                console.warn(`Unsupported file extension: ${ext}`);
                showInvalidFileModal("Invalid file detected in Rename section. Please upload the correct Orders file.");
                return;
            }

            // Validate Help sheet cell A14 via server check
            showLoader(`Validating file "${file.name}"...`);
            const formData = new FormData();
            formData.append('file', file);
            try {
                console.log(`Sending POST /api/validate-file for ${file.name}...`);
                const res = await fetch('/api/validate-file', {
                    method: 'POST',
                    body: formData
                });
                console.log("Validate API HTTP status:", res.status);
                let data = {};
                try { data = await res.json(); } catch(e){ console.error("JSON parse error:", e); }
                console.log("Validate API response data:", data);
                hideLoader();
                if (!res.ok || !data.valid) {
                    console.warn(`[VALIDATION FAILED] File ${file.name} is invalid! Showing modal...`);
                    showInvalidFileModal(data.message || "Invalid file detected in Rename section. Please upload the correct Orders file.");
                    return;
                }
                console.log(`[VALIDATION PASSED] File ${file.name} is valid.`);
            } catch (err) {
                hideLoader();
                console.error("[VALIDATION FETCH ERROR]:", err);
                showInvalidFileModal("Invalid file detected in Rename section. Please upload the correct Orders file.");
                return;
            }

            const isDuplicate = selectedFiles.some(f => f.name === file.name && f.size === file.size);
            if (!isDuplicate) selectedFiles.push(file);
        }
        updateFilesListUI();
    }

    function updateFilesListUI() {
        filesList.innerHTML = '';
        fileCountSpan.textContent = selectedFiles.length;

        if (selectedFiles.length === 0) {
            filesListContainer.style.display = 'none';
            resultCard.style.display = 'none';
            return;
        }

        selectedFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="file-info">
                    <i class="fa-regular fa-file-excel"></i>
                    <div>
                        <div class="file-name" title="${file.name}">${file.name}</div>
                        <span class="file-size">${formatBytes(file.size)}</span>
                    </div>
                </div>
                <button class="remove-file-btn" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>
            `;
            
            li.querySelector('.remove-file-btn').addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                selectedFiles.splice(idx, 1);
                updateFilesListUI();
            });
            filesList.appendChild(li);
        });

        filesListContainer.style.display = 'block';
    }

    clearAllBtn.addEventListener('click', () => {
        selectedFiles = [];
        updateFilesListUI();
        fileInput.value = '';
    });

    processBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;

        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('files[]', file));

        showLoader(`Merging and cleaning ${selectedFiles.length} file(s)...`);
        resultCard.style.display = 'none';

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            let data = {};
            try { data = await response.json(); } catch(e){}

            if (!response.ok) {
                showInvalidFileModal(data.message || "Invalid file detected in Rename section. Please upload the correct Orders file.");
                return;
            }

            hideLoader();
            successMessage.textContent = `Successfully merged ${selectedFiles.length} file(s). Total orders: ${data.total_orders}`;
            
            renderPreviewTable(data.columns, data.preview);
            
            resultCard.style.display = 'block';
            resultCard.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            hideLoader();
            showInvalidFileModal("Invalid file detected in Rename section. Please upload the correct Orders file.");
        }
    });

    function renderPreviewTable(columns, previewData) {
        tableHeaders.innerHTML = '';
        tableBody.innerHTML = '';

        if (columns.length === 0 || previewData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="100%" style="text-align:center;">No data available</td></tr>';
            return;
        }

        const highlightCols = ['order_item_id', 'sku', 'product_title', 'title', 'order item id', 'orderitemid', 'product title', 'producttitle'];
        const colIndicesToHighlight = {};

        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            const isTarget = highlightCols.some(hc => col.toString().toLowerCase().trim() === hc);
            if (isTarget) {
                th.classList.add('col-highlight');
                colIndicesToHighlight[col] = true;
            }
            tableHeaders.appendChild(th);
        });

        previewData.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                const val = row[col];
                td.textContent = val !== undefined && val !== null ? val : '';
                td.title = td.textContent;
                
                if (colIndicesToHighlight[col]) {
                    td.classList.add('col-highlight');
                }
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    }


    // ====================================================
    // TAB 2: RENAME EXCEL FILES LOGIC (UNIFIED)
    // ====================================================
    const renameDropzone = document.getElementById('renameDropzone');
    const renameFileInput = document.getElementById('renameFileInput');
    const renameFilesList = document.getElementById('renameFilesList');
    const renameFilesListContainer = document.getElementById('renameFilesListContainer');
    const renameFileCountSpan = document.getElementById('renameFileCount');
    const renameClearAllBtn = document.getElementById('renameClearAllBtn');
    const renameProcessBtn = document.getElementById('renameProcessBtn');
    const renameResultCard = document.getElementById('renameResultCard');
    const renameSuccessMessage = document.getElementById('renameSuccessMessage');
    const renameDownloadBtn = document.getElementById('renameDownloadBtn');
    const renameLogBody = document.getElementById('renameLogBody');
    const renameInfoNote = document.getElementById('renameInfoNote');

    // Indicator hooks
    const statusIndicatorLight = document.getElementById('statusIndicatorLight');
    const mappingStatusTitle = document.getElementById('mappingStatusTitle');
    const mappingStatusDesc = document.getElementById('mappingStatusDesc');

    let selectedRenameFiles = [];
    let isMappingActive = false;
    let renameResultType = 'zip'; // 'zip' or 'single'
    let renameResultFilename = 'Renamed_Files.zip';

    // Fetch saved mapping status from the server
    async function checkMappingStatus() {
        try {
            const response = await fetch('/api/mapping-status');
            const data = await response.json();
            
            if (data.loaded) {
                statusIndicatorLight.classList.add('active');
                mappingStatusTitle.textContent = "Brand Mapping Active";
                mappingStatusDesc.innerHTML = `<span style="color:#10b981; font-weight:600;">Rules Loaded: ${data.rules_count} rules</span>. You can drop a new mapping file at any time to replace them.`;
                isMappingActive = true;
            } else {
                statusIndicatorLight.classList.remove('active');
                mappingStatusTitle.textContent = "No Active Mapping";
                mappingStatusDesc.textContent = "Drop a mapping file (e.g., arrange_mapping.xlsx) in the upload zone to load brand rules.";
                isMappingActive = false;
            }
        } catch (e) {
            console.error("Failed to query mapping status:", e);
        }
    }

    // Call on load
    checkMappingStatus();

    // Helper: Client-side classify if file is a mapping file
    function checkIsMappingFile(file) {
        const nameLower = file.name.toLowerCase();
        return nameLower.includes('arrange') || nameLower.includes('mapping');
    }

    // 2. Renamer Files Dropzone handlers
    ['dragenter', 'dragover'].forEach(eventName => {
        renameDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            renameDropzone.classList.add('dragover');
        }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        renameDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            renameDropzone.classList.remove('dragover');
        }, false);
    });

    renameDropzone.addEventListener('click', (e) => {
        if (e.target !== renameFileInput) {
            renameFileInput.click();
        }
    });
    renameDropzone.addEventListener('drop', (e) => handleRenameFilesSelection(e.dataTransfer.files));
    renameFileInput.addEventListener('change', (e) => handleRenameFilesSelection(e.target.files));

    async function handleRenameFilesSelection(files) {
        console.log("%c [Rename Tab handleRenameFilesSelection]", "background: purple; color: white; font-size: 14px;", files);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`Rename tab processing file #${i+1}: ${file.name}`);
            const ext = file.name.split('.').pop().toLowerCase();
            
            if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
                console.warn(`Unsupported rename file extension: ${ext}`);
                showInvalidFileModal("Invalid file detected in Rename section. Please upload the correct taxes file.");
                return;
            }

            const isMap = checkIsMappingFile(file);
            console.log(`Is mapping file check for ${file.name}: ${isMap}`);
            if (!isMap) {
                const filenameLower = file.name.toLowerCase();
                if (!filenameLower.includes('taxreportdata')) {
                    console.warn(`[RENAME VALIDATION FAILED] File ${file.name} does not contain 'TaxReportData'`);
                    showInvalidFileModal("Invalid file detected in Rename section. Please upload the correct taxes file.");
                    return;
                }
            }

            const isDuplicate = selectedRenameFiles.some(f => f.name === file.name && f.size === file.size);
            if (!isDuplicate) selectedRenameFiles.push(file);
        }
        updateRenameFilesListUI();
    }

    function updateRenameFilesListUI() {
        renameFilesList.innerHTML = '';
        renameFileCountSpan.textContent = selectedRenameFiles.length;

        if (selectedRenameFiles.length === 0) {
            renameFilesListContainer.style.display = 'none';
            renameResultCard.style.display = 'none';
            return;
        }

        selectedRenameFiles.forEach((file, index) => {
            const isMap = checkIsMappingFile(file);
            const tagClass = isMap ? 'tag-mapping' : 'tag-rename';
            const tagText = isMap ? 'Mapping' : 'To Rename';

            const li = document.createElement('li');
            li.innerHTML = `
                <div class="file-info">
                    <i class="fa-regular fa-file-excel"></i>
                    <div>
                        <div class="file-name" title="${file.name}">
                            ${file.name} 
                            <span class="file-tag ${tagClass}">${tagText}</span>
                        </div>
                        <span class="file-size">${formatBytes(file.size)}</span>
                    </div>
                </div>
                <button class="remove-file-btn" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>
            `;
            
            li.querySelector('.remove-file-btn').addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                selectedRenameFiles.splice(idx, 1);
                updateRenameFilesListUI();
            });
            renameFilesList.appendChild(li);
        });

        renameFilesListContainer.style.display = 'block';
    }

    renameClearAllBtn.addEventListener('click', () => {
        selectedRenameFiles = [];
        updateRenameFilesListUI();
        renameFileInput.value = '';
    });

    // 3. Process & Rename files
    renameProcessBtn.addEventListener('click', async () => {
        if (selectedRenameFiles.length === 0) return;

        const selectedOption = document.querySelector('input[name="renameOption"]:checked').value;
        const hasUploadMapping = selectedRenameFiles.some(checkIsMappingFile);

        if (selectedOption === 'yes' && !isMappingActive && !hasUploadMapping) {
            alert('Option A requires the ARRANGE mapping sheet. Please upload your mapping file (e.g. arrange_mapping.xlsx) in the upload zone.');
            return;
        }

        const formData = new FormData();
        selectedRenameFiles.forEach(file => formData.append('files[]', file));
        formData.append('option', selectedOption);

        showLoader(`Processing files...`);
        renameResultCard.style.display = 'none';

        try {
            const response = await fetch('/api/rename', {
                method: 'POST',
                body: formData
            });

            let data = {};
            try { data = await response.json(); } catch(e){}

            if (!response.ok) {
                showInvalidFileModal(data.message || "Invalid file detected in Rename section. Please upload the correct Orders file.");
                return;
            }

            hideLoader();

            // Check if mapping was updated/uploaded during the rename call
            if (data.type === 'mapping_only') {
                alert(`ARRANGE mapping rules uploaded and saved successfully! Loaded ${data.rules_count} brand rules.`);
                // Clean the list
                selectedRenameFiles = [];
                updateRenameFilesListUI();
                checkMappingStatus();
                return;
            }

            // If mapping file was detected & parsed in the response
            if (data.mapping_detected) {
                checkMappingStatus();
            }

            // Set up download settings
            renameResultType = data.type;
            renameResultFilename = data.filename;
            
            // Success message
            renameSuccessMessage.textContent = `Renaming completed! Processed ${data.log.length} file(s).`;
            
            // Set button appearance based on file type
            if (renameResultType === 'zip') {
                renameDownloadBtn.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Download Renamed Files (ZIP)';
                renameInfoNote.innerHTML = '<i class="fa-solid fa-circle-info"></i> Files have been renamed. Download the ZIP folder containing all renamed files.';
            } else {
                renameDownloadBtn.innerHTML = '<i class="fa-solid fa-file-arrow-down"></i> Download Renamed File';
                renameInfoNote.innerHTML = `<i class="fa-solid fa-circle-info"></i> File successfully renamed to: <b>${data.filename}</b>`;
            }

            // Populate Log Table
            renderRenameLogTable(data.log);

            renameResultCard.style.display = 'block';
            renameResultCard.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            hideLoader();
            showInvalidFileModal("Invalid file detected in Rename section. Please upload the correct Orders file.");
        }
    });

    // Render operations log table
    function renderRenameLogTable(logs) {
        renameLogBody.innerHTML = '';
        if (logs.length === 0) {
            renameLogBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No files were renamed.</td></tr>';
            return;
        }

        logs.forEach(log => {
            const tr = document.createElement('tr');
            
            const tdOriginal = document.createElement('td');
            tdOriginal.textContent = log.original;
            tdOriginal.title = log.original;
            
            const tdRenamed = document.createElement('td');
            tdRenamed.textContent = log.renamed;
            tdRenamed.title = log.renamed;
            tdRenamed.className = 'col-highlight';
            
            const tdCode = document.createElement('td');
            tdCode.textContent = log.code;
            tdCode.title = log.code;

            tr.appendChild(tdOriginal);
            tr.appendChild(tdRenamed);
            tr.appendChild(tdCode);
            renameLogBody.appendChild(tr);
        });
    }

    // 4. Download Trigger
    renameDownloadBtn.addEventListener('click', () => {
        const url = `/api/download-renamed?type=${renameResultType}&filename=${encodeURIComponent(renameResultFilename)}`;
        window.location.href = url;
    });

    // ====================================================
    // TAB 3: SEPARATE FILE LOGIC (SPLIT FILE)
    // ====================================================
    const splitDropzone = document.getElementById('splitDropzone');
    const splitFileInput = document.getElementById('splitFileInput');
    const splitFileList = document.getElementById('splitFileList');
    const splitFileListContainer = document.getElementById('splitFileListContainer');
    const splitClearBtn = document.getElementById('splitClearBtn');
    const splitProcessBtn = document.getElementById('splitProcessBtn');
    const splitResultCard = document.getElementById('splitResultCard');
    const splitSuccessMessage = document.getElementById('splitSuccessMessage');
    const splitDownloadBtn = document.getElementById('splitDownloadBtn');
    const splitLogBody = document.getElementById('splitLogBody');

    let selectedSplitFile = null;
    let splitZipFilename = 'Split_Files.zip';

    // Dropzone logic
    if (splitDropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            splitDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                splitDropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            splitDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                splitDropzone.classList.remove('dragover');
            }, false);
        });

        splitDropzone.addEventListener('click', () => {
            if (splitFileInput) splitFileInput.click();
        });
        
        splitDropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer.files.length > 0) {
                handleSplitFileSelection(e.dataTransfer.files[0]);
            }
        });
    }

    if (splitFileInput) {
        splitFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleSplitFileSelection(e.target.files[0]);
            }
        });
    }

    function handleSplitFileSelection(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
            alert(`File "${file.name}" is not supported (supports Excel/CSV).`);
            return;
        }
        selectedSplitFile = file;
        updateSplitFileUI();
    }

    function updateSplitFileUI() {
        if (!splitFileList) return;
        splitFileList.innerHTML = '';
        if (!selectedSplitFile) {
            if (splitFileListContainer) splitFileListContainer.style.display = 'none';
            if (splitResultCard) splitResultCard.style.display = 'none';
            return;
        }

        const li = document.createElement('li');
        li.innerHTML = `
            <div class="file-info">
                <i class="fa-regular fa-file-excel"></i>
                <div>
                    <div class="file-name" title="${selectedSplitFile.name}">${selectedSplitFile.name}</div>
                    <span class="file-size">${formatBytes(selectedSplitFile.size)}</span>
                </div>
            </div>
            <button class="remove-file-btn" id="removeSplitFileBtn"><i class="fa-solid fa-xmark"></i></button>
        `;
        
        li.querySelector('#removeSplitFileBtn').addEventListener('click', () => {
            selectedSplitFile = null;
            updateSplitFileUI();
            if (splitFileInput) splitFileInput.value = '';
        });
        
        splitFileList.appendChild(li);
        if (splitFileListContainer) splitFileListContainer.style.display = 'block';
    }

    if (splitClearBtn) {
        splitClearBtn.addEventListener('click', () => {
            selectedSplitFile = null;
            updateSplitFileUI();
            if (splitFileInput) splitFileInput.value = '';
        });
    }

    if (splitProcessBtn) {
        splitProcessBtn.addEventListener('click', async () => {
            if (!selectedSplitFile) return;

            const splitOption = document.querySelector('input[name="splitOption"]:checked').value;

            const formData = new FormData();
            formData.append('file', selectedSplitFile);
            formData.append('option', splitOption);

            showLoader("Splitting spreadsheet by criteria...");
            if (splitResultCard) splitResultCard.style.display = 'none';

            try {
                const response = await fetch('/api/split', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Server processing error.');

                hideLoader();

                splitZipFilename = data.zip_filename || 'Split_Files.zip';
                if (splitSuccessMessage) {
                    splitSuccessMessage.textContent = `Successfully split file into ${data.files_count} separate sheets!`;
                }
                
                // Populate Log Table
                renderSplitLogTable(data.log);

                if (splitResultCard) {
                    splitResultCard.style.display = 'block';
                    splitResultCard.scrollIntoView({ behavior: 'smooth' });
                }

            } catch (error) {
                hideLoader();
                alert(`Error during splitting: ${error.message}`);
            }
        });
    }

    function renderSplitLogTable(logs) {
        if (!splitLogBody) return;
        splitLogBody.innerHTML = '';
        if (logs.length === 0) {
            splitLogBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No split files generated.</td></tr>';
            return;
        }

        logs.forEach(log => {
            const tr = document.createElement('tr');
            
            const tdName = document.createElement('td');
            tdName.textContent = log.filename;
            tdName.title = log.filename;
            tdName.className = 'col-highlight';
            
            const tdKey = document.createElement('td');
            tdKey.textContent = log.key;
            tdKey.title = log.key;
            
            const tdId = document.createElement('td');
            tdId.textContent = log.index;

            tr.appendChild(tdName);
            tr.appendChild(tdKey);
            tr.appendChild(tdId);
            splitLogBody.appendChild(tr);
        });
    }

    if (splitDownloadBtn) {
        splitDownloadBtn.addEventListener('click', () => {
            const url = `/api/download-split?filename=${encodeURIComponent(splitZipFilename)}`;
            window.location.href = url;
        });
    }

    // ====================================================
    // TAB 4: CREATE FOLDER LOGIC (GROUP & ZIP)
    // ====================================================
    const folderDropzone = document.getElementById('folderDropzone');
    const folderFileInput = document.getElementById('folderFileInput');
    const folderFolderInput = document.getElementById('folderFolderInput');
    const folderModeFilesBtn = document.getElementById('folderModeFilesBtn');
    const folderModeFoldersBtn = document.getElementById('folderModeFoldersBtn');
    const folderHeaderTitle = document.getElementById('folderHeaderTitle');
    const folderUploadDesc = document.getElementById('folderUploadDesc');
    const folderDropzoneTitle = document.getElementById('folderDropzoneTitle');
    const folderBrowseBtn = document.getElementById('folderBrowseBtn');
    const folderUploadIcon = document.getElementById('folderUploadIcon');
    
    const folderFileList = document.getElementById('folderFileList');
    const folderFileListContainer = document.getElementById('folderFileListContainer');
    const folderFileCountSpan = document.getElementById('folderFileCount');
    const folderClearAllBtn = document.getElementById('folderClearBtn');
    const folderProcessBtn = document.getElementById('folderProcessBtn');
    const folderResultCard = document.getElementById('folderResultCard');
    const folderSuccessMessage = document.getElementById('folderSuccessMessage');
    const folderDownloadBtn = document.getElementById('folderDownloadBtn');
    const folderLogBody = document.getElementById('folderLogBody');

    let selectedFolderFiles = [];
    let folderZipFilename = 'Grouped_Folders.zip';
    let folderMode = 'files'; // 'files' or 'folders'

    // Initialize folder input display as hidden by default
    if (folderFolderInput) folderFolderInput.style.display = 'none';

    function checkIsMergedFile(file) {
        return file.name.toUpperCase().includes('FLIPKART_MERGED_ORDERS');
    }

    // Helper to recursively traverse dragged folders and get files
    async function getFilesFromDataTransfer(dataTransfer) {
        const files = [];
        
        const readDirectory = (dirEntry) => {
            return new Promise((resolve) => {
                const reader = dirEntry.createReader();
                const allEntries = [];
                
                const readEntries = () => {
                    reader.readEntries((entries) => {
                        if (entries.length === 0) {
                            resolve(allEntries);
                        } else {
                            allEntries.push(...entries);
                            readEntries();
                        }
                    }, () => resolve([]));
                };
                readEntries();
            });
        };
        
        const getFile = (fileEntry) => {
            return new Promise((resolve) => {
                fileEntry.file((file) => resolve(file), () => resolve(null));
            });
        };
        
        const traverse = async (entry, path = "") => {
            if (entry.isFile) {
                const file = await getFile(entry);
                if (file) {
                    file.customRelativePath = path ? `${path}/${file.name}` : file.name;
                    files.push(file);
                }
            } else if (entry.isDirectory) {
                const entries = await readDirectory(entry);
                const nextPath = path ? `${path}/${entry.name}` : entry.name;
                for (const subEntry of entries) {
                    await traverse(subEntry, nextPath);
                }
            }
        };
        
        const items = dataTransfer.items;
        const entries = [];
        
        if (items) {
            for (let i = 0; i < items.length; i++) {
                try {
                    const entry = items[i].webkitGetAsEntry();
                    if (entry) {
                        entries.push(entry);
                    }
                } catch (err) {
                    console.warn(err);
                }
            }
        }
        
        if (entries.length > 0) {
            for (const entry of entries) {
                await traverse(entry);
            }
        } else {
            const list = Array.from(dataTransfer.files);
            list.forEach(file => {
                file.customRelativePath = file.webkitRelativePath || file.name;
                files.push(file);
            });
        }
        return files;
    }

    function switchFolderMode(mode) {
        if (folderMode === mode) return;
        folderMode = mode;
        
        selectedFolderFiles = [];
        if (folderFileInput) folderFileInput.value = '';
        if (folderFolderInput) folderFolderInput.value = '';
        
        if (folderFileListContainer) folderFileListContainer.style.display = 'none';
        if (folderResultCard) folderResultCard.style.display = 'none';
        
        if (mode === 'files') {
            if (folderFileInput) folderFileInput.style.display = 'block';
            if (folderFolderInput) folderFolderInput.style.display = 'none';
            if (folderModeFilesBtn) folderModeFilesBtn.classList.add('active');
            if (folderModeFoldersBtn) folderModeFoldersBtn.classList.remove('active');
            if (folderHeaderTitle) folderHeaderTitle.innerText = "Upload Files to Group";
            if (folderUploadDesc) folderUploadDesc.innerText = "Drag & drop your files (including Merged file & prefix renamed files) together.";
            if (folderDropzoneTitle) folderDropzoneTitle.innerText = "Drag & drop your files here";
            if (folderBrowseBtn) folderBrowseBtn.innerText = "Browse Files";
            if (folderUploadIcon) {
                folderUploadIcon.className = "fa-solid fa-folder-plus upload-icon";
                folderUploadIcon.style.color = "var(--primary)";
            }
        } else {
            if (folderFileInput) folderFileInput.style.display = 'none';
            if (folderFolderInput) folderFolderInput.style.display = 'block';
            if (folderModeFilesBtn) folderModeFilesBtn.classList.remove('active');
            if (folderModeFoldersBtn) folderModeFoldersBtn.classList.add('active');
            if (folderHeaderTitle) folderHeaderTitle.innerText = "Upload Folders Directly";
            if (folderUploadDesc) folderUploadDesc.innerText = "Drag & drop your grouped folders here to verify and package.";
            if (folderDropzoneTitle) folderDropzoneTitle.innerText = "Drag & drop your folders here";
            if (folderBrowseBtn) folderBrowseBtn.innerText = "Browse Folders";
            if (folderUploadIcon) {
                folderUploadIcon.className = "fa-solid fa-folder-open upload-icon";
                folderUploadIcon.style.color = "var(--success)";
            }
        }
        updateFolderFilesListUI();
    }

    if (folderModeFilesBtn) {
        folderModeFilesBtn.addEventListener('click', () => switchFolderMode('files'));
    }
    if (folderModeFoldersBtn) {
        folderModeFoldersBtn.addEventListener('click', () => switchFolderMode('folders'));
    }

    if (folderDropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            folderDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                folderDropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            folderDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                folderDropzone.classList.remove('dragover');
            }, false);
        });

        folderDropzone.addEventListener('click', (e) => {
            if (e.target === folderFileInput || e.target === folderFolderInput) return;
            if (folderMode === 'files') {
                if (folderFileInput) folderFileInput.click();
            } else {
                if (folderFolderInput) folderFolderInput.click();
            }
        });
        
        folderDropzone.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            folderDropzone.classList.remove('dragover');
            
            let files = [];
            if (folderMode === 'files') {
                if (e.dataTransfer.files.length > 0) {
                    files = Array.from(e.dataTransfer.files);
                }
            } else {
                files = await getFilesFromDataTransfer(e.dataTransfer);
            }
            
            if (files.length > 0) {
                handleFolderFilesSelection(files);
            }
        });
    }

    if (folderFileInput) {
        folderFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFolderFilesSelection(Array.from(e.target.files));
            }
        });
    }

    if (folderFolderInput) {
        folderFolderInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFolderFilesSelection(Array.from(e.target.files));
            }
        });
    }

    function handleFolderFilesSelection(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop().toLowerCase();
            const isSystemFile = file.name.startsWith('.') || file.name.startsWith('~') || file.name === "Thumbs.db";
            
            if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
                alert(`File "${file.name}" is not supported (supports Excel/CSV) and was skipped.`);
                continue;
            }
            if (isSystemFile) {
                continue;
            }

            if (folderMode === 'files') {
                const isDuplicate = selectedFolderFiles.some(f => f.name === file.name && f.size === file.size);
                if (!isDuplicate) {
                    file.customRelativePath = file.name;
                    selectedFolderFiles.push(file);
                }
            } else {
                const relativePath = file.customRelativePath || file.webkitRelativePath || file.name;
                const normalizedPath = relativePath.replace(/\\/g, '/');
                const pathParts = normalizedPath.split('/');
                
                if (pathParts.length > 1) {
                    const folderName = pathParts[pathParts.length - 2];
                    const cleanRelativePath = `${folderName}/${file.name}`;
                    
                    const isDuplicate = selectedFolderFiles.some(f => f.customRelativePath === cleanRelativePath && f.size === file.size);
                    if (!isDuplicate) {
                        file.customRelativePath = cleanRelativePath;
                        file.folderName = folderName;
                        selectedFolderFiles.push(file);
                    }
                } else {
                    alert(`File "${file.name}" was skipped because it is not inside an uploaded folder.`);
                }
            }
        }
        updateFolderFilesListUI();
    }

    function updateFolderFilesListUI() {
        if (!folderFileList) return;
        folderFileList.innerHTML = '';
        if (folderFileCountSpan) folderFileCountSpan.textContent = selectedFolderFiles.length;

        if (selectedFolderFiles.length === 0) {
            if (folderFileListContainer) folderFileListContainer.style.display = 'none';
            if (folderResultCard) folderResultCard.style.display = 'none';
            return;
        }

        selectedFolderFiles.forEach((file, index) => {
            let isMerged = false;
            let tagText = 'Prefix File';
            let tagClass = 'tag-rename';

            if (folderMode === 'files') {
                isMerged = checkIsMergedFile(file);
                tagClass = isMerged ? 'tag-mapping' : 'tag-rename';
                tagText = isMerged ? 'Merged File' : 'Prefix File';
            } else {
                isMerged = checkIsMergedFile(file);
                tagClass = isMerged ? 'tag-mapping' : 'tag-rename';
                tagText = isMerged ? `Folder: ${file.folderName} (Merged)` : `Folder: ${file.folderName}`;
            }

            const displayName = file.customRelativePath || file.name;

            const li = document.createElement('li');
            li.innerHTML = `
                <div class="file-info">
                    <i class="fa-regular fa-file-excel"></i>
                    <div>
                        <div class="file-name" title="${displayName}">
                            ${displayName} 
                            <span class="file-tag ${tagClass}">${tagText}</span>
                        </div>
                        <span class="file-size">${formatBytes(file.size)}</span>
                    </div>
                </div>
                <button class="remove-file-btn" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>
            `;
            
            li.querySelector('.remove-file-btn').addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                selectedFolderFiles.splice(idx, 1);
                updateFolderFilesListUI();
            });
            folderFileList.appendChild(li);
        });

        if (folderFileListContainer) folderFileListContainer.style.display = 'block';
    }

    if (folderClearAllBtn) {
        folderClearAllBtn.addEventListener('click', () => {
            selectedFolderFiles = [];
            updateFolderFilesListUI();
            if (folderFileInput) folderFileInput.value = '';
            if (folderFolderInput) folderFolderInput.value = '';
        });
    }

    if (folderProcessBtn) {
        folderProcessBtn.addEventListener('click', async () => {
            if (selectedFolderFiles.length === 0) return;

            if (folderMode === 'files') {
                // Check validation: at least 1 merged file and at least 1 other file
                const mergedFiles = selectedFolderFiles.filter(checkIsMergedFile);
                const otherFiles = selectedFolderFiles.filter(f => !checkIsMergedFile(f));

                if (mergedFiles.length !== 1) {
                    alert(`Error: Exactly one file containing "FLIPKART_MERGED_ORDERS" in its name must be selected (you selected ${mergedFiles.length}).`);
                    return;
                }

                if (otherFiles.length === 0) {
                    alert(`Error: You must upload at least one other file with a prefix to move into folders.`);
                    return;
                }
            } else {
                const allFolders = new Set();
                selectedFolderFiles.forEach(file => {
                    if (file.folderName) allFolders.add(file.folderName);
                });

                if (allFolders.size === 0) {
                    alert(`Error: No valid folders were detected. Please upload/drop whole folders.`);
                    return;
                }
            }

            const formData = new FormData();
            formData.append('mode', folderMode);
            
            selectedFolderFiles.forEach(file => {
                const filepath = file.customRelativePath || file.name;
                formData.append('files[]', file, filepath);
            });

            showLoader("Processing folder creation workflow...");
            if (folderResultCard) folderResultCard.style.display = 'none';

            try {
                const response = await fetch('/api/create-folder', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Server processing error.');

                hideLoader();

                folderZipFilename = data.zip_filename || 'Grouped_Folders.zip';
                if (folderSuccessMessage) {
                    folderSuccessMessage.textContent = folderMode === 'files' ? 
                        `Successfully created ${data.folders_count} prefix folder(s)!` :
                        `Successfully verified and zipped ${data.folders_count} folder(s)!`;
                }

                // Populate Log Table
                renderFolderLogTable(data.log);

                if (folderResultCard) {
                    folderResultCard.style.display = 'block';
                    folderResultCard.scrollIntoView({ behavior: 'smooth' });
                }

            } catch (error) {
                hideLoader();
                alert(`Error during folder creation: ${error.message}`);
            }
        });
    }

    function renderFolderLogTable(logs) {
        if (!folderLogBody) return;
        folderLogBody.innerHTML = '';
        if (logs.length === 0) {
            folderLogBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No folders were created.</td></tr>';
            return;
        }

        logs.forEach(log => {
            const tr = document.createElement('tr');
            
            const tdFolder = document.createElement('td');
            tdFolder.textContent = log.folder;
            tdFolder.className = 'col-highlight';
            tdFolder.style.fontWeight = '600';
            
            const tdMerged = document.createElement('td');
            tdMerged.textContent = log.copied_merged || "";
            tdMerged.title = log.copied_merged || "";
            
            const tdMoved = document.createElement('td');
            tdMoved.textContent = log.moved_files ? log.moved_files.join(', ') : "";
            tdMoved.title = log.moved_files ? log.moved_files.join(', ') : "";

            tr.appendChild(tdFolder);
            tr.appendChild(tdMerged);
            tr.appendChild(tdMoved);
            folderLogBody.appendChild(tr);
        });
    }

    if (folderDownloadBtn) {
        folderDownloadBtn.addEventListener('click', () => {
            window.location.href = `/api/download-folder-zip?filename=${encodeURIComponent(folderZipFilename)}`;
        });
    }

    // ====================================================
    // TAB 5: INVOICE ARRANGE LOGIC
    // ====================================================
    const invoiceDropzone = document.getElementById('invoiceDropzone');
    const invoiceFileInput = document.getElementById('invoiceFileInput');
    const invoiceFileList = document.getElementById('invoiceFileList');
    const invoiceFileListContainer = document.getElementById('invoiceFileListContainer');
    const invoiceFileCountSpan = document.getElementById('invoiceFileCount');
    const invoiceClearAllBtn = document.getElementById('invoiceClearBtn');
    const invoiceProcessBtn = document.getElementById('invoiceProcessBtn');
    const invoiceResultCard = document.getElementById('invoiceResultCard');
    const invoiceSuccessMessage = document.getElementById('invoiceSuccessMessage');
    const invoiceDownloadBtn = document.getElementById('invoiceDownloadBtn');
    const invoiceLogBody = document.getElementById('invoiceLogBody');

    let selectedInvoiceFiles = [];
    let invoiceZipFilename = 'Arranged_Invoices.zip';

    function classifyInvoiceFile(file) {
        const name = file.name.toUpperCase();
        if (name.endsWith('.ZIP')) {
            return { type: 'ZIP', label: 'Batch ZIP Archive', css: 'tag-rename' }; // Blue
        } else if (name.includes('FLIPKART_MERGED_ORDERS')) {
            return { type: 'OD', label: 'OD File (Merged)', css: 'tag-mapping' }; // Green
        } else if (name.includes('TAXREPORTDATA')) {
            return { type: 'DT', label: 'DT File (Tax Report)', css: 'tag-rename' }; // Blue
        } else {
            return { type: 'Details', label: 'Details File (Split)', css: 'tag-info' }; // Orange
        }
    }

    if (invoiceDropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            invoiceDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                invoiceDropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            invoiceDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                invoiceDropzone.classList.remove('dragover');
            }, false);
        });

        invoiceDropzone.addEventListener('click', () => {
            if (invoiceFileInput) invoiceFileInput.click();
        });
        
        invoiceDropzone.addEventListener('drop', (e) => {
            handleInvoiceFilesSelection(e.dataTransfer.files);
        });
    }

    if (invoiceFileInput) {
        invoiceFileInput.addEventListener('change', (e) => {
            handleInvoiceFilesSelection(e.target.files);
        });
    }

    function handleInvoiceFilesSelection(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop().toLowerCase();
            
            if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv' && ext !== 'zip') {
                alert(`File "${file.name}" is not supported (supports Excel, CSV, or ZIP) and was skipped.`);
                continue;
            }

            if (ext === 'zip') {
                // If a ZIP archive is selected, clear everything and only keep the ZIP
                selectedInvoiceFiles = [file];
                break;
            } else {
                // If we are adding Excel/CSV files, check if a ZIP is currently in the list and clear it
                if (selectedInvoiceFiles.length === 1 && selectedInvoiceFiles[0].name.toLowerCase().endsWith('.zip')) {
                    selectedInvoiceFiles = [];
                }
                
                // Limit to 3 files max
                if (selectedInvoiceFiles.length >= 3) {
                    alert("You can upload at most 3 files.");
                    break;
                }

                const isDuplicate = selectedInvoiceFiles.some(f => f.name === file.name && f.size === file.size);
                if (!isDuplicate) selectedInvoiceFiles.push(file);
            }
        }
        updateInvoiceFilesListUI();
    }

    function updateInvoiceFilesListUI() {
        if (!invoiceFileList) return;
        invoiceFileList.innerHTML = '';
        if (invoiceFileCountSpan) invoiceFileCountSpan.textContent = selectedInvoiceFiles.length;

        if (selectedInvoiceFiles.length === 0) {
            if (invoiceFileListContainer) invoiceFileListContainer.style.display = 'none';
            if (invoiceResultCard) invoiceResultCard.style.display = 'none';
            return;
        }

        selectedInvoiceFiles.forEach((file, index) => {
            const classification = classifyInvoiceFile(file);

            const li = document.createElement('li');
            li.innerHTML = `
                <div class="file-info">
                    <i class="fa-regular fa-file-excel"></i>
                    <div>
                        <div class="file-name" title="${file.name}">
                            ${file.name} 
                            <span class="file-tag ${classification.css}">${classification.label}</span>
                        </div>
                        <span class="file-size">${formatBytes(file.size)}</span>
                    </div>
                </div>
                <button class="remove-file-btn" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>
            `;
            
            li.querySelector('.remove-file-btn').addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                selectedInvoiceFiles.splice(idx, 1);
                updateInvoiceFilesListUI();
            });
            invoiceFileList.appendChild(li);
        });

        if (invoiceFileListContainer) invoiceFileListContainer.style.display = 'block';
    }

    if (invoiceClearAllBtn) {
        invoiceClearAllBtn.addEventListener('click', () => {
            selectedInvoiceFiles = [];
            updateInvoiceFilesListUI();
            if (invoiceFileInput) invoiceFileInput.value = '';
        });
    }

    if (invoiceProcessBtn) {
        invoiceProcessBtn.addEventListener('click', async () => {
            if (selectedInvoiceFiles.length === 0) {
                alert("Please select files first.");
                return;
            }

            const formData = new FormData();
            const firstFile = selectedInvoiceFiles[0];

            if (selectedInvoiceFiles.length === 1 && firstFile.name.toLowerCase().endsWith('.zip')) {
                // Batch ZIP mode
                formData.append('zipfile', firstFile);
            } else if (selectedInvoiceFiles.length === 3) {
                // Individual 3-file mode
                let hasOD = false;
                let hasDT = false;
                let hasDetails = false;

                selectedInvoiceFiles.forEach(file => {
                    const cls = classifyInvoiceFile(file);
                    if (cls.type === 'OD') hasOD = true;
                    if (cls.type === 'DT') hasDT = true;
                    if (cls.type === 'Details') hasDetails = true;
                });

                if (!hasOD || !hasDT || !hasDetails) {
                    alert("Error: You must upload exactly 1 OD File (merged orders), 1 DT File (tax report), and 1 Details File (warehouse split).");
                    return;
                }

                selectedInvoiceFiles.forEach(file => {
                    const cls = classifyInvoiceFile(file);
                    formData.append(cls.type, file);
                });
            } else {
                alert("Error: Upload either exactly 1 ZIP archive (batch mode) or exactly 3 files (OD, DT, and Details).");
                return;
            }

            showLoader("Processing invoice arrange workflow...");
            if (invoiceResultCard) invoiceResultCard.style.display = 'none';

            try {
                const response = await fetch('/api/invoice-arrange', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Server processing error.');

                hideLoader();

                invoiceZipFilename = data.zip_filename || 'Arranged_Invoices.zip';
                if (invoiceSuccessMessage) {
                    invoiceSuccessMessage.textContent = `Successfully matched and grouped files! Generated ${data.files_count} outputs.`;
                }

                // Populate Log Table
                renderInvoiceLogTable(data.log);

                if (invoiceResultCard) {
                    invoiceResultCard.style.display = 'block';
                    invoiceResultCard.scrollIntoView({ behavior: 'smooth' });
                }

            } catch (error) {
                hideLoader();
                alert(`Error during invoice arrange: ${error.message}`);
            }
        });
    }

    function renderInvoiceLogTable(logs) {
        if (!invoiceLogBody) return;
        invoiceLogBody.innerHTML = '';
        if (logs.length === 0) {
            invoiceLogBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No records.</td></tr>';
            return;
        }

        logs.forEach(log => {
            const tr = document.createElement('tr');
            
            const tdOp = document.createElement('td');
            tdOp.textContent = log.operation;
            tdOp.className = 'col-highlight';
            tdOp.style.fontWeight = '600';
            
            const tdVal = document.createElement('td');
            tdVal.textContent = log.value;
            tdVal.title = log.value;
            
            const tdStatus = document.createElement('td');
            tdStatus.textContent = log.status;
            tdStatus.title = log.status;
            if (log.status.toUpperCase().includes('FAIL') || log.status.toUpperCase().includes('ERROR')) {
                tdStatus.style.color = '#ef4444';
            } else {
                tdStatus.style.color = '#10b981';
            }

            tr.appendChild(tdOp);
            tr.appendChild(tdVal);
            tr.appendChild(tdStatus);
            invoiceLogBody.appendChild(tr);
        });
    }

    if (invoiceDownloadBtn) {
        invoiceDownloadBtn.addEventListener('click', () => {
            window.location.href = `/api/download-invoice-zip?filename=${encodeURIComponent(invoiceZipFilename)}`;
        });
    }

    // ====================================================
    // TAB 6: PARTY DATA (GOOGLE SHEET SYNC) LOGIC
    // ====================================================
    const partiesTableBody = document.getElementById('partiesTableBody');
    const addPartyBtn = document.getElementById('addPartyBtn');
    const partyModal = document.getElementById('partyModal');
    const partyModalTitle = document.getElementById('partyModalTitle');
    const partyRowIndexInput = document.getElementById('partyRowIndex');
    const partyCodeInput = document.getElementById('partyCodeInput');
    const partyNameInput = document.getElementById('partyNameInput');
    const closePartyModalBtn = document.getElementById('closePartyModalBtn');
    const savePartyBtn = document.getElementById('savePartyBtn');

    // Tab Activation logic: handled by unified tab switching at start of script

    async function fetchPartiesList() {
        partiesTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-secondary);">Loading parties from Google Sheet...</td></tr>';
        try {
            const resp = await fetch('/api/parties');
            const data = await resp.json();
            if (resp.status !== 200) throw new Error(data.error || 'Server error fetching parties.');

            partiesTableBody.innerHTML = '';
            if (data.length === 0) {
                partiesTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-secondary);">No party records found. Click "Add New Party" to create one.</td></tr>';
                return;
            }

            data.forEach(party => {
                const tr = document.createElement('tr');
                
                const tdCode = document.createElement('td');
                tdCode.textContent = party.CODE;
                tdCode.style.fontWeight = '600';
                
                const tdPartyCode = document.createElement('td');
                tdPartyCode.textContent = party['PARTY CODE'];
                tdPartyCode.className = 'col-highlight';
                
                const tdActions = document.createElement('td');
                tdActions.style.textAlign = 'center';
                tdActions.innerHTML = `
                    <button class="btn btn-warning edit-party-row-btn" data-row="${party.row_index}" data-code="${party.CODE}" data-party="${party['PARTY CODE']}" style="padding: 5px 10px; margin-right: 5px; font-size: 0.8rem;">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button class="btn btn-danger delete-party-row-btn" data-row="${party.row_index}" style="padding: 5px 10px; font-size: 0.8rem;">
                        <i class="fa-solid fa-trash-can"></i> Delete
                    </button>
                `;

                tdActions.querySelector('.edit-party-row-btn').addEventListener('click', (e) => {
                    const btn = e.currentTarget;
                    partyRowIndexInput.value = btn.getAttribute('data-row');
                    partyCodeInput.value = btn.getAttribute('data-code');
                    partyNameInput.value = btn.getAttribute('data-party');
                    partyModalTitle.textContent = 'Edit Flipkart Party';
                    partyModal.style.display = 'flex';
                });

                tdActions.querySelector('.delete-party-row-btn').addEventListener('click', async (e) => {
                    const btn = e.currentTarget;
                    const rowIndex = btn.getAttribute('data-row');
                    if (!confirm('Are you sure you want to delete this party?')) return;

                    showLoader('Deleting party from Google Sheet...');
                    try {
                        const delResp = await fetch('/api/parties/delete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ rowIndex: rowIndex })
                        });
                        const delRes = await delResp.json();
                        hideLoader();
                        if (delRes.status === 'success') {
                            fetchPartiesList();
                        } else {
                            alert('Error: ' + delRes.error);
                        }
                    } catch (error) {
                        hideLoader();
                        alert('Failed to delete party: ' + error.message);
                    }
                });

                tr.appendChild(tdCode);
                tr.appendChild(tdPartyCode);
                tr.appendChild(tdActions);
                partiesTableBody.appendChild(tr);
            });
        } catch (error) {
            partiesTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #ef4444;"><i class="fa-solid fa-circle-exclamation"></i> Error loading parties: ${error.message}</td></tr>`;
        }
    }

    if (addPartyBtn) {
        addPartyBtn.addEventListener('click', () => {
            partyRowIndexInput.value = '';
            partyCodeInput.value = '';
            partyNameInput.value = '';
            partyModalTitle.textContent = 'Add New Flipkart Party';
            partyModal.style.display = 'flex';
        });
    }

    if (closePartyModalBtn) {
        closePartyModalBtn.addEventListener('click', () => {
            partyModal.style.display = 'none';
        });
    }

    if (savePartyBtn) {
        savePartyBtn.addEventListener('click', async () => {
            const rowIndex = partyRowIndexInput.value;
            const code = partyCodeInput.value.trim();
            const partyCode = partyNameInput.value.trim();

            if (!code || !partyCode) {
                alert('Please enter both CODE and PARTY CODE.');
                return;
            }

            const isEdit = rowIndex !== '';
            const apiEndpoint = isEdit ? '/api/parties/update' : '/api/parties/add';
            const payload = isEdit ? { rowIndex, code, partyCode } : { code, partyCode };

            partyModal.style.display = 'none';
            showLoader(isEdit ? 'Updating party on Google Sheet...' : 'Adding party to Google Sheet...');

            try {
                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const res = await response.json();
                hideLoader();
                if (res.status === 'success') {
                    fetchPartiesList();
                } else {
                    alert('Error saving party: ' + (res.error || res.message));
                }
            } catch (error) {
                hideLoader();
                alert('Network error saving party: ' + error.message);
            }
        });
    }

    // ====================================================
    // TAB 7: FLIPKART ERROR LOGIC
    // ====================================================
    const errorDropzone = document.getElementById('errorDropzone');
    const errorFileInput = document.getElementById('errorFileInput');
    const errorFileListContainer = document.getElementById('errorFileListContainer');
    const errorFileList = document.getElementById('errorFileList');
    const errorFileCount = document.getElementById('errorFileCount');
    const errorClearBtn = document.getElementById('errorClearBtn');
    const errorProcessBtn = document.getElementById('errorProcessBtn');
    const errorResultCard = document.getElementById('errorResultCard');
    const errorDownloadBtn = document.getElementById('errorDownloadBtn');
    const errorFromDate = document.getElementById('errorFromDate');
    const errorToDate = document.getElementById('errorToDate');

    let errorFiles = [];

    function updateErrorUI() {
        if (errorFiles.length > 0) {
            errorDropzone.style.display = 'none';
            errorFileListContainer.style.display = 'block';
            errorFileCount.textContent = errorFiles.length;
            errorFileList.innerHTML = '';
            
            errorFiles.forEach(file => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="file-info">
                        <i class="fa-solid fa-file-excel file-icon"></i>
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">(${formatBytes(file.size)})</span>
                    </div>
                    <i class="fa-solid fa-circle-check status-icon success"></i>
                `;
                errorFileList.appendChild(li);
            });
            
            if (errorFiles.length === 2) {
                errorProcessBtn.disabled = false;
            } else {
                errorProcessBtn.disabled = true;
            }
        } else {
            errorDropzone.style.display = 'block';
            errorFileListContainer.style.display = 'none';
            errorResultCard.style.display = 'none';
            errorProcessBtn.disabled = true;
        }
    }

    if (errorDropzone) {
        errorDropzone.addEventListener('click', () => {
            if (errorFiles.length < 2) {
                errorFileInput.click();
            }
        });

        errorDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            errorDropzone.classList.add('dragover');
        });

        errorDropzone.addEventListener('dragleave', () => {
            errorDropzone.classList.remove('dragover');
        });

        errorDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            errorDropzone.classList.remove('dragover');
            
            const newFiles = Array.from(e.dataTransfer.files).filter(file => {
                return file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
            });
            
            if (errorFiles.length + newFiles.length > 2) {
                alert('You can only upload exactly 2 files.');
                const remainingSlots = 2 - errorFiles.length;
                errorFiles = errorFiles.concat(newFiles.slice(0, remainingSlots));
            } else {
                errorFiles = errorFiles.concat(newFiles);
            }
            updateErrorUI();
        });
    }

    if (errorFileInput) {
        errorFileInput.addEventListener('change', (e) => {
            const newFiles = Array.from(e.target.files);
            if (errorFiles.length + newFiles.length > 2) {
                alert('You can only upload exactly 2 files.');
                const remainingSlots = 2 - errorFiles.length;
                errorFiles = errorFiles.concat(newFiles.slice(0, remainingSlots));
            } else {
                errorFiles = errorFiles.concat(newFiles);
            }
            updateErrorUI();
            errorFileInput.value = '';
        });
    }

    if (errorClearBtn) {
        errorClearBtn.addEventListener('click', () => {
            errorFiles = [];
            errorFromDate.value = '';
            errorToDate.value = '';
            updateErrorUI();
        });
    }

    let errGeneratedZipBlob = null;
    let errGeneratedZipName = "";

    function readExcelAsAOA(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
                    resolve(aoa);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        });
    }

    function cleanKey(v) {
        if (v === undefined || v === null) return "";
        let str = String(v).trim();
        str = str.replace(/[^A-Za-z0-9]/g, '');
        return str.toUpperCase();
    }

    function parseDisputeAmount(val) {
        if (val === undefined || val === null) return 0;
        const str = String(val).trim();
        const match = str.match(/Price Dispute\s*:\s*(-?\d+(\.\d+)?)/i);
        if (match) {
            return parseFloat(match[1]);
        }
        const numMatch = str.match(/-?\d+(\.\d+)?/);
        if (numMatch) {
            return parseFloat(numMatch[0]);
        }
        return 0;
    }

    function parseCellAsDate(val) {
        if (val === undefined || val === null || val === "") return null;
        if (val instanceof Date) return val;
        if (!isNaN(Number(val)) && Number(val) > 20000) {
            return new Date((Number(val) - 25569) * 86400000);
        }
        const str = String(val).trim();
        if (!str) return null;
        const parts = str.split(' ')[0].split(/[-/]/);
        if (parts.length === 3) {
            let day, month, year;
            if (parts[0].length === 4) {
                year = parseInt(parts[0], 10);
                month = parseInt(parts[1], 10) - 1;
                day = parseInt(parts[2], 10);
            } else {
                day = parseInt(parts[0], 10);
                month = parseInt(parts[1], 10) - 1;
                year = parseInt(parts[2], 10);
            }
            const d = new Date(year, month, day);
            if (!isNaN(d.getTime())) return d;
        }
        const d = new Date(str);
        return isNaN(d.getTime()) ? null : d;
    }

    function applyWorksheetFormatting(ws, sheetAOA, isGroupSheet, headerRowIdx = 0) {
        if (!ws || !sheetAOA || sheetAOA.length === 0) return;
        ws['!views'] = [{ showGridLines: true }];

        const colWidths = sheetAOA[0].map((_, colIndex) => {
            let maxLen = 10;
            sheetAOA.forEach((row, rowIndex) => {
                if (isGroupSheet && rowIndex === 0) return;
                const val = row[colIndex];
                if (val !== undefined && val !== null && val !== "") {
                    const str = String(val);
                    if (str.length > maxLen) maxLen = str.length;
                }
            });
            return { wch: Math.min(maxLen + 3, 45) };
        });
        ws['!cols'] = colWidths;

        const rowHeights = [];
        if (isGroupSheet) {
            rowHeights.push({ hpt: 28 });
            rowHeights.push({ hpt: 24 });
            for (let r = 2; r < sheetAOA.length; r++) {
                rowHeights.push({ hpt: 20 });
            }
        } else {
            rowHeights.push({ hpt: 20 });
            rowHeights.push({ hpt: 24 });
            for (let r = 2; r < sheetAOA.length; r++) {
                rowHeights.push({ hpt: 20 });
            }
        }
        ws['!rows'] = rowHeights;

        const colAlignments = [
            "left", "center", "left", "center", "center", "left",
            "center", "right", "left", "center", "right", "left"
        ];

        for (const cellKey in ws) {
            if (cellKey[0] === '!') continue;
            const cell = ws[cellKey];
            const borderStyle = {
                top: { style: "thin", color: { rgb: "D1D5DB" } },
                bottom: { style: "thin", color: { rgb: "D1D5DB" } },
                left: { style: "thin", color: { rgb: "D1D5DB" } },
                right: { style: "thin", color: { rgb: "D1D5DB" } }
            };
            cell.s = { border: borderStyle };

            const match = cellKey.match(/^([A-Z]+)(\d+)$/);
            if (match) {
                const col = match[1];
                const rowNum = parseInt(match[2], 10);
                const colIndex = XLSX.utils.decode_col(col);

                if (isGroupSheet) {
                    if (rowNum === 1) {
                        cell.s.fill = { fgColor: { rgb: "FFFFFF" } };
                        cell.s.font = { name: "Arial", sz: 12, bold: true, color: { rgb: "000000" } };
                        cell.s.alignment = { horizontal: "center", vertical: "center" };
                    } else if (rowNum === 2) {
                        cell.s.fill = { fgColor: { rgb: "2F5597" } };
                        cell.s.font = { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } };
                        cell.s.alignment = { horizontal: "center", vertical: "center" };
                    } else {
                        cell.s.font = { name: "Arial", sz: 10, color: { rgb: "000000" } };
                        cell.s.alignment = { horizontal: colAlignments[colIndex] || "left", vertical: "center" };
                        if (colIndex === 7 || colIndex === 10) {
                            cell.z = '#,##0.00';
                        }
                    }
                } else {
                    const detailHeaderRowNum = headerRowIdx + 1;
                    if (rowNum === detailHeaderRowNum) {
                        cell.s.fill = { fgColor: { rgb: "2F5597" } };
                        cell.s.font = { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } };
                        cell.s.alignment = { horizontal: "left", vertical: "center" };
                    } else if (rowNum < detailHeaderRowNum) {
                        cell.s.font = { name: "Arial", sz: 10, color: { rgb: "000000" } };
                    } else {
                        cell.s.font = { name: "Arial", sz: 10, color: { rgb: "000000" } };
                        cell.s.alignment = { horizontal: "left", vertical: "center" };
                    }
                }
            }
        }
    }

    if (errorProcessBtn) {
        errorProcessBtn.addEventListener('click', async () => {
            if (errorFiles.length !== 2) {
                alert('Please upload exactly 2 files (Details and Data).');
                return;
            }

            let detailsFile = null;
            let dataFile = null;

            if (errorFiles[0].name.toLowerCase().includes('detail')) {
                detailsFile = errorFiles[0];
                dataFile = errorFiles[1];
            } else if (errorFiles[1].name.toLowerCase().includes('detail')) {
                detailsFile = errorFiles[1];
                dataFile = errorFiles[0];
            } else if (errorFiles[0].name.toLowerCase().includes('data')) {
                dataFile = errorFiles[0];
                detailsFile = errorFiles[1];
            } else if (errorFiles[1].name.toLowerCase().includes('data')) {
                dataFile = errorFiles[1];
                detailsFile = errorFiles[0];
            } else {
                detailsFile = errorFiles[0];
                dataFile = errorFiles[1];
            }

            showLoader('Processing Flipkart Error Data Client-Side... Please wait.');

            try {
                const fromDateStr = errorFromDate.value;
                const toDateStr = errorToDate.value;

                const fromDate = fromDateStr ? new Date(fromDateStr) : null;
                const toDate = toDateStr ? new Date(toDateStr) : null;

                if (fromDate) fromDate.setHours(0, 0, 0, 0);
                if (toDate) toDate.setHours(23, 59, 59, 999);

                // Read files client-side
                const detailsAOA = await readExcelAsAOA(detailsFile);
                const dataAOA = await readExcelAsAOA(dataFile);

                if (detailsAOA.length === 0) throw new Error("Details file is empty.");
                if (dataAOA.length === 0) throw new Error("Data file is empty.");

                // Determine correct header row for Details
                let headerRowIndex = 0;
                if (detailsAOA[1] && String(detailsAOA[1][1]).toLowerCase().includes("invoice")) {
                    headerRowIndex = 1;
                }
                const headerDetails = detailsAOA[headerRowIndex];

                // Details AOA check: Column V (index 21). Delete row if value is "0" or "Price Dispute : 0".
                const filteredDetailsRows = [];
                let deletedRowCount = 0;
                for (let i = headerRowIndex + 1; i < detailsAOA.length; i++) {
                    const row = detailsAOA[i];
                    const valV = row[21] !== undefined ? String(row[21]).trim() : "";
                    if (valV === "0" || valV === "Price Dispute : 0") {
                        deletedRowCount++;
                    } else {
                        filteredDetailsRows.push(row);
                    }
                }

                // Data AOA: Map Column E (index 4) -> Column C (index 2)
                const dataMap = new Map();
                for (let j = 1; j < dataAOA.length; j++) {
                    const row = dataAOA[j];
                    const keyE = row[4] !== undefined ? cleanKey(row[4]) : "";
                    if (keyE) {
                        const valC = row[2] !== undefined ? row[2] : "";
                        dataMap.set(keyE, valC);
                    }
                }

                // Details AOA: Map Column B (index 1) -> Column W (index 22) and check Date Range
                let mappedCount = 0;
                let dateFilteredCount = 0;
                const survivingRows = [];

                for (let i = 0; i < filteredDetailsRows.length; i++) {
                    const row = filteredDetailsRows[i];
                    const keyB = row[1] !== undefined ? cleanKey(row[1]) : "";
                    
                    while (row.length < 23) {
                        row.push("");
                    }
                    
                    let cellValC = "";
                    if (keyB && dataMap.has(keyB)) {
                        cellValC = dataMap.get(keyB);
                        mappedCount++;
                    }
                    row[22] = cellValC;

                    // Date filter check
                    if (fromDate || toDate) {
                        const cellDate = parseCellAsDate(cellValC);
                        if (cellDate) {
                            let inRange = true;
                            if (fromDate && cellDate < fromDate) inRange = false;
                            if (toDate && cellDate > toDate) inRange = false;

                            if (inRange) {
                                dateFilteredCount++;
                                continue;
                            }
                        }
                    }

                    survivingRows.push(row);
                }

                // Group survivingRows by Column D (index 3)
                const partyGroups = new Map();
                survivingRows.forEach(row => {
                    const partyKey = String(row[3] || "").trim();
                    if (partyKey) {
                        if (!partyGroups.has(partyKey)) {
                            partyGroups.set(partyKey, []);
                        }
                        partyGroups.get(partyKey).push(row);
                    }
                });

                // Initialize ZIP and Master Workbook
                const zip = new JSZip();
                const masterWb = XLSX.utils.book_new();
                const partyKeysSorted = Array.from(partyGroups.keys()).sort();

                const partyRecords = [];

                partyKeysSorted.forEach(partyKey => {
                    const rowsInGroup = partyGroups.get(partyKey);

                    // Row 1 (index 0): Merged A1:L1 title block
                    const titleRow = [`${partyKey}-price dispute`, "", "", "", "", "", "", "", "", "", "", ""];

                    // Row 2 (index 1): Column Headers
                    const colHeaders = [
                        "Invoice No", "Invoice Date", "Warehouse Name", "Order ID", "Item Asin",
                        "Item SKU", "Quantity", "Item Cost", "Reason", "Order Date", "Calculated Price", "Remarks"
                    ];

                    const sheetAOA = [titleRow, colHeaders];

                    rowsInGroup.forEach(row => {
                        const valH = parseFloat(row[12]) || 0;
                        const valG = parseInt(row[11], 10) || 0;
                        const disputeVal = parseDisputeAmount(row[21]);
                        const valK = parseFloat((valH - disputeVal).toFixed(2));
                        const valL = "this amount not coorect as account central price this is approx price that currently live in account central";

                        const dataRow = [
                            row[1] || "",
                            row[2] || "",
                            row[3] || "",
                            row[6] || "",
                            row[7] || "",
                            row[8] || "",
                            valG,
                            valH,
                            row[21] || "",
                            row[22] || "",
                            valK,
                            valL
                        ];
                        sheetAOA.push(dataRow);
                    });

                    // Convert to sheet and merge A1:L1
                    const wsGroup = XLSX.utils.aoa_to_sheet(sheetAOA);
                    wsGroup['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }];

                    // Apply styles
                    applyWorksheetFormatting(wsGroup, sheetAOA, true);

                    const sheetName = `${partyKey}-price dispute`.substring(0, 31);

                    // Create individual workbook
                    const wbGroup = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wbGroup, wsGroup, sheetName);
                    const bufferGroup = XLSX.write(wbGroup, { bookType: 'xlsx', type: 'array' });
                    const blobGroup = new Blob([bufferGroup], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const groupFilename = `${partyKey}-price dispute.xlsx`;
                    zip.file(groupFilename, blobGroup);

                    // Register tracked error in database
                    partyRecords.push({
                        party: partyKey,
                        filename: groupFilename,
                        rows_count: rowsInGroup.length
                    });

                    // Add to combined master workbook
                    XLSX.utils.book_append_sheet(masterWb, wsGroup, sheetName);
                });

                // Add master workbook to ZIP if sheets exist
                if (partyKeysSorted.length > 0) {
                    const masterBuffer = XLSX.write(masterWb, { bookType: 'xlsx', type: 'array' });
                    const masterBlob = new Blob([masterBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    zip.file("flipkart price dispute.xlsx", masterBlob);
                }

                // Clean details column W
                const topRows = headerRowIndex > 0 ? detailsAOA.slice(0, headerRowIndex) : [[]];
                const detailsCleaned = [...topRows, headerDetails, ...survivingRows];

                const wbDetails = XLSX.utils.book_new();
                const wsDetails = XLSX.utils.aoa_to_sheet(detailsCleaned);
                
                applyWorksheetFormatting(wsDetails, detailsCleaned, false, headerRowIndex > 0 ? headerRowIndex : 1);
                XLSX.utils.book_append_sheet(wbDetails, wsDetails, "Processed_Details");
                const detailsBuffer = XLSX.write(wbDetails, { bookType: 'xlsx', type: 'array' });
                const detailsBlob = new Blob([detailsBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                
                let detailsFilename = detailsFile.name;
                if (detailsFilename.toLowerCase().endsWith('.xls')) {
                    detailsFilename = detailsFilename.substring(0, detailsFilename.length - 4) + '.xlsx';
                }
                zip.file(detailsFilename, detailsBlob);

                // Compile ZIP
                const zipBlob = await zip.generateAsync({ type: "blob" });
                errGeneratedZipBlob = zipBlob;
                errGeneratedZipName = `flipkart_price_dispute_bundle.zip`;

                hideLoader();

                // Show success UI
                errorResultCard.style.display = 'block';
                errorDownloadBtn.onclick = () => {
                    const url = URL.createObjectURL(errGeneratedZipBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = errGeneratedZipName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                };

                // Save tracked errors
                if (partyRecords.length > 0) {
                    for (const rec of partyRecords) {
                        await registerTrackedError('flipkart', rec.filename, rec.party, 'Price Dispute', rec.rows_count);
                    }
                }

                alert('Flipkart Error client-side processing completed successfully!');

            } catch (error) {
                hideLoader();
                console.error(error);
                alert('Processing Error: ' + error.message);
            }
        });
    }

    // ====================================================
    // TAB 8: INVOICE ERROR LOGIC
    // ====================================================
    const invoiceErrorDropzone = document.getElementById('invoiceErrorDropzone');
    const invoiceErrorFileInput = document.getElementById('invoiceErrorFileInput');
    const invoiceErrorFileList = document.getElementById('invoiceErrorFileList');
    const invoiceErrorFileListContainer = document.getElementById('invoiceErrorFileListContainer');
    const invoiceErrorClearBtn = document.getElementById('invoiceErrorClearBtn');
    const invoiceErrorProcessBtn = document.getElementById('invoiceErrorProcessBtn');
    const invoiceErrorResultCard = document.getElementById('invoiceErrorResultCard');
    const invoiceErrorDownloadBtn = document.getElementById('invoiceErrorDownloadBtn');

    let invoiceErrorFiles = [];

    if (invoiceErrorDropzone && invoiceErrorFileInput) {
        invoiceErrorDropzone.addEventListener('click', () => invoiceErrorFileInput.click());

        invoiceErrorFileInput.addEventListener('change', (e) => {
            handleInvoiceErrorFiles(e.target.files);
        });

        // Drag and drop events
        ['dragenter', 'dragover'].forEach(eventName => {
            invoiceErrorDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                invoiceErrorDropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            invoiceErrorDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                invoiceErrorDropzone.classList.remove('dragover');
                if (e.dataTransfer && e.dataTransfer.files) {
                    handleInvoiceErrorFiles(e.dataTransfer.files);
                }
            }, false);
        });
    }

    function handleInvoiceErrorFiles(files) {
        if (files.length === 0) return;
        invoiceErrorFiles = [files[0]];
        renderInvoiceErrorFileList();
    }

    function renderInvoiceErrorFileList() {
        if (!invoiceErrorFileList) return;
        invoiceErrorFileList.innerHTML = '';
        
        invoiceErrorFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'file-item';
            
            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';
            
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-file-excel file-icon';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'file-name';
            nameSpan.textContent = file.name;
            
            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'file-size';
            sizeSpan.textContent = ` (${(file.size / 1024).toFixed(1)} KB)`;
            
            fileInfo.appendChild(icon);
            fileInfo.appendChild(nameSpan);
            fileInfo.appendChild(sizeSpan);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file-btn';
            removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                invoiceErrorFiles.splice(index, 1);
                renderInvoiceErrorFileList();
            });
            
            li.appendChild(fileInfo);
            li.appendChild(removeBtn);
            invoiceErrorFileList.appendChild(li);
        });

        if (invoiceErrorFiles.length > 0) {
            invoiceErrorFileListContainer.style.display = 'block';
            invoiceErrorResultCard.style.display = 'none';
        } else {
            invoiceErrorFileListContainer.style.display = 'none';
        }
    }

    if (invoiceErrorClearBtn) {
        invoiceErrorClearBtn.addEventListener('click', () => {
            invoiceErrorFiles = [];
            invoiceErrorFileInput.value = '';
            renderInvoiceErrorFileList();
        });
    }

    if (invoiceErrorProcessBtn) {
        invoiceErrorProcessBtn.addEventListener('click', async () => {
            if (invoiceErrorFiles.length === 0) {
                alert('Please upload a file to process.');
                return;
            }

            const formData = new FormData();
            formData.append('files[]', invoiceErrorFiles[0]);

            showLoader('Processing Invoice Error Data... Please wait.');

            try {
                const response = await fetch('/api/invoice-error-process', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                hideLoader();

                if (response.ok) {
                    invoiceErrorResultCard.style.display = 'block';
                    invoiceErrorDownloadBtn.onclick = () => {
                        window.location.href = '/api/download-invoice-error-zip';
                    };
                    if (data.records && data.records.length > 0) {
                        for (const rec of data.records) {
                            await registerTrackedError('invoice', rec.filename, rec.party, rec.error, rec.rows_count);
                        }
                    }
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                hideLoader();
                alert('Network Error: ' + error.message);
            }
        });
    }

    // ====================================================
    // TAB 9: ERROR TRACKER SYSTEM
    // ====================================================
    // Custom Confirmation Modal System
    function showCustomConfirm(title, message, callback) {
        let backdrop = document.getElementById('customConfirmBackdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'customConfirmBackdrop';
            backdrop.className = 'custom-modal-backdrop';
            backdrop.innerHTML = `
                <div class="custom-modal-card" style="border: 1px solid rgba(220, 38, 38, 0.15); box-shadow: 0 20px 25px -5px rgba(220, 38, 38, 0.05); text-align: left;">
                    <div class="custom-modal-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                        <span class="custom-modal-icon error" style="background: rgba(220, 38, 38, 0.1); color: var(--danger); display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; font-size: 1.25rem;"><i class="fa-solid fa-triangle-exclamation"></i></span>
                        <h3 class="custom-modal-title" id="customConfirmTitle" style="margin: 0; font-weight: 700; font-size: 1.2rem; color: var(--text-primary);">Confirm Action</h3>
                    </div>
                    <div class="custom-modal-body" id="customConfirmBody" style="margin-bottom: 1.5rem; line-height: 1.6; font-size: 0.9rem; color: var(--text-secondary);"></div>
                    <div class="custom-modal-footer" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                        <button class="btn btn-secondary custom-modal-close-btn" id="customConfirmCancelBtn" style="background: #e2e8f0; color: #334155; border: 1px solid #cbd5e1; height: 36px; border-radius: 8px; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: all 0.2s ease; margin-top: 0; min-width: 80px;">Cancel</button>
                        <button class="btn btn-danger custom-modal-close-btn" id="customConfirmOkBtn" style="background: var(--danger); border-color: var(--danger); color: white; height: 36px; border-radius: 8px; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: all 0.2s ease; margin-top: 0; min-width: 80px;">Delete</button>
                    </div>
                </div>
            `;
            document.body.appendChild(backdrop);
        }

        const titleEl = document.getElementById('customConfirmTitle');
        const bodyEl = document.getElementById('customConfirmBody');
        const okBtn = document.getElementById('customConfirmOkBtn');
        const cancelBtn = document.getElementById('customConfirmCancelBtn');

        titleEl.innerText = title;
        bodyEl.innerText = message;

        const newOkBtn = okBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        newOkBtn.addEventListener('click', () => {
            backdrop.classList.remove('show');
            callback(true);
        });

        const closeConfirm = () => {
            backdrop.classList.remove('show');
            callback(false);
        };

        newCancelBtn.addEventListener('click', closeConfirm);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeConfirm();
            }
        });

        setTimeout(() => {
            backdrop.classList.add('show');
        }, 50);
    }

    let trackerSyncStatus = 'offline';

    function updateTrackerSyncBadge() {
        const badge = document.getElementById('trackerSyncBadge');
        if (!badge) return;
        if (trackerSyncStatus === 'online') {
            badge.style.background = 'rgba(16, 185, 129, 0.1)';
            badge.style.color = 'var(--success)';
            badge.innerText = 'Google Sheets Sync Active';
        } else {
            badge.style.background = 'rgba(245, 158, 11, 0.1)';
            badge.style.color = '#d97706';
            badge.innerText = 'Offline Backup Mode';
        }
    }

    async function fetchTrackedErrors() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            const response = await fetch('/api/tracker', { signal: controller.signal });
            clearTimeout(timeoutId);
            const result = await response.json();
            if (result && result.status === 'success') {
                trackerSyncStatus = 'online';
                updateTrackerSyncBadge();
                return result.errors || [];
            }
        } catch (e) {
            console.warn("Google Sheets Error Tracker connection failed, using local storage:", e);
        }

        trackerSyncStatus = 'offline';
        updateTrackerSyncBadge();

        let records = JSON.parse(localStorage.getItem('trackedErrors') || '[]');
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        records = records.filter(r => (now - new Date(r.createdDate).getTime()) < THIRTY_DAYS_MS);
        localStorage.setItem('trackedErrors', JSON.stringify(records));
        return records;
    }

    async function registerTrackedError(type, fileName, partyOrWh, errorType, rowsCount) {
        const newRecord = {
            id: 'err-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            type: type,
            fileName: fileName,
            partyOrWh: partyOrWh,
            errorType: errorType,
            rowsCount: rowsCount,
            createdDate: new Date().toISOString(),
            solved: false,
            solvedDate: ''
        };

        let records = JSON.parse(localStorage.getItem('trackedErrors') || '[]');
        records.push(newRecord);
        localStorage.setItem('trackedErrors', JSON.stringify(records));

        try {
            const response = await fetch('/api/tracker/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecord)
            });
            const result = await response.json();
            if (result && result.status === 'success') {
                trackerSyncStatus = 'online';
                updateTrackerSyncBadge();
            }
        } catch (e) {
            console.warn("Failed to write tracked error to Google Sheets:", e);
        }
    }

    async function solveTrackedError(id) {
        const solvedDate = new Date().toISOString();

        let records = JSON.parse(localStorage.getItem('trackedErrors') || '[]');
        const idx = records.findIndex(r => r.id === id);
        if (idx !== -1) {
            records[idx].solved = true;
            records[idx].solvedDate = solvedDate;
            localStorage.setItem('trackedErrors', JSON.stringify(records));
        }

        try {
            const response = await fetch('/api/tracker/solve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, solvedDate: solvedDate })
            });
            const result = await response.json();
            if (result && result.status === 'success') {
                trackerSyncStatus = 'online';
                updateTrackerSyncBadge();
            }
        } catch (e) {
            console.warn("Failed to solve tracked error on Google Sheets:", e);
        }
    }

    async function deleteTrackedError(id) {
        let records = JSON.parse(localStorage.getItem('trackedErrors') || '[]');
        records = records.filter(r => r.id !== id);
        localStorage.setItem('trackedErrors', JSON.stringify(records));

        try {
            const response = await fetch('/api/tracker/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            const result = await response.json();
            if (result && result.status === 'success') {
                trackerSyncStatus = 'online';
                updateTrackerSyncBadge();
            }
        } catch (e) {
            console.warn("Failed to delete tracked error from Google Sheets:", e);
        }
    }

    async function clearTrackedErrorsDb() {
        localStorage.removeItem('trackedErrors');
        try {
            const response = await fetch('/api/tracker/clear', {
                method: 'POST'
            });
            const result = await response.json();
            if (result && result.status === 'success') {
                trackerSyncStatus = 'online';
                updateTrackerSyncBadge();
            }
        } catch (e) {
            console.warn("Failed to clear tracked errors on Google Sheets:", e);
        }
    }

    async function renderErrorTracker() {
        const statsActive = document.getElementById('statsActiveErrors');
        const statsSolved = document.getElementById('statsSolvedErrors');
        const statsTotal = document.getElementById('statsTotalErrors');
        const container = document.getElementById('trackerTableContainer');
        const searchInput = document.getElementById('trackerSearchInput');
        const statusFilter = document.getElementById('trackerStatusFilter');
        const sourceFilter = document.getElementById('trackerSourceFilter');

        if (!container) return;

        container.innerHTML = `
            <div class="empty-output-state" style="text-align: center; padding: 40px 20px;">
                <i class="fa-solid fa-spinner fa-spin placeholder-icon" style="color: var(--primary); font-size: 2rem; margin-bottom: 15px; display: block;"></i>
                <p style="color: var(--text-secondary);">Loading tracked errors list from database...</p>
            </div>
        `;

        const errors = await fetchTrackedErrors();

        const activeCount = errors.filter(e => !e.solved).length;
        const solvedCount = errors.filter(e => e.solved).length;
        const totalCount = errors.length;

        if (statsActive) statsActive.innerText = activeCount;
        if (statsSolved) statsSolved.innerText = solvedCount;
        if (statsTotal) statsTotal.innerText = totalCount;

        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const statusVal = statusFilter ? statusFilter.value : 'all';
        const sourceVal = sourceFilter ? sourceFilter.value : 'all';

        const filtered = errors.filter(item => {
            const matchesQuery = !query ||
                String(item.fileName).toLowerCase().includes(query) ||
                String(item.partyOrWh).toLowerCase().includes(query) ||
                String(item.errorType).toLowerCase().includes(query);

            const matchesStatus = statusVal === 'all' ||
                (statusVal === 'active' && !item.solved) ||
                (statusVal === 'solved' && item.solved);

            const matchesSource = sourceVal === 'all' || item.type === sourceVal;

            return matchesQuery && matchesStatus && matchesSource;
        });

        filtered.sort((a, b) => {
            if (a.solved !== b.solved) {
                return a.solved ? 1 : -1;
            }
            return new Date(b.createdDate) - new Date(a.createdDate);
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-output-state" style="text-align: center; padding: 40px 20px;">
                    <i class="fa-solid fa-square-check placeholder-icon" style="color: var(--success); font-size: 2rem; margin-bottom: 15px; display: block; opacity: 0.8;"></i>
                    <p style="color: var(--text-secondary);">No tracked errors match your criteria.</p>
                </div>
            `;
            return;
        }

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '0.85rem';
        table.style.textAlign = 'left';

        table.innerHTML = `
            <thead>
                <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-primary);">
                    <th style="padding: 0.75rem; font-weight: 700; font-size: 0.75rem; text-transform: uppercase;">Source</th>
                    <th style="padding: 0.75rem; font-weight: 700; font-size: 0.75rem; text-transform: uppercase;">File / Error Details</th>
                    <th style="padding: 0.75rem; font-weight: 700; font-size: 0.75rem; text-transform: uppercase;">Party / Wh</th>
                    <th style="padding: 0.75rem; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; text-align: right;">Rows</th>
                    <th style="padding: 0.75rem; font-weight: 700; font-size: 0.75rem; text-transform: uppercase;">Date Added</th>
                    <th style="padding: 0.75rem; font-weight: 700; font-size: 0.75rem; text-transform: uppercase;">Days Active</th>
                    <th style="padding: 0.75rem; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; text-align: center;">Status</th>
                    <th style="padding: 0.75rem; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; text-align: center;">Action</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');

        filtered.forEach(record => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--border-color)';
            tr.style.transition = 'all 0.2s ease';

            tr.addEventListener('mouseenter', () => {
                tr.style.background = 'rgba(99, 102, 241, 0.02)';
            });
            tr.addEventListener('mouseleave', () => {
                tr.style.background = 'transparent';
            });

            const isFlipkart = record.type === 'flipkart';
            const sourceBadge = isFlipkart
                ? `<span style="background: rgba(37, 99, 235, 0.08); color: var(--primary); border: 1px solid rgba(37, 99, 235, 0.15); padding: 0.2rem 0.45rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">FLIPKART ERROR</span>`
                : `<span style="background: rgba(99, 102, 241, 0.08); color: #6366f1; border: 1px solid rgba(99, 102, 241, 0.15); padding: 0.2rem 0.45rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">INVOICE ERROR</span>`;

            const detailHtml = `
                <div style="font-weight: 600; color: var(--text-primary);">${record.fileName}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.1rem;">${record.errorType}</div>
            `;

            const createdTime = new Date(record.createdDate).getTime();
            const endTime = record.solved ? new Date(record.solvedDate).getTime() : Date.now();
            const diffDays = Math.max(0, Math.floor((endTime - createdTime) / (1000 * 60 * 60 * 24)));
            const daysText = record.solved
                ? `<span style="color: var(--text-secondary); font-size: 0.8rem;">Solved in ${diffDays} day${diffDays === 1 ? '' : 's'}</span>`
                : `<span style="color: var(--danger); font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 0.25rem;"><i class="fa-regular fa-clock"></i> ${diffDays} Day${diffDays === 1 ? '' : 's'}</span>`;

            const addedDateFormatted = new Date(record.createdDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

            const statusBadge = record.solved
                ? `<span style="background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); padding: 0.25rem 0.5rem; border-radius: 20px; font-weight: 600; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.3rem;"><i class="fa-solid fa-circle-check"></i> Solved</span>`
                : `<span style="background: rgba(220, 38, 38, 0.1); color: var(--danger); border: 1px solid rgba(220, 38, 38, 0.2); padding: 0.25rem 0.5rem; border-radius: 20px; font-weight: 600; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.3rem;"><i class="fa-solid fa-triangle-exclamation"></i> Active</span>`;

            const actionHtml = record.solved
                ? `<div style="display: flex; gap: 0.4rem; justify-content: center; align-items: center;">
                       <span style="font-size: 0.75rem; color: var(--text-secondary); font-style: italic; margin-right: 0.3rem;">Solved</span>
                       <button class="btn btn-danger delete-tracker-btn" data-id="${record.id}" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-top: 0; line-height: 1;"><i class="fa-solid fa-trash-can"></i></button>
                   </div>`
                : `<div style="display: flex; gap: 0.4rem; justify-content: center; align-items: center;">
                       <button class="btn btn-primary solve-tracker-btn" data-id="${record.id}" style="padding: 0.35rem 0.7rem; font-size: 0.75rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.3rem; background: var(--success); border-color: var(--success); color: white; cursor: pointer; font-weight: 600; margin-top: 0; line-height: 1;"><i class="fa-solid fa-check-double"></i> Solve</button>
                       <button class="btn btn-danger delete-tracker-btn" data-id="${record.id}" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-top: 0; line-height: 1;"><i class="fa-solid fa-trash-can"></i></button>
                   </div>`;

            tr.innerHTML = `
                <td style="padding: 0.75rem; vertical-align: middle;">${sourceBadge}</td>
                <td style="padding: 0.75rem; vertical-align: middle;">${detailHtml}</td>
                <td style="padding: 0.75rem; vertical-align: middle; font-weight: 500; color: var(--text-secondary);">${record.partyOrWh}</td>
                <td style="padding: 0.75rem; vertical-align: middle; text-align: right; font-weight: 600; color: var(--text-secondary);">${record.rowsCount}</td>
                <td style="padding: 0.75rem; vertical-align: middle; color: var(--text-secondary);">${addedDateFormatted}</td>
                <td style="padding: 0.75rem; vertical-align: middle;">${daysText}</td>
                <td style="padding: 0.75rem; vertical-align: middle; text-align: center;">${statusBadge}</td>
                <td style="padding: 0.75rem; vertical-align: middle; text-align: center;">${actionHtml}</td>
            `;

            const solveBtn = tr.querySelector('.solve-tracker-btn');
            if (solveBtn) {
                solveBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    solveBtn.disabled = true;
                    solveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                    await solveTrackedError(record.id);
                    renderErrorTracker();
                });
            }

            const deleteBtn = tr.querySelector('.delete-tracker-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showCustomConfirm(
                        "Delete Dispute Record",
                        `Are you sure you want to delete the tracked error for "${record.fileName}"? This action cannot be undone.`,
                        async (confirmed) => {
                            if (confirmed) {
                                deleteBtn.disabled = true;
                                deleteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                                await deleteTrackedError(record.id);
                                renderErrorTracker();
                            }
                        }
                    );
                });
            }

            tbody.appendChild(tr);
        });

        container.innerHTML = '';
        container.appendChild(table);
    }

    const trackerSearchInput = document.getElementById('trackerSearchInput');
    const trackerStatusFilter = document.getElementById('trackerStatusFilter');
    const trackerSourceFilter = document.getElementById('trackerSourceFilter');
    const clearTrackerDbBtn = document.getElementById('clearTrackerDbBtn');

    if (trackerSearchInput) {
        trackerSearchInput.addEventListener('input', () => renderErrorTracker());
    }
    if (trackerStatusFilter) {
        trackerStatusFilter.addEventListener('change', () => renderErrorTracker());
    }
    if (trackerSourceFilter) {
        trackerSourceFilter.addEventListener('change', () => renderErrorTracker());
    }
    if (clearTrackerDbBtn) {
        clearTrackerDbBtn.addEventListener('click', () => {
            showCustomConfirm(
                "Clear Tracker History",
                "Are you sure you want to delete all tracked error dispute history? This will wipe all records permanently.",
                async (confirmed) => {
                    if (confirmed) {
                        clearTrackerDbBtn.disabled = true;
                        clearTrackerDbBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Clearing...';
                        await clearTrackedErrorsDb();
                        clearTrackerDbBtn.disabled = false;
                        clearTrackerDbBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Clear History';
                        renderErrorTracker();
                    }
                }
            );
        });
    }

    // Expose functions globally for debugging/console testing
    window.errorTracker = {
        fetch: fetchTrackedErrors,
        register: registerTrackedError,
        solve: solveTrackedError,
        delete: deleteTrackedError,
        clear: clearTrackedErrorsDb,
        render: renderErrorTracker
    };

});
