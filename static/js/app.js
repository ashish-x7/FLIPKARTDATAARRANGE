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

    // TAB SYSTEM
    // ----------------------------------------------------
    const tabRenameBtn = document.getElementById('tabRenameBtn');
    const tabMergeBtn = document.getElementById('tabMergeBtn');
    const tabSplitBtn = document.getElementById('tabSplitBtn');
    const tabFolderBtn = document.getElementById('tabFolderBtn');
    const tabInvoiceBtn = document.getElementById('tabInvoiceBtn');
    const tabPartyBtn = document.getElementById('tabPartyBtn');
    const tabFlipkartErrorBtn = document.getElementById('tabFlipkartErrorBtn');
    const tabInvoiceErrorBtn = document.getElementById('tabInvoiceErrorBtn');
    const tabErrorTrackerBtn = document.getElementById('tabErrorTrackerBtn');
    const renameSection = document.getElementById('renameSection');
    const mergeSection = document.getElementById('mergeSection');
    const splitSection = document.getElementById('splitSection');
    const folderSection = document.getElementById('folderSection');
    const invoiceSection = document.getElementById('invoiceSection');
    const partySection = document.getElementById('partySection');
    const flipkartErrorSection = document.getElementById('flipkartErrorSection');
    const invoiceErrorSection = document.getElementById('invoiceErrorSection');
    const errorTrackerSection = document.getElementById('errorTrackerSection');

    // ====================================================
    // GLOBAL SHARED STATE FOR TAB 4: CREATE FOLDER
    // (Accessible across Tabs 1, 2, 3, and 4)
    // ====================================================
    let fcFiles = [];
    let selectedFolderFiles = fcFiles;
    let fcMode = 'files';
    let folderMode = 'files';
    let fcFolderGroups = [];
    let fcZipBlob = null;
    let fcZipFilename = 'Grouped_Folders.zip';
    let fcMissingReportBlob = null;
    let fcModalCurrentFilter = 'all';
    let fcCountdownInterval = null;

    // Legacy DOM element aliases for Tabs 1, 2, 3 compatibility
    const folderFileListContainer = document.getElementById('fcSelectedFilesCard');
    const folderDropzone = document.getElementById('fcDropzone');

    function updateFolderFilesListUI() {
        fcFiles = selectedFolderFiles;
        if (typeof updateFcUploadedFileListUI === 'function') {
            updateFcUploadedFileListUI();
        }
    }

    function setActiveTab(activeBtn, activeSec) {
        [tabRenameBtn, tabMergeBtn, tabSplitBtn, tabFolderBtn, tabInvoiceBtn, tabPartyBtn, tabFlipkartErrorBtn, tabInvoiceErrorBtn, tabErrorTrackerBtn].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        [renameSection, mergeSection, splitSection, folderSection, invoiceSection, partySection, flipkartErrorSection, invoiceErrorSection, errorTrackerSection].forEach(sec => {
            if (sec) sec.classList.remove('active');
        });
        if (activeBtn) activeBtn.classList.add('active');
        if (activeSec) activeSec.classList.add('active');
    }

    if (tabRenameBtn) tabRenameBtn.addEventListener('click', () => {
        setActiveTab(tabRenameBtn, renameSection);
        checkMappingStatus();
    });
    if (tabMergeBtn) tabMergeBtn.addEventListener('click', () => {
        setActiveTab(tabMergeBtn, mergeSection);
        if (typeof btnSubMergeGrouped !== 'undefined' && btnSubMergeGrouped) {
            btnSubMergeGrouped.click();
        }
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

    // Cache and preload Flipkart party list
    let flipkartPartyList = [];
    try {
        const cachedParties = localStorage.getItem('flipkart_parties_cache');
        if (cachedParties) {
            flipkartPartyList = JSON.parse(cachedParties);
            window.flipkartPartyList = flipkartPartyList;
        }
    } catch (e) {}
    // Fetch parties in background on load
    setTimeout(() => {
        if (typeof fetchPartiesList === 'function') {
            fetchPartiesList().catch(() => {});
        }
    }, 100);

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
    // ----------------------------------------------------
    // PERSISTENCE (1-HOUR EXPIRY) FOR CLEANED ORDERS
    // ----------------------------------------------------
    const DB_NAME = 'FlipkartDataArrangeDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'cleaned_session';
    const SESSION_KEY = 'latest_merge_session';
    const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour

    let cachedMergedBlob = null;
    let cachedSessionMetadata = null;

    function openIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) return reject(new Error('IndexedDB not available'));
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function saveCleanedSession(sessionData) {
        try {
            const meta = {
                timestamp: sessionData.timestamp,
                expiresAt: sessionData.expiresAt,
                total_orders: sessionData.total_orders,
                successMessage: sessionData.successMessage,
                columns: sessionData.columns,
                preview: sessionData.preview,
                files: sessionData.files
            };
            try { localStorage.setItem('flipkart_cleaned_session_meta', JSON.stringify(meta)); } catch(e){}

            const db = await openIndexedDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                sessionData.id = SESSION_KEY;
                const req = store.put(sessionData);
                req.onsuccess = () => resolve(true);
                req.onerror = () => reject(req.error);
            });
        } catch (err) {
            console.warn('saveCleanedSession warning:', err);
        }
    }

    async function getCleanedSession() {
        try {
            const db = await openIndexedDB();
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.get(SESSION_KEY);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
        } catch (err) {
            console.warn('getCleanedSession IndexedDB error, checking localStorage:', err);
            try {
                const raw = localStorage.getItem('flipkart_cleaned_session_meta');
                return raw ? JSON.parse(raw) : null;
            } catch(e) {
                return null;
            }
        }
    }

    async function clearCleanedSession() {
        cachedMergedBlob = null;
        cachedSessionMetadata = null;
        try { localStorage.removeItem('flipkart_cleaned_session_meta'); } catch(e){}
        try {
            const db = await openIndexedDB();
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.delete(SESSION_KEY);
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
            });
        } catch (err) {}
    }

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

    clearAllBtn.addEventListener('click', async () => {
        await clearCleanedSession();
        selectedFiles = [];
        updateFilesListUI();
        fileInput.value = '';
        if (resultCard) resultCard.style.display = 'none';
        const timerSpan = document.getElementById('sessionExpiryTimer');
        if (timerSpan) timerSpan.style.display = 'none';
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
            const msg = `Successfully merged ${selectedFiles.length} file(s). Total orders: ${data.total_orders}`;
            successMessage.textContent = msg;
            
            renderPreviewTable(data.columns, data.preview);
            
            resultCard.style.display = 'block';
            resultCard.scrollIntoView({ behavior: 'smooth' });

            // Fetch the generated merged file blob to store in 1-hour session
            try {
                const dlResp = await fetch('/api/download');
                if (dlResp.ok) {
                    cachedMergedBlob = await dlResp.blob();
                }
            } catch(e) {
                console.warn('Could not pre-fetch merged blob for caching:', e);
            }

            // Save session with 1 hour expiration
            const now = Date.now();
            const sessionData = {
                timestamp: now,
                expiresAt: now + ONE_HOUR_MS,
                total_orders: data.total_orders,
                successMessage: msg,
                columns: data.columns,
                preview: data.preview,
                files: selectedFiles.map(f => ({ name: f.name, size: f.size })),
                blob: cachedMergedBlob
            };
            await saveCleanedSession(sessionData);

            let timerSpan = document.getElementById('sessionExpiryTimer');
            if (!timerSpan && successMessage && successMessage.parentNode) {
                timerSpan = document.createElement('div');
                timerSpan.id = 'sessionExpiryTimer';
                timerSpan.style.cssText = "display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 6px; margin-top: 6px; font-weight: 500;";
                successMessage.parentNode.appendChild(timerSpan);
            }
            if (timerSpan) {
                timerSpan.innerHTML = `<i class="fa-regular fa-clock"></i> Active session saved: <b>60 min remaining</b> (Refresh won't remove this until Clear All is clicked)`;
                timerSpan.style.display = 'inline-flex';
            }

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

    // ----------------------------------------------------
    // RESTORE CLEANED SESSION (1-HOUR LIFETIME)
    // ----------------------------------------------------
    async function restoreCleanedSessionIfValid() {
        try {
            const session = await getCleanedSession();
            if (!session) return;

            const now = Date.now();
            if (!session.expiresAt || now > session.expiresAt) {
                console.log('[SESSION] Cleaned session expired (> 1 hour). Clearing...');
                await clearCleanedSession();
                return;
            }

            cachedSessionMetadata = session;
            if (session.blob) {
                cachedMergedBlob = session.blob;
            }

            const remainingMins = Math.max(1, Math.round((session.expiresAt - now) / 60000));
            console.log(`[SESSION] Restoring cleaned session. Remaining: ${remainingMins} min.`);

            // 1. Restore Success Banner
            if (successMessage) {
                successMessage.textContent = session.successMessage || `Successfully merged orders. Total orders: ${session.total_orders}`;
            }

            // 2. Add or update session timer indicator
            let timerSpan = document.getElementById('sessionExpiryTimer');
            if (!timerSpan && successMessage && successMessage.parentNode) {
                timerSpan = document.createElement('div');
                timerSpan.id = 'sessionExpiryTimer';
                timerSpan.style.cssText = "display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 6px; margin-top: 6px; font-weight: 500;";
                successMessage.parentNode.appendChild(timerSpan);
            }
            if (timerSpan) {
                timerSpan.innerHTML = `<i class="fa-regular fa-clock"></i> Active session saved: <b>${remainingMins} min remaining</b> (Refresh won't remove this until Clear All is clicked)`;
                timerSpan.style.display = 'inline-flex';
            }

            // 3. Restore Preview Table
            if (session.columns && session.preview) {
                renderPreviewTable(session.columns, session.preview);
            }

            // 4. Show Result Card
            if (resultCard) {
                resultCard.style.display = 'block';
            }

            // 5. Restore Selected Files List UI
            if (session.files && session.files.length > 0 && filesList && filesListContainer) {
                filesList.innerHTML = '';
                if (fileCountSpan) fileCountSpan.textContent = session.files.length;
                filesListContainer.style.display = 'block';

                session.files.forEach((file, index) => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <div class="file-info">
                            <i class="fa-regular fa-file-excel"></i>
                            <div>
                                <div class="file-name" title="${file.name}">
                                    ${file.name}
                                    <span class="file-tag tag-mapping" style="margin-left: 8px; font-size: 0.72rem; padding: 2px 7px;">Cleaned</span>
                                </div>
                                <span class="file-size">${formatBytes(file.size)}</span>
                            </div>
                        </div>
                        <button class="remove-file-btn" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>
                    `;
                    li.querySelector('.remove-file-btn').addEventListener('click', async () => {
                        await clearCleanedSession();
                        selectedFiles = [];
                        updateFilesListUI();
                        if (resultCard) resultCard.style.display = 'none';
                        if (timerSpan) timerSpan.style.display = 'none';
                    });
                    filesList.appendChild(li);
                });
            }

        } catch (err) {
            console.error('Error restoring cleaned session:', err);
        }
    }

    // Call restoration on page load
    restoreCleanedSessionIfValid();

    // Hook up downloadBtn to use cached blob if present
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            if (cachedMergedBlob) {
                e.preventDefault();
                const url = URL.createObjectURL(cachedMergedBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Flipkart_Merged_Orders.xlsx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
        });
    }


    // ====================================================
    
    // ====================================================
    // SUB-TABS FOR MERGE & CLEAN ORDERS
    // (Mode 1: Single Merge & Clean, Mode 2: Group Merge by Prefix)
    // ====================================================
    const btnSubMergeSingle = document.getElementById('btnSubMergeSingle');
    const btnSubMergeGrouped = document.getElementById('btnSubMergeGrouped');
    const subMergeSingleView = document.getElementById('subMergeSingleView');
    const subMergeGroupedView = document.getElementById('subMergeGroupedView');

    if (btnSubMergeSingle && btnSubMergeGrouped) {
        btnSubMergeSingle.addEventListener('click', () => {
            btnSubMergeSingle.classList.add('active');
            btnSubMergeGrouped.classList.remove('active');
            if (subMergeSingleView) subMergeSingleView.style.display = 'block';
            if (subMergeGroupedView) subMergeGroupedView.style.display = 'none';
        });

        btnSubMergeGrouped.addEventListener('click', () => {
            btnSubMergeGrouped.classList.add('active');
            btnSubMergeSingle.classList.remove('active');
            if (subMergeGroupedView) subMergeGroupedView.style.display = 'block';
            if (subMergeSingleView) subMergeSingleView.style.display = 'none';
        });
    }

    // ====================================================
    // GROUP MERGE BY PREFIX (-) LOGIC (MYNTRA STYLE)
    // ====================================================
    const gmrgDropzone = document.getElementById('gmrgDropzone');
    const gmrgFileInput = document.getElementById('gmrgFileInput');
    const gmrgFileLabel = document.getElementById('gmrgFileLabel');
    const btnResetGroupMerge = document.getElementById('btnResetGroupMerge');
    const btnGroupMergeRun = document.getElementById('btnGroupMergeRun');
    const gmrgProgress = document.getElementById('gmrgProgress');
    const gmrgProgressText = document.getElementById('gmrgProgressText');
    const gmrgProgressPercent = document.getElementById('gmrgProgressPercent');
    const gmrgProgressFill = document.getElementById('gmrgProgressFill');

    const gmrgGroupCount = document.getElementById('gmrgGroupCount');
    const gmrgHeaderActions = document.getElementById('gmrgHeaderActions');
    const gmrgEmptyState = document.getElementById('gmrgEmptyState');
    const gmrgTableContainer = document.getElementById('gmrgTableContainer');
    const gmrgPreviewTbody = document.getElementById('gmrgPreviewTbody');

    const btnGmrgFullview = document.getElementById('btnGmrgFullview');
    const btnGmrgMoveToFolder = document.getElementById('btnGmrgMoveToFolder');
    const btnGmrgDownloadZip = document.getElementById('btnGmrgDownloadZip');

    // Modals
    const editGroupKeyModal = document.getElementById('editGroupKeyModal');
    const editGroupKeyCurrent = document.getElementById('editGroupKeyCurrent');
    const editGroupKeyInput = document.getElementById('editGroupKeyInput');
    const btnCancelEditGroupKey = document.getElementById('btnCancelEditGroupKey');
    const btnSaveEditGroupKey = document.getElementById('btnSaveEditGroupKey');

    const gmrgFullViewModal = document.getElementById('gmrgFullViewModal');
    const gmrgFullViewCount = document.getElementById('gmrgFullViewCount');
    const btnCloseGmrgFullview = document.getElementById('btnCloseGmrgFullview');
    const gmrgFullViewSearch = document.getElementById('gmrgFullViewSearch');
    const tbodyGmrgFullView = document.getElementById('tbodyGmrgFullView');

    let gmrgUploadedFiles = [];
    let gmrgGroupsMap = new Map();
    let gmrgUniqueGroups = [];
    let gmrgNextId = 1;
    let gmrgSingleFileBlob = null;
    let gmrgSingleFileName = '';
    let gmrgGeneratedZipBlob = null;
    let gmrgGeneratedZipName = '';
    let gmrgActiveEditGroupKey = null;

    const groupColorPalette = [
        { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
        { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
        { bg: '#faf5ff', border: '#e9d5ff', text: '#7e22ce' },
        { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
        { bg: '#fdf2f8', border: '#fbcfe8', text: '#be185d' },
        { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
        { bg: '#fefce8', border: '#fef08a', text: '#a16207' }
    ];

    function resetGmrgButtonState() {
        gmrgGeneratedZipBlob = null;
        gmrgGeneratedZipName = '';
        gmrgSingleFileBlob = null;
        gmrgSingleFileName = '';
        if (btnGroupMergeRun) {
            btnGroupMergeRun.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Merge Files';
            btnGroupMergeRun.style.background = '';
            btnGroupMergeRun.style.borderColor = '';
            btnGroupMergeRun.disabled = false;
        }
        if (btnGmrgDownloadZip) {
            btnGmrgDownloadZip.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Download Merged';
            btnGmrgDownloadZip.disabled = false;
        }
    }

    function recalculateGmrgGroups() {
        gmrgGroupsMap = new Map();
        gmrgUniqueGroups = [];

        gmrgUploadedFiles.forEach(fileObj => {
            const key = fileObj.groupKey || 'Other';
            if (!gmrgGroupsMap.has(key)) {
                gmrgGroupsMap.set(key, []);
                gmrgUniqueGroups.push(key);
            }
            gmrgGroupsMap.get(key).push(fileObj);
        });

        gmrgUniqueGroups.sort();
    }

    async function extractSpreadsheetsFromZip(zipFile) {
        const results = [];
        try {
            const zip = await JSZip.loadAsync(zipFile);
            const entries = Object.keys(zip.files);
            for (const relPath of entries) {
                const entry = zip.files[relPath];
                if (entry.dir) continue;
                const fileName = relPath.split('/').pop();
                if (fileName.startsWith('.') || fileName.startsWith('~') || fileName === 'Thumbs.db') continue;
                const ext = fileName.split('.').pop().toLowerCase();
                if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
                    const blob = await entry.async('blob');
                    results.push({
                        name: fileName,
                        ext: ext,
                        blob: new File([blob], fileName, { type: blob.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                    });
                }
            }
        } catch (err) {
            console.error('Error reading ZIP file:', err);
        }
        return results;
    }

    async function handleGmrgFileSelection(files) {
        resetGmrgButtonState();
        if (!files || files.length === 0) return;

        if (gmrgProgress) gmrgProgress.style.display = 'block';
        const updateProgress = (percent, text) => {
            if (gmrgProgressPercent) gmrgProgressPercent.textContent = `${Math.round(percent)}%`;
            if (gmrgProgressFill) gmrgProgressFill.style.width = `${percent}%`;
            if (gmrgProgressText && text) gmrgProgressText.textContent = text;
        };

        updateProgress(5, 'Reading uploaded files...');

        try {
            const flatFilesList = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const ext = file.name.split('.').pop().toLowerCase();

                if (ext === 'zip') {
                    updateProgress(10, `Unpacking ZIP: ${file.name}...`);
                    const extracted = await extractSpreadsheetsFromZip(file);
                    flatFilesList.push(...extracted);
                } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
                    flatFilesList.push({
                        name: file.name,
                        ext: ext,
                        blob: file
                    });
                }
            }

            if (flatFilesList.length === 0) {
                if (gmrgProgress) gmrgProgress.style.display = 'none';
                showCustomAlert('Invalid Files', 'No valid Excel (.xlsx, .xls) or CSV files found in selection.', 'error');
                return;
            }

            for (let i = 0; i < flatFilesList.length; i++) {
                const fileData = flatFilesList[i];
                const pct = 10 + Math.round((i / flatFilesList.length) * 80);
                updateProgress(pct, `Parsing: ${fileData.name}...`);
                await new Promise(r => setTimeout(r, 10));

                const baseName = fileData.name.substring(0, fileData.name.lastIndexOf('.')) || fileData.name;
                const parts = baseName.split('-');
                const groupKey = parts.length > 1 ? parts[0].trim() : baseName.trim();

                const fileObj = {
                    id: gmrgNextId++,
                    name: fileData.name,
                    fileObj: fileData.blob,
                    ext: fileData.ext,
                    groupKey: groupKey,
                    aoa: []
                };

                fileObj.aoa = await readExcelAsAOA(fileData.blob);
                gmrgUploadedFiles.push(fileObj);
            }

            updateProgress(95, 'Grouping files by prefix...');
            await new Promise(r => setTimeout(r, 30));

            recalculateGmrgGroups();
            renderGmrgPreview();

            updateProgress(100, 'Files Loaded!');
            setTimeout(() => {
                if (gmrgProgress) {
                    gmrgProgress.style.display = 'none';
                    if (gmrgProgressPercent) gmrgProgressPercent.textContent = '0%';
                    if (gmrgProgressFill) gmrgProgressFill.style.width = '0%';
                    if (gmrgProgressText) gmrgProgressText.textContent = 'Merging file groups...';
                }
            }, 800);

            showCustomAlert('Files Loaded', `Successfully loaded ${gmrgUploadedFiles.length} files across ${gmrgUniqueGroups.length} prefix groups!`, 'success');

        } catch (err) {
            console.error('Error reading files:', err);
            if (gmrgProgress) gmrgProgress.style.display = 'none';
            showCustomAlert('Upload Error', 'Error reading files: ' + err.message, 'error');
        }
    }

    function renderGmrgPreview() {
        if (gmrgGroupCount) {
            gmrgGroupCount.textContent = `${gmrgUniqueGroups.length} groups detected (${gmrgUploadedFiles.length} files)`;
        }
        if (gmrgFileLabel) {
            gmrgFileLabel.textContent = gmrgUploadedFiles.length > 0 ? `${gmrgUploadedFiles.length} files loaded` : 'Drag & drop files here';
        }

        if (gmrgUniqueGroups.length === 0) {
            if (gmrgEmptyState) gmrgEmptyState.style.display = 'block';
            if (gmrgTableContainer) gmrgTableContainer.style.display = 'none';
            if (btnGroupMergeRun) btnGroupMergeRun.style.display = 'none';
            if (gmrgHeaderActions) gmrgHeaderActions.style.display = 'none';
            if (gmrgPreviewTbody) gmrgPreviewTbody.innerHTML = '';
            return;
        }

        if (gmrgEmptyState) gmrgEmptyState.style.display = 'none';
        if (gmrgTableContainer) gmrgTableContainer.style.display = 'block';
        if (btnGroupMergeRun) btnGroupMergeRun.style.display = 'flex';
        if (gmrgHeaderActions) gmrgHeaderActions.style.display = 'flex';

        if (!gmrgPreviewTbody) return;
        gmrgPreviewTbody.innerHTML = '';

        gmrgUniqueGroups.forEach((key, idx) => {
            const filesInGroup = gmrgGroupsMap.get(key) || [];
            const sourceNames = filesInGroup.map(f => f.name).join(', ');
            const outputFilename = `${key}-DropShipOrderReports-FLIPKART-${key}.xlsx`;
            const color = groupColorPalette[idx % groupColorPalette.length];

            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #f1f5f9';
            tr.style.background = idx % 2 === 0 ? '#ffffff' : '#fcfcfd';

            tr.innerHTML = `
                <td style="padding: 10px 12px; font-weight: 700; color: #64748b;">${idx + 1}</td>
                <td style="padding: 10px 12px;">
                    <span style="display: inline-block; padding: 3px 10px; border-radius: 999px; font-weight: 700; font-size: 0.8rem; background: ${color.bg}; border: 1px solid ${color.border}; color: ${color.text}; font-family: monospace;">
                        ${key}
                    </span>
                </td>
                <td style="padding: 10px 12px;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-weight: 700; color: #1e293b; font-size: 0.8rem;">
                            <i class="fa-solid fa-copy" style="color: #6366f1; margin-right: 4px;"></i> ${filesInGroup.length} Source Files
                        </span>
                        <span style="font-size: 0.74rem; color: #64748b; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${sourceNames}">
                            ${sourceNames}
                        </span>
                    </div>
                </td>
                <td style="padding: 10px 12px;">
                    <span style="color: #4f46e5; font-weight: 700; font-size: 0.82rem; font-family: monospace;">
                        <i class="fa-solid fa-file-excel" style="color: #10b981; margin-right: 4px;"></i> ${outputFilename}
                    </span>
                </td>
                <td style="padding: 10px 12px; text-align: center;">
                    <div style="display: inline-flex; gap: 6px;">
                        <button type="button" class="btn-inspect-gmrg" title="Inspect first 50 rows" style="width: 28px; height: 28px; border-radius: 7px; border: 1px solid #cbd5e1; background: #f8fafc; color: #4f46e5; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <i class="fa-solid fa-eye" style="font-size: 0.78rem;"></i>
                        </button>
                        <button type="button" class="btn-edit-gmrg-key" title="Edit Group Key" style="width: 28px; height: 28px; border-radius: 7px; border: 1px solid #a7f3d0; background: #ecfdf5; color: #059669; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <i class="fa-solid fa-pen" style="font-size: 0.78rem;"></i>
                        </button>
                        <button type="button" class="btn-del-gmrg-group" title="Delete Group" style="width: 28px; height: 28px; border-radius: 7px; border: 1px solid #fca5a5; background: #fee2e2; color: #dc2626; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <i class="fa-solid fa-trash-can" style="font-size: 0.78rem;"></i>
                        </button>
                    </div>
                </td>
            `;

            const btnInspect = tr.querySelector('.btn-inspect-gmrg');
            if (btnInspect) {
                btnInspect.addEventListener('click', () => {
                    if (filesInGroup.length > 0) inspectGmrgSpreadsheet(filesInGroup[0]);
                });
            }

            const btnEdit = tr.querySelector('.btn-edit-gmrg-key');
            if (btnEdit) {
                btnEdit.addEventListener('click', () => openEditGroupKeyModal(key));
            }

            const btnDel = tr.querySelector('.btn-del-gmrg-group');
            if (btnDel) {
                btnDel.addEventListener('click', () => {
                    showCustomConfirm(
                        'Delete Group',
                        `Are you sure you want to remove group "${key}" (${filesInGroup.length} files)?`,
                        (confirmed) => {
                            if (confirmed) removeGmrgGroup(key);
                        }
                    );
                });
            }

            gmrgPreviewTbody.appendChild(tr);
        });
    }

    function removeGmrgGroup(groupKey) {
        gmrgUploadedFiles = gmrgUploadedFiles.filter(f => f.groupKey !== groupKey);
        recalculateGmrgGroups();
        resetGmrgButtonState();
        renderGmrgPreview();
        if (gmrgFullViewModal && gmrgFullViewModal.style.display !== 'none') {
            renderGmrgFullViewRows();
        }
        showCustomAlert('Group Removed', `Group "${groupKey}" has been removed.`, 'info');
    }

    function inspectGmrgSpreadsheet(file) {
        if (!file) return;
        const rows = file.aoa || [];
        if (rows.length === 0) {
            showCustomAlert('Notice', 'No data rows found in this file.', 'warning');
            return;
        }

        if (excelPreviewModalTitle) excelPreviewModalTitle.textContent = file.name;
        if (excelPreviewSheetName) excelPreviewSheetName.textContent = `Group: ${file.groupKey} • Displaying first ${Math.min(50, rows.length)} rows`;

        if (excelPreviewThead) excelPreviewThead.innerHTML = '';
        if (excelPreviewTbody) excelPreviewTbody.innerHTML = '';

        if (rows.length > 0) {
            const headerRow = rows[0];
            const trHead = document.createElement('tr');
            headerRow.forEach((col, cIdx) => {
                const th = document.createElement('th');
                th.textContent = col !== undefined && col !== null ? String(col) : `Col ${cIdx + 1}`;
                trHead.appendChild(th);
            });
            if (excelPreviewThead) excelPreviewThead.appendChild(trHead);

            for (let r = 1; r < Math.min(51, rows.length); r++) {
                const tr = document.createElement('tr');
                const row = rows[r];
                for (let c = 0; c < headerRow.length; c++) {
                    const td = document.createElement('td');
                    const val = row[c];
                    td.textContent = val !== undefined && val !== null ? String(val) : '';
                    td.title = td.textContent;
                    tr.appendChild(td);
                }
                if (excelPreviewTbody) excelPreviewTbody.appendChild(tr);
            }
        }

        if (renameExcelPreviewModal) renameExcelPreviewModal.style.display = 'flex';
    }

    function openEditGroupKeyModal(groupKey) {
        gmrgActiveEditGroupKey = groupKey;
        if (editGroupKeyCurrent) editGroupKeyCurrent.textContent = groupKey;
        if (editGroupKeyInput) {
            editGroupKeyInput.value = groupKey;
            setTimeout(() => editGroupKeyInput.focus(), 100);
        }
        if (editGroupKeyModal) editGroupKeyModal.style.display = 'flex';
    }

    function closeEditGroupKeyModal() {
        if (editGroupKeyModal) editGroupKeyModal.style.display = 'none';
        gmrgActiveEditGroupKey = null;
    }

    function saveEditGroupKey() {
        if (!gmrgActiveEditGroupKey) return;
        const newKey = editGroupKeyInput ? editGroupKeyInput.value.trim() : '';
        if (!newKey) {
            showCustomAlert('Error', 'Please enter a valid group key.', 'error');
            return;
        }

        const oldKey = gmrgActiveEditGroupKey;
        gmrgUploadedFiles.forEach(file => {
            if (file.groupKey === oldKey) {
                file.groupKey = newKey;
                const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                const ext = file.ext ? `.${file.ext}` : '';
                const parts = baseName.split('-');
                if (parts.length > 1) {
                    parts[0] = newKey;
                    file.name = parts.join('-') + ext;
                }
            }
        });

        recalculateGmrgGroups();
        resetGmrgButtonState();
        renderGmrgPreview();
        if (gmrgFullViewModal && gmrgFullViewModal.style.display !== 'none') {
            renderGmrgFullViewRows();
        }
        closeEditGroupKeyModal();
        showCustomAlert('Group Key Updated', `Group renamed from "${oldKey}" to "${newKey}"!`, 'success');
    }

    if (btnCancelEditGroupKey) btnCancelEditGroupKey.addEventListener('click', closeEditGroupKeyModal);
    if (btnSaveEditGroupKey) btnSaveEditGroupKey.addEventListener('click', saveEditGroupKey);
    if (editGroupKeyInput) {
        editGroupKeyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEditGroupKey();
            }
        });
    }

    // Full View Modal for Grouped Merge
    function openGmrgFullViewModal() {
        if (!gmrgFullViewModal) return;
        if (gmrgFullViewSearch) gmrgFullViewSearch.value = '';
        renderGmrgFullViewRows();
        gmrgFullViewModal.style.display = 'flex';
    }

    function closeGmrgFullViewModal() {
        if (gmrgFullViewModal) gmrgFullViewModal.style.display = 'none';
    }

    function renderGmrgFullViewRows() {
        if (!tbodyGmrgFullView) return;
        tbodyGmrgFullView.innerHTML = '';

        const query = gmrgFullViewSearch ? gmrgFullViewSearch.value.trim().toLowerCase() : '';
        let groups = [...gmrgUniqueGroups];

        if (query) {
            groups = groups.filter(key => {
                if (key.toLowerCase().includes(query)) return true;
                const files = gmrgGroupsMap.get(key) || [];
                return files.some(f => f.name.toLowerCase().includes(query));
            });
        }

        if (gmrgFullViewCount) {
            gmrgFullViewCount.textContent = `${groups.length} groups (${gmrgUploadedFiles.length} files)`;
        }

        if (groups.length === 0) {
            tbodyGmrgFullView.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 30px;">No matching groups found.</td></tr>';
            return;
        }

        groups.forEach((key, idx) => {
            const filesInGroup = gmrgGroupsMap.get(key) || [];
            const sourceNames = filesInGroup.map(f => f.name).join(', ');
            const outputFilename = `${key}-DropShipOrderReports-FLIPKART-${key}.xlsx`;
            const color = groupColorPalette[idx % groupColorPalette.length];

            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #f1f5f9';
            tr.style.background = idx % 2 === 0 ? '#ffffff' : '#fcfcfd';

            tr.innerHTML = `
                <td style="padding: 10px 12px; font-weight: 700; color: #64748b;">${idx + 1}</td>
                <td style="padding: 10px 12px;">
                    <span style="display: inline-block; padding: 3px 10px; border-radius: 999px; font-weight: 700; font-size: 0.8rem; background: ${color.bg}; border: 1px solid ${color.border}; color: ${color.text}; font-family: monospace;">
                        ${key}
                    </span>
                </td>
                <td style="padding: 10px 12px;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-weight: 700; color: #1e293b; font-size: 0.8rem;">
                            <i class="fa-solid fa-copy" style="color: #6366f1; margin-right: 4px;"></i> ${filesInGroup.length} Source Files
                        </span>
                        <span style="font-size: 0.74rem; color: #64748b; max-width: 420px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${sourceNames}">
                            ${sourceNames}
                        </span>
                    </div>
                </td>
                <td style="padding: 10px 12px;">
                    <span style="color: #4f46e5; font-weight: 700; font-size: 0.82rem; font-family: monospace;">
                        <i class="fa-solid fa-file-excel" style="color: #10b981; margin-right: 4px;"></i> ${outputFilename}
                    </span>
                </td>
                <td style="padding: 10px 12px; text-align: center;">
                    <div style="display: inline-flex; gap: 6px;">
                        <button type="button" class="btn-inspect-gmrg-fv" title="Inspect first 50 rows" style="width: 28px; height: 28px; border-radius: 7px; border: 1px solid #cbd5e1; background: #f8fafc; color: #4f46e5; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <i class="fa-solid fa-eye" style="font-size: 0.78rem;"></i>
                        </button>
                        <button type="button" class="btn-edit-gmrg-key-fv" title="Edit Group Key" style="width: 28px; height: 28px; border-radius: 7px; border: 1px solid #a7f3d0; background: #ecfdf5; color: #059669; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <i class="fa-solid fa-pen" style="font-size: 0.78rem;"></i>
                        </button>
                        <button type="button" class="btn-del-gmrg-group-fv" title="Delete Group" style="width: 28px; height: 28px; border-radius: 7px; border: 1px solid #fca5a5; background: #fee2e2; color: #dc2626; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <i class="fa-solid fa-trash-can" style="font-size: 0.78rem;"></i>
                        </button>
                    </div>
                </td>
            `;

            const btnInspect = tr.querySelector('.btn-inspect-gmrg-fv');
            if (btnInspect) {
                btnInspect.addEventListener('click', () => {
                    if (filesInGroup.length > 0) inspectGmrgSpreadsheet(filesInGroup[0]);
                });
            }

            const btnEdit = tr.querySelector('.btn-edit-gmrg-key-fv');
            if (btnEdit) {
                btnEdit.addEventListener('click', () => openEditGroupKeyModal(key));
            }

            const btnDel = tr.querySelector('.btn-del-gmrg-group-fv');
            if (btnDel) {
                btnDel.addEventListener('click', () => {
                    showCustomConfirm(
                        'Delete Group',
                        `Are you sure you want to remove group "${key}" (${filesInGroup.length} files)?`,
                        (confirmed) => {
                            if (confirmed) removeGmrgGroup(key);
                        }
                    );
                });
            }

            tbodyGmrgFullView.appendChild(tr);
        });
    }

    if (btnGmrgFullview) btnGmrgFullview.addEventListener('click', openGmrgFullViewModal);
    if (btnCloseGmrgFullview) btnCloseGmrgFullview.addEventListener('click', closeGmrgFullViewModal);
    if (gmrgFullViewSearch) gmrgFullViewSearch.addEventListener('input', renderGmrgFullViewRows);

    // Merge Process & Download Execution
    async function runGroupMergeProcess() {
        if (gmrgUniqueGroups.length === 0) return;

        // If files already generated, download directly
        if (gmrgSingleFileBlob) {
            const url = URL.createObjectURL(gmrgSingleFileBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = gmrgSingleFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            showCustomAlert('Download Complete', `${gmrgSingleFileName} downloaded successfully!`, 'success');
            return;
        } else if (gmrgGeneratedZipBlob) {
            const url = URL.createObjectURL(gmrgGeneratedZipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = gmrgGeneratedZipName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            showCustomAlert('Download Complete', `${gmrgGeneratedZipName} downloaded successfully!`, 'success');
            return;
        }

        if (btnGroupMergeRun) btnGroupMergeRun.disabled = true;
        if (gmrgProgress) gmrgProgress.style.display = 'block';

        const updateProgress = (percent, text) => {
            if (gmrgProgressPercent) gmrgProgressPercent.textContent = `${Math.round(percent)}%`;
            if (gmrgProgressFill) gmrgProgressFill.style.width = `${percent}%`;
            if (gmrgProgressText && text) gmrgProgressText.textContent = text;
        };

        updateProgress(10, 'Merging file groups...');
        await new Promise(r => setTimeout(r, 40));

        try {
            const zip = new JSZip();

            for (let i = 0; i < gmrgUniqueGroups.length; i++) {
                const key = gmrgUniqueGroups[i];
                const filesInGroup = gmrgGroupsMap.get(key) || [];

                const progressPct = 10 + Math.round((i / gmrgUniqueGroups.length) * 80);
                updateProgress(progressPct, `Merging group: ${key} (${i + 1}/${gmrgUniqueGroups.length})...`);
                await new Promise(r => setTimeout(r, 20));

                const mergedRows = [];
                let headerWritten = false;

                for (let fIdx = 0; fIdx < filesInGroup.length; fIdx++) {
                    const file = filesInGroup[fIdx];
                    let aoa = file.aoa;
                    if (!aoa || aoa.length === 0) {
                        aoa = await readExcelAsAOA(file.fileObj);
                    }
                    if (!aoa || aoa.length === 0) continue;

                    if (!headerWritten) {
                        for (let r = 0; r < aoa.length; r++) {
                            mergedRows.push([...aoa[r]]);
                        }
                        headerWritten = true;
                    } else {
                        if (aoa.length > 1) {
                            for (let r = 1; r < aoa.length; r++) {
                                mergedRows.push([...aoa[r]]);
                            }
                        }
                    }
                }

                const ws = XLSX.utils.aoa_to_sheet(mergedRows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

                const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                const fileBlob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const outputName = `${key}-DropShipOrderReports-FLIPKART-${key}.xlsx`;

                if (gmrgUniqueGroups.length === 1) {
                    gmrgSingleFileBlob = fileBlob;
                    gmrgSingleFileName = outputName;
                } else {
                    zip.file(outputName, fileBlob);
                }
            }

            updateProgress(95, 'Generating output package...');
            await new Promise(r => setTimeout(r, 40));

            const isSingle = (gmrgUniqueGroups.length === 1);
            if (!isSingle) {
                gmrgGeneratedZipBlob = await zip.generateAsync({ type: 'blob' });
                gmrgGeneratedZipName = 'flipkart_grouped_merged.zip';
            }

            updateProgress(100, 'Merging complete!');

            setTimeout(() => {
                if (gmrgProgress) {
                    gmrgProgress.style.display = 'none';
                    if (gmrgProgressPercent) gmrgProgressPercent.textContent = '0%';
                    if (gmrgProgressFill) gmrgProgressFill.style.width = '0%';
                }

                if (btnGroupMergeRun) {
                    btnGroupMergeRun.disabled = false;
                    btnGroupMergeRun.innerHTML = isSingle ? '<i class="fa-solid fa-file-arrow-down"></i> Download Merged Excel' : '<i class="fa-solid fa-file-zipper"></i> Download Merged ZIP';
                    btnGroupMergeRun.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    btnGroupMergeRun.style.borderColor = '#059669';
                }

                if (btnGmrgDownloadZip) {
                    btnGmrgDownloadZip.innerHTML = isSingle ? '<i class="fa-solid fa-file-arrow-down"></i> Download Merged' : '<i class="fa-solid fa-file-zipper"></i> Download ZIP';
                }
            }, 800);

            // Automatically trigger download on complete
            if (isSingle && gmrgSingleFileBlob) {
                const url = URL.createObjectURL(gmrgSingleFileBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = gmrgSingleFileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } else if (gmrgGeneratedZipBlob) {
                const url = URL.createObjectURL(gmrgGeneratedZipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = gmrgGeneratedZipName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }

            showCustomAlert('Merge Complete', `All ${gmrgUniqueGroups.length} groups merged successfully!`, 'success');

        } catch (err) {
            console.error('Error during group merge:', err);
            if (gmrgProgress) gmrgProgress.style.display = 'none';
            if (btnGroupMergeRun) btnGroupMergeRun.disabled = false;
            showCustomAlert('Merge Failed', 'Error merging files: ' + err.message, 'error');
        }
    }

    if (btnGroupMergeRun) btnGroupMergeRun.addEventListener('click', runGroupMergeProcess);
    if (btnGmrgDownloadZip) btnGmrgDownloadZip.addEventListener('click', runGroupMergeProcess);

    // Transfer Group Merged Files directly to Tab 4: Create Folder
    async function moveToFolderCreateFromGroupMerge() {
        if (gmrgUniqueGroups.length === 0) {
            showCustomAlert('Notice', 'No groups available to move.', 'warning');
            return;
        }

        if (gmrgProgress) gmrgProgress.style.display = 'block';
        const updateProgress = (pct, txt) => {
            if (gmrgProgressPercent) gmrgProgressPercent.textContent = `${Math.round(pct)}%`;
            if (gmrgProgressFill) gmrgProgressFill.style.width = `${pct}%`;
            if (gmrgProgressText && txt) gmrgProgressText.textContent = txt;
        };

        updateProgress(15, 'Preparing merged Excel files for Create Folder...');
        await new Promise(r => setTimeout(r, 40));

        try {
            const mergedFilesForFolder = [];

            for (let i = 0; i < gmrgUniqueGroups.length; i++) {
                const key = gmrgUniqueGroups[i];
                const filesInGroup = gmrgGroupsMap.get(key) || [];

                const progressPct = 15 + Math.round((i / gmrgUniqueGroups.length) * 75);
                updateProgress(progressPct, `Processing group: ${key}...`);
                await new Promise(r => setTimeout(r, 10));

                const mergedRows = [];
                let headerWritten = false;

                for (let fIdx = 0; fIdx < filesInGroup.length; fIdx++) {
                    const file = filesInGroup[fIdx];
                    let aoa = file.aoa;
                    if (!aoa || aoa.length === 0) {
                        aoa = await readExcelAsAOA(file.fileObj);
                    }
                    if (!aoa || aoa.length === 0) continue;

                    if (!headerWritten) {
                        for (let r = 0; r < aoa.length; r++) {
                            mergedRows.push([...aoa[r]]);
                        }
                        headerWritten = true;
                    } else {
                        if (aoa.length > 1) {
                            for (let r = 1; r < aoa.length; r++) {
                                mergedRows.push([...aoa[r]]);
                            }
                        }
                    }
                }

                const ws = XLSX.utils.aoa_to_sheet(mergedRows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

                const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                const outputName = `${key}-DropShipOrderReports-FLIPKART-${key}.xlsx`;
                const fileObj = new File([arrayBuffer], outputName, {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    lastModified: Date.now()
                });
                fileObj.customRelativePath = outputName;
                fileObj.id = 'fc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

                mergedFilesForFolder.push(fileObj);
            }

            updateProgress(100, 'Done!');
            setTimeout(() => {
                if (gmrgProgress) gmrgProgress.style.display = 'none';
            }, 800);

            // Switch Create Folder mode to 'files' if needed
            const modeFilesBtn = document.getElementById('fcModeFilesBtn') || document.getElementById('folderModeFilesBtn');
            if (folderMode !== 'files' && modeFilesBtn) {
                modeFilesBtn.click();
            }

            // Transfer files to Create Folder
            mergedFilesForFolder.forEach(mf => {
                const exists = selectedFolderFiles.some(f => f.name === mf.name && f.size === mf.size);
                if (!exists) {
                    selectedFolderFiles.unshift(mf);
                }
            });
            fcFiles = selectedFolderFiles;

            updateFolderFilesListUI();

            if (tabFolderBtn) {
                tabFolderBtn.click();
            }

            showCustomAlert('Moved to Create Folder', `${mergedFilesForFolder.length} grouped merged files transferred to Create Folder tab!`, 'success');

        } catch (err) {
            console.error('Error moving to Create Folder:', err);
            if (gmrgProgress) gmrgProgress.style.display = 'none';
            showCustomAlert('Error', 'Failed to move files to Create Folder: ' + err.message, 'error');
        }
    }

    if (btnGmrgMoveToFolder) btnGmrgMoveToFolder.addEventListener('click', moveToFolderCreateFromGroupMerge);

    // Reset Group Merge
    function resetGroupMerge() {
        gmrgUploadedFiles = [];
        gmrgGroupsMap.clear();
        gmrgUniqueGroups = [];
        gmrgNextId = 1;
        resetGmrgButtonState();
        if (gmrgFileInput) gmrgFileInput.value = '';
        renderGmrgPreview();
        showCustomAlert('Reset Complete', 'Group Merge queue has been cleared.', 'info');
    }

    if (btnResetGroupMerge) btnResetGroupMerge.addEventListener('click', resetGroupMerge);

    // Dropzone Events for Group Merge
    if (gmrgDropzone && gmrgFileInput) {
        gmrgDropzone.addEventListener('click', () => gmrgFileInput.click());
        gmrgFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleGmrgFileSelection(e.target.files);
            }
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            gmrgDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                gmrgDropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            gmrgDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                gmrgDropzone.classList.remove('dragover');
            });
        });

        gmrgDropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleGmrgFileSelection(e.dataTransfer.files);
            }
        });
    }

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

    // New Tab 2 Controls & Modals
    const renameFullViewBtn = document.getElementById('renameFullViewBtn');
    const renameMoveToFolderBtn = document.getElementById('renameMoveToFolderBtn');
    const renameSessionExpiryTimer = document.getElementById('renameSessionExpiryTimer');

    const renameFullViewModal = document.getElementById('renameFullViewModal');
    const fullViewCountBadge = document.getElementById('fullViewCountBadge');
    const fullViewDownloadBtn = document.getElementById('fullViewDownloadBtn');
    const fullViewMoveToFolderBtn = document.getElementById('fullViewMoveToFolderBtn');
    const renameFullViewCloseBtn = document.getElementById('renameFullViewCloseBtn');
    const fullViewSearchInput = document.getElementById('fullViewSearchInput');
    const fullViewTableBody = document.getElementById('fullViewTableBody');

    const renameExcelPreviewModal = document.getElementById('renameExcelPreviewModal');
    const excelPreviewModalTitle = document.getElementById('excelPreviewModalTitle');
    const excelPreviewSheetName = document.getElementById('excelPreviewSheetName');
    const excelPreviewCloseBtn = document.getElementById('excelPreviewCloseBtn');
    const excelPreviewThead = document.getElementById('excelPreviewThead');
    const excelPreviewTbody = document.getElementById('excelPreviewTbody');

    const renameEditFilenameModal = document.getElementById('renameEditFilenameModal');
    const editFilenameInput = document.getElementById('editFilenameInput');
    const editFilenameExtBadge = document.getElementById('editFilenameExtBadge');
    const editFilenameError = document.getElementById('editFilenameError');
    const editFilenameCancelBtn = document.getElementById('editFilenameCancelBtn');
    const editFilenameSaveBtn = document.getElementById('editFilenameSaveBtn');

    // Indicator hooks
    const statusIndicatorLight = document.getElementById('statusIndicatorLight');
    const mappingStatusTitle = document.getElementById('mappingStatusTitle');
    const mappingStatusDesc = document.getElementById('mappingStatusDesc');

    let selectedRenameFiles = [];
    let isMappingActive = false;
    let renameResultType = 'zip'; // 'zip' or 'single'
    let renameResultFilename = 'Renamed_Files.zip';

    let currentRenameZipBlob = null;
    let currentRenameZipInstance = null;
    let currentRenameLogs = [];
    let editingLogIndex = -1;
    let editingOriginalFilename = '';

    // Persistence functions for Rename Tab
    async function saveRenameSession(sessionData) {
        try {
            const meta = {
                timestamp: sessionData.timestamp,
                expiresAt: sessionData.expiresAt,
                filename: sessionData.filename,
                type: sessionData.type,
                log: sessionData.log,
                uploadedFiles: sessionData.uploadedFiles
            };
            try { localStorage.setItem('flipkart_rename_session_meta', JSON.stringify(meta)); } catch(e){}

            const db = await openIndexedDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                sessionData.id = 'latest_rename_session';
                const req = store.put(sessionData);
                req.onsuccess = () => resolve(true);
                req.onerror = () => reject(req.error);
            });
        } catch (err) {
            console.warn('saveRenameSession warning:', err);
        }
    }

    async function getRenameSession() {
        try {
            const db = await openIndexedDB();
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.get('latest_rename_session');
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
        } catch (err) {
            console.warn('getRenameSession IndexedDB error, checking localStorage:', err);
            try {
                const raw = localStorage.getItem('flipkart_rename_session_meta');
                return raw ? JSON.parse(raw) : null;
            } catch(e) {
                return null;
            }
        }
    }

    async function clearRenameSession() {
        currentRenameZipBlob = null;
        currentRenameZipInstance = null;
        currentRenameLogs = [];
        try { localStorage.removeItem('flipkart_rename_session_meta'); } catch(e){}
        try {
            const db = await openIndexedDB();
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.delete('latest_rename_session');
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
            });
        } catch (err) {}
    }

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

    renameClearAllBtn.addEventListener('click', async () => {
        await clearRenameSession();
        selectedRenameFiles = [];
        updateRenameFilesListUI();
        renameFileInput.value = '';
        if (renameResultCard) renameResultCard.style.display = 'none';
        if (renameSessionExpiryTimer) renameSessionExpiryTimer.style.display = 'none';
        if (renameFullViewModal) renameFullViewModal.style.display = 'none';
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
            currentRenameLogs = data.log || [];
            
            // Success message
            renameSuccessMessage.textContent = `Renaming completed! Processed ${currentRenameLogs.length} file(s).`;
            
            // Set button appearance based on file type
            if (renameResultType === 'zip') {
                renameDownloadBtn.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Download Renamed Files (ZIP)';
                renameInfoNote.innerHTML = '<i class="fa-solid fa-circle-info"></i> Files have been renamed. Download the ZIP folder containing all renamed files.';
            } else {
                renameDownloadBtn.innerHTML = '<i class="fa-solid fa-file-arrow-down"></i> Download Renamed File';
                renameInfoNote.innerHTML = `<i class="fa-solid fa-circle-info"></i> File successfully renamed to: <b>${data.filename}</b>`;
            }

            // Populate Log Table
            renderRenameLogTable(currentRenameLogs);

            // Fetch and cache the renamed package blob for 1-hour session and in-browser operations
            try {
                const dlResp = await fetch(`/api/download-renamed?type=${data.type}&filename=${encodeURIComponent(data.filename)}`);
                if (dlResp.ok) {
                    currentRenameZipBlob = await dlResp.blob();
                    if (data.type === 'single') {
                        currentRenameZipInstance = new JSZip();
                        currentRenameZipInstance.file(data.filename, currentRenameZipBlob);
                    } else {
                        currentRenameZipInstance = await JSZip.loadAsync(currentRenameZipBlob);
                    }
                }
            } catch(e) {
                console.warn('Could not cache rename zip blob:', e);
            }

            // Save session with 1 hour expiration
            const now = Date.now();
            const sessionData = {
                timestamp: now,
                expiresAt: now + ONE_HOUR_MS,
                filename: renameResultFilename,
                type: renameResultType,
                log: currentRenameLogs,
                uploadedFiles: selectedRenameFiles.map(f => ({ name: f.name, size: f.size })),
                blob: currentRenameZipBlob
            };
            await saveRenameSession(sessionData);

            if (renameSessionExpiryTimer) {
                renameSessionExpiryTimer.innerHTML = `<i class="fa-regular fa-clock"></i> Active session saved: <b>60 min remaining</b> (Refresh won't remove this until Clear All is clicked)`;
                renameSessionExpiryTimer.style.display = 'inline-flex';
            }

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

    // ----------------------------------------------------
    // RESTORE RENAMED SESSION (1-HOUR LIFETIME)
    // ----------------------------------------------------
    async function restoreRenameSessionIfValid() {
        try {
            const session = await getRenameSession();
            if (!session) return;

            const now = Date.now();
            if (!session.expiresAt || now > session.expiresAt) {
                console.log('[SESSION] Renamed session expired (> 1 hour). Clearing...');
                await clearRenameSession();
                return;
            }

            currentRenameLogs = session.log || [];
            renameResultType = session.type || 'zip';
            renameResultFilename = session.filename || 'Renamed_Files.zip';

            if (session.blob) {
                currentRenameZipBlob = session.blob;
                try {
                    if (renameResultType === 'single') {
                        currentRenameZipInstance = new JSZip();
                        currentRenameZipInstance.file(renameResultFilename, currentRenameZipBlob);
                    } else {
                        currentRenameZipInstance = await JSZip.loadAsync(currentRenameZipBlob);
                    }
                } catch(e) {
                    console.warn('Error loading restored rename zip:', e);
                }
            }

            const remainingMins = Math.max(1, Math.round((session.expiresAt - now) / 60000));
            console.log(`[SESSION] Restoring rename session. Remaining: ${remainingMins} min.`);

            // 1. Success Message
            if (renameSuccessMessage) {
                renameSuccessMessage.textContent = `Renaming completed! Processed ${currentRenameLogs.length} file(s).`;
            }

            // 2. Timer badge
            if (renameSessionExpiryTimer) {
                renameSessionExpiryTimer.innerHTML = `<i class="fa-regular fa-clock"></i> Active session saved: <b>${remainingMins} min remaining</b> (Refresh won't remove this until Clear All is clicked)`;
                renameSessionExpiryTimer.style.display = 'inline-flex';
            }

            // 3. Download button label
            if (renameResultType === 'zip') {
                renameDownloadBtn.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Download Renamed Files (ZIP)';
                renameInfoNote.innerHTML = '<i class="fa-solid fa-circle-info"></i> Files have been renamed. Download the ZIP folder containing all renamed files.';
            } else {
                renameDownloadBtn.innerHTML = '<i class="fa-solid fa-file-arrow-down"></i> Download Renamed File';
                renameInfoNote.innerHTML = `<i class="fa-solid fa-circle-info"></i> File successfully renamed to: <b>${renameResultFilename}</b>`;
            }

            // 4. Log Table
            renderRenameLogTable(currentRenameLogs);

            // 5. Result Card
            if (renameResultCard) {
                renameResultCard.style.display = 'block';
            }

            // 6. Selected Files List UI
            if (session.uploadedFiles && session.uploadedFiles.length > 0 && renameFilesList && renameFilesListContainer) {
                renameFilesList.innerHTML = '';
                if (renameFileCountSpan) renameFileCountSpan.textContent = session.uploadedFiles.length;
                renameFilesListContainer.style.display = 'block';

                session.uploadedFiles.forEach((file, index) => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <div class="file-info">
                            <i class="fa-regular fa-file-excel"></i>
                            <div>
                                <div class="file-name" title="${file.name}">
                                    ${file.name}
                                    <span class="file-tag tag-rename" style="margin-left: 8px; font-size: 0.72rem; padding: 2px 7px;">Renamed</span>
                                </div>
                                <span class="file-size">${formatBytes(file.size)}</span>
                            </div>
                        </div>
                        <button class="remove-file-btn" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>
                    `;
                    li.querySelector('.remove-file-btn').addEventListener('click', async () => {
                        await clearRenameSession();
                        selectedRenameFiles = [];
                        updateRenameFilesListUI();
                        if (renameResultCard) renameResultCard.style.display = 'none';
                        if (renameSessionExpiryTimer) renameSessionExpiryTimer.style.display = 'none';
                    });
                    renameFilesList.appendChild(li);
                });
            }

        } catch (err) {
            console.error('Error restoring rename session:', err);
        }
    }

    // Call restoration on load
    restoreRenameSessionIfValid();

    // ----------------------------------------------------
    // FULL VIEW MODAL & ACTIONS (VIEW 50 ROWS, EDIT, DELETE)
    // ----------------------------------------------------
    function renderFullViewTable(filterText = '') {
        if (!fullViewTableBody) return;
        fullViewTableBody.innerHTML = '';

        if (!currentRenameLogs || currentRenameLogs.length === 0) {
            fullViewTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px; color: #94a3b8;">No renamed files available.</td></tr>';
            if (fullViewCountBadge) fullViewCountBadge.textContent = '0 Files';
            return;
        }

        const lowerFilter = filterText.toLowerCase().trim();
        let matchCount = 0;

        currentRenameLogs.forEach((log, index) => {
            if (lowerFilter) {
                const matchOriginal = log.original && log.original.toLowerCase().includes(lowerFilter);
                const matchRenamed = log.renamed && log.renamed.toLowerCase().includes(lowerFilter);
                const matchCode = log.code && log.code.toLowerCase().includes(lowerFilter);
                if (!matchOriginal && !matchRenamed && !matchCode) return;
            }

            matchCount++;
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td style="text-align: center; color: #64748b; font-weight: 600;">${index + 1}</td>
                <td style="color: #475569;" title="${log.original}">${log.original}</td>
                <td class="col-highlight" style="font-weight: 700; color: #1e293b;" title="${log.renamed}">${log.renamed}</td>
                <td><span class="file-tag tag-rename" style="font-size: 0.75rem; padding: 3px 8px;">${log.code || 'None'}</span></td>
                <td>
                    <div class="action-buttons-group" style="justify-content: center;">
                        <button type="button" class="btn-action btn-action-view" data-filename="${log.renamed}" title="View first 50 rows">
                            <i class="fa-solid fa-eye"></i> View
                        </button>
                        <button type="button" class="btn-action btn-action-edit" data-index="${index}" data-filename="${log.renamed}" title="Edit filename">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button type="button" class="btn-action btn-action-delete" data-index="${index}" data-filename="${log.renamed}" title="Delete file">
                            <i class="fa-solid fa-trash-can"></i> Delete
                        </button>
                    </div>
                </td>
            `;

            tr.querySelector('.btn-action-view').addEventListener('click', () => {
                viewExcelFile50Rows(log.renamed);
            });

            tr.querySelector('.btn-action-edit').addEventListener('click', () => {
                openEditFilenameModal(index, log.renamed);
            });

            tr.querySelector('.btn-action-delete').addEventListener('click', () => {
                deleteRenamedFile(index, log.renamed);
            });

            fullViewTableBody.appendChild(tr);
        });

        if (fullViewCountBadge) {
            fullViewCountBadge.textContent = matchCount === currentRenameLogs.length
                ? `${currentRenameLogs.length} Files`
                : `${matchCount} / ${currentRenameLogs.length} Files`;
        }
    }

    // View first 50 rows of Excel/CSV file without lag
    async function viewExcelFile50Rows(filename) {
        if (!currentRenameZipInstance) {
            alert('File package is not loaded. Please re-run the rename process.');
            return;
        }

        const fileEntry = currentRenameZipInstance.file(filename);
        if (!fileEntry) {
            alert(`File "${filename}" not found in current package.`);
            return;
        }

        showLoader(`Loading preview for ${filename}...`);
        try {
            const arrayBuffer = await fileEntry.async('arraybuffer');
            if (!window.XLSX) {
                throw new Error('XLSX parser library not loaded.');
            }

            // Parse first 51 rows (1 header + 50 data rows) to avoid memory or CPU lag
            const workbook = XLSX.read(arrayBuffer, { type: 'array', sheetRows: 51 });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

            hideLoader();

            excelPreviewThead.innerHTML = '';
            excelPreviewTbody.innerHTML = '';

            if (!rows || rows.length === 0) {
                excelPreviewTbody.innerHTML = '<tr><td colspan="100%" style="text-align: center; padding: 20px;">Sheet is empty.</td></tr>';
            } else {
                const headerRow = rows[0];
                const trHead = document.createElement('tr');
                const thNum = document.createElement('th');
                thNum.className = 'excel-row-num';
                thNum.textContent = '#';
                trHead.appendChild(thNum);

                headerRow.forEach((colName, colIdx) => {
                    const th = document.createElement('th');
                    th.textContent = colName !== undefined && colName !== null && colName !== '' ? colName : `Col ${colIdx + 1}`;
                    trHead.appendChild(th);
                });
                excelPreviewThead.appendChild(trHead);

                const dataRows = rows.slice(1, 51);
                dataRows.forEach((row, rowIdx) => {
                    const tr = document.createElement('tr');
                    const tdNum = document.createElement('td');
                    tdNum.className = 'excel-row-num';
                    tdNum.textContent = rowIdx + 1;
                    tr.appendChild(tdNum);

                    for (let c = 0; c < headerRow.length; c++) {
                        const td = document.createElement('td');
                        const val = row[c];
                        td.textContent = val !== undefined && val !== null ? val : '';
                        td.title = td.textContent;
                        tr.appendChild(td);
                    }
                    excelPreviewTbody.appendChild(tr);
                });
            }

            excelPreviewModalTitle.textContent = filename;
            excelPreviewSheetName.textContent = `Sheet: ${sheetName || 'Sheet1'} • Displaying first ${Math.min(50, Math.max(0, rows.length - 1))} rows (Lag-Free)`;
            renameExcelPreviewModal.style.display = 'flex';

        } catch (err) {
            hideLoader();
            console.error('Error viewing Excel file:', err);
            alert('Failed to preview file: ' + (err.message || 'Unknown error'));
        }
    }

    // Open Edit Filename Modal with locked extension
    function openEditFilenameModal(index, filename) {
        editingLogIndex = index;
        editingOriginalFilename = filename;

        const lastDot = filename.lastIndexOf('.');
        const stem = lastDot !== -1 ? filename.slice(0, lastDot) : filename;
        const ext = lastDot !== -1 ? filename.slice(lastDot) : '';

        editFilenameInput.value = stem;
        editFilenameExtBadge.textContent = ext;
        if (editFilenameError) editFilenameError.style.display = 'none';

        renameEditFilenameModal.style.display = 'flex';
        setTimeout(() => {
            editFilenameInput.focus();
            editFilenameInput.select();
        }, 100);
    }

    // Save Edited Filename
    async function saveEditedFilename() {
        const newStem = editFilenameInput.value.trim();
        const ext = editFilenameExtBadge.textContent;

        if (!newStem) {
            editFilenameError.textContent = 'Filename cannot be empty.';
            editFilenameError.style.display = 'block';
            return;
        }

        if (/[\\/:*?"<>|]/.test(newStem)) {
            editFilenameError.textContent = 'Filename cannot contain \\ / : * ? " < > |';
            editFilenameError.style.display = 'block';
            return;
        }

        const newFullName = newStem + ext;
        if (newFullName === editingOriginalFilename) {
            renameEditFilenameModal.style.display = 'none';
            return;
        }

        const exists = currentRenameLogs.some((l, idx) => idx !== editingLogIndex && l.renamed.toLowerCase() === newFullName.toLowerCase());
        if (exists) {
            editFilenameError.textContent = `A file named "${newFullName}" already exists in this package.`;
            editFilenameError.style.display = 'block';
            return;
        }

        showLoader('Updating filename in ZIP...');
        try {
            if (currentRenameZipInstance) {
                const oldEntry = currentRenameZipInstance.file(editingOriginalFilename);
                if (oldEntry) {
                    const data = await oldEntry.async('uint8array');
                    currentRenameZipInstance.file(newFullName, data);
                    currentRenameZipInstance.remove(editingOriginalFilename);
                    currentRenameZipBlob = await currentRenameZipInstance.generateAsync({ type: 'blob' });
                }
            }

            if (currentRenameLogs[editingLogIndex]) {
                currentRenameLogs[editingLogIndex].renamed = newFullName;
            }

            const session = await getRenameSession();
            if (session) {
                session.log = currentRenameLogs;
                session.blob = currentRenameZipBlob;
                await saveRenameSession(session);
            }

            hideLoader();
            renameEditFilenameModal.style.display = 'none';

            renderRenameLogTable(currentRenameLogs);
            renderFullViewTable(fullViewSearchInput ? fullViewSearchInput.value : '');

            showCustomAlert('Filename Updated', `File renamed to "${newFullName}" successfully!`, 'success');

        } catch (err) {
            hideLoader();
            console.error('Error renaming file in zip:', err);
            alert('Failed to rename file: ' + err.message);
        }
    }

    // Delete Renamed File
    async function deleteRenamedFile(index, filename) {
        if (!confirm(`Are you sure you want to delete "${filename}" from this package?`)) {
            return;
        }

        showLoader(`Deleting ${filename}...`);
        try {
            if (currentRenameZipInstance) {
                currentRenameZipInstance.remove(filename);
                currentRenameZipBlob = await currentRenameZipInstance.generateAsync({ type: 'blob' });
            }

            currentRenameLogs.splice(index, 1);

            const session = await getRenameSession();
            if (session) {
                session.log = currentRenameLogs;
                session.blob = currentRenameZipBlob;
                await saveRenameSession(session);
            }

            hideLoader();

            if (currentRenameLogs.length === 0) {
                renameResultCard.style.display = 'none';
                renameFullViewModal.style.display = 'none';
                await clearRenameSession();
                showCustomAlert('Package Empty', 'All files have been removed from the package.', 'warning');
                return;
            }

            renameSuccessMessage.textContent = `Renaming completed! Processed ${currentRenameLogs.length} file(s).`;
            renderRenameLogTable(currentRenameLogs);
            renderFullViewTable(fullViewSearchInput ? fullViewSearchInput.value : '');

            showCustomAlert('File Deleted', `"${filename}" was removed from the package.`, 'success');

        } catch (err) {
            hideLoader();
            console.error('Error deleting file:', err);
            alert('Failed to delete file: ' + err.message);
        }
    }

    // Move Renamed Files to Merge Tab (Group Merge)
    async function moveRenamedFilesToMerge() {
        if (!currentRenameZipInstance && !currentRenameZipBlob) {
            alert('No renamed files available. Please run the rename process first.');
            return;
        }

        showLoader('Moving renamed files to Group Merge...');
        try {
            let zip = currentRenameZipInstance;
            if (!zip && currentRenameZipBlob) {
                zip = await JSZip.loadAsync(currentRenameZipBlob);
                currentRenameZipInstance = zip;
            }

            const filesToMove = [];
            for (const [fname, entry] of Object.entries(zip.files)) {
                if (!entry.dir) {
                    const blob = await entry.async('blob');
                    const file = new File([blob], fname, {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        lastModified: Date.now()
                    });
                    file.customRelativePath = fname;
                    filesToMove.push(file);
                }
            }

            if (filesToMove.length === 0) {
                hideLoader();
                alert('No files found in package to move.');
                return;
            }

            if (renameFullViewModal) renameFullViewModal.style.display = 'none';

            // Pass directly to Group Merge handler
            await handleGmrgFileSelection(filesToMove);

            // Ensure Group Merge sub-tab is active
            if (btnSubMergeGrouped) {
                btnSubMergeGrouped.click();
            }

            // Switch main tab to Merge & Clean Orders
            if (tabMergeBtn) {
                tabMergeBtn.click();
            }

            hideLoader();

            setTimeout(() => {
                const targetEl = document.getElementById('gmrgTableContainer') || document.getElementById('gmrgDropzone');
                if (targetEl && targetEl.style.display !== 'none') {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 150);

            showCustomAlert(
                'Moved to Merge',
                `${filesToMove.length} renamed file(s) have been successfully transferred to Group Merge!`,
                'success'
            );

        } catch (err) {
            hideLoader();
            console.error('Error moving renamed files to Merge:', err);
            alert('Failed to move files: ' + err.message);
        }
    }

    // Trigger Renamed Download
    async function triggerRenamedDownload() {
        if (currentRenameZipInstance) {
            try {
                showLoader('Preparing download...');
                const blob = await currentRenameZipInstance.generateAsync({ type: 'blob' });
                hideLoader();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = renameResultFilename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                return;
            } catch(e) {
                hideLoader();
                console.warn('Client zip generation fallback to server:', e);
            }
        }
        window.location.href = `/api/download-renamed?type=${renameResultType}&filename=${encodeURIComponent(renameResultFilename)}`;
    }

    // Event Listeners for Tab 2 Actions & Modals
    if (renameFullViewBtn) {
        renameFullViewBtn.addEventListener('click', () => {
            renderFullViewTable(fullViewSearchInput ? fullViewSearchInput.value : '');
            renameFullViewModal.style.display = 'flex';
        });
    }

    if (renameFullViewCloseBtn) {
        renameFullViewCloseBtn.addEventListener('click', () => {
            renameFullViewModal.style.display = 'none';
        });
    }

    if (fullViewSearchInput) {
        fullViewSearchInput.addEventListener('input', (e) => {
            renderFullViewTable(e.target.value);
        });
    }

    if (excelPreviewCloseBtn) {
        excelPreviewCloseBtn.addEventListener('click', () => {
            renameExcelPreviewModal.style.display = 'none';
        });
    }

    if (editFilenameCancelBtn) {
        editFilenameCancelBtn.addEventListener('click', () => {
            renameEditFilenameModal.style.display = 'none';
        });
    }

    if (editFilenameSaveBtn) {
        editFilenameSaveBtn.addEventListener('click', saveEditedFilename);
    }

    if (editFilenameInput) {
        editFilenameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEditedFilename();
            }
        });
    }

    if (renameMoveToFolderBtn) renameMoveToFolderBtn.addEventListener('click', moveRenamedFilesToMerge);
    if (fullViewMoveToFolderBtn) fullViewMoveToFolderBtn.addEventListener('click', moveRenamedFilesToMerge);
    if (renameDownloadBtn) renameDownloadBtn.addEventListener('click', triggerRenamedDownload);
    if (fullViewDownloadBtn) fullViewDownloadBtn.addEventListener('click', triggerRenamedDownload);

    // ====================================================
    // ====================================================
    // TAB 3: SEPARATE FILE LOGIC (SPLIT FILE - 4 DIRECT CARDS)
    // ====================================================
    const SPLIT_OPTIONS = {
        '1': {
            title: 'Option 1: SIMPLE',
            desc: 'Split by Column D (FLIPKART). Header rows: 2.',
            badge: 'Prefix Output • Ready for Create Folder',
            tag: 'Simple'
        },
        '2': {
            title: 'Option 2: DETAILS',
            desc: 'Split by Column D (FLIPKART Warehouse / Seller Code). Header rows: 2.',
            badge: 'Multi-sheet Bundle',
            tag: 'Details'
        },
        '3': {
            title: 'Option 3: SUMMARY',
            desc: 'Split by Column G (FLIPKART Warehouse / Code). Header rows: 2.',
            badge: 'Multi-sheet Bundle',
            tag: 'Summary'
        },
        '4': {
            title: 'Option 4: TAX SPLIT',
            desc: 'Split by Column A (GSTIN / Tax details). Header rows: 1.',
            badge: 'Tax Bundle',
            tag: 'Tax Split'
        }
    };

    let currentSplitOption = '1';
    let selectedSplitFiles = { '1': null, '2': null, '3': null, '4': null };
    let splitSessions = {
        '1': { blob: null, zipInstance: null, logs: [], filename: 'flipkart_simple_seprate_bundle.zip', expiresAt: 0, fileMeta: null },
        '2': { blob: null, zipInstance: null, logs: [], filename: 'flipkart_details_seprate_bundle.zip', expiresAt: 0, fileMeta: null },
        '3': { blob: null, zipInstance: null, logs: [], filename: 'flipkart_summaary_seprate_bundle.zip', expiresAt: 0, fileMeta: null },
        '4': { blob: null, zipInstance: null, logs: [], filename: 'flipkart_tax_seprate_bundle.zip', expiresAt: 0, fileMeta: null }
    };

    let editingSplitLogIndex = -1;
    let editingSplitOriginalFilename = '';

    // Split Full View Modal elements
    const splitFullViewModal = document.getElementById('splitFullViewModal');
    const splitFullViewTitle = document.getElementById('splitFullViewTitle');
    const splitFullViewCountBadge = document.getElementById('splitFullViewCountBadge');
    const splitFullViewDownloadBtn = document.getElementById('splitFullViewDownloadBtn');
    const splitFullViewMoveToFolderBtn = document.getElementById('splitFullViewMoveToFolderBtn');
    const splitFullViewCloseBtn = document.getElementById('splitFullViewCloseBtn');
    const splitFullViewSearchInput = document.getElementById('splitFullViewSearchInput');
    const splitFullViewTableBody = document.getElementById('splitFullViewTableBody');

    // Persistence helpers for Split
    async function saveSplitSession(opt, sessionData) {
        try {
            const meta = {
                timestamp: sessionData.timestamp,
                expiresAt: sessionData.expiresAt,
                filename: sessionData.filename,
                log: sessionData.log,
                fileMeta: sessionData.fileMeta
            };
            try { localStorage.setItem(`flipkart_split_meta_${opt}`, JSON.stringify(meta)); } catch(e){}

            const db = await openIndexedDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                sessionData.id = `latest_split_session_${opt}`;
                const req = store.put(sessionData);
                req.onsuccess = () => resolve(true);
                req.onerror = () => reject(req.error);
            });
        } catch (e) {
            console.warn(`saveSplitSession (${opt}) error:`, e);
        }
    }

    async function getSplitSession(opt) {
        try {
            const db = await openIndexedDB();
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.get(`latest_split_session_${opt}`);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
        } catch (e) {
            try {
                const raw = localStorage.getItem(`flipkart_split_meta_${opt}`);
                return raw ? JSON.parse(raw) : null;
            } catch(err) {
                return null;
            }
        }
    }

    async function clearSplitSession(opt) {
        splitSessions[opt] = { blob: null, zipInstance: null, logs: [], filename: 'Split_Files.zip', expiresAt: 0, fileMeta: null };
        try { localStorage.removeItem(`flipkart_split_meta_${opt}`); } catch(e){}
        try {
            const db = await openIndexedDB();
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.delete(`latest_split_session_${opt}`);
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
            });
        } catch (e) {}
    }

    // ----------------------------------------------------
    // CLEAN RESET FUNCTIONS FOR TAB 3: SEPARATE FILE
    // ----------------------------------------------------
    async function resetSplitOption(opt, askConfirm = true) {
        if (askConfirm) {
            const hasData = selectedSplitFiles[opt] !== null || 
                            (splitSessions[opt] && splitSessions[opt].logs && splitSessions[opt].logs.length > 0);
            if (hasData) {
                const optName = (SPLIT_OPTIONS[opt] && SPLIT_OPTIONS[opt].title) ? SPLIT_OPTIONS[opt].title : `Option ${opt}`;
                const confirmed = window.confirm(`Are you sure you want to reset ${optName}? All uploaded files and split results for this option will be cleared.`);
                if (!confirmed) return;
            }
        }

        // 1. Clear in-memory selection
        selectedSplitFiles[opt] = null;

        // 2. Clear HTML inputs & UI info
        const fileInput = document.getElementById(`splitFileInput${opt}`);
        if (fileInput) fileInput.value = '';
        const fileInfo = document.getElementById(`splitFileInfo${opt}`);
        if (fileInfo) fileInfo.style.display = 'none';
        const fileName = document.getElementById(`splitFileName${opt}`);
        if (fileName) fileName.textContent = '';
        const fileSize = document.getElementById(`splitFileSize${opt}`);
        if (fileSize) fileSize.textContent = '';

        // 3. Clear session & IndexedDB
        await clearSplitSession(opt);

        // 4. Reset result UI
        const resultCard = document.getElementById(`splitResult${opt}`);
        if (resultCard) resultCard.style.display = 'none';
        const successMsg = document.getElementById(`splitSuccessMsg${opt}`);
        if (successMsg) successMsg.textContent = 'Generated 0 files.';
        const timerBadge = document.getElementById(`splitTimer${opt}`);
        if (timerBadge) timerBadge.innerHTML = `<i class="fa-regular fa-clock"></i> 60 min remaining`;

        // 5. If modal is currently viewing this option, close modal
        if (splitFullViewModal && splitFullViewModal.style.display !== 'none' && currentSplitOption === opt) {
            splitFullViewModal.style.display = 'none';
        }

        if (askConfirm) {
            const optName = (SPLIT_OPTIONS[opt] && SPLIT_OPTIONS[opt].title) ? SPLIT_OPTIONS[opt].title : `Option ${opt}`;
            showCustomAlert('Reset Completed', `${optName} has been cleanly reset.`, 'success');
        }
    }

    async function resetSplitAll(askConfirm = true) {
        const hasAnyData = ['1', '2', '3', '4'].some(opt => {
            return selectedSplitFiles[opt] !== null || 
                   (splitSessions[opt] && splitSessions[opt].logs && splitSessions[opt].logs.length > 0);
        });

        if (askConfirm && hasAnyData) {
            const confirmed = window.confirm("Are you sure you want to reset ALL 4 Separate File options? All uploaded files, generated split results, and sessions will be cleared.");
            if (!confirmed) return;
        }

        for (const opt of ['1', '2', '3', '4']) {
            await resetSplitOption(opt, false);
        }

        if (splitFullViewModal) {
            splitFullViewModal.style.display = 'none';
        }

        showCustomAlert('Reset Completed', 'All 4 Separate File options have been cleanly reset.', 'success');
    }

    // Initialize each of the 4 option cards
    ['1', '2', '3', '4'].forEach(opt => {
        const dropzone = document.getElementById(`splitDropzone${opt}`);
        const fileInput = document.getElementById(`splitFileInput${opt}`);
        const fileInfo = document.getElementById(`splitFileInfo${opt}`);
        const fileName = document.getElementById(`splitFileName${opt}`);
        const fileSize = document.getElementById(`splitFileSize${opt}`);
        const clearBtn = document.getElementById(`splitClearBtn${opt}`);
        const processBtn = document.getElementById(`splitProcessBtn${opt}`);
        const resultCard = document.getElementById(`splitResult${opt}`);
        const successMsg = document.getElementById(`splitSuccessMsg${opt}`);
        const timerBadge = document.getElementById(`splitTimer${opt}`);
        const downloadBtn = document.getElementById(`splitDownloadBtn${opt}`);
        const fullViewBtn = document.getElementById(`splitFullViewBtn${opt}`);
        const moveToFolderBtn = (opt === '1') ? document.getElementById('splitMoveToFolderBtn1') : null;

        function updateOptionUI() {
            const file = selectedSplitFiles[opt];
            if (file) {
                if (fileName) fileName.textContent = file.name;
                if (fileSize) fileSize.textContent = formatBytes(file.size);
                if (fileInfo) fileInfo.style.display = 'flex';
            } else {
                if (fileInfo) fileInfo.style.display = 'none';
                if (fileInput) fileInput.value = '';
            }
        }

        function handleFile(file) {
            const ext = file.name.split('.').pop().toLowerCase();
            if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
                alert(`File "${file.name}" is not supported (supports Excel/CSV).`);
                return;
            }
            selectedSplitFiles[opt] = file;
            updateOptionUI();
        }

        // Dropzone events
        if (dropzone) {
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

            dropzone.addEventListener('click', () => {
                if (fileInput) fileInput.click();
            });

            dropzone.addEventListener('drop', (e) => {
                if (e.dataTransfer.files.length > 0) {
                    handleFile(e.dataTransfer.files[0]);
                }
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                selectedSplitFiles[opt] = null;
                updateOptionUI();
                await clearSplitSession(opt);
                if (resultCard) resultCard.style.display = 'none';
            });
        }

        // Process button
        if (processBtn) {
            processBtn.addEventListener('click', async () => {
                const file = selectedSplitFiles[opt];
                if (!file) {
                    alert(`Please upload an Excel/CSV file for Option ${opt} first.`);
                    return;
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('option', opt);

                showLoader(`Processing Option ${opt} (${SPLIT_OPTIONS[opt].tag})...`);
                if (resultCard) resultCard.style.display = 'none';

                try {
                    const response = await fetch('/api/split', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Server processing error.');

                    hideLoader();

                    const zipFilename = data.zip_filename || `Split_Option_${opt}.zip`;
                    const logs = data.log || [];

                    // Fetch and cache the split ZIP blob
                    let zipBlob = null;
                    let zipInstance = null;
                    try {
                        const dlRes = await fetch(`/api/download-split?option=${opt}&filename=${encodeURIComponent(zipFilename)}`);
                        if (dlRes.ok) {
                            zipBlob = await dlRes.blob();
                            zipInstance = await JSZip.loadAsync(zipBlob);
                        }
                    } catch(e) {
                        console.warn(`Could not load split zip blob for Option ${opt}:`, e);
                    }

                    const now = Date.now();
                    const sessionData = {
                        timestamp: now,
                        expiresAt: now + ONE_HOUR_MS,
                        filename: zipFilename,
                        log: logs,
                        fileMeta: { name: file.name, size: file.size },
                        blob: zipBlob
                    };

                    splitSessions[opt] = {
                        blob: zipBlob,
                        zipInstance: zipInstance,
                        logs: logs,
                        filename: zipFilename,
                        expiresAt: sessionData.expiresAt,
                        fileMeta: sessionData.fileMeta
                    };

                    await saveSplitSession(opt, sessionData);

                    // Update this card's results
                    if (successMsg) successMsg.textContent = `Generated ${logs.length} separate file(s)!`;
                    if (timerBadge) {
                        timerBadge.innerHTML = `<i class="fa-regular fa-clock"></i> 60 min remaining`;
                    }
                    if (resultCard) {
                        resultCard.style.display = 'block';
                    }

                    showCustomAlert('Split Completed', `Option ${opt} generated ${logs.length} files successfully!`, 'success');

                } catch (error) {
                    hideLoader();
                    alert(`Error during splitting: ${error.message}`);
                }
            });
        }

        // Download button
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                triggerSplitDownloadForOption(opt);
            });
        }

        // Full View button
        if (fullViewBtn) {
            fullViewBtn.addEventListener('click', () => {
                currentSplitOption = opt;
                if (splitFullViewSearchInput) splitFullViewSearchInput.value = '';
                renderSplitFullViewTable(opt, '');
                if (splitFullViewModal) splitFullViewModal.style.display = 'flex';
            });
        }

        // Move to Create Folder (Option 1 only)
        if (moveToFolderBtn) {
            moveToFolderBtn.addEventListener('click', moveSplitFilesToCreateFolder);
        }

        // Header Reset Button for Option
        const cardResetBtn = document.getElementById(`splitCardResetBtn${opt}`);
        if (cardResetBtn) {
            cardResetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                resetSplitOption(opt, true);
            });
        }

        // Result Bar Reset Button for Option
        const resultResetBtn = document.getElementById(`splitResultResetBtn${opt}`);
        if (resultResetBtn) {
            resultResetBtn.addEventListener('click', () => {
                resetSplitOption(opt, true);
            });
        }
    });

    // Bulk Process All Uploaded Files Button (Master Button)
    const masterBtn = document.getElementById('splitMasterProcessBtn') || document.getElementById('splitProcessAllBtn');
    if (masterBtn) {
        masterBtn.addEventListener('click', async () => {
            const activeOptions = ['1', '2', '3', '4'].filter(opt => selectedSplitFiles[opt] !== null);
            if (activeOptions.length === 0) {
                alert('Please upload an Excel/CSV file to at least one option before clicking Start All.');
                return;
            }

            masterBtn.disabled = true;
            const originalHTML = masterBtn.innerHTML;
            masterBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing ${activeOptions.length} Option(s)...`;

            try {
                for (const opt of activeOptions) {
                    const btn = document.getElementById(`splitProcessBtn${opt}`);
                    if (btn) {
                        btn.click();
                        await new Promise(r => setTimeout(r, 600));
                    }
                }
            } finally {
                setTimeout(() => {
                    masterBtn.disabled = false;
                    masterBtn.innerHTML = originalHTML;
                }, 1500);
            }
        });
    }

    const splitMasterResetBtn = document.getElementById('splitMasterResetBtn');
    if (splitMasterResetBtn) {
        splitMasterResetBtn.addEventListener('click', () => {
            resetSplitAll(true);
        });
    }

    // ----------------------------------------------------
    // RESTORE ALL SPLIT SESSIONS ON PAGE LOAD (1-HOUR)
    // ----------------------------------------------------
    async function restoreAllSplitSessionsIfValid() {
        const now = Date.now();
        for (const opt of ['1', '2', '3', '4']) {
            try {
                const s = await getSplitSession(opt);
                if (!s) continue;

                if (!s.expiresAt || now > s.expiresAt) {
                    await clearSplitSession(opt);
                    continue;
                }

                let zipInstance = null;
                if (s.blob) {
                    try {
                        zipInstance = await JSZip.loadAsync(s.blob);
                    } catch(e) {
                        console.warn(`Error loading zip for split opt ${opt}:`, e);
                    }
                }

                splitSessions[opt] = {
                    blob: s.blob || null,
                    zipInstance: zipInstance,
                    logs: s.log || [],
                    filename: s.filename || `Split_Option_${opt}.zip`,
                    expiresAt: s.expiresAt,
                    fileMeta: s.fileMeta || null
                };

                // Restore selected file meta in this option's card
                if (s.fileMeta) {
                    selectedSplitFiles[opt] = {
                        name: s.fileMeta.name,
                        size: s.fileMeta.size
                    };
                    const fileName = document.getElementById(`splitFileName${opt}`);
                    const fileSize = document.getElementById(`splitFileSize${opt}`);
                    const fileInfo = document.getElementById(`splitFileInfo${opt}`);
                    if (fileName) fileName.textContent = s.fileMeta.name;
                    if (fileSize) fileSize.textContent = formatBytes(s.fileMeta.size);
                    if (fileInfo) fileInfo.style.display = 'flex';
                }

                // Restore result card & timer badge
                const resultCard = document.getElementById(`splitResult${opt}`);
                const successMsg = document.getElementById(`splitSuccessMsg${opt}`);
                const timerBadge = document.getElementById(`splitTimer${opt}`);

                const remainingMins = Math.max(1, Math.round((s.expiresAt - now) / 60000));
                if (successMsg) successMsg.textContent = `Generated ${s.log ? s.log.length : 0} separate file(s)!`;
                if (timerBadge) {
                    timerBadge.innerHTML = `<i class="fa-regular fa-clock"></i> ${remainingMins} min remaining`;
                }
                if (resultCard) {
                    resultCard.style.display = 'block';
                }

            } catch (err) {
                console.error(`Error restoring split session ${opt}:`, err);
            }
        }
    }

    restoreAllSplitSessionsIfValid();

    // ----------------------------------------------------
    // FULL VIEW MODAL & FILE ACTIONS FOR SPLIT
    // ----------------------------------------------------
    function renderSplitFullViewTable(opt, filterText = '') {
        if (!splitFullViewTableBody) return;
        splitFullViewTableBody.innerHTML = '';

        const session = splitSessions[opt];
        const logs = session ? session.logs : [];

        if (splitFullViewTitle) {
            splitFullViewTitle.textContent = `Split Files - Option ${opt} (${SPLIT_OPTIONS[opt].tag})`;
        }

        // Show "Move to Create Folder" inside Full View ONLY for Option 1
        if (splitFullViewMoveToFolderBtn) {
            splitFullViewMoveToFolderBtn.style.display = (opt === '1') ? 'inline-flex' : 'none';
        }

        if (!logs || logs.length === 0) {
            splitFullViewTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px; color: #94a3b8;">No split files available for Option ' + opt + '.</td></tr>';
            if (splitFullViewCountBadge) splitFullViewCountBadge.textContent = '0 Files';
            return;
        }

        const lowerFilter = filterText.toLowerCase().trim();
        let matchCount = 0;

        logs.forEach((log, index) => {
            if (lowerFilter) {
                const matchName = log.filename && log.filename.toLowerCase().includes(lowerFilter);
                const matchKey = log.key && log.key.toLowerCase().includes(lowerFilter);
                if (!matchName && !matchKey) return;
            }

            matchCount++;
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td style="text-align: center; color: #64748b; font-weight: 600;">${index + 1}</td>
                <td class="col-highlight" style="font-weight: 700; color: #1e293b;" title="${log.filename}">${log.filename}</td>
                <td style="color: #475569;" title="${log.key}">${log.key}</td>
                <td style="text-align: center; color: #64748b;">${log.index}</td>
                <td>
                    <div class="action-buttons-group" style="justify-content: center;">
                        <button type="button" class="btn-action btn-action-view" data-filename="${log.filename}" title="View first 50 rows">
                            <i class="fa-solid fa-eye"></i> View
                        </button>
                        <button type="button" class="btn-action btn-action-edit" data-index="${index}" data-filename="${log.filename}" title="Edit filename">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button type="button" class="btn-action btn-action-delete" data-index="${index}" data-filename="${log.filename}" title="Delete file">
                            <i class="fa-solid fa-trash-can"></i> Delete
                        </button>
                    </div>
                </td>
            `;

            tr.querySelector('.btn-action-view').addEventListener('click', () => {
                viewSplitExcelFile50Rows(log.filename);
            });

            tr.querySelector('.btn-action-edit').addEventListener('click', () => {
                openSplitEditFilenameModal(index, log.filename);
            });

            tr.querySelector('.btn-action-delete').addEventListener('click', () => {
                deleteSplitFile(index, log.filename);
            });

            splitFullViewTableBody.appendChild(tr);
        });

        if (splitFullViewCountBadge) {
            splitFullViewCountBadge.textContent = matchCount === logs.length
                ? `${logs.length} Files`
                : `${matchCount} / ${logs.length} Files`;
        }
    }

    // View first 50 rows for split file
    async function viewSplitExcelFile50Rows(filename) {
        const session = splitSessions[currentSplitOption];
        if (!session || !session.zipInstance) {
            alert('File package is not loaded in memory. Please re-run the split.');
            return;
        }

        const fileEntry = session.zipInstance.file(filename);
        if (!fileEntry) {
            alert(`File "${filename}" not found in current split package.`);
            return;
        }

        showLoader(`Loading preview for ${filename}...`);
        try {
            const arrayBuffer = await fileEntry.async('arraybuffer');
            if (!window.XLSX) throw new Error('XLSX parser library not loaded.');

            const workbook = XLSX.read(arrayBuffer, { type: 'array', sheetRows: 51 });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

            hideLoader();

            if (excelPreviewThead) excelPreviewThead.innerHTML = '';
            if (excelPreviewTbody) excelPreviewTbody.innerHTML = '';

            if (!rows || rows.length === 0) {
                if (excelPreviewTbody) excelPreviewTbody.innerHTML = '<tr><td colspan="100%" style="text-align: center; padding: 20px;">Sheet is empty.</td></tr>';
            } else {
                const headerRow = rows[0];
                const trHead = document.createElement('tr');
                const thNum = document.createElement('th');
                thNum.className = 'excel-row-num';
                thNum.textContent = '#';
                trHead.appendChild(thNum);

                headerRow.forEach((colName, colIdx) => {
                    const th = document.createElement('th');
                    th.textContent = colName !== undefined && colName !== null && colName !== '' ? colName : `Col ${colIdx + 1}`;
                    trHead.appendChild(th);
                });
                if (excelPreviewThead) excelPreviewThead.appendChild(trHead);

                const dataRows = rows.slice(1, 51);
                dataRows.forEach((row, rowIdx) => {
                    const tr = document.createElement('tr');
                    const tdNum = document.createElement('td');
                    tdNum.className = 'excel-row-num';
                    tdNum.textContent = rowIdx + 1;
                    tr.appendChild(tdNum);

                    for (let c = 0; c < headerRow.length; c++) {
                        const td = document.createElement('td');
                        const val = row[c];
                        td.textContent = val !== undefined && val !== null ? val : '';
                        td.title = td.textContent;
                        tr.appendChild(td);
                    }
                    if (excelPreviewTbody) excelPreviewTbody.appendChild(tr);
                });
            }

            if (excelPreviewModalTitle) excelPreviewModalTitle.textContent = filename;
            if (excelPreviewSheetName) excelPreviewSheetName.textContent = `Sheet: ${sheetName || 'Sheet1'} • Displaying first ${Math.min(50, Math.max(0, rows.length - 1))} rows (Lag-Free)`;
            if (renameExcelPreviewModal) renameExcelPreviewModal.style.display = 'flex';

        } catch (err) {
            hideLoader();
            console.error('Error previewing split file:', err);
            alert('Failed to preview file: ' + err.message);
        }
    }

    // Open Edit Filename Modal for Split file
    function openSplitEditFilenameModal(index, filename) {
        editingSplitLogIndex = index;
        editingSplitOriginalFilename = filename;

        const lastDot = filename.lastIndexOf('.');
        const stem = lastDot !== -1 ? filename.slice(0, lastDot) : filename;
        const ext = lastDot !== -1 ? filename.slice(lastDot) : '';

        if (editFilenameInput) editFilenameInput.value = stem;
        if (editFilenameExtBadge) editFilenameExtBadge.textContent = ext;
        if (editFilenameError) editFilenameError.style.display = 'none';

        if (editFilenameSaveBtn) {
            editFilenameSaveBtn.onclick = saveSplitEditedFilename;
        }

        if (renameEditFilenameModal) {
            renameEditFilenameModal.style.display = 'flex';
            setTimeout(() => {
                if (editFilenameInput) {
                    editFilenameInput.focus();
                    editFilenameInput.select();
                }
            }, 100);
        }
    }

    // Save Edited Filename for Split
    async function saveSplitEditedFilename() {
        const opt = currentSplitOption;
        const session = splitSessions[opt];
        if (!session) return;

        const newStem = editFilenameInput.value.trim();
        const ext = editFilenameExtBadge.textContent;

        if (!newStem) {
            editFilenameError.textContent = 'Filename cannot be empty.';
            editFilenameError.style.display = 'block';
            return;
        }

        if (/[\\/:*?"<>|]/.test(newStem)) {
            editFilenameError.textContent = 'Filename cannot contain \\ / : * ? " < > |';
            editFilenameError.style.display = 'block';
            return;
        }

        const newFullName = newStem + ext;
        if (newFullName === editingSplitOriginalFilename) {
            renameEditFilenameModal.style.display = 'none';
            return;
        }

        const exists = session.logs.some((l, idx) => idx !== editingSplitLogIndex && l.filename.toLowerCase() === newFullName.toLowerCase());
        if (exists) {
            editFilenameError.textContent = `A file named "${newFullName}" already exists in this package.`;
            editFilenameError.style.display = 'block';
            return;
        }

        showLoader('Updating filename in ZIP...');
        try {
            if (session.zipInstance) {
                const oldEntry = session.zipInstance.file(editingSplitOriginalFilename);
                if (oldEntry) {
                    const data = await oldEntry.async('uint8array');
                    session.zipInstance.file(newFullName, data);
                    session.zipInstance.remove(editingSplitOriginalFilename);
                    session.blob = await session.zipInstance.generateAsync({ type: 'blob' });
                }
            }

            if (session.logs[editingSplitLogIndex]) {
                session.logs[editingSplitLogIndex].filename = newFullName;
            }

            // Save to IndexedDB
            await saveSplitSession(opt, {
                timestamp: Date.now(),
                expiresAt: session.expiresAt,
                filename: session.filename,
                log: session.logs,
                fileMeta: session.fileMeta,
                blob: session.blob
            });

            hideLoader();
            renameEditFilenameModal.style.display = 'none';

            // Refresh Full View table
            renderSplitFullViewTable(opt, splitFullViewSearchInput ? splitFullViewSearchInput.value : '');

            showCustomAlert('Filename Updated', `File renamed to "${newFullName}" successfully!`, 'success');

        } catch (err) {
            hideLoader();
            console.error('Error renaming split file:', err);
            alert('Failed to rename file: ' + err.message);
        }
    }

    // Delete Split File
    async function deleteSplitFile(index, filename) {
        const opt = currentSplitOption;
        const session = splitSessions[opt];
        if (!session) return;

        if (!confirm(`Are you sure you want to delete "${filename}" from this package?`)) {
            return;
        }

        showLoader(`Deleting ${filename}...`);
        try {
            if (session.zipInstance) {
                session.zipInstance.remove(filename);
                session.blob = await session.zipInstance.generateAsync({ type: 'blob' });
            }

            session.logs.splice(index, 1);

            await saveSplitSession(opt, {
                timestamp: Date.now(),
                expiresAt: session.expiresAt,
                filename: session.filename,
                log: session.logs,
                fileMeta: session.fileMeta,
                blob: session.blob
            });

            hideLoader();

            const resultCard = document.getElementById(`splitResult${opt}`);
            const successMsg = document.getElementById(`splitSuccessMsg${opt}`);

            if (session.logs.length === 0) {
                if (resultCard) resultCard.style.display = 'none';
                if (splitFullViewModal) splitFullViewModal.style.display = 'none';
                await clearSplitSession(opt);
                showCustomAlert('Package Empty', 'All files have been removed from this package.', 'warning');
                return;
            }

            if (successMsg) successMsg.textContent = `Generated ${session.logs.length} separate file(s)!`;
            renderSplitFullViewTable(opt, splitFullViewSearchInput ? splitFullViewSearchInput.value : '');

            showCustomAlert('File Deleted', `"${filename}" was removed from the package.`, 'success');

        } catch (err) {
            hideLoader();
            console.error('Error deleting split file:', err);
            alert('Failed to delete file: ' + err.message);
        }
    }

    // Move to Create Folder (ONLY FOR OPTION 1: SIMPLE)
    async function moveSplitFilesToCreateFolder() {
        const session = splitSessions['1'];
        if (!session || (!session.zipInstance && !session.blob)) {
            alert('No files available in Option 1 (SIMPLE). Please run Option 1 split first.');
            return;
        }

        showLoader('Moving Option 1 files to Create Folder...');
        try {
            let zip = session.zipInstance;
            if (!zip && session.blob) {
                zip = await JSZip.loadAsync(session.blob);
                session.zipInstance = zip;
            }

            const filesToMove = [];
            for (const [fname, entry] of Object.entries(zip.files)) {
                if (!entry.dir) {
                    const blob = await entry.async('blob');
                    const file = new File([blob], fname, {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        lastModified: Date.now()
                    });
                    file.customRelativePath = fname;
                    filesToMove.push(file);
                }
            }

            if (filesToMove.length === 0) {
                hideLoader();
                alert('No files found to move.');
                return;
            }

            const modeFilesBtn2 = document.getElementById('fcModeFilesBtn') || document.getElementById('folderModeFilesBtn');
            if (folderMode !== 'files' && modeFilesBtn2) {
                modeFilesBtn2.click();
            }

            filesToMove.forEach(newFile => {
                const existingIdx = selectedFolderFiles.findIndex(f => f.name === newFile.name);
                if (existingIdx !== -1) {
                    selectedFolderFiles[existingIdx] = newFile;
                } else {
                    selectedFolderFiles.push(newFile);
                }
            });
            fcFiles = selectedFolderFiles;

            updateFolderFilesListUI();

            hideLoader();

            if (splitFullViewModal) splitFullViewModal.style.display = 'none';

            if (tabFolderBtn) {
                tabFolderBtn.click();
            }

            setTimeout(() => {
                const targetEl = document.getElementById('fcSelectedFilesCard') || document.getElementById('fcDropzone');
                if (targetEl && targetEl.style.display !== 'none') {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    const dropzone = document.getElementById('fcDropzone');
                    if (dropzone) dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 150);

            showCustomAlert(
                'Moved to Create Folder',
                `${filesToMove.length} Option 1 split file(s) have been successfully added to Create Folder!`,
                'success'
            );

        } catch (err) {
            hideLoader();
            console.error('Error moving split files to Create Folder:', err);
            alert('Failed to move files: ' + err.message);
        }
    }

    // Trigger Split Download for a given option
    async function triggerSplitDownloadForOption(opt) {
        const session = splitSessions[opt];
        if (session && session.zipInstance) {
            try {
                showLoader('Preparing download...');
                const blob = await session.zipInstance.generateAsync({ type: 'blob' });
                hideLoader();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = session.filename || `Split_Option_${opt}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                return;
            } catch(e) {
                hideLoader();
                console.warn('Client zip generation fallback to server:', e);
            }
        }
        window.location.href = `/api/download-split?option=${opt}&filename=${encodeURIComponent(session ? session.filename : 'Split_Files.zip')}`;
    }

    // Modal listeners for Split Full View
    if (splitFullViewCloseBtn) {
        splitFullViewCloseBtn.addEventListener('click', () => {
            if (splitFullViewModal) splitFullViewModal.style.display = 'none';
        });
    }

    if (splitFullViewSearchInput) {
        splitFullViewSearchInput.addEventListener('input', (e) => {
            renderSplitFullViewTable(currentSplitOption, e.target.value);
        });
    }

    if (splitFullViewDownloadBtn) {
        splitFullViewDownloadBtn.addEventListener('click', () => {
            triggerSplitDownloadForOption(currentSplitOption);
        });
    }

    if (splitFullViewMoveToFolderBtn) {
        splitFullViewMoveToFolderBtn.addEventListener('click', moveSplitFilesToCreateFolder);
    }

    const modalSplitResetBtn = document.getElementById('modalSplitResetBtn');
    if (modalSplitResetBtn) {
        modalSplitResetBtn.addEventListener('click', () => {
            resetSplitOption(currentSplitOption, true);
        });
    }

    // ====================================================
    // TAB 4: ADVANCED FOLDER CREATE (STRICT 3-FILE RULE)
    // ====================================================
    // Elements and local references (state variables declared at top of script)
    const folderModeFilesBtn = document.getElementById('fcModeFilesBtn');

    // Elements
    const fcModeFilesBtn = document.getElementById('fcModeFilesBtn');
    const fcModeFoldersBtn = document.getElementById('fcModeFoldersBtn');
    const fcUploadTitle = document.getElementById('fcUploadTitle');
    const fcUploadDesc = document.getElementById('fcUploadDesc');
    const fcDropzone = document.getElementById('fcDropzone');
    const fcFileInput = document.getElementById('fcFileInput');
    const fcFolderInput = document.getElementById('fcFolderInput');
    const fcFileDisplay = document.getElementById('fcFileDisplay');
    const fcSelectedFilesCard = document.getElementById('fcSelectedFilesCard');
    const fcUploadedFileList = document.getElementById('fcUploadedFileList');
    const fcSelectedCount = document.getElementById('fcSelectedCount');
    const clearFcFilesBtn = document.getElementById('clearFcFilesBtn');
    const fcBtn = document.getElementById('fcBtn');

    const fcProgressCard = document.getElementById('fcProgressCard');
    const fcProgressBar = document.getElementById('fcProgressBar');
    const fcProgressPercent = document.getElementById('fcProgressPercent');
    const fcProgressStepText = document.getElementById('fcProgressStepText');

    const fcOutputContainer = document.getElementById('fcOutputContainer');
    const fcConsoleLog = document.getElementById('fcConsoleLog');
    const clearFcLogBtn = document.getElementById('clearFcLogBtn');

    // Fullscreen Modal Elements
    const fcFullscreenModal = document.getElementById('fcFullscreenModal');
    const modalFcTotalBadge = document.getElementById('modalFcTotalBadge');
    const modalFcReadyBadge = document.getElementById('modalFcReadyBadge');
    const modalFcErrorBadge = document.getElementById('modalFcErrorBadge');
    const modalFcDownloadReportBtn = document.getElementById('modalFcDownloadReportBtn');
    const modalFcDownloadZipBtn = document.getElementById('modalFcDownloadZipBtn');
    const modalFcMoveToInvoiceBtn = document.getElementById('modalFcMoveToInvoiceBtn');
    const closeFcModalBtn = document.getElementById('closeFcModalBtn');
    const modalFcAccordionContainer = document.getElementById('modalFcAccordionContainer');
    const modalFcSearchInput = document.getElementById('modalFcSearchInput');
    const modalFcSummaryText = document.getElementById('modalFcSummaryText');
    const modalFcFooterMoveToInvoiceBtn = document.getElementById('modalFcFooterMoveToInvoiceBtn');
    const modalFcFooterCloseBtn = document.getElementById('modalFcFooterCloseBtn');

    // Copy File Dialog Modal Elements
    const fcMoveFileModal = document.getElementById('fcMoveFileModal');
    const fcMoveSourceFileName = document.getElementById('fcMoveSourceFileName');
    const fcMoveFoldersList = document.getElementById('fcMoveFoldersList');
    const fcMoveSelectAllBtn = document.getElementById('fcMoveSelectAllBtn');
    const fcMoveDeselectAllBtn = document.getElementById('fcMoveDeselectAllBtn');
    const fcMoveSearchInput = document.getElementById('fcMoveSearchInput');
    const fcMoveCancelBtn = document.getElementById('fcMoveCancelBtn');
    const fcMoveConfirmBtn = document.getElementById('fcMoveConfirmBtn');
    let fcSourceFileForCopy = null;
    let fcSourcePrefixForCopy = null;

    function appendFcLog(msg, type = 'info') {
        if (!fcConsoleLog) return;
        const time = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.textContent = `[${time}] ${msg}`;
        fcConsoleLog.appendChild(line);
        fcConsoleLog.scrollTop = fcConsoleLog.scrollHeight;
    }

    if (clearFcLogBtn) {
        clearFcLogBtn.addEventListener('click', () => {
            if (fcConsoleLog) fcConsoleLog.innerHTML = '';
        });
    }

    function checkIsMergedFile(file) {
        return (file.name || '').toUpperCase().includes('FLIPKART_MERGED_ORDERS');
    }

    // Recursive directory reader
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
                    if (entry) entries.push(entry);
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

    // Switch between Group Files and Process Folders
    function getFcExpectedCount() {
        const toggle = document.getElementById('toggleFcRule');
        if (!toggle) return 2;
        return toggle.checked ? 2 : 3;
    }

    function updateFcRuleUI() {
        const toggle = document.getElementById('toggleFcRule');
        const isNew = toggle ? toggle.checked : false;
        const ruleSlider = document.getElementById('fcRuleSlider');
        const ruleKnob = document.getElementById('fcRuleKnob');
        const ruleText = document.getElementById('fcRuleText');
        const ruleTag = document.getElementById('fcRuleTag');
        const uploadTitle = document.getElementById('fcUploadTitle');
        const ruleBoxContainer = document.getElementById('fcRuleBoxContainer');
        const ruleBoxTitle = document.getElementById('fcRuleBoxTitle');
        const ruleBoxDesc = document.getElementById('fcRuleBoxDesc');
        const expected = isNew ? 2 : 3;

        if (isNew) {
            if (ruleSlider) ruleSlider.style.backgroundColor = '#6366f1';
            if (ruleKnob) ruleKnob.style.transform = 'translateX(18px)';
            if (ruleText) {
                ruleText.textContent = 'New (2 Files)';
                ruleText.style.color = '#4f46e5';
            }
            if (ruleTag) {
                ruleTag.textContent = 'New: 2 Files / Folder';
                ruleTag.style.background = '#ede9fe';
                ruleTag.style.color = '#6d28d9';
                ruleTag.style.borderColor = '#ddd6fe';
            }
            if (ruleBoxContainer) {
                ruleBoxContainer.style.background = '#f5f3ff';
                ruleBoxContainer.style.borderLeft = '4px solid #7c3aed';
            }
            if (ruleBoxTitle) {
                ruleBoxTitle.style.color = '#6d28d9';
                ruleBoxTitle.innerHTML = '<i class="fa-solid fa-circle-check"></i> Mandatory 2-File Rule:';
            }
            if (ruleBoxDesc) {
                ruleBoxDesc.style.color = '#5b21b6';
                ruleBoxDesc.innerHTML = 'Every folder <b>must have exactly 2 files</b>! Any folder with less than 2 files will trigger an <b>ERROR</b> and generate a Missing Files Report.';
            }
        } else {
            if (ruleSlider) ruleSlider.style.backgroundColor = '#94a3b8';
            if (ruleKnob) ruleKnob.style.transform = 'translateX(0px)';
            if (ruleText) {
                ruleText.textContent = 'Old (3 Files)';
                ruleText.style.color = '#475569';
            }
            if (ruleTag) {
                ruleTag.textContent = 'Old: 3 Files / Folder';
                ruleTag.style.background = '#fee2e2';
                ruleTag.style.color = '#b91c1c';
                ruleTag.style.borderColor = '#fca5a5';
            }
            if (ruleBoxContainer) {
                ruleBoxContainer.style.background = '#fee2e2';
                ruleBoxContainer.style.borderLeft = '4px solid #dc2626';
            }
            if (ruleBoxTitle) {
                ruleBoxTitle.style.color = '#b91c1c';
                ruleBoxTitle.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Mandatory 3-File Rule:';
            }
            if (ruleBoxDesc) {
                ruleBoxDesc.style.color = '#991b1b';
                ruleBoxDesc.innerHTML = 'Every folder <b>must have exactly 3 files</b>! Any folder with less than 3 files will trigger an <b>ERROR</b> and generate a Missing Files Report.';
            }
        }

        if (uploadTitle) {
            uploadTitle.textContent = fcMode === 'files' ? `Select Files to Group (${expected} Files Rule)` : `Upload Folders Directly (${expected} Files Rule)`;
        }
    }

    function switchFcMode(mode) {
        if (fcMode === mode) return;
        fcMode = mode;
        folderMode = mode;
        fcFiles = [];
        selectedFolderFiles = fcFiles;
        if (fcFileInput) fcFileInput.value = '';
        if (fcFolderInput) fcFolderInput.value = '';

        const expCount = getFcExpectedCount();
        if (mode === 'files') {
            if (fcModeFilesBtn) fcModeFilesBtn.classList.add('active');
            if (fcModeFoldersBtn) fcModeFoldersBtn.classList.remove('active');
            if (fcUploadTitle) fcUploadTitle.textContent = `Select Files to Group (${expCount} Files Rule)`;
            if (fcUploadDesc) fcUploadDesc.textContent = "Drag & drop all files (including Merged file & prefix sheets) together.";
            if (fcFileDisplay) fcFileDisplay.innerHTML = 'Drag & drop files here or <span class="browse-link">Browse Files</span>';
        } else {
            if (fcModeFilesBtn) fcModeFilesBtn.classList.remove('active');
            if (fcModeFoldersBtn) fcModeFoldersBtn.classList.add('active');
            if (fcUploadTitle) fcUploadTitle.textContent = `Upload Folders Directly (${expCount} Files Rule)`;
            if (fcUploadDesc) fcUploadDesc.textContent = `Drag & drop whole folders here to verify ${expCount} files per folder and package.`;
            if (fcFileDisplay) fcFileDisplay.innerHTML = 'Drag & drop folders here or <span class="browse-link">Browse Folders</span>';
        }
        updateFcUploadedFileListUI();
        appendFcLog(`Switched mode to: ${mode === 'files' ? 'Group Files by Prefix' : 'Process Folders Directly'}`);
    }

    if (fcModeFilesBtn) fcModeFilesBtn.addEventListener('click', () => switchFcMode('files'));
    if (fcModeFoldersBtn) fcModeFoldersBtn.addEventListener('click', () => switchFcMode('folders'));

    const toggleFcRule = document.getElementById('toggleFcRule');
    if (toggleFcRule) {
        toggleFcRule.checked = true; // Default ON: New 2-File Rule
        toggleFcRule.addEventListener('change', async () => {
            updateFcRuleUI();
            if (fcFolderGroups && fcFolderGroups.length > 0) {
                const exp = getFcExpectedCount();
                fcFolderGroups.forEach(grp => {
                    grp.isError = (grp.files.length !== exp);
                });
                sortFolderGroups(fcFolderGroups);
                await rebuildFcPackage(true);
                renderFcDashboardUI();
                renderFcAccordion();
                appendFcLog(`Switched rule to: ${exp} Files per folder. Folders re-validated.`, 'info');
            }
        });
        updateFcRuleUI();
    }

    // Dropzone listeners
    if (fcDropzone) {
        ['dragenter', 'dragover'].forEach(evt => {
            fcDropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                fcDropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            fcDropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                fcDropzone.classList.remove('dragover');
            });
        });

        fcDropzone.addEventListener('click', (e) => {
            if (e.target === fcFileInput || e.target === fcFolderInput) return;
            if (fcMode === 'files') {
                if (fcFileInput) fcFileInput.click();
            } else {
                if (fcFolderInput) fcFolderInput.click();
            }
        });

        fcDropzone.addEventListener('drop', async (e) => {
            let files = [];
            if (fcMode === 'files') {
                if (e.dataTransfer.files.length > 0) files = Array.from(e.dataTransfer.files);
            } else {
                files = await getFilesFromDataTransfer(e.dataTransfer);
            }
            if (files.length > 0) handleFcFilesSelection(files);
        });
    }

    if (fcFileInput) {
        fcFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleFcFilesSelection(Array.from(e.target.files));
        });
    }

    if (fcFolderInput) {
        fcFolderInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleFcFilesSelection(Array.from(e.target.files));
        });
    }

    function handleFcFilesSelection(files) {
        let addedCount = 0;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop().toLowerCase();
            const isSystemFile = file.name.startsWith('.') || file.name.startsWith('~') || file.name === "Thumbs.db";

            if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
                continue;
            }
            if (isSystemFile) continue;

            if (fcMode === 'files') {
                const isDuplicate = fcFiles.some(f => f.name === file.name && f.size === file.size);
                if (!isDuplicate) {
                    file.customRelativePath = file.name;
                    file.id = 'fc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
                    fcFiles.push(file);
                    addedCount++;
                }
            } else {
                const relativePath = file.customRelativePath || file.webkitRelativePath || file.name;
                const normalizedPath = relativePath.replace(/\\/g, '/');
                const pathParts = normalizedPath.split('/');
                if (pathParts.length > 1) {
                    const folderName = pathParts[pathParts.length - 2];
                    const cleanRelativePath = `${folderName}/${file.name}`;
                    const isDuplicate = fcFiles.some(f => f.customRelativePath === cleanRelativePath && f.size === file.size);
                    if (!isDuplicate) {
                        file.customRelativePath = cleanRelativePath;
                        file.folderName = folderName;
                        file.id = 'fc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
                        fcFiles.push(file);
                        addedCount++;
                    }
                }
            }
        }
        selectedFolderFiles = fcFiles;
        updateFcUploadedFileListUI();
        if (addedCount > 0) {
            appendFcLog(`Added ${addedCount} file(s) to selection.`);
        }
    }

    function updateFcUploadedFileListUI() {
        if (!fcUploadedFileList) return;
        fcUploadedFileList.innerHTML = '';
        if (fcSelectedCount) fcSelectedCount.textContent = fcFiles.length;

        if (fcFiles.length === 0) {
            if (fcSelectedFilesCard) fcSelectedFilesCard.style.display = 'none';
            if (fcBtn) fcBtn.disabled = true;
            return;
        }

        fcFiles.forEach((file, index) => {
            const isMerged = checkIsMergedFile(file);
            const tagClass = isMerged ? 'tag-mapping' : 'tag-rename';
            const tagText = isMerged ? 'Merged File' : (file.folderName ? `Folder: ${file.folderName}` : 'Prefix File');
            const displayName = file.customRelativePath || file.name;

            const div = document.createElement('div');
            div.className = 'fc-file-row';
            div.style.padding = '6px 10px';
            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px;">
                    <i class="fa-regular fa-file-excel" style="color: #059669; font-size: 1.1rem;"></i>
                    <div>
                        <div style="font-weight: 600; font-size: 0.82rem; color: #1e293b; word-break: break-all;">
                            ${displayName}
                            <span class="file-tag ${tagClass}" style="font-size: 0.7rem; padding: 2px 6px;">${tagText}</span>
                        </div>
                        <span style="font-size: 0.72rem; color: #64748b;">${formatBytes(file.size || 0)}</span>
                    </div>
                </div>
                <button type="button" class="btn-clear" data-index="${index}" style="background: none; border: none; color: #ef4444; font-size: 0.85rem; cursor: pointer;" title="Remove">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;

            div.querySelector('.btn-clear').addEventListener('click', () => {
                fcFiles.splice(index, 1);
                selectedFolderFiles = fcFiles;
                updateFcUploadedFileListUI();
            });

            fcUploadedFileList.appendChild(div);
        });

        if (fcSelectedFilesCard) fcSelectedFilesCard.style.display = 'block';
        if (fcBtn) fcBtn.disabled = false;
    }

    // Complete Clean Reset for Create Folder
    async function resetFolderCreateAll(askConfirm = true) {
        if (askConfirm && (fcFiles.length > 0 || fcFolderGroups.length > 0)) {
            if (!confirm("Are you sure you want to clean reset all files and folders in Create Folder?")) {
                return;
            }
        }

        // 1. Clear file arrays
        fcFiles = [];
        selectedFolderFiles = [];
        fcFolderGroups = [];
        if (fcOpenFolderPrefixes) fcOpenFolderPrefixes.clear();

        // 2. Clear blobs and filenames
        fcZipBlob = null;
        fcZipFilename = "";
        fcMissingReportBlob = null;

        // 3. Reset file inputs
        if (fcFileInput) fcFileInput.value = '';
        if (fcFolderInput) fcFolderInput.value = '';
        const hiddenUpload = document.getElementById('fcFolderUploadInput');
        if (hiddenUpload) hiddenUpload.value = '';

        // 4. Update UI - Selected files list
        if (fcSelectedCount) fcSelectedCount.textContent = '0';
        if (fcUploadedFileList) fcUploadedFileList.innerHTML = '';
        if (fcSelectedFilesCard) fcSelectedFilesCard.style.display = 'none';
        if (fcBtn) {
            fcBtn.disabled = true;
            fcBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> START FOLDER CREATE';
        }

        // 5. Hide output dashboard and progress card
        if (fcOutputContainer) {
            fcOutputContainer.innerHTML = '';
            fcOutputContainer.style.display = 'none';
        }
        if (fcProgressCard) {
            fcProgressCard.style.display = 'none';
        }

        // 6. Stop countdown timer and clear IndexedDB session
        if (fcCountdownInterval) clearInterval(fcCountdownInterval);
        await clearFolderCreateSession();

        // 7. Reset Folder Manager modal if open
        closeFcFullscreenModal();
        if (modalFcAccordionContainer) {
            modalFcAccordionContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: #94a3b8;">
                    <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 0.75rem;"></i>
                    <p style="font-weight: 500;">No folders loaded.</p>
                </div>
            `;
        }

        // 8. Log message & notification
        appendFcLog('Clean Reset: All files, folders, and created packages have been cleared.', 'info');
        showCustomAlert('Reset Complete', 'Create Folder data and session have been cleared successfully.', 'info');
    }

    if (clearFcFilesBtn) {
        clearFcFilesBtn.addEventListener('click', () => {
            resetFolderCreateAll(false);
        });
    }

    const fcResetTopBtn = document.getElementById('fcResetTopBtn');
    if (fcResetTopBtn) {
        fcResetTopBtn.addEventListener('click', () => {
            resetFolderCreateAll(true);
        });
    }

    const modalFcResetBtn = document.getElementById('modalFcResetBtn');
    if (modalFcResetBtn) {
        modalFcResetBtn.addEventListener('click', () => {
            resetFolderCreateAll(true);
        });
    }

    // Sort helper: Error folders (< 3 files) appear FIRST!
    function sortFolderGroups(groups) {
        groups.sort((a, b) => {
            // First by error state (error folders first)
            if (a.isError && !b.isError) return -1;
            if (!a.isError && b.isError) return 1;

            // Then numerically/alphabetically by prefix
            const numA = parseInt(a.prefix, 10);
            const numB = parseInt(b.prefix, 10);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return a.prefix.localeCompare(b.prefix, undefined, { numeric: true, sensitivity: 'base' });
        });
    }

    // MAIN EXECUTION: Group & Validate Strict 3-File Rule
    if (fcBtn) {
        fcBtn.addEventListener('click', async () => {
            if (fcFiles.length === 0) return;

            fcBtn.disabled = true;
            if (fcProgressCard) {
                fcProgressCard.style.display = 'block';
                fcProgressBar.style.width = '10%';
                fcProgressPercent.textContent = '10%';
                fcProgressStepText.textContent = 'Analyzing and grouping files...';
            }
            appendFcLog(`Starting Folder Create process with Strict ${getFcExpectedCount()}-File Rule...`);

            try {
                // Grouping
                const groupsMap = {};
                let commonMergedFile = null;

                if (fcMode === 'files') {
                    // Check if there is a common merged file
                    const mergedCandidates = fcFiles.filter(checkIsMergedFile);
                    if (mergedCandidates.length === 1 && !mergedCandidates[0].name.includes('-')) {
                        commonMergedFile = mergedCandidates[0];
                        appendFcLog(`Detected Common Merged File: ${commonMergedFile.name}`);
                    }

                    fcFiles.forEach(file => {
                        if (file === commonMergedFile) return;

                        // Extract prefix before first '-'
                        let prefix = '';
                        if (file.name.includes('-')) {
                            prefix = file.name.split('-', 1)[0].trim();
                        } else {
                            prefix = 'Unassigned';
                        }

                        if (!groupsMap[prefix]) {
                            groupsMap[prefix] = {
                                prefix: prefix,
                                files: [],
                                isError: false
                            };
                        }

                        groupsMap[prefix].files.push({
                            id: file.id || 'f_' + Math.random().toString(36).substring(2, 9),
                            name: file.name,
                            size: file.size,
                            file: file,
                            customRelativePath: `${prefix}/${file.name}`
                        });
                    });

                    // If common merged file exists, clone into all prefix groups
                    if (commonMergedFile) {
                        const prefixes = Object.keys(groupsMap);
                        for (const p of prefixes) {
                            const alreadyHas = groupsMap[p].files.some(f => checkIsMergedFile(f));
                            if (!alreadyHas) {
                                groupsMap[p].files.unshift({
                                    id: 'm_' + p + '_' + Date.now(),
                                    name: commonMergedFile.name,
                                    size: commonMergedFile.size,
                                    file: commonMergedFile,
                                    customRelativePath: `${p}/${commonMergedFile.name}`
                                });
                            }
                        }
                    }
                } else {
                    // Folders mode: group by file.folderName
                    fcFiles.forEach(file => {
                        const prefix = file.folderName || 'Unassigned';
                        if (!groupsMap[prefix]) {
                            groupsMap[prefix] = {
                                prefix: prefix,
                                files: [],
                                isError: false
                            };
                        }
                        groupsMap[prefix].files.push({
                            id: file.id || 'f_' + Math.random().toString(36).substring(2, 9),
                            name: file.name,
                            size: file.size,
                            file: file,
                            customRelativePath: `${prefix}/${file.name}`
                        });
                    });
                }

                const expCount = getFcExpectedCount();
                if (fcProgressBar) {
                    fcProgressBar.style.width = '45%';
                    fcProgressPercent.textContent = '45%';
                    fcProgressStepText.textContent = `Validating ${expCount} files per folder...`;
                }

                // Dynamic File validation (2 or 3 files)
                fcFolderGroups = Object.values(groupsMap);
                fcFolderGroups.forEach(grp => {
                    grp.isError = (grp.files.length !== expCount);
                });

                // Sort incomplete folders to top
                sortFolderGroups(fcFolderGroups);

                if (fcProgressBar) {
                    fcProgressBar.style.width = '75%';
                    fcProgressPercent.textContent = '75%';
                    fcProgressStepText.textContent = 'Generating ZIP & Missing Files Report...';
                }

                // Build JSZip in memory
                await rebuildFcPackage(true);

                if (fcProgressBar) {
                    fcProgressBar.style.width = '100%';
                    fcProgressPercent.textContent = '100%';
                    fcProgressStepText.textContent = 'Complete!';
                }

                setTimeout(() => {
                    if (fcProgressCard) fcProgressCard.style.display = 'none';
                }, 800);

                // Render Dashboard Result Card
                renderFcDashboardUI();

                // Save session in IndexedDB (1 hour)
                await saveFolderCreateSession();
                startFcCountdownTimer(3600);

                const totalFolders = fcFolderGroups.length;
                const incompleteCount = fcFolderGroups.filter(f => f.isError).length;
                const readyCount = totalFolders - incompleteCount;

                const expCountAfter = getFcExpectedCount();
                appendFcLog(`Folder Create completed. Total: ${totalFolders}, Ready (${expCountAfter} Files): ${readyCount}, Errors (< ${expCountAfter} Files): ${incompleteCount}.`, incompleteCount > 0 ? 'warning' : 'success');

                if (incompleteCount > 0) {
                    showCustomAlert(
                        'Folders Created with Incomplete Files',
                        `${incompleteCount} folder(s) have fewer than ${expCountAfter} files and triggered an ERROR! They are displayed first in the Folder Manager.`,
                        'warning'
                    );
                } else {
                    showCustomAlert(
                        'Folder Create Successful',
                        `All ${totalFolders} folder(s) have exactly ${expCountAfter} files! Your package is ready.`,
                        'success'
                    );
                }

            } catch (err) {
                console.error('Error creating folders:', err);
                if (fcProgressCard) fcProgressCard.style.display = 'none';
                appendFcLog(`Error: ${err.message}`, 'error');
                showCustomAlert('Folder Create Error', err.message, 'error');
            } finally {
                fcBtn.disabled = false;
            }
        });
    }

    // Rebuild ZIP package in memory dynamically (triggered on rename, delete, copy)
    async function rebuildFcPackage(silent = false) {
        if (!fcFolderGroups || fcFolderGroups.length === 0) {
            fcZipBlob = null;
            fcMissingReportBlob = null;
            return;
        }

        const zip = new JSZip();
        const foldersWithIssues = [];
        let hasMissing = false;

        const expCount = getFcExpectedCount();
        fcFolderGroups.forEach(grp => {
            // Dynamic rule: exactly expCount files required
            grp.isError = (grp.files.length !== expCount);
            if (grp.isError) {
                foldersWithIssues.push(grp);
                hasMissing = true;
            }

            const folder = zip.folder(grp.prefix);
            grp.files.forEach(fObj => {
                folder.file(fObj.name, fObj.blob || fObj.file);
            });
        });

        // Re-sort so error folders (< expCount files) appear first
        sortFolderGroups(fcFolderGroups);

        if (hasMissing) {
            const reportData = [
                ["Folder Name (Prefix)", "Files Found", "Current Files", "Status"]
            ];
            foldersWithIssues.forEach(item => {
                const fileNamesStr = item.files.map(f => f.name).join(", ");
                const statusStr = item.files.length < expCount
                    ? `File Missing (Found ${item.files.length}, Expected ${expCount})`
                    : `Extra Files Present (Found ${item.files.length}, Expected ${expCount})`;
                reportData.push([
                    item.prefix,
                    item.files.length,
                    fileNamesStr,
                    statusStr
                ]);
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(reportData);
            XLSX.utils.book_append_sheet(wb, ws, "Missing Files Log");
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            fcMissingReportBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            zip.file("Missing_Files_Report.xlsx", excelBuffer);
        } else {
            fcMissingReportBlob = null;
        }

        let zipFilename = "Grouped_Folders.zip";
        if (fcFolderGroups.length === 1) {
            zipFilename = `${fcFolderGroups[0].prefix}.zip`;
        } else if (fcFolderGroups.length > 1) {
            zipFilename = `${fcFolderGroups[0].prefix}-${fcFolderGroups[fcFolderGroups.length - 1].prefix}.zip`;
        }
        fcZipFilename = zipFilename;
        fcZipBlob = await zip.generateAsync({ type: 'blob' });

        // Update UI
        renderFcDashboardUI();
        if (fcFullscreenModal && fcFullscreenModal.style.display !== 'none') {
            renderFcAccordion(fcModalCurrentFilter);
        }

        // Save session update
        saveFolderCreateSession();

        if (!silent) {
            appendFcLog(`Package updated: ${zipFilename} re-zipped with current files.`);
        }
    }

    // Render Tab 4 Dashboard Output Card
    function renderFcDashboardUI() {
        if (!fcOutputContainer) return;
        if (!fcFolderGroups || fcFolderGroups.length === 0) {
            fcOutputContainer.style.display = 'none';
            return;
        }

        const totalFolders = fcFolderGroups.length;
        const incompleteCount = fcFolderGroups.filter(f => f.isError).length;
        const readyCount = totalFolders - incompleteCount;

        fcOutputContainer.innerHTML = `
            <div class="card result-card" style="display: block; margin-top: 1.5rem; padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; background: ${incompleteCount > 0 ? '#fee2e2' : '#ecfdf5'}; color: ${incompleteCount > 0 ? '#dc2626' : '#059669'};">
                            <i class="fa-solid fa-${incompleteCount > 0 ? 'triangle-exclamation' : 'circle-check'}"></i>
                        </div>
                        <div>
                            <h2 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: #1e293b;">
                                ${incompleteCount > 0 ? 'Folder Create Completed with Errors' : 'Folder Create Completed Successfully!'}
                            </h2>
                            <div style="font-size: 0.82rem; color: #64748b; margin-top: 2px;">
                                ${incompleteCount > 0 ? `${incompleteCount} folder(s) have missing files (< ${getFcExpectedCount()} files). Fix them in Folder Manager.` : `All ${totalFolders} folder(s) have exactly ${getFcExpectedCount()} files! Ready for Invoice Arrange.`}
                            </div>
                        </div>
                    </div>
                    <div id="fcTimerBadge" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 8px; font-size: 0.78rem; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-regular fa-clock" style="color: #6366f1;"></i> Auto-Saved (60:00)
                    </div>
                </div>

                <!-- Stats Bar -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 1.25rem;">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Total Folders</div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: #1e293b;" id="fcTotalStat">${totalFolders}</div>
                    </div>
                    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 0.75rem; color: #059669; font-weight: 600; text-transform: uppercase;">Ready (${getFcExpectedCount()} Files)</div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: #059669;" id="fcReadyStat">${readyCount}</div>
                    </div>
                    <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 12px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 0.75rem; color: #dc2626; font-weight: 600; text-transform: uppercase;">Error / Incomplete</div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: #dc2626;" id="fcErrorStat">${incompleteCount}</div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button type="button" class="btn btn-download" id="fcDownloadZipBtn" style="padding: 10px 18px; font-weight: 700; font-size: 0.9rem; border-radius: 8px;">
                        <i class="fa-solid fa-file-zipper"></i> Download Folder ZIP
                    </button>
                    <button type="button" class="btn btn-secondary" id="fcDownloadReportBtn" style="padding: 10px 16px; font-weight: 600; font-size: 0.88rem; border-radius: 8px; display: ${incompleteCount > 0 ? 'inline-flex' : 'none'}; align-items: center; gap: 6px; background: #fff; border: 1.5px solid #cbd5e1;">
                        <i class="fa-solid fa-file-excel" style="color: #059669;"></i> Download Missing Report
                    </button>
                    <button type="button" class="btn" id="openFcFullscreenBtn" style="padding: 10px 18px; font-weight: 700; font-size: 0.9rem; border-radius: 8px; background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; border: none; cursor: pointer;">
                        <i class="fa-solid fa-expand"></i> Folder Manager (Full View)
                    </button>
                    <button type="button" class="btn btn-move-folder" id="fcMoveToInvoiceBtn" style="padding: 10px 18px; font-weight: 700; font-size: 0.9rem; border-radius: 8px; background: linear-gradient(135deg, #4f46e5, #4338ca); color: #fff; border: none; cursor: pointer;">
                        <i class="fa-solid fa-file-invoice"></i> Move to Invoice Arrange
                    </button>
                    <button type="button" class="btn btn-danger" id="fcResetDashboardBtn" style="padding: 10px 18px; font-weight: 700; font-size: 0.9rem; border-radius: 8px; background: #fee2e2; color: #dc2626; border: 1.5px solid #fca5a5; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-rotate-left"></i> Reset / Clear All
                    </button>
                </div>
            </div>
        `;

        fcOutputContainer.style.display = 'block';

        // Bind dashboard button listeners
        const dlZipBtn = document.getElementById('fcDownloadZipBtn');
        if (dlZipBtn) {
            dlZipBtn.addEventListener('click', () => {
                if (!fcZipBlob) return;
                const url = URL.createObjectURL(fcZipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fcZipFilename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });
        }

        const dlReportBtn = document.getElementById('fcDownloadReportBtn');
        if (dlReportBtn) {
            dlReportBtn.addEventListener('click', () => {
                if (!fcMissingReportBlob) {
                    alert('No missing files found!');
                    return;
                }
                const url = URL.createObjectURL(fcMissingReportBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Missing_Files_Report.xlsx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });
        }

        const openFsBtn = document.getElementById('openFcFullscreenBtn');
        if (openFsBtn) {
            openFsBtn.addEventListener('click', openFcFullscreenModal);
        }

        const moveInvBtn = document.getElementById('fcMoveToInvoiceBtn');
        if (moveInvBtn) {
            moveInvBtn.addEventListener('click', moveToInvoiceArrangeFromFolderCreate);
        }

        const resetDashBtn = document.getElementById('fcResetDashboardBtn');
        if (resetDashBtn) {
            resetDashBtn.addEventListener('click', () => {
                resetFolderCreateAll(true);
            });
        }
    }

    // Fullscreen Folder Manager Modal
    function openFcFullscreenModal() {
        if (!fcFullscreenModal) return;
        fcFullscreenModal.classList.add('show', 'active');
        fcFullscreenModal.style.display = 'flex';
        renderFcAccordion(fcModalCurrentFilter);
    }

    function closeFcFullscreenModal() {
        if (fcFullscreenModal) {
            fcFullscreenModal.classList.remove('show', 'active');
            fcFullscreenModal.style.display = 'none';
        }
    }

    if (closeFcModalBtn) closeFcModalBtn.addEventListener('click', closeFcFullscreenModal);
    if (modalFcFooterCloseBtn) modalFcFooterCloseBtn.addEventListener('click', closeFcFullscreenModal);

    if (modalFcDownloadZipBtn) {
        modalFcDownloadZipBtn.addEventListener('click', () => {
            const btn = document.getElementById('fcDownloadZipBtn');
            if (btn) btn.click();
        });
    }

    if (modalFcDownloadReportBtn) {
        modalFcDownloadReportBtn.addEventListener('click', () => {
            const btn = document.getElementById('fcDownloadReportBtn');
            if (btn) btn.click();
        });
    }

    if (modalFcMoveToInvoiceBtn) {
        modalFcMoveToInvoiceBtn.addEventListener('click', moveToInvoiceArrangeFromFolderCreate);
    }
    if (modalFcFooterMoveToInvoiceBtn) {
        modalFcFooterMoveToInvoiceBtn.addEventListener('click', moveToInvoiceArrangeFromFolderCreate);
    }

    // Modal Filters (All / Incomplete / Ready)
    const filterAllBtn = document.getElementById('modalFcFilterAllBtn');
    const filterIncBtn = document.getElementById('modalFcFilterIncompleteBtn');
    const filterRdyBtn = document.getElementById('modalFcFilterReadyBtn');

    [filterAllBtn, filterIncBtn, filterRdyBtn].forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            [filterAllBtn, filterIncBtn, filterRdyBtn].forEach(b => b && b.classList.remove('active'));
            btn.classList.add('active');
            fcModalCurrentFilter = btn.getAttribute('data-filter') || 'all';
            renderFcAccordion(fcModalCurrentFilter);
        });
    });

    if (modalFcSearchInput) {
        modalFcSearchInput.addEventListener('input', () => {
            renderFcAccordion(fcModalCurrentFilter);
        });
    }

    // Folder Upload State and Helpers
    const fcOpenFolderPrefixes = new Set();
    let fcUploadTargetPrefix = null;
    let fcHiddenUploadInput = null;

    function initFcHiddenUploadInput() {
        if (!fcHiddenUploadInput) {
            fcHiddenUploadInput = document.getElementById('fcFolderUploadInput');
            if (!fcHiddenUploadInput) {
                fcHiddenUploadInput = document.createElement('input');
                fcHiddenUploadInput.id = 'fcFolderUploadInput';
                fcHiddenUploadInput.type = 'file';
                fcHiddenUploadInput.multiple = true;
                fcHiddenUploadInput.accept = '.xlsx,.xls,.csv';
                fcHiddenUploadInput.style.display = 'none';
                document.body.appendChild(fcHiddenUploadInput);
            }

            fcHiddenUploadInput.addEventListener('change', async (e) => {
                if (e.target.files && e.target.files.length > 0 && fcUploadTargetPrefix) {
                    const targetPrefix = fcUploadTargetPrefix;
                    const selectedFiles = Array.from(e.target.files);
                    await handleFcUploadToFolder(targetPrefix, selectedFiles);
                }
                fcHiddenUploadInput.value = '';
                fcUploadTargetPrefix = null;
            });
        }
    }

    function triggerFcUploadForFolder(prefix) {
        initFcHiddenUploadInput();
        fcUploadTargetPrefix = prefix;
        fcHiddenUploadInput.value = '';
        fcHiddenUploadInput.click();
    }

    async function handleFcUploadToFolder(prefix, selectedFiles) {
        let grp = fcFolderGroups.find(g => g.prefix === prefix);
        if (!grp) {
            grp = {
                prefix: prefix,
                files: [],
                isError: true
            };
            fcFolderGroups.push(grp);
        }

        const expCount = getFcExpectedCount();
        let addedCount = 0;

        for (const file of selectedFiles) {
            let finalName = file.name;
            if (!finalName.startsWith(`${prefix}-`) && !finalName.startsWith(`${prefix}_`)) {
                finalName = `${prefix}-${file.name}`;
            }

            const existingIdx = grp.files.findIndex(f => f.name === finalName);
            const fileObj = {
                id: 'u_' + prefix + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                name: finalName,
                size: file.size,
                blob: file,
                file: file,
                customRelativePath: `${prefix}/${finalName}`
            };

            if (existingIdx !== -1) {
                grp.files[existingIdx] = fileObj;
            } else {
                grp.files.push(fileObj);
            }

            file.customRelativePath = `${prefix}/${finalName}`;
            fcFiles.push(file);
            addedCount++;
        }

        selectedFolderFiles = fcFiles;
        grp.isError = (grp.files.length !== expCount);
        fcOpenFolderPrefixes.add(prefix);

        appendFcLog(`Uploaded ${addedCount} file(s) into folder [${prefix}]. Folder now has ${grp.files.length}/${expCount} files.`, 'success');

        await rebuildFcPackage();

        if (!grp.isError) {
            showCustomAlert(
                'Folder Completed! ✅',
                `Folder [${prefix}] now has all ${expCount} files! Error removed successfully.`,
                'success'
            );
        } else {
            showCustomAlert(
                'File Attached',
                `Added ${addedCount} file(s) to folder [${prefix}] (${grp.files.length}/${expCount} files).`,
                'info'
            );
        }
    }

    // Render Folder Accordion inside Fullscreen Modal
    function renderFcAccordion(filter = 'all') {
        if (!modalFcAccordionContainer) return;
        modalFcAccordionContainer.innerHTML = '';

        const totalFolders = fcFolderGroups.length;
        const incompleteCount = fcFolderGroups.filter(f => f.isError).length;
        const readyCount = totalFolders - incompleteCount;

        // Update badges
        if (modalFcTotalBadge) modalFcTotalBadge.innerHTML = `<i class="fa-solid fa-folder"></i> Total: ${totalFolders} Folders`;
        const expCount = getFcExpectedCount();
        if (modalFcReadyBadge) modalFcReadyBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Ready (${expCount} Files): ${readyCount}`;
        if (modalFcErrorBadge) modalFcErrorBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Incomplete (< ${expCount} Files): ${incompleteCount} (Shown First)`;

        if (modalFcDownloadReportBtn) {
            modalFcDownloadReportBtn.style.display = incompleteCount > 0 ? 'inline-flex' : 'none';
        }

        if (filterAllBtn) filterAllBtn.innerText = `All Folders (${totalFolders})`;
        if (filterIncBtn) filterIncBtn.innerText = `⚠️ Errors / Incomplete (${incompleteCount})`;
        if (filterRdyBtn) filterRdyBtn.innerText = `✅ Ready (${getFcExpectedCount()} Files) (${readyCount})`;

        const query = (modalFcSearchInput ? modalFcSearchInput.value : '').trim().toLowerCase();

        const filtered = fcFolderGroups.filter(grp => {
            if (filter === 'incomplete' && !grp.isError) return false;
            if (filter === 'ready' && grp.isError) return false;

            if (query !== '') {
                const prefixMatch = grp.prefix.toLowerCase().includes(query);
                const fileMatch = grp.files.some(f => f.name.toLowerCase().includes(query));
                if (!prefixMatch && !fileMatch) return false;
            }
            return true;
        });

        if (modalFcSummaryText) {
            modalFcSummaryText.innerText = `Showing ${filtered.length} of ${totalFolders} folder(s)`;
        }

        if (filtered.length === 0) {
            modalFcAccordionContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: #94a3b8;">
                    <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 0.75rem;"></i>
                    <p style="font-weight: 500;">No folders matching the current filter/search.</p>
                </div>
            `;
            return;
        }

        filtered.forEach((grp) => {
            const card = document.createElement('div');
            // Keep folder open if error OR previously opened by user
            const isOpen = grp.isError || fcOpenFolderPrefixes.has(grp.prefix);
            card.className = `fc-folder-card ${grp.isError ? 'error-card' : 'success-card'} ${isOpen ? 'open' : ''}`;

            const isOk = grp.files.length === expCount;
            const badgeColor = isOk ? '#059669' : '#dc2626';
            const badgeBg = isOk ? '#ecfdf5' : '#fee2e2';
            const badgeBorder = isOk ? '#a7f3d0' : '#fca5a5';
            const missingDiff = expCount - grp.files.length;
            const badgeText = isOk
                ? `✅ ${expCount} Files (Complete)`
                : `⚠️ ${grp.files.length} / ${expCount} Files (${missingDiff > 0 ? `Missing ${missingDiff}` : `Extra ${-missingDiff}`})`;

            // Header
            const header = document.createElement('div');
            header.className = 'fc-folder-header';
            header.innerHTML = `
                <div class="fc-folder-title-left">
                    <div class="fc-folder-icon">
                        <i class="fa-solid fa-folder${grp.isError ? '-open' : ''}"></i>
                    </div>
                    <div>
                        <div class="fc-folder-name">Folder [${grp.prefix}]</div>
                        <div style="font-size: 0.75rem; color: #64748b;">${grp.files.length} of ${expCount} file(s) attached</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                    <button type="button" class="btn fc-header-upload-btn" title="Upload / Attach file directly into Folder [${grp.prefix}]" style="padding: 4px 11px; font-size: 0.76rem; font-weight: 700; border-radius: 6px; background: #059669; color: white; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 1px 3px rgba(5,150,105,0.25);">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Upload File
                    </button>
                    <span style="background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-size: 0.78rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 6px;">
                        ${badgeText}
                    </span>
                    <i class="fa-solid fa-chevron-down fc-chevron"></i>
                </div>
            `;
            header.addEventListener('click', () => {
                card.classList.toggle('open');
                if (card.classList.contains('open')) {
                    fcOpenFolderPrefixes.add(grp.prefix);
                } else {
                    fcOpenFolderPrefixes.delete(grp.prefix);
                }
            });

            // Header upload button click
            const headerUploadBtn = header.querySelector('.fc-header-upload-btn');
            if (headerUploadBtn) {
                headerUploadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    triggerFcUploadForFolder(grp.prefix);
                });
            }

            card.appendChild(header);

            // Body
            const body = document.createElement('div');
            body.className = 'fc-folder-body';

            // Drag & Drop directly onto card
            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                card.style.borderColor = '#059669';
                card.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.2)';
            });
            card.addEventListener('dragleave', (e) => {
                e.preventDefault();
                card.style.borderColor = '';
                card.style.boxShadow = '';
            });
            card.addEventListener('drop', async (e) => {
                e.preventDefault();
                card.style.borderColor = '';
                card.style.boxShadow = '';
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    await handleFcUploadToFolder(grp.prefix, Array.from(e.dataTransfer.files));
                }
            });

            // Files list
            grp.files.forEach((fileObj, fIdx) => {
                const fileRow = document.createElement('div');
                fileRow.className = 'fc-file-row';

                fileRow.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 0.6rem; min-width: 250px; flex: 1;">
                        <i class="fa-solid fa-file-excel" style="color: #059669; font-size: 1.1rem;"></i>
                        <div>
                            <div style="font-weight: 600; font-size: 0.85rem; color: #1e293b; word-break: break-all;">${fileObj.name}</div>
                            <div style="font-size: 0.72rem; color: #64748b;">${formatBytes(fileObj.size || 0)}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                        <button type="button" class="btn fc-view-file-btn" style="font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 6px; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-weight: 600; cursor: pointer;">
                            <i class="fa-solid fa-eye"></i> View
                        </button>
                        <button type="button" class="btn fc-copy-file-btn" style="font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 6px; background: #ede9fe; color: #6d28d9; border: 1px solid #d8b4fe; font-weight: 600; cursor: pointer;">
                            <i class="fa-solid fa-copy"></i> Copy to Folder
                        </button>
                        <button type="button" class="btn fc-rename-file-btn" style="font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 6px; background: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-weight: 600; cursor: pointer;">
                            <i class="fa-solid fa-pen-to-square"></i> Rename
                        </button>
                        <button type="button" class="btn fc-download-file-btn" style="font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 6px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; font-weight: 600; cursor: pointer;">
                            <i class="fa-solid fa-download"></i> Download
                        </button>
                        <button type="button" class="btn fc-delete-file-btn" style="font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 6px; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; font-weight: 600; cursor: pointer;">
                            <i class="fa-solid fa-trash-can"></i> Delete
                        </button>
                    </div>
                `;

                // View first 50 rows
                fileRow.querySelector('.fc-view-file-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    viewFcFile(grp.prefix, fIdx);
                });

                // Copy file to other incomplete folders
                fileRow.querySelector('.fc-copy-file-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    openFcCopyFileModal(fileObj, grp.prefix);
                });

                // Rename file (locked extension)
                fileRow.querySelector('.fc-rename-file-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    renameFcFile(grp.prefix, fIdx);
                });

                // Download single file
                fileRow.querySelector('.fc-download-file-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    downloadFcSingleFile(grp.prefix, fIdx);
                });

                // Delete file
                fileRow.querySelector('.fc-delete-file-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteFcFile(grp.prefix, fIdx);
                });

                body.appendChild(fileRow);
            });

            // If missing files: render Missing File Slot Cards with direct upload button
            if (missingDiff > 0) {
                for (let mIdx = 1; mIdx <= missingDiff; mIdx++) {
                    const slotNum = grp.files.length + mIdx;
                    const missingCard = document.createElement('div');
                    missingCard.className = 'fc-missing-file-slot';
                    missingCard.style.cssText = `
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        background: #fff5f5;
                        border: 2px dashed #f87171;
                        border-radius: 8px;
                        padding: 10px 14px;
                        margin-top: 10px;
                        gap: 12px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    `;
                    missingCard.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 800; border: 1.5px solid #fca5a5; flex-shrink: 0;">
                                ${slotNum}
                            </div>
                            <div>
                                <div style="font-weight: 700; font-size: 0.85rem; color: #dc2626; display: flex; align-items: center; gap: 6px;">
                                    <i class="fa-solid fa-triangle-exclamation"></i> Missing File #${slotNum} in Folder [${grp.prefix}]
                                </div>
                                <div style="font-size: 0.74rem; color: #ef4444; margin-top: 2px;">
                                    Click here or use the button to attach the missing file (DropShip / IndoPrimo)
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn fc-upload-slot-btn" style="padding: 6px 14px; font-size: 0.8rem; font-weight: 700; border-radius: 6px; background: #dc2626; color: white; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.25); white-space: nowrap; flex-shrink: 0;">
                            <i class="fa-solid fa-cloud-arrow-up"></i> Upload File
                        </button>
                    `;
                    missingCard.addEventListener('click', (e) => {
                        e.stopPropagation();
                        triggerFcUploadForFolder(grp.prefix);
                    });
                    missingCard.querySelector('.fc-upload-slot-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        triggerFcUploadForFolder(grp.prefix);
                    });
                    missingCard.addEventListener('mouseenter', () => {
                        missingCard.style.background = '#fef2f2';
                        missingCard.style.borderColor = '#ef4444';
                    });
                    missingCard.addEventListener('mouseleave', () => {
                        missingCard.style.background = '#fff5f5';
                        missingCard.style.borderColor = '#f87171';
                    });
                    body.appendChild(missingCard);
                }
            } else {
                const completeRow = document.createElement('div');
                completeRow.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 10px;
                    padding-top: 8px;
                    border-top: 1px dashed #e2e8f0;
                `;
                completeRow.innerHTML = `
                    <span style="font-size: 0.78rem; color: #059669; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">
                        <i class="fa-solid fa-circle-check"></i> All ${expCount} files attached
                    </span>
                    <button type="button" class="btn fc-add-more-btn" style="padding: 4px 10px; font-size: 0.75rem; font-weight: 600; border-radius: 6px; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                        <i class="fa-solid fa-plus"></i> Add Another File
                    </button>
                `;
                completeRow.querySelector('.fc-add-more-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    triggerFcUploadForFolder(grp.prefix);
                });
                body.appendChild(completeRow);
            }

            card.appendChild(body);
            modalFcAccordionContainer.appendChild(card);
        });
    }

    // View file (first 50 rows lag-free)
    async function viewFcFile(prefix, fileIndex) {
        const grp = fcFolderGroups.find(g => g.prefix === prefix);
        if (!grp || !grp.files[fileIndex]) return;
        const fileObj = grp.files[fileIndex];

        showLoader(`Loading preview for ${fileObj.name}...`);
        try {
            let buffer;
            if (fileObj.blob) {
                buffer = await fileObj.blob.arrayBuffer();
            } else if (fileObj.file) {
                buffer = await fileObj.file.arrayBuffer();
            } else {
                throw new Error('File data is not available.');
            }

            const wb = XLSX.read(buffer, { type: 'array', sheetRows: 51 });
            const sheetName = wb.SheetNames[0];
            const sheet = wb.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

            hideLoader();

            if (!excelPreviewThead || !excelPreviewTbody || !renameExcelPreviewModal) return;

            excelPreviewThead.innerHTML = '';
            excelPreviewTbody.innerHTML = '';
            if (excelPreviewModalTitle) {
                excelPreviewModalTitle.textContent = `${fileObj.name} (Folder: ${prefix})`;
            }

            if (!rows || rows.length === 0) {
                excelPreviewTbody.innerHTML = '<tr><td colspan="100%" style="text-align: center; padding: 20px;">Sheet is empty.</td></tr>';
            } else {
                const headerRow = rows[0];
                const trHead = document.createElement('tr');
                const thNum = document.createElement('th');
                thNum.className = 'excel-row-num';
                thNum.textContent = '#';
                trHead.appendChild(thNum);

                headerRow.forEach((colName, colIdx) => {
                    const th = document.createElement('th');
                    th.textContent = colName !== undefined && colName !== null && colName !== '' ? colName : `Col ${colIdx + 1}`;
                    trHead.appendChild(th);
                });
                excelPreviewThead.appendChild(trHead);

                const dataRows = rows.slice(1, 51);
                dataRows.forEach((row, rowIdx) => {
                    const tr = document.createElement('tr');
                    const tdNum = document.createElement('td');
                    tdNum.className = 'excel-row-num';
                    tdNum.textContent = rowIdx + 1;
                    tr.appendChild(tdNum);

                    for (let c = 0; c < headerRow.length; c++) {
                        const td = document.createElement('td');
                        const val = row[c];
                        td.textContent = val !== undefined && val !== null ? val : '';
                        td.title = td.textContent;
                        tr.appendChild(td);
                    }
                    excelPreviewTbody.appendChild(tr);
                });
            }

            renameExcelPreviewModal.style.display = 'flex';
        } catch (err) {
            hideLoader();
            console.error('Error previewing file:', err);
            showCustomAlert('Preview Error', 'Failed to preview file: ' + err.message, 'error');
        }
    }

    // Rename file with locked extension
    function renameFcFile(prefix, fileIndex) {
        const grp = fcFolderGroups.find(g => g.prefix === prefix);
        if (!grp || !grp.files[fileIndex]) return;
        const fileObj = grp.files[fileIndex];

        const lastDot = fileObj.name.lastIndexOf('.');
        const stem = lastDot !== -1 ? fileObj.name.slice(0, lastDot) : fileObj.name;
        const ext = lastDot !== -1 ? fileObj.name.slice(lastDot) : '.xlsx';

        const newStem = prompt(`Enter new filename for "${fileObj.name}" (extension ${ext} is locked):`, stem);
        if (newStem === null) return;
        const cleanStem = newStem.trim();
        if (!cleanStem) {
            alert('Filename cannot be empty.');
            return;
        }
        if (/[\\/:*?"<>|]/.test(cleanStem)) {
            alert('Filename cannot contain \\ / : * ? " < > |');
            return;
        }

        const newFullName = cleanStem + ext;
        fileObj.name = newFullName;
        fileObj.customRelativePath = `${prefix}/${newFullName}`;
        appendFcLog(`Renamed file in folder [${prefix}] to: ${newFullName}`);
        rebuildFcPackage();
    }

    // Delete single file from folder
    function deleteFcFile(prefix, fileIndex) {
        const grp = fcFolderGroups.find(g => g.prefix === prefix);
        if (!grp || !grp.files[fileIndex]) return;
        const fileName = grp.files[fileIndex].name;

        if (!confirm(`Are you sure you want to remove "${fileName}" from folder [${prefix}]?`)) return;

        const expCount = getFcExpectedCount();
        grp.files.splice(fileIndex, 1);
        grp.isError = (grp.files.length !== expCount);
        appendFcLog(`Deleted "${fileName}" from folder [${prefix}]. Folder now has ${grp.files.length}/${expCount} files.`);
        rebuildFcPackage();
    }

    // Download single file from folder
    function downloadFcSingleFile(prefix, fileIndex) {
        const grp = fcFolderGroups.find(g => g.prefix === prefix);
        if (!grp || !grp.files[fileIndex]) return;
        const fileObj = grp.files[fileIndex];

        const source = fileObj.blob || fileObj.file;
        if (!source) return;
        const url = URL.createObjectURL(source);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileObj.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // OPEN COPY FILE TO INCOMPLETE FOLDERS MODAL
    function openFcCopyFileModal(sourceFile, sourcePrefix) {
        if (!fcMoveFileModal) return;
        fcSourceFileForCopy = sourceFile;
        fcSourcePrefixForCopy = sourcePrefix;

        if (fcMoveSourceFileName) {
            fcMoveSourceFileName.textContent = `${sourceFile.name} (from folder [${sourcePrefix}])`;
        }

        renderFcTargetFoldersList();
        fcMoveFileModal.classList.add('show');
        fcMoveFileModal.style.display = 'flex';
    }

    function closeFcCopyFileModal() {
        if (fcMoveFileModal) {
            fcMoveFileModal.classList.remove('show');
            fcMoveFileModal.style.display = 'none';
        }
        fcSourceFileForCopy = null;
        fcSourcePrefixForCopy = null;
    }

    if (fcMoveCancelBtn) fcMoveCancelBtn.addEventListener('click', closeFcCopyFileModal);

    function renderFcTargetFoldersList() {
        if (!fcMoveFoldersList) return;
        fcMoveFoldersList.innerHTML = '';

        // Target folders: folders with < expCount files, excluding sourcePrefix
        const expCount = getFcExpectedCount();
        const incompleteTargets = fcFolderGroups.filter(g => g.prefix !== fcSourcePrefixForCopy && g.files.length < expCount);

        const search = (fcMoveSearchInput ? fcMoveSearchInput.value : '').trim().toLowerCase();

        const displayTargets = incompleteTargets.filter(g => {
            if (search === '') return true;
            return g.prefix.toLowerCase().includes(search);
        });

        if (displayTargets.length === 0) {
            fcMoveFoldersList.innerHTML = `
                <div style="text-align: center; padding: 1.5rem 0.5rem; color: #94a3b8; font-size: 0.85rem;">
                    <i class="fa-solid fa-circle-check" style="color: #059669; font-size: 1.5rem; margin-bottom: 6px;"></i>
                    <p style="margin: 0;">No incomplete folders (< ${expCount} files) found!</p>
                </div>
            `;
            return;
        }

        displayTargets.forEach(grp => {
            const opt = document.createElement('div');
            opt.className = 'target-folder-option';

            const alreadyHasFile = grp.files.some(f => f.name === fcSourceFileForCopy.name);

            opt.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" class="fc-target-chk" value="${grp.prefix}" ${alreadyHasFile ? 'disabled' : 'checked'}>
                    <div>
                        <div style="font-weight: 600; font-size: 0.85rem; color: #1e293b;">Folder [${grp.prefix}]</div>
                        <div style="font-size: 0.72rem; color: ${alreadyHasFile ? '#b45309' : '#dc2626'}; font-weight: 500;">
                            ${alreadyHasFile ? '⚠️ Already contains this file' : `Current: ${grp.files.length}/${expCount} files (Needs ${expCount - grp.files.length})`}
                        </div>
                    </div>
                </div>
                <span class="rename-badge-pill error" style="font-size: 0.72rem; padding: 2px 6px;">${grp.files.length}/${expCount}</span>
            `;

            opt.addEventListener('click', (e) => {
                if (e.target.tagName.toLowerCase() === 'input' || alreadyHasFile) return;
                const chk = opt.querySelector('.fc-target-chk');
                chk.checked = !chk.checked;
                opt.classList.toggle('selected', chk.checked);
            });

            const chk = opt.querySelector('.fc-target-chk');
            if (chk.checked && !alreadyHasFile) opt.classList.add('selected');

            fcMoveFoldersList.appendChild(opt);
        });
    }

    if (fcMoveSearchInput) {
        fcMoveSearchInput.addEventListener('input', renderFcTargetFoldersList);
    }

    if (fcMoveSelectAllBtn) {
        fcMoveSelectAllBtn.addEventListener('click', () => {
            if (!fcMoveFoldersList) return;
            fcMoveFoldersList.querySelectorAll('.fc-target-chk:not(:disabled)').forEach(chk => {
                chk.checked = true;
                chk.closest('.target-folder-option').classList.add('selected');
            });
        });
    }

    if (fcMoveDeselectAllBtn) {
        fcMoveDeselectAllBtn.addEventListener('click', () => {
            if (!fcMoveFoldersList) return;
            fcMoveFoldersList.querySelectorAll('.fc-target-chk').forEach(chk => {
                chk.checked = false;
                chk.closest('.target-folder-option').classList.remove('selected');
            });
        });
    }

    // Confirm Copy File into selected incomplete folders
    if (fcMoveConfirmBtn) {
        fcMoveConfirmBtn.addEventListener('click', async () => {
            if (!fcSourceFileForCopy || !fcMoveFoldersList) return;

            const sourceFileName = fcSourceFileForCopy.name;
            const sourceFileSize = fcSourceFileForCopy.size;
            const sourceFileBlob = fcSourceFileForCopy.blob || null;
            const sourceFileRaw = fcSourceFileForCopy.file || null;

            const selectedCheckboxes = fcMoveFoldersList.querySelectorAll('.fc-target-chk:checked');
            const targetPrefixes = Array.from(selectedCheckboxes).map(c => c.value);

            if (targetPrefixes.length === 0) {
                alert('Please select at least one target folder.');
                return;
            }

            fcMoveConfirmBtn.disabled = true;
            const originalHTML = fcMoveConfirmBtn.innerHTML;
            fcMoveConfirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Copying...';

            try {
                let copiedCount = 0;
                targetPrefixes.forEach(targetPrefix => {
                    const grp = fcFolderGroups.find(g => g.prefix === targetPrefix);
                    if (!grp) return;

                    const exists = grp.files.some(f => f.name === sourceFileName);
                    if (!exists) {
                        grp.files.push({
                            id: 'c_' + targetPrefix + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                            name: sourceFileName,
                            size: sourceFileSize,
                            blob: sourceFileBlob,
                            file: sourceFileRaw,
                            customRelativePath: `${targetPrefix}/${sourceFileName}`
                        });
                        grp.isError = (grp.files.length !== getFcExpectedCount());
                        copiedCount++;
                    }
                });

                closeFcCopyFileModal();
                await rebuildFcPackage();

                appendFcLog(`Copied "${sourceFileName}" into ${copiedCount} incomplete folder(s).`, 'success');
                showCustomAlert(
                    'File Copied Successfully',
                    `"${sourceFileName}" has been copied into ${copiedCount} folder(s)!`,
                    'success'
                );
            } catch (err) {
                console.error('Error copying file to folders:', err);
                showCustomAlert('Copy Error', err.message, 'error');
            } finally {
                fcMoveConfirmBtn.disabled = false;
                fcMoveConfirmBtn.innerHTML = originalHTML;
            }
        });
    }

    // DIRECT MOVE TO INVOICE ARRANGE (TAB 5)
    function moveToInvoiceArrangeFromFolderCreate() {
        if (!fcZipBlob) {
            showCustomAlert('Error', 'No ZIP package available. Please group folders first.', 'error');
            return;
        }

        try {
            showLoader('Moving ZIP to Invoice Arrange...');
            const zipFile = new File([fcZipBlob], fcZipFilename || 'Grouped_Folders.zip', {
                type: 'application/zip',
                lastModified: Date.now()
            });
            zipFile.customRelativePath = zipFile.name;

            // Feed directly into Tab 5 (supports both New and Old sub-tabs)
            const isSubNewActive = subInvoiceNewView && subInvoiceNewView.style.display !== 'none';
            if (isSubNewActive && typeof invNewHandleDroppedFiles === 'function') {
                invNewHandleDroppedFiles([zipFile]);
            } else if (typeof handleInvoiceFilesSelection === 'function') {
                handleInvoiceFilesSelection([zipFile]);
            }

            // Close fullscreen modal if open
            closeFcFullscreenModal();

            hideLoader();

            // Switch to Tab 5 (Invoice Arrange)
            const tabInvoiceBtn = document.getElementById('tabInvoiceBtn');
            if (tabInvoiceBtn) {
                tabInvoiceBtn.click();
            }

            setTimeout(() => {
                const dropzone = document.getElementById('invoiceDropzone');
                if (dropzone) dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 150);

            showCustomAlert(
                'Moved to Invoice Arrange',
                `Folder ZIP "${zipFile.name}" has been transferred to Invoice Arrange!`,
                'success'
            );
        } catch (err) {
            hideLoader();
            console.error('Error moving to Invoice Arrange:', err);
            showCustomAlert('Error', 'Failed to transfer ZIP to Invoice Arrange: ' + err.message, 'error');
        }
    }

    // ----------------------------------------------------
    // 1-HOUR PERSISTENCE FOR CREATE FOLDER (INDEXEDDB)
    // ----------------------------------------------------
    async function saveFolderCreateSession() {
        try {
            const expiresAt = Date.now() + 3600000; // 1 hour
            const serializedGroups = fcFolderGroups.map(g => ({
                prefix: g.prefix,
                isError: g.isError,
                files: g.files.map(f => ({
                    id: f.id,
                    name: f.name,
                    size: f.size,
                    customRelativePath: f.customRelativePath
                }))
            }));

            const sessionData = {
                id: 'latest_folder_create_session',
                timestamp: Date.now(),
                expiresAt: expiresAt,
                fcZipFilename: fcZipFilename,
                fcFolderGroups: serializedGroups,
                fcZipBlob: fcZipBlob,
                fcMissingReportBlob: fcMissingReportBlob
            };

            const db = await openIndexedDB();
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.put(sessionData);
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
            });
        } catch (err) {
            console.warn('Error saving folder create session:', err);
        }
    }

    async function getFolderCreateSession() {
        try {
            const db = await openIndexedDB();
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.get('latest_folder_create_session');
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
        } catch (err) {
            return null;
        }
    }

    async function clearFolderCreateSession() {
        try {
            const db = await openIndexedDB();
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.delete('latest_folder_create_session');
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
            });
        } catch (err) {}
    }

    function startFcCountdownTimer(remainingSeconds) {
        if (fcCountdownInterval) clearInterval(fcCountdownInterval);
        let sec = remainingSeconds;

        const updateBadge = () => {
            const timerBadge = document.getElementById('fcTimerBadge');
            if (!timerBadge) return;
            if (sec <= 0) {
                clearInterval(fcCountdownInterval);
                timerBadge.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> Session Expired';
                timerBadge.style.background = '#fee2e2';
                timerBadge.style.color = '#dc2626';
                clearFolderCreateSession();
                return;
            }
            const mins = Math.floor(sec / 60);
            const s = sec % 60;
            timerBadge.innerHTML = `<i class="fa-regular fa-clock" style="color: #6366f1;"></i> Auto-Saved (${mins}:${s < 10 ? '0' : ''}${s})`;
            sec--;
        };

        updateBadge();
        fcCountdownInterval = setInterval(updateBadge, 1000);
    }

    // Restore Folder Create Session on Page Load (1-Hour)
    async function restoreFolderCreateSessionIfValid() {
        const s = await getFolderCreateSession();
        if (!s) return;

        const now = Date.now();
        if (!s.expiresAt || now > s.expiresAt) {
            await clearFolderCreateSession();
            return;
        }

        try {
            fcZipFilename = s.fcZipFilename || 'Grouped_Folders.zip';
            fcZipBlob = s.fcZipBlob || null;
            fcMissingReportBlob = s.fcMissingReportBlob || null;

            if (s.fcZipBlob) {
                const zip = await JSZip.loadAsync(s.fcZipBlob);
                fcFolderGroups = [];

                if (s.fcFolderGroups && Array.isArray(s.fcFolderGroups)) {
                    for (const grpMeta of s.fcFolderGroups) {
                        const grp = {
                            prefix: grpMeta.prefix,
                            isError: grpMeta.isError,
                            files: []
                        };

                        for (const fMeta of grpMeta.files) {
                            const zipEntry = zip.file(`${grpMeta.prefix}/${fMeta.name}`);
                            let blob = null;
                            if (zipEntry) {
                                blob = await zipEntry.async('blob');
                            }
                            grp.files.push({
                                id: fMeta.id,
                                name: fMeta.name,
                                size: fMeta.size,
                                blob: blob,
                                customRelativePath: `${grpMeta.prefix}/${fMeta.name}`
                            });
                        }
                        const expRestored = getFcExpectedCount();
                        grp.isError = (grp.files.length !== expRestored);
                        fcFolderGroups.push(grp);
                    }
                }
            }

            if (fcFolderGroups.length > 0) {
                sortFolderGroups(fcFolderGroups);
                renderFcDashboardUI();
                const remainingSecs = Math.max(0, Math.floor((s.expiresAt - now) / 1000));
                startFcCountdownTimer(remainingSecs);
                appendFcLog(`Restored folder create session (${fcFolderGroups.length} folders, ${Math.floor(remainingSecs/60)}m remaining).`, 'info');
            }
        } catch (err) {
            console.warn('Error restoring folder create session:', err);
        }
    }

    // Call restore on page load
    setTimeout(restoreFolderCreateSessionIfValid, 300);

    // ----------------------------------------------------
    // MOVE MERGED FILE TO CREATE FOLDER ACTION
    // ----------------------------------------------------
    const moveToFolderBtn = document.getElementById('moveToFolderBtn');
    if (moveToFolderBtn) {
        moveToFolderBtn.addEventListener('click', async () => {
            const originalBtnContent = moveToFolderBtn.innerHTML;
            try {
                moveToFolderBtn.disabled = true;
                moveToFolderBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Moving...';

                let blob = cachedMergedBlob;
                if (!blob) {
                    // Fetch the merged Excel file from backend
                    const response = await fetch('/api/download');
                    if (!response.ok) {
                        throw new Error('Merged file is not available. Please process and merge again.');
                    }
                    blob = await response.blob();
                    cachedMergedBlob = blob;
                }

                if (!blob || blob.size === 0) {
                    throw new Error('Empty file received. Please re-run the merge process.');
                }

                // Create standard File object with required name
                const mergedFile = new File([blob], 'Flipkart_Merged_Orders.xlsx', {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    lastModified: Date.now()
                });
                mergedFile.customRelativePath = 'Flipkart_Merged_Orders.xlsx';

                // Switch Create Folder mode to 'files' if it was in 'folders' mode
                const modeFilesBtn3 = document.getElementById('fcModeFilesBtn') || document.getElementById('folderModeFilesBtn');
                if (folderMode !== 'files' && modeFilesBtn3) {
                    modeFilesBtn3.click();
                }

                // Remove any existing merged file from Create Folder to avoid duplicate
                selectedFolderFiles = selectedFolderFiles.filter(f => !checkIsMergedFile(f));
                // Add the fresh merged file at the top
                selectedFolderFiles.unshift(mergedFile);
                fcFiles = selectedFolderFiles;

                // Update Create Folder UI list
                updateFolderFilesListUI();

                // Switch to Create Folder tab
                if (tabFolderBtn) {
                    tabFolderBtn.click();
                }

                // Scroll smoothly to the files list
                setTimeout(() => {
                    const targetEl = document.getElementById('fcSelectedFilesCard') || document.getElementById('fcDropzone');
                    if (targetEl && targetEl.style.display !== 'none') {
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        const dropzone = document.getElementById('fcDropzone');
                        if (dropzone) dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 150);

                showCustomAlert(
                    'Moved to Create Folder',
                    'Flipkart_Merged_Orders.xlsx has been added to Create Folder! You can now add your prefix files here.',
                    'success'
                );

            } catch (error) {
                console.error('Error moving file to Create Folder:', error);
                showCustomAlert('Error', error.message || 'Failed to move file to Create Folder.', 'error');
            } finally {
                moveToFolderBtn.disabled = false;
                moveToFolderBtn.innerHTML = originalBtnContent;
            }
        });
    }


    // =========================================================================
    // TAB 5: INVOICE ARRANGE - SUB-TAB SWITCHER & NEW 2-FILE PROCESSOR PIPELINE
    // =========================================================================

    const btnSubInvoiceNew = document.getElementById('btnSubInvoiceNew');
    const btnSubInvoiceOld = document.getElementById('btnSubInvoiceOld');
    const subInvoiceNewView = document.getElementById('subInvoiceNewView');
    const subInvoiceOldView = document.getElementById('subInvoiceOldView');

    function switchSubInvoiceTab(mode) {
        if (mode === 'new') {
            if (btnSubInvoiceNew) {
                btnSubInvoiceNew.classList.add('active');
                btnSubInvoiceNew.style.background = '#6366f1';
                btnSubInvoiceNew.style.color = '#ffffff';
            }
            if (btnSubInvoiceOld) {
                btnSubInvoiceOld.classList.remove('active');
                btnSubInvoiceOld.style.background = 'transparent';
                btnSubInvoiceOld.style.color = '#475569';
            }
            if (subInvoiceNewView) subInvoiceNewView.style.display = 'block';
            if (subInvoiceOldView) subInvoiceOldView.style.display = 'none';
        } else {
            if (btnSubInvoiceNew) {
                btnSubInvoiceNew.classList.remove('active');
                btnSubInvoiceNew.style.background = 'transparent';
                btnSubInvoiceNew.style.color = '#475569';
            }
            if (btnSubInvoiceOld) {
                btnSubInvoiceOld.classList.add('active');
                btnSubInvoiceOld.style.background = '#2563eb';
                btnSubInvoiceOld.style.color = '#ffffff';
            }
            if (subInvoiceNewView) subInvoiceNewView.style.display = 'none';
            if (subInvoiceOldView) subInvoiceOldView.style.display = 'block';
        }
    }

    if (btnSubInvoiceNew) {
        btnSubInvoiceNew.addEventListener('click', () => switchSubInvoiceTab('new'));
    }
    if (btnSubInvoiceOld) {
        btnSubInvoiceOld.addEventListener('click', () => switchSubInvoiceTab('old'));
    }
    // Set default active sub-tab
    switchSubInvoiceTab('new');

    // -------------------------------------------------------------
    // NEW 2-FILE PROCESSOR (PORTED FROM MYNTRA ENGINE)
    // -------------------------------------------------------------
    let invNewFilesList = [];
    let invNewNextId = 1;
    let invNewUploadedZipBaseName = "";
    let invNewIsProcessed = false;

    // UI Elements
    const invNewDropzone = document.getElementById('invNewDropzone');
    const invNewFileInput = document.getElementById('invNewFileInput');
    const invNewFolderInput = document.getElementById('invNewFolderInput');
    const invNewSelectFilesBtn = document.getElementById('invNewSelectFilesBtn');
    const invNewSelectFolderBtn = document.getElementById('invNewSelectFolderBtn');
    const btnInvNewReset = document.getElementById('btnInvNewReset');

    const invNewMappingCard = document.getElementById('invNewMappingCard');
    const invNewMappingTitle = document.getElementById('invNewMappingTitle');
    const invNewMappingSingle = document.getElementById('invNewMappingSingle');
    const invNewMappingBatch = document.getElementById('invNewMappingBatch');
    const invNewBatchDetectedText = document.getElementById('invNewBatchDetectedText');
    const invNewSelectOdFile = document.getElementById('invNewSelectOdFile');
    const invNewSelectDtFile = document.getElementById('invNewSelectDtFile');
    const invNewBtnProcessAction = document.getElementById('invNewBtnProcessAction');

    const invNewProgressCard = document.getElementById('invNewProgressCard');
    const invNewProgressPercent = document.getElementById('invNewProgressPercent');
    const invNewLoadingText = document.getElementById('invNewLoadingText');
    const invNewProgressBarFill = document.getElementById('invNewProgressBarFill');

    const invNewDashboardControls = document.getElementById('invNewDashboardControls');
    const invNewStatTotal = document.getElementById('invNewStatTotal');
    const invNewStatOd = document.getElementById('invNewStatOd');
    const invNewStatDt = document.getElementById('invNewStatDt');
    const invNewStatDtSold = document.getElementById('invNewStatDtSold');
    const invNewStatDtCancelled = document.getElementById('invNewStatDtCancelled');
    const invNewStatUnmatched = document.getElementById('invNewStatUnmatched');

    const invNewLogTdFilename = document.getElementById('invNewLogTdFilename');
    const invNewLogTdRange = document.getElementById('invNewLogTdRange');
    const invNewLogTdDates = document.getElementById('invNewLogTdDates');
    const invNewLogTdB2p2 = document.getElementById('invNewLogTdB2p2');
    const invNewBtnCopyLog = document.getElementById('invNewBtnCopyLog');

    const invNewRangeValue = document.getElementById('invNewRangeValue');
    const invNewBtnCopyRange = document.getElementById('invNewBtnCopyRange');

    const invNewCancelledInvoicesList = document.getElementById('invNewCancelledInvoicesList');
    const invNewBtnCopyCancelled = document.getElementById('invNewBtnCopyCancelled');

    const invNewInputOdName = document.getElementById('invNewInputOdName');
    const invNewInputDtName = document.getElementById('invNewInputDtName');
    const invNewInputCombinedName = document.getElementById('invNewInputCombinedName');
    const invNewBtnClear = document.getElementById('invNewBtnClear');
    const invNewBtnDownloadZip = document.getElementById('invNewBtnDownloadZip');
    const invNewConsoleLogs = document.getElementById('invNewConsoleLogs');

    const invNewEmptyState = document.getElementById('invNewEmptyState');
    const invNewTableContainer = document.getElementById('invNewTableContainer');
    const invNewFilesTbody = document.getElementById('invNewFilesTbody');
    const invNewSearchInput = document.getElementById('invNewSearchInput');

    // Indian State Codes dictionary
    const INV_NEW_INDIAN_STATE_CODES = {
        "andaman and nicobar islands": "AN", "andaman & nicobar islands": "AN",
        "andhra pradesh": "AP", "arunachal pradesh": "AR",
        "assam": "AS", "bihar": "BR", "chandigarh": "CH",
        "chhattisgarh": "CG", "chattisgarh": "CG",
        "dadra and nagar haveli and daman and diu": "DN",
        "dadra & nagar haveli and daman & diu": "DN",
        "dadra & nagar haveli & daman & diu": "DN",
        "dadra and nagar haveli & daman and diu": "DN",
        "dadra & nagar haveli and daman and diu": "DN",
        "dadra and nagar haveli & daman & diu": "DN",
        "dadra and nagar haveli": "DN",
        "dadra & nagar haveli": "DN",
        "daman and diu": "DN",
        "daman & diu": "DN",
        "delhi": "DL", "new delhi": "DL", "national capital territory of delhi": "DL", "nct of delhi": "DL",
        "goa": "GA", "gujarat": "GJ", "haryana": "HR", "himachal pradesh": "HP",
        "jammu and kashmir": "JK", "jammu & kashmir": "JK",
        "jharkhand": "JH", "karnataka": "KA", "kerala": "KL", "ladakh": "LA",
        "lakshadweep": "LD", "madhya pradesh": "MP", "maharashtra": "MH", "manipur": "MN",
        "meghalaya": "ML", "mizoram": "MZ", "nagaland": "NL", "odisha": "OD", "orissa": "OD",
        "puducherry": "PY", "pondicherry": "PY", "punjab": "PB", "rajasthan": "RJ", "sikkim": "SK",
        "tamil nadu": "TN", "tamilnadu": "TN", "telangana": "TS", "tripura": "TR",
        "uttar pradesh": "UP", "uttarakhand": "UK", "uttaranchal": "UK", "west bengal": "WB"
    };

    function invNewGetIndianStateCode(stateName) {
        if (!stateName) return "";
        const rawStr = String(stateName).trim().toLowerCase();
        
        // Direct checks for Dadra & Nagar Haveli and Daman & Diu
        if (rawStr.includes("dadra") || rawStr.includes("daman")) {
            return "DN";
        }

        const clean = rawStr.replace(/[\s\.\-_]+/g, ' ');
        if (INV_NEW_INDIAN_STATE_CODES[clean]) return INV_NEW_INDIAN_STATE_CODES[clean];

        const cleanAnd = rawStr.replace(/&/g, 'and').replace(/[\s\.\-_]+/g, ' ');
        if (INV_NEW_INDIAN_STATE_CODES[cleanAnd]) return INV_NEW_INDIAN_STATE_CODES[cleanAnd];

        if (/^[a-z]{2}$/i.test(clean)) return clean.toUpperCase();
        for (const key in INV_NEW_INDIAN_STATE_CODES) {
            if (clean.includes(key) || key.includes(clean) || cleanAnd.includes(key) || key.includes(cleanAnd)) {
                return INV_NEW_INDIAN_STATE_CODES[key];
            }
        }
        return String(stateName).trim().toUpperCase();
    }

    function invNewCleanCell(val) {
        if (val === undefined || val === null) return "";
        return String(val).replace(/[\x00-\x1F\x7F-\x9F\u00A0\u200B-\u200D\uFEFF]/g, "").trim();
    }

    function invNewIsValidOrderRow(row) {
        if (!row || !Array.isArray(row) || row.length === 0) return false;
        
        const hasKeyData = (row[4] !== undefined && invNewCleanCell(row[4]) !== "") ||
                           (row[6] !== undefined && invNewCleanCell(row[6]) !== "") ||
                           (row[3] !== undefined && invNewCleanCell(row[3]) !== "") ||
                           (row[0] !== undefined && invNewCleanCell(row[0]) !== "") ||
                           (row[1] !== undefined && invNewCleanCell(row[1]) !== "") ||
                           (row[2] !== undefined && invNewCleanCell(row[2]) !== "") ||
                           (row[15] !== undefined && invNewCleanCell(row[15]) !== "") ||
                           (row[16] !== undefined && invNewCleanCell(row[16]) !== "");
        if (hasKeyData) return true;
        
        for (let c = 0; c < row.length; c++) {
            if (invNewCleanCell(row[c]) !== "") return true;
        }
        return false;
    }

    function invNewStripEmptyCellsFromWorksheet(ws) {
        if (!ws || !ws['!ref']) return;
        const range = XLSX.utils.decode_range(ws['!ref']);
        let maxR = 0;
        let maxC = 0;
        let hasAny = false;

        for (let R = range.s.r; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = ws[cellRef];
                if (cell && cell.v !== undefined && cell.v !== null && invNewCleanCell(cell.v) !== "") {
                    if (R > maxR) maxR = R;
                    if (C > maxC) maxC = C;
                    hasAny = true;
                } else if (cell && (cell.v === "" || cell.v === null || cell.v === undefined || invNewCleanCell(cell.v) === "")) {
                    delete ws[cellRef];
                }
            }
        }
        if (hasAny) {
            ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: maxC } });
        }
    }

    function invNewCleanKey(v) {
        if (v === undefined || v === null) return "";
        let k = String(v).replace(/[`'\x7F-\x9F\x00-\x1F\x80-\x9F\xA0\t\r\n]/g, "").trim();
        if (k !== "" && !isNaN(Number(k))) {
            k = String(Math.round(Number(k)));
        }
        return k;
    }

    function invNewFormatDate(val) {
        if (val === undefined || val === null || val === "") return "";
        let date;
        if (val instanceof Date) {
            date = val;
        } else {
            const str = String(val).trim();
            if (!str) return "";
            if (!isNaN(Number(str))) {
                date = new Date((Number(str) - 25569) * 86400000);
            } else {
                date = new Date(str);
            }
        }
        if (isNaN(date.getTime())) return String(val).trim();
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}.000`;
    }

    function invNewParseFormattedDate(dateStr) {
        if (!dateStr) return null;
        const parts = String(dateStr).trim().split(' ');
        if (parts.length < 1) return null;
        const dateParts = parts[0].split('-');
        if (dateParts.length !== 3) return null;
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);
        let hour = 0, min = 0, sec = 0;
        if (parts[1]) {
            const timeParts = parts[1].split(':');
            hour = parseInt(timeParts[0], 10) || 0;
            min = parseInt(timeParts[1], 10) || 0;
            if (timeParts[2]) {
                sec = parseInt(timeParts[2].split('.')[0], 10) || 0;
            }
        }
        const d = new Date(year, month, day, hour, min, sec);
        return isNaN(d.getTime()) ? null : d;
    }

    function invNewReadExcelAsAOA(fileBlob, preferredSheetName = null) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {
                        type: 'array',
                        cellDates: true,
                        raw: false,
                        defval: ""
                    });
                    let sheetName = workbook.SheetNames[0];
                    if (preferredSheetName) {
                        const matchedSheet = workbook.SheetNames.find(s => s.toLowerCase() === preferredSheetName.toLowerCase());
                        if (matchedSheet) sheetName = matchedSheet;
                    }
                    const worksheet = workbook.Sheets[sheetName];
                    const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
                    while (aoa.length > 0 && !invNewIsValidOrderRow(aoa[aoa.length - 1])) {
                        aoa.pop();
                    }
                    resolve(aoa);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(fileBlob);
        });
    }

    function invNewAddLog(message, type = "info") {
        if (!invNewConsoleLogs) return;
        const logLine = document.createElement('div');
        const color = type === "success" ? "#10b981" : type === "warning" ? "#f59e0b" : type === "error" ? "#ef4444" : "#94a3b8";
        logLine.style.color = color;
        logLine.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        invNewConsoleLogs.appendChild(logLine);
        invNewConsoleLogs.scrollTop = invNewConsoleLogs.scrollHeight;
    }

    function invNewClearLogs() {
        if (invNewConsoleLogs) {
            invNewConsoleLogs.innerHTML = '<div style="color: #94a3b8;">Ready to run pipeline...</div>';
        }
    }

    function invNewShowLoading(text, percent = 0) {
        if (invNewProgressCard) {
            invNewProgressCard.style.display = 'block';
            if (invNewProgressPercent) invNewProgressPercent.textContent = `${percent}%`;
            if (invNewLoadingText) invNewLoadingText.textContent = text;
            if (invNewProgressBarFill) invNewProgressBarFill.style.width = `${percent}%`;
        }
    }

    function invNewUpdateProgress(percent, text) {
        if (invNewProgressPercent) invNewProgressPercent.textContent = `${percent}%`;
        if (invNewLoadingText && text) invNewLoadingText.textContent = text;
        if (invNewProgressBarFill) invNewProgressBarFill.style.width = `${percent}%`;
    }

    function invNewHideLoading() {
        if (invNewProgressCard) {
            setTimeout(() => {
                invNewProgressCard.style.display = 'none';
            }, 600);
        }
    }

    function invNewGetPartyCode(fileObj) {
        if (!fileObj) return "PartyCode";
        if (fileObj.path && (fileObj.path.includes('/') || fileObj.path.includes('\\'))) {
            const parts = fileObj.path.split(/[\/\\]/);
            for (let i = parts.length - 2; i >= 0; i--) {
                const seg = parts[i].trim();
                const mPre = seg.match(/^(?:FK|MY)(\d{2,5})/i);
                if (mPre) return mPre[1];
                const match = seg.match(/^\d{2,5}/);
                if (match) return match[0];
            }
        }
        const name = fileObj.name || "";
        if (name.includes('-')) {
            const prefix = name.split('-')[0].trim();
            const mPre = prefix.match(/^(?:FK|MY)?(\d{2,5})/i);
            if (mPre) return mPre[1];
            return prefix;
        }
        const digitMatch = name.match(/\d{2,5}/);
        if (digitMatch) return digitMatch[0];
        return "PartyCode";
    }

    function invNewGetPartyCodeName(partyCode) {
        if (!partyCode) return "PartyCode";
        const codeClean = String(partyCode).trim();

        // 1. Check in-memory flipkartPartyList or localStorage
        let list = window.flipkartPartyList;
        if (!list || !Array.isArray(list) || list.length === 0) {
            try {
                const cached = localStorage.getItem('flipkart_parties_cache');
                if (cached) list = JSON.parse(cached);
            } catch (e) {}
        }

        if (Array.isArray(list) && list.length > 0) {
            const found = list.find(item => {
                if (!item) return false;
                const c = String(item.CODE || item.code || '').trim();
                const pc = String(item['PARTY CODE'] || item.partyCode || '').trim();
                return c === codeClean || pc === codeClean || pc.startsWith(`${codeClean}-`) || pc.startsWith(`${codeClean} -`) || pc.startsWith(`${codeClean}_`);
            });
            if (found) {
                const rawPartyCode = found['PARTY CODE'] || found.partyCode || found.name || '';
                if (rawPartyCode) {
                    return rawPartyCode.replace(/\s*-\s*/, '-').trim().toUpperCase();
                }
            }
        }

        // 2. Default known Flipkart parties fallback
        const defaultParties = {
            "101": "101-BHARVITA",
            "509": "509-VIVATRA",
            "128": "128-BAGHADELLO",
            "200": "200-FOCUS STYLE",
            "178": "178-COLORBOOK",
            "150": "150-ZOMBOM",
            "544": "544-HOUSE OF PRANSHI"
        };
        if (defaultParties[codeClean]) {
            return defaultParties[codeClean];
        }

        // 3. Check uploaded files or folder paths for party name (e.g. "101-Bharvita")
        if (typeof invNewFilesList !== "undefined" && invNewFilesList.length > 0) {
            const partyFiles = invNewFilesList.filter(f => f.partyCode === codeClean || (f.path && f.path.includes(codeClean)));
            for (const f of partyFiles) {
                if (f.path && (f.path.includes('/') || f.path.includes('\\'))) {
                    const parts = f.path.split(/[\/\\]/);
                    for (let i = parts.length - 1; i >= 0; i--) {
                        const seg = parts[i].trim();
                        if (seg.startsWith(codeClean) && /[a-zA-Z]/.test(seg)) {
                            const cleanSeg = seg.replace(/\s*\(Admin\)/i, '').replace(/\s*-\s*/, '-').trim().toUpperCase();
                            return cleanSeg;
                        }
                    }
                }
            }
        }

        return codeClean;
    }

    function invNewCreateFileObject(name, path, ext, fileBlob) {
        let category = 'unmatched';
        let renamedName = name;
        const lowerName = name.toLowerCase();

        if (lowerName.includes('dropship') || lowerName.includes('seller_orders_report') || lowerName.includes('flipkart_merged_orders') || lowerName.includes('merged_orders') || (lowerName.endsWith('-od.xlsx') || lowerName.endsWith('-od.xls'))) {
            category = 'OD';
            renamedName = ext ? `OD.${ext}` : 'OD';
        } else if (lowerName.includes('indoprimo') || lowerName.includes('itemdetails') || lowerName.includes('taxreport') || lowerName.includes('taxsales') || lowerName.includes('tax') || lowerName.includes('saledata') || (lowerName.endsWith('-dt.xlsx') || lowerName.endsWith('-dt.xls'))) {
            category = 'DT';
            renamedName = ext ? `DT.${ext}` : 'DT';
        } else if (lowerName.includes('summary') || lowerName.includes('details') || lowerName.includes('arrange')) {
            category = 'Summary';
        }

        return {
            id: invNewNextId++,
            name: name,
            path: path,
            ext: ext,
            originalFile: fileBlob,
            category: category,
            renamedName: renamedName
        };
    }

    function invNewProcessSingleFile(file) {
        const relativePath = file.webkitRelativePath || file.name;
        const ext = file.name.split('.').pop();
        const lowerExt = ext.toLowerCase();
        if (lowerExt !== 'xlsx' && lowerExt !== 'xls' && lowerExt !== 'csv') return;
        const fileObj = invNewCreateFileObject(file.name, relativePath, ext, file);
        invNewFilesList.push(fileObj);
    }

    async function invNewProcessZipFile(zipFile) {
        const zip = await JSZip.loadAsync(zipFile);
        const promises = [];
        const zipName = zipFile.name;
        const zipDigitsMatch = zipName.match(/\d+/);
        const zipDigits = zipDigitsMatch ? zipDigitsMatch[0] : null;
        const zipBaseName = zipName.substring(0, zipName.lastIndexOf('.')) || zipName;

        zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                const ext = zipEntry.name.split('.').pop();
                const lowerExt = ext.toLowerCase();
                if (lowerExt !== 'xlsx' && lowerExt !== 'xls' && lowerExt !== 'csv') return;
                const promise = zipEntry.async("blob").then((blob) => {
                    const filename = zipEntry.name.split('/').pop();
                    let adjustedPath = relativePath;
                    const pathParts = relativePath.split('/');
                    let hasNumericFolder = false;
                    for (let i = 0; i < pathParts.length - 1; i++) {
                        if (/^\d+/.test(pathParts[i])) {
                            hasNumericFolder = true;
                            break;
                        }
                    }
                    if (!hasNumericFolder) {
                        const prefix = zipDigits || zipBaseName;
                        adjustedPath = `${prefix}/${relativePath}`;
                    }
                    const fileObj = invNewCreateFileObject(filename, adjustedPath, ext, blob);
                    invNewFilesList.push(fileObj);
                });
                promises.push(promise);
            }
        });
        await Promise.all(promises);
    }

    async function invNewHandleDroppedFiles(files) {
        if (!files || files.length === 0) return;
        try {
            invNewShowLoading("Reading files...", 10);
            let zipFound = false;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.name.toLowerCase().endsWith('.zip')) {
                    zipFound = true;
                    const dotIdx = file.name.lastIndexOf('.');
                    invNewUploadedZipBaseName = dotIdx !== -1 ? file.name.substring(0, dotIdx) : file.name;
                    await invNewProcessZipFile(file);
                } else {
                    invNewProcessSingleFile(file);
                }
            }

            invNewHideLoading();
            if (invNewFilesList.length > 0) {
                if (invNewEmptyState) invNewEmptyState.style.display = 'none';
                if (invNewTableContainer) invNewTableContainer.style.display = 'block';
                if (invNewMappingCard) invNewMappingCard.style.display = 'block';
                if (invNewDashboardControls) invNewDashboardControls.style.display = 'none';

                invNewPopulateSelectors();
                invNewRenderFilesTable();
                invNewAddLog(`${invNewFilesList.length} files loaded. Confirm mapping and click Process.`, "info");
            } else {
                alert("No valid Excel or CSV files found.");
            }
        } catch (err) {
            console.error(err);
            invNewHideLoading();
            alert("Error reading files: " + err.message);
        }
    }

    function invNewGetUniquePartyCodes() {
        const codes = new Set();
        invNewFilesList.forEach(file => {
            if (file.category === "Combined" || file.name.includes("GST NOT APPLICABLE") || file.name.includes("2 MORE INVOICE") || file.name.includes("SUMMARY")) return;
            const code = invNewGetPartyCode(file);
            if (code && code !== "PartyCode") codes.add(code);
        });
        return Array.from(codes);
    }

    function invNewPopulateSelectors() {
        const uniqueCodes = invNewGetUniquePartyCodes();

        if (uniqueCodes.length > 1) {
            // Batch mode
            if (invNewMappingTitle) invNewMappingTitle.textContent = `Batch Mode (${uniqueCodes.length} Parties Detected)`;
            if (invNewMappingSingle) invNewMappingSingle.style.display = 'none';
            if (invNewMappingBatch) invNewMappingBatch.style.display = 'block';
            if (invNewBatchDetectedText) {
                invNewBatchDetectedText.innerHTML = `Detected <b>${uniqueCodes.length}</b> unique party codes: <span style="color: #6366f1; font-weight: 700;">${uniqueCodes.join(', ')}</span>`;
            }
            return;
        }

        // Single mode
        if (invNewMappingTitle) invNewMappingTitle.textContent = "Confirm File Mapping (2 Files)";
        if (invNewMappingSingle) invNewMappingSingle.style.display = 'flex';
        if (invNewMappingBatch) invNewMappingBatch.style.display = 'none';

        if (invNewSelectOdFile) invNewSelectOdFile.innerHTML = '<option value="">-- Choose DropShip File --</option>';
        if (invNewSelectDtFile) invNewSelectDtFile.innerHTML = '<option value="">-- Choose IndoPrimo File --</option>';

        invNewFilesList.forEach(file => {
            const displayPath = file.path.length > 50 ? '...' + file.path.slice(-47) : file.path;
            const opt = `<option value="${file.id}">${displayPath}</option>`;
            if (invNewSelectOdFile) invNewSelectOdFile.insertAdjacentHTML('beforeend', opt);
            if (invNewSelectDtFile) invNewSelectDtFile.insertAdjacentHTML('beforeend', opt);
        });

        // Auto selection
        const dropShipFile = invNewFilesList.find(f => f.category === 'OD' || f.name.toLowerCase().includes('dropship') || f.name.toLowerCase().includes('seller_orders_report') || f.name.toLowerCase().includes('flipkart_merged_orders'));
        const indoPrimoFile = invNewFilesList.find(f => f.name.toLowerCase().includes('indoprimo') || f.name.toLowerCase().includes('itemdetails') || f.name.toLowerCase().includes('sale') || f.name.toLowerCase().includes('tax') || (f !== dropShipFile && f.category !== 'OD'));

        if (dropShipFile && invNewSelectOdFile) invNewSelectOdFile.value = dropShipFile.id;
        if (indoPrimoFile && invNewSelectDtFile) invNewSelectDtFile.value = indoPrimoFile.id;
    }

    function invNewRenderFilesTable() {
        if (!invNewFilesTbody) return;
        invNewFilesTbody.innerHTML = '';
        const query = (invNewSearchInput ? invNewSearchInput.value : '').toLowerCase().trim();

        const filtered = invNewFilesList.filter(f => 
            f.name.toLowerCase().includes(query) || f.path.toLowerCase().includes(query) || f.category.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            invNewFilesTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 1.5rem;">No matching files found.</td></tr>';
            return;
        }

        filtered.forEach((file, idx) => {
            const tr = document.createElement('tr');
            const catBadge = file.category === 'OD' ? '<span class="rename-badge-pill success">OD File</span>'
                           : file.category === 'DT' ? '<span class="rename-badge-pill info">DT File</span>'
                           : file.category === 'IndoPrimo' ? '<span class="rename-badge-pill" style="background: #e0e7ff; color: #4338ca;">IndoPrimo</span>'
                           : file.category === 'Summary' ? '<span class="rename-badge-pill" style="background: #fef3c7; color: #b45309; font-weight: 700;">Summary</span>'
                           : '<span class="rename-badge-pill error">Extra/Report</span>';

            tr.innerHTML = `
                <td>
                    <div style="font-weight: 600; color: #1e293b; font-size: 0.85rem;">${file.name}</div>
                    <div style="font-size: 0.72rem; color: #64748b;">${file.path}</div>
                </td>
                <td>${catBadge}</td>
                <td>
                    <span style="font-weight: 600; color: #0284c7;">${file.renamedName || file.name}</span>
                </td>
                <td style="text-align: center;">
                    <button type="button" class="btn btn-secondary inv-new-del-btn" data-id="${file.id}" style="padding: 4px 8px; font-size: 0.75rem; color: #dc2626; border-radius: 6px;">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;

            tr.querySelector('.inv-new-del-btn').addEventListener('click', (e) => {
                const fId = parseInt(e.currentTarget.getAttribute('data-id'));
                invNewFilesList = invNewFilesList.filter(f => f.id !== fId);
                if (invNewFilesList.length === 0) {
                    if (invNewEmptyState) invNewEmptyState.style.display = 'block';
                    if (invNewTableContainer) invNewTableContainer.style.display = 'none';
                    if (invNewMappingCard) invNewMappingCard.style.display = 'none';
                } else {
                    invNewPopulateSelectors();
                    invNewRenderFilesTable();
                }
            });

            invNewFilesTbody.appendChild(tr);
        });
    }

    // -------------------------------------------------------------
    // CORE 2-FILE PIPELINE EXECUTION
    // -------------------------------------------------------------
    async function invNewProcessPartyPipeline2Files(dropShipFileObj, indoPrimoFileObj, partyCode, isBatchMode = false) {
        invNewAddLog(`--- Processing Party: ${partyCode} (2-File Pipeline) ---`, "warning");

        // 1. Read sheet data
        invNewAddLog(`[${partyCode}] Reading DropShip and IndoPrimo sheets...`, "info");
        const dropShipRows = await invNewReadExcelAsAOA(dropShipFileObj.originalFile);
        const indoPrimoRows = await invNewReadExcelAsAOA(indoPrimoFileObj.originalFile, 'SaleData');

        if (!dropShipRows || dropShipRows.length < 2) {
            throw new Error(`DropShip file for party ${partyCode} has no data rows.`);
        }

        // 2. Build IndoPrimo Key Set (=B3&G3)
        invNewAddLog(`[${partyCode}] Building IndoPrimo Dictionary (Columns B & G, row 3 onwards)...`, "info");
        const indoKeySet = new Set();
        const indoKeySetStrict = new Set();

        for (let r = 2; r < indoPrimoRows.length; r++) {
            const row = indoPrimoRows[r];
            if (!row) continue;
            const bVal = invNewCleanCell(row[1]);
            const gVal = invNewCleanCell(row[6]).replace(/\.0+$/, '').replace(/^[`']/, '').trim();
            if (bVal && gVal) {
                const combined = bVal + gVal;
                indoKeySet.add(invNewCleanKey(combined));
                indoKeySetStrict.add(combined.toLowerCase().replace(/[\s\-_]/g, ''));
            }
        }
        // Check row 2 (index 1) if not header
        if (indoPrimoRows.length > 1) {
            const r1 = indoPrimoRows[1];
            const b1 = invNewCleanCell(r1[1]);
            const g1 = invNewCleanCell(r1[6]);
            const isHdr = /order|item|sku|invoice|code|id|date/i.test(b1 + g1);
            if (!isHdr && b1 && g1) {
                const combined = b1 + g1;
                indoKeySet.add(invNewCleanKey(combined));
                indoKeySetStrict.add(combined.toLowerCase().replace(/[\s\-_]/g, ''));
            }
        }
        invNewAddLog(`[${partyCode}] Dictionary loaded with ${indoKeySet.size} unique keys.`, "success");

        // 3. Filter DropShip File: Delete matched rows where =G2&E2 in IndoKeySet
        invNewAddLog(`[${partyCode}] Filtering DropShip: Deleting invoiced rows against IndoPrimo keys...`, "info");
        const headerRow = dropShipRows[0] || [];
        let cleanDropShipRows = [headerRow];
        let deletedCount = 0;

        const findColIndex = (name, fallback) => {
            const lowerName = name.toLowerCase();
            let idx = headerRow.findIndex(h => String(h || "").trim().toLowerCase() === lowerName);
            if (idx !== -1) return idx;
            idx = headerRow.findIndex(h => String(h || "").trim().toLowerCase().includes(lowerName));
            return idx !== -1 ? idx : fallback;
        };

        const idxTaxRate = findColIndex("Tax Rate", 41);
        const idxSellingPrice = findColIndex("Selling Price", 47);
        const idxItemPrice = findColIndex("Item Price(Excluding Tax)", findColIndex("Item Price", 49));
        const idxTaxAmount = findColIndex("Tax", findColIndex("IGST Rate", 59));
        const idxIgst = findColIndex("IGST", findColIndex("IGST Amount", 60));
        const idxCgst = findColIndex("CGST", findColIndex("CGST Amount", 61));
        const idxSgst = findColIndex("SGST", findColIndex("SGST Amount", 62));
        const idxBillingState = findColIndex("Billing State", findColIndex("State", 87));
        const idxQuantity = findColIndex("Quantity", findColIndex("Item Quantity", findColIndex("Qty", -1)));
        const idxHsn = headerRow.findIndex(h => String(h || "").trim().toLowerCase().includes("hsn")) !== -1
            ? headerRow.findIndex(h => String(h || "").trim().toLowerCase().includes("hsn"))
            : 25;

        for (let r = 1; r < dropShipRows.length; r++) {
            const row = dropShipRows[r];
            if (!row || !invNewIsValidOrderRow(row)) continue;
            const gVal = invNewCleanCell(row[6]).replace(/\.0+$/, '').replace(/^[`']/, '').trim();
            const eVal = invNewCleanCell(row[4]).replace(/\.0+$/, '').replace(/^[`']/, '').trim();
            const dropShipKey = invNewCleanKey(gVal + eVal);
            const dropShipKeyStrict = (gVal + eVal).toLowerCase().replace(/[\s\-_]/g, '');
            const dwKey = invNewCleanKey(invNewCleanCell(row[126])).replace(/\.0+$/, '').replace(/^[`']/, '').trim();
            const dwKeyStrict = invNewCleanCell(row[126]).replace(/\.0+$/, '').replace(/^[`']/, '').trim().toLowerCase().replace(/[\s\-_]/g, '');

            const isMatched = (dropShipKey !== "" && indoKeySet.has(dropShipKey)) ||
                              (dropShipKeyStrict !== "" && indoKeySetStrict.has(dropShipKeyStrict)) ||
                              (dwKey !== "" && indoKeySet.has(dwKey)) ||
                              (dwKeyStrict !== "" && indoKeySetStrict.has(dwKeyStrict));

            if (isMatched) {
                deletedCount++;
            } else {
                const cloned = [...row];
                if (cloned[11] !== undefined && cloned[11] !== "") cloned[11] = invNewFormatDate(cloned[11]);
                if (cloned[12] !== undefined && cloned[12] !== "") cloned[12] = invNewFormatDate(cloned[12]);
                while (cloned.length > 0 && (cloned[cloned.length - 1] === undefined || cloned[cloned.length - 1] === null || invNewCleanCell(cloned[cloned.length - 1]) === "")) {
                    cloned.pop();
                }
                if (invNewIsValidOrderRow(cloned)) {
                    cleanDropShipRows.push(cloned);
                }
            }
        }
        invNewAddLog(`[${partyCode}] Filtered: Deleted ${deletedCount} invoiced rows. Remaining: ${cleanDropShipRows.length - 1} clean rows.`, "success");

        // 4. Date Range & Metadata
        let minDate = null;
        let maxDate = null;
        for (let r = 1; r < cleanDropShipRows.length; r++) {
            const row = cleanDropShipRows[r];
            const dateVal = row[12] || row[11];
            if (dateVal) {
                const parsed = invNewParseFormattedDate(dateVal);
                if (parsed) {
                    if (!minDate || parsed < minDate) minDate = parsed;
                    if (!maxDate || parsed > maxDate) maxDate = parsed;
                }
            }
        }

        let dateRangeStr = "—";
        if (minDate && maxDate) {
            const padZero = (n) => String(n).padStart(2, '0');
            dateRangeStr = `${padZero(minDate.getDate())}-${padZero(minDate.getMonth()+1)}-${minDate.getFullYear()} TO ${padZero(maxDate.getDate())}-${padZero(maxDate.getMonth()+1)}-${maxDate.getFullYear()}`;
        }

        const row1 = cleanDropShipRows[1] || [];
        const b2Val = invNewCleanCell(row1[125]) || invNewCleanCell(row1[1]);
        const p2Val = invNewCleanCell(row1[0]) || invNewCleanCell(row1[15]);
        const b2p2String = (b2Val || p2Val) ? `${b2Val}/${p2Val}` : "—";

        // 5. GST Not Applicable Checks & Calculations
        const gstRows = [["EE Invoice No", "Order Status", "Invoice Date", "Item Quantity", "Selling Price", "Item Price(Excluding Tax)"]];
        const dtCellStyles = {};
        const gstCellStyles = {};
        let shadeIndex = 1;
        let gstCreated = false;

        for (let r = 1; r < cleanDropShipRows.length; r++) {
            const row = cleanDropShipRows[r];
            if (!row || !invNewIsValidOrderRow(row)) continue;
            const invoiceNo = invNewCleanCell(row[6]) || invNewCleanCell(row[3]);
            const taxRate = invNewCleanCell(row[idxTaxRate]);
            const taxNum = parseFloat(taxRate);
            const isTaxMissing = (taxRate === "" || taxRate === "0" || taxRate === "0%" || taxRate === "0.00" || taxNum === 0 || isNaN(taxNum) || taxRate.toLowerCase().includes("not") || taxRate.toLowerCase().includes("n/a"));

            if (invoiceNo !== "" && isTaxMissing) {
                gstCreated = true;
                const newGstRow = [
                    invoiceNo,
                    invNewCleanCell(row[8]) || "Sold",
                    invNewCleanCell(row[12]) || invNewCleanCell(row[11]) || "",
                    invNewCleanCell(row[idxQuantity !== -1 ? idxQuantity : 17]) || "1",
                    invNewCleanCell(row[idxSellingPrice]) || "",
                    invNewCleanCell(row[idxItemPrice]) || ""
                ];
                gstRows.push(newGstRow);

                const Rc = 170 + ((shadeIndex * 37) % 80);
                const Gc = 170 + ((shadeIndex * 67) % 80);
                const Bc = 170 + ((shadeIndex * 97) % 80);
                const hexColor = ((1 << 24) + (Rc << 16) + (Gc << 8) + Bc).toString(16).slice(1).toUpperCase();
                const destRow = gstRows.length - 1;
                for (let c = 0; c < 6; c++) {
                    gstCellStyles[`${destRow},${c}`] = { fill: { fgColor: { rgb: hexColor } } };
                }

                const targetLen = Math.max(idxTaxRate, idxSellingPrice, idxItemPrice, idxTaxAmount, idxIgst, idxCgst, idxSgst, idxBillingState, 87) + 1;
                while (row.length < targetLen) row.push("");

                row[idxTaxRate] = 5;
                const valAV = parseFloat(String(row[idxSellingPrice] || "").replace(/,/g, "")) || 0;
                const round0 = (v) => Math.round(v);
                const round4 = (v) => Math.round(v * 10000) / 10000;
                const valAX = round0(valAV / 1.05);
                row[idxItemPrice] = valAX;
                const roundPart = round4(valAV / 1.05);
                row[idxTaxAmount] = round4(valAV - roundPart);

                const stateVal = (invNewCleanCell(row[idxBillingState]) || invNewCleanCell(row[39]) || invNewCleanCell(row[87])).toLowerCase().trim();
                if (stateVal.includes("gujarat") || stateVal === "gj") {
                    row[idxIgst] = "0";
                    const valHalf = round4((valAV - roundPart) / 2);
                    row[idxCgst] = valHalf;
                    row[idxSgst] = valHalf;
                } else {
                    row[idxIgst] = round4(valAV - roundPart);
                    row[idxCgst] = "0";
                    row[idxSgst] = "0";
                }

                dtCellStyles[`${r},6`] = { fill: { fgColor: { rgb: "C8FFC8" } } };
                dtCellStyles[`${r},8`] = { fill: { fgColor: { rgb: "C8FFC8" } } };
                dtCellStyles[`${r},12`] = { fill: { fgColor: { rgb: "C8FFC8" } } };
                dtCellStyles[`${r},${idxQuantity !== -1 ? idxQuantity : 17}`] = { fill: { fgColor: { rgb: "C8FFC8" } } };
                dtCellStyles[`${r},${idxSellingPrice}`] = { fill: { fgColor: { rgb: "C8FFC8" } } };
                dtCellStyles[`${r},${idxItemPrice}`] = { fill: { fgColor: { rgb: "C8FFC8" } } };
                dtCellStyles[`${r},${idxTaxRate}`] = { fill: { fgColor: { rgb: "B4F0B4" } } };

                shadeIndex++;
            }
        }

        // 6. Extrapolate Invoice Range strictly from Column G
        let minNum = Infinity;
        let maxNum = -Infinity;
        let invoicePrefix = "";

        for (let r = 1; r < cleanDropShipRows.length; r++) {
            const row = cleanDropShipRows[r];
            const valG = invNewCleanCell(row[6]);
            if (valG) {
                const parts = valG.split('-');
                if (parts.length >= 2) {
                    const lastPart = parts[parts.length - 1];
                    const curNum = parseInt(lastPart, 10);
                    if (!isNaN(curNum) && curNum > 0) {
                        if (curNum < minNum) minNum = curNum;
                        if (curNum > maxNum) maxNum = curNum;
                        if (!invoicePrefix) invoicePrefix = parts.slice(0, -1).join('-');
                    }
                } else {
                    const curNum = parseInt(valG, 10);
                    if (!isNaN(curNum) && curNum > 0) {
                        if (curNum < minNum) minNum = curNum;
                        if (curNum > maxNum) maxNum = curNum;
                    }
                }
            }
        }

        let generatedRange = (minNum !== Infinity && maxNum !== -Infinity)
            ? (invoicePrefix ? `${invoicePrefix}-${minNum}-${maxNum}` : `${minNum}-${maxNum}`)
            : "RangeNotFound";
        invNewAddLog(`[${partyCode}] Invoice Range: ${generatedRange}`, "success");

        // 7. Duplicate Invoices check in Column G
        const invoiceCounts = new Map();
        for (let r = 1; r < cleanDropShipRows.length; r++) {
            const rRow = cleanDropShipRows[r];
            if (!rRow || !invNewIsValidOrderRow(rRow)) continue;
            const val = invNewCleanCell(rRow[6]);
            if (val !== "") invoiceCounts.set(val, (invoiceCounts.get(val) || 0) + 1);
        }

        let duplicateFound = false;
        const duplicateRows = [["DUPLICATE INVOICE", "COUNT"]];
        const duplicateList = [];
        for (const [inv, count] of invoiceCounts.entries()) {
            if (count > 1) {
                duplicateFound = true;
                duplicateRows.push([inv, count]);
                duplicateList.push(inv);
            }
        }

        // 8. Generate 18-Column Combined Master (OD) Sheet
        const combinedRows = [[
            "Order ID", "Invoice ID", "New Invoice ID", "Invoice Reference Number (IRN)",
            "Shipment date", "Invoice date", "GST ID", "SKU ID", "SKU", "Item Title",
            "Quantity", "Item Cost", "GST Rate", "CESS Rate", "HSN", "Warehouse Code/Name",
            "Status", "state code"
        ]];

        for (let r = 1; r < cleanDropShipRows.length; r++) {
            const row = cleanDropShipRows[r];
            if (!row || !invNewIsValidOrderRow(row)) continue;
            const newRow = new Array(18).fill("");
            newRow[0] = invNewCleanCell(row[4]).replace(/^[`']/, '').trim();
            newRow[1] = invNewCleanCell(row[7]); // Taken from Column H of DT file
            newRow[2] = invNewCleanCell(row[6]);
            newRow[3] = "";
            newRow[4] = invNewFormatDate(row[11]);
            newRow[5] = invNewFormatDate(row[12]);
            newRow[6] = "24AAECE9149B1ZU";
            newRow[7] = "";
            newRow[8] = "";
            newRow[9] = invNewCleanCell(row[23]);

            let qty = 1;
            if (idxQuantity !== -1 && row[idxQuantity] !== undefined && String(row[idxQuantity]).trim() !== "") {
                qty = invNewCleanCell(row[idxQuantity]);
            }
            newRow[10] = qty;

            let costVal = "";
            if (idxItemPrice !== -1 && row[idxItemPrice] !== undefined && String(row[idxItemPrice]).trim() !== "") {
                costVal = row[idxItemPrice];
            } else if (row[49] !== undefined && String(row[49]).trim() !== "") {
                costVal = row[49];
            } else if (row[47] !== undefined && String(row[47]).trim() !== "") {
                costVal = row[47];
            }
            newRow[11] = costVal;
            newRow[12] = "5%";
            newRow[13] = "";

            let hsnVal = "";
            if (idxHsn !== -1 && row[idxHsn] !== undefined && String(row[idxHsn]).trim() !== "") {
                hsnVal = invNewCleanCell(row[idxHsn]);
            } else if (row[25] !== undefined && String(row[25]).trim() !== "") {
                hsnVal = invNewCleanCell(row[25]);
            }
            newRow[14] = hsnVal;

            const colDV = invNewCleanCell(row[125]);
            const colA = invNewCleanCell(row[0]);
            newRow[15] = (colDV && colA) ? `${colDV}/${colA}` : (colDV || colA);
            newRow[16] = "Not Submitted";
            newRow[17] = invNewGetIndianStateCode(invNewCleanCell(row[39]));

            combinedRows.push(newRow);
        }

        // 9. Formulate Filenames
        const dtNameStr = invoicePrefix ? `${partyCode}-(${invoicePrefix}-${minNum}-${maxNum})-DT` : `${partyCode}-(${minNum}-${maxNum})-DT`;
        const odNameStr = invoicePrefix ? `${partyCode}-(${invoicePrefix}-${minNum}-${maxNum})-OD` : `${partyCode}-(${minNum}-${maxNum})-OD`;
        const finalDtFileName = `${dtNameStr}.xlsx`;
        const finalOdFileName = `${odNameStr}.xlsx`;

        if (!isBatchMode) {
            if (invNewInputOdName) invNewInputOdName.value = odNameStr;
            if (invNewInputDtName) invNewInputDtName.value = dtNameStr;
            if (invNewInputCombinedName) invNewInputCombinedName.value = odNameStr;
            if (invNewRangeValue) invNewRangeValue.textContent = generatedRange;
        }

        // 10. Compile Workbooks & Blobs (Filtered strictly to zero blank/ghost rows)
        const finalCleanDropShipRows = cleanDropShipRows.filter((r, idx) => idx === 0 || invNewIsValidOrderRow(r));
        const finalCleanOdRows = combinedRows.filter((r, idx) => idx === 0 || invNewIsValidOrderRow(r));

        const dtWS = XLSX.utils.aoa_to_sheet(finalCleanDropShipRows);
        invNewStripEmptyCellsFromWorksheet(dtWS);
        const dtWB = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(dtWB, dtWS, "DT");
        for (const key in dtCellStyles) {
            const [r, c] = key.split(',').map(Number);
            const cellRef = XLSX.utils.encode_cell({ r, c });
            if (dtWS[cellRef]) dtWS[cellRef].s = dtCellStyles[key];
        }
        const dtArrayBuffer = XLSX.write(dtWB, { bookType: 'xlsx', type: 'array' });
        const dtBlob = new Blob([dtArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const odWS = XLSX.utils.aoa_to_sheet(finalCleanOdRows);
        invNewStripEmptyCellsFromWorksheet(odWS);
        const odWB = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(odWB, odWS, "Combined Master");
        const odArrayBuffer = XLSX.write(odWB, { bookType: 'xlsx', type: 'array' });
        const odBlob = new Blob([odArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Update file states
        dropShipFileObj.originalFile = dtBlob;
        dropShipFileObj.renamedName = finalDtFileName;
        dropShipFileObj.category = "DT";
        dropShipFileObj.partyCode = partyCode;
        dropShipFileObj.partyRange = generatedRange;
        dropShipFileObj.parsedAOA = finalCleanDropShipRows;
        dropShipFileObj.cellStyles = dtCellStyles;

        if (indoPrimoFileObj) {
            indoPrimoFileObj.category = "IndoPrimo";
        }

        invNewFilesList.push({
            id: invNewNextId++,
            name: finalOdFileName,
            path: finalOdFileName,
            ext: "xlsx",
            originalFile: odBlob,
            category: "OD",
            renamedName: finalOdFileName,
            partyCode: partyCode,
            partyRange: generatedRange,
            parsedAOA: combinedRows
        });

        // GST Not Applicable file
        if (gstCreated && gstRows.length > 1) {
            const gstWS = XLSX.utils.aoa_to_sheet(gstRows);
            const gstWB = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(gstWB, gstWS, "GST NOT APPLICABLE");
            for (const key in gstCellStyles) {
                const [r, c] = key.split(',').map(Number);
                const cellRef = XLSX.utils.encode_cell({ r, c });
                if (gstWS[cellRef]) gstWS[cellRef].s = gstCellStyles[key];
            }
            const gstBuffer = XLSX.write(gstWB, { bookType: 'xlsx', type: 'array' });
            const gstBlob = new Blob([gstBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const gstFileName = `${partyCode}-GST NOT APPLICABLE.xlsx`;
            invNewFilesList.push({
                id: invNewNextId++,
                name: gstFileName,
                path: gstFileName,
                ext: "xlsx",
                originalFile: gstBlob,
                category: "unmatched",
                renamedName: "GST NOT APPLICABLE.xlsx",
                partyCode: partyCode,
                partyRange: generatedRange,
                parsedAOA: gstRows,
                cellStyles: gstCellStyles
            });
            invNewAddLog(`[${partyCode}] Generated ${gstFileName} (${gstRows.length - 1} records).`, "warning");
        }

        // Duplicate Invoices file
        if (duplicateFound) {
            const dupWS = XLSX.utils.aoa_to_sheet(duplicateRows);
            const dupWB = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(dupWB, dupWS, "DUPLICATES");
            const dupBuffer = XLSX.write(dupWB, { bookType: 'xlsx', type: 'array' });
            const dupBlob = new Blob([dupBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const dupFileName = `${partyCode}-2 MORE INVOICE.xlsx`;
            invNewFilesList.push({
                id: invNewNextId++,
                name: dupFileName,
                path: dupFileName,
                ext: "xlsx",
                originalFile: dupBlob,
                category: "unmatched",
                renamedName: "2 MORE INVOICE.xlsx",
                partyCode: partyCode,
                partyRange: generatedRange,
                parsedAOA: duplicateRows
            });
            invNewAddLog(`[${partyCode}] Generated ${dupFileName} (${duplicateRows.length - 1} duplicate invoices).`, "warning");
        }

        // Metrics returned for Master Summary Report (No individual party summary file generated in folder)

        return {
            partyCode: partyCode,
            partyName: invNewGetPartyCodeName(partyCode),
            odName: finalOdFileName,
            dtName: finalDtFileName,
            generatedRange: generatedRange,
            dateRangeStr: dateRangeStr,
            b2p2String: b2p2String,
            soldCnt: finalCleanDropShipRows.length - 1,
            cancelCnt: deletedCount,
            cancelledInvoices: duplicateList
        };
    }

    // -------------------------------------------------------------
    // COMBINED INVOICE SUMMARY REPORT (AJIO & FLIPKART STYLE)
    // -------------------------------------------------------------
    function invNewGetFormattedDateTime(date = new Date()) {
        const pad = (n) => String(n).padStart(2, '0');
        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const year = date.getFullYear();
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        return `${day}-${month}-${year} ${hours}-${minutes}-${seconds}`;
    }

    function invNewGenerateCombinedSummaryFile(allPartyMetrics) {
        if (!allPartyMetrics || allPartyMetrics.length === 0) return null;

        const summaryWb = XLSX.utils.book_new();

        // Sheet 1: "Invoice Summary" (party block list matching Ajio & Myntra)
        const partySummaryRows = [];
        for (let i = 0; i < allPartyMetrics.length; i++) {
            const m = allPartyMetrics[i];
            const pName = m.partyName || invNewGetPartyCodeName(m.partyCode);
            partySummaryRows.push([pName]);
            partySummaryRows.push([m.generatedRange || "-"]);
            partySummaryRows.push([]); // blank separator
        }
        const wsSummary = XLSX.utils.aoa_to_sheet(partySummaryRows);
        XLSX.utils.book_append_sheet(summaryWb, wsSummary, "Invoice Summary");

        // Sheet 2: "Invoice Details" (tabular overview)
        const detailedSummaryData = [
            ["Party Code", "Party Name", "OD File", "DT File", "Total Sold", "Total Cancelled", "Invoice Range", "Date Range", "Duplicates Count", "Status"]
        ];
        for (const m of allPartyMetrics) {
            detailedSummaryData.push([
                m.partyCode,
                m.partyName || invNewGetPartyCodeName(m.partyCode),
                m.odName,
                m.dtName,
                m.soldCnt,
                m.cancelCnt,
                m.generatedRange,
                m.dateRangeStr,
                m.cancelledInvoices ? m.cancelledInvoices.length : 0,
                "Success"
            ]);
        }
        const wsDetailed = XLSX.utils.aoa_to_sheet(detailedSummaryData);
        XLSX.utils.book_append_sheet(summaryWb, wsDetailed, "Invoice Details");

        const summaryBuffer = XLSX.write(summaryWb, { bookType: 'xlsx', type: 'array' });
        const summaryBlob = new Blob([summaryBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const summaryFilename = `flipkart invoice summary ${invNewGetFormattedDateTime()}.xlsx`;

        const summaryObj = {
            id: invNewNextId++,
            name: summaryFilename,
            path: summaryFilename,
            ext: "xlsx",
            originalFile: summaryBlob,
            category: "Summary",
            renamedName: summaryFilename,
            partyCode: "__BATCH_ROOT__",
            partyRange: "Summary",
            parsedAOA: partySummaryRows
        };
        invNewFilesList.push(summaryObj);
        invNewAddLog(`Generated single combined summary file: ${summaryFilename}`, "success");
        return summaryObj;
    }

    // -------------------------------------------------------------
    // PROCESS BUTTON CLICK LISTENER
    // -------------------------------------------------------------
    if (invNewBtnProcessAction) {
        invNewBtnProcessAction.addEventListener('click', async () => {
            if (invNewFilesList.length === 0) {
                alert("Please upload DropShip and IndoPrimo files first.");
                return;
            }

            let uniqueCodes = invNewGetUniquePartyCodes();
            if (uniqueCodes.length === 0) {
                const pCode = invNewGetPartyCode(invNewFilesList[0]) || "101";
                uniqueCodes = [pCode];
            }

            invNewShowLoading("Running 2-File Excel Pipeline...", 5);
            invNewClearLogs();
            await new Promise(r => setTimeout(r, 50));

            try {
                if (uniqueCodes.length === 1) {
                    // Single Party Mode
                    const odId = parseInt(invNewSelectOdFile ? invNewSelectOdFile.value : "");
                    const dtId = parseInt(invNewSelectDtFile ? invNewSelectDtFile.value : "");

                    let dropShipObj, indoPrimoObj;
                    const partyCode = uniqueCodes[0];

                    if (odId && dtId) {
                        dropShipObj = invNewFilesList.find(f => f.id === odId);
                        indoPrimoObj = invNewFilesList.find(f => f.id === dtId);
                    } else {
                        dropShipObj = invNewFilesList.find(f => f.category === 'OD' || f.name.toLowerCase().includes('dropship') || f.name.toLowerCase().includes('seller_orders_report') || f.name.toLowerCase().includes('flipkart_merged_orders'));
                        indoPrimoObj = invNewFilesList.find(f => f !== dropShipObj);
                    }

                    if (!dropShipObj || !indoPrimoObj) {
                        alert("Missing required DropShip or IndoPrimo file.");
                        invNewHideLoading();
                        return;
                    }

                    // Clean previous run outputs
                    invNewFilesList = invNewFilesList.filter(f => 
                        !f.name.endsWith("-GST NOT APPLICABLE.xlsx") && !f.name.endsWith("-2 MORE INVOICE.xlsx") && !f.name.endsWith("-SUMMARY.xlsx") && !f.name.toLowerCase().includes("summary") && f.category !== "Combined" && f.category !== "Summary"
                    );

                    invNewUpdateProgress(20, "Loading DropShip and IndoPrimo sheet data...");
                    await new Promise(r => setTimeout(r, 40));

                    const metrics = await invNewProcessPartyPipeline2Files(dropShipObj, indoPrimoObj, partyCode, false);
                    invNewGenerateCombinedSummaryFile([metrics]);
                    invNewUpdateProgress(95, "Finalizing output workbooks...");
                    await new Promise(r => setTimeout(r, 40));

                    // Update UI Details Log Summary
                    if (invNewLogTdFilename) invNewLogTdFilename.textContent = metrics.odName;
                    if (invNewLogTdRange) invNewLogTdRange.textContent = metrics.generatedRange;
                    if (invNewLogTdDates) invNewLogTdDates.textContent = metrics.dateRangeStr;
                    if (invNewLogTdB2p2) invNewLogTdB2p2.textContent = metrics.b2p2String;
                    if (invNewRangeValue) invNewRangeValue.textContent = metrics.generatedRange;

                    if (invNewStatTotal) invNewStatTotal.textContent = metrics.soldCnt + metrics.cancelCnt;
                    if (invNewStatOd) invNewStatOd.textContent = "1";
                    if (invNewStatDt) invNewStatDt.textContent = "1";
                    if (invNewStatDtSold) invNewStatDtSold.textContent = metrics.soldCnt;
                    if (invNewStatDtCancelled) invNewStatDtCancelled.textContent = metrics.cancelCnt;
                    if (invNewStatUnmatched) invNewStatUnmatched.textContent = (metrics.cancelledInvoices ? metrics.cancelledInvoices.length : 0);

                    // Duplicate/Cancelled invoices list
                    if (invNewCancelledInvoicesList) {
                        invNewCancelledInvoicesList.innerHTML = '';
                        if (metrics.cancelledInvoices && metrics.cancelledInvoices.length > 0) {
                            metrics.cancelledInvoices.forEach(inv => {
                                const badge = document.createElement('span');
                                badge.className = 'cancelled-invoice-badge';
                                badge.textContent = inv;
                                badge.addEventListener('click', () => {
                                    if (invNewSearchInput) {
                                        invNewSearchInput.value = inv;
                                        invNewRenderFilesTable();
                                    }
                                });
                                invNewCancelledInvoicesList.appendChild(badge);
                            });
                        } else {
                            invNewCancelledInvoicesList.innerHTML = '<span style="color: #94a3b8;">No duplicate invoices found.</span>';
                        }
                    }

                    invNewIsProcessed = true;
                    if (invNewDashboardControls) invNewDashboardControls.style.display = 'block';
                    invNewRenderFilesTable();
                    invNewHideLoading();
                    invNewAddLog("Pipeline completed successfully! Ready for ZIP download.", "success");

                } else {
                    // Batch Mode
                    invNewAddLog(`Batch Mode: Processing ${uniqueCodes.length} parties...`, "warning");

                    invNewFilesList = invNewFilesList.filter(f => 
                        !f.name.endsWith("-GST NOT APPLICABLE.xlsx") && !f.name.endsWith("-2 MORE INVOICE.xlsx") && !f.name.endsWith("-SUMMARY.xlsx") && !f.name.toLowerCase().includes("summary") && f.category !== "Combined" && f.category !== "Summary"
                    );

                    let totalSold = 0;
                    let totalCancel = 0;
                    const allCancelled = [];
                    const allPartyMetrics = [];

                    for (let pi = 0; pi < uniqueCodes.length; pi++) {
                        const partyCode = uniqueCodes[pi];
                        const groupFiles = invNewFilesList.filter(f => invNewGetPartyCode(f) === partyCode);

                        const dropShipObj = groupFiles.find(f => f.category === 'OD' || f.name.toLowerCase().includes('dropship') || f.name.toLowerCase().includes('seller_orders_report') || f.name.toLowerCase().includes('flipkart_merged_orders'));
                        const indoPrimoObj = groupFiles.find(f => f !== dropShipObj);

                        if (!dropShipObj || !indoPrimoObj) {
                            invNewAddLog(`[${partyCode}] Skipped: Missing DropShip or IndoPrimo file.`, "error");
                            continue;
                        }

                        const pStart = Math.round(10 + (pi / uniqueCodes.length) * 80);
                        invNewUpdateProgress(pStart, `Processing party ${partyCode} (${pi+1}/${uniqueCodes.length})...`);
                        await new Promise(r => setTimeout(r, 30));

                        try {
                            const metrics = await invNewProcessPartyPipeline2Files(dropShipObj, indoPrimoObj, partyCode, true);
                            allPartyMetrics.push(metrics);
                            totalSold += metrics.soldCnt;
                            totalCancel += metrics.cancelCnt;
                            if (metrics.cancelledInvoices) allCancelled.push(...metrics.cancelledInvoices);
                        } catch (err) {
                            invNewAddLog(`[${partyCode}] Error: ${err.message}`, "error");
                        }
                    }

                    if (allPartyMetrics.length > 0) {
                        invNewGenerateCombinedSummaryFile(allPartyMetrics);

                        // Populate Details Log Summary and Invoice Range for the Batch
                        if (invNewLogTdFilename) invNewLogTdFilename.textContent = allPartyMetrics.map(m => m.odName).join(', ');
                        if (invNewLogTdRange) invNewLogTdRange.textContent = allPartyMetrics.map(m => m.generatedRange).join(' | ');
                        if (invNewLogTdDates) invNewLogTdDates.textContent = allPartyMetrics.map(m => m.dateRangeStr).filter(d => d && d !== '—').join(' | ') || '—';
                        if (invNewLogTdB2p2) invNewLogTdB2p2.textContent = allPartyMetrics.map(m => m.b2p2String).filter(b => b && b !== '—').join(' | ') || '—';
                        if (invNewRangeValue) invNewRangeValue.textContent = allPartyMetrics.map(m => `${m.partyName || m.partyCode}: ${m.generatedRange}`).join(' | ');
                    }

                    if (invNewStatTotal) invNewStatTotal.textContent = totalSold + totalCancel;
                    if (invNewStatOd) invNewStatOd.textContent = uniqueCodes.length;
                    if (invNewStatDt) invNewStatDt.textContent = uniqueCodes.length;
                    if (invNewStatDtSold) invNewStatDtSold.textContent = totalSold;
                    if (invNewStatDtCancelled) invNewStatDtCancelled.textContent = totalCancel;
                    if (invNewStatUnmatched) invNewStatUnmatched.textContent = allCancelled.length;

                    if (invNewCancelledInvoicesList) {
                        invNewCancelledInvoicesList.innerHTML = '';
                        if (allCancelled.length > 0) {
                            allCancelled.forEach(inv => {
                                const badge = document.createElement('span');
                                badge.className = 'cancelled-invoice-badge';
                                badge.textContent = inv;
                                invNewCancelledInvoicesList.appendChild(badge);
                            });
                        } else {
                            invNewCancelledInvoicesList.innerHTML = '<span style="color: #94a3b8;">No duplicate invoices found.</span>';
                        }
                    }

                    invNewIsProcessed = true;
                    if (invNewDashboardControls) invNewDashboardControls.style.display = 'block';
                    invNewRenderFilesTable();
                    invNewHideLoading();
                    invNewAddLog(`Batch processing complete for ${uniqueCodes.length} parties. Ready for download.`, "success");
                }
            } catch (err) {
                console.error(err);
                invNewHideLoading();
                alert("Pipeline execution error: " + err.message);
                invNewAddLog("Error: " + err.message, "error");
            }
        });
    }

    // -------------------------------------------------------------
    // DOWNLOAD ALL AS ZIP (Exact Myntra Nested Hierarchy)
    // -------------------------------------------------------------
    async function invNewDownloadAllAsZip() {
        const outputFiles = invNewFilesList.filter(fileObj => {
            const cat = fileObj.category;
            const rName = fileObj.renamedName || fileObj.name || "";
            return cat === "OD" || cat === "DT" || cat === "Combined" || cat === "Summary" ||
                   rName.toLowerCase().includes("summary") ||
                   rName === "2 MORE INVOICE.xlsx" ||
                   rName.endsWith("-2 MORE INVOICE.xlsx") ||
                   rName === "GST NOT APPLICABLE.xlsx" ||
                   rName.endsWith("-GST NOT APPLICABLE.xlsx");
        });

        if (outputFiles.length === 0) {
            alert("No processed files available to package into ZIP.");
            return;
        }

        invNewShowLoading("Packaging processed files into ZIP...", 10);
        const newZip = new JSZip();
        const usedPaths = new Set();

        try {
            const processedParties = new Set();
            outputFiles.forEach(f => {
                if (f.partyCode && f.partyCode !== "__BATCH_ROOT__") processedParties.add(f.partyCode);
            });
            const partyCodesArray = Array.from(processedParties).sort((a, b) => {
                const numA = parseInt(a, 10);
                const numB = parseInt(b, 10);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            });

            // Set ZIP Name (e.g. "101_Arranged.zip" or "101-509_Arranged.zip")
            let zipName = "";
            if (partyCodesArray.length === 1) {
                zipName = `${partyCodesArray[0]}_Arranged.zip`;
            } else if (partyCodesArray.length > 1) {
                zipName = `${partyCodesArray[0]}-${partyCodesArray[partyCodesArray.length - 1]}_Arranged.zip`;
            } else if (invNewUploadedZipBaseName && !invNewUploadedZipBaseName.includes("bundle") && !invNewUploadedZipBaseName.includes("flipkart_data_arrange")) {
                const cleanBase = invNewUploadedZipBaseName.replace(/[-_]?(?:processed|arranged)$/i, '');
                zipName = `${cleanBase}_Arranged.zip`;
            } else {
                zipName = "flipkart_Arranged.zip";
            }

            const toggleStructEl = document.getElementById('invNewToggleStructure');
            const keepStructure = toggleStructEl ? toggleStructEl.checked : true;

            for (let i = 0; i < outputFiles.length; i++) {
                const zipProgress = 10 + Math.round((i / outputFiles.length) * 70);
                invNewUpdateProgress(zipProgress, `Adding file ${i + 1}/${outputFiles.length} to ZIP...`);
                const fileObj = outputFiles[i];

                let partyCode = fileObj.partyCode || invNewGetPartyCode(fileObj);
                if (!partyCode || partyCode === "PartyCode") {
                    partyCode = partyCodesArray[0] || "Processed";
                }

                let partyRange = fileObj.partyRange;
                if (!partyRange) {
                    const sibling = outputFiles.find(f => f.partyCode === partyCode && f.partyRange);
                    if (sibling) {
                        partyRange = sibling.partyRange;
                    }
                }

                const hasRange = (partyRange && partyRange !== "—" && partyRange !== "RangeNotFound");
                const baseFolder = partyCode;
                const subFolder = hasRange ? `${partyCode}-(${partyRange})` : `${partyCode}-(Processed)`;

                const filename = fileObj.renamedName || fileObj.name;
                const lastDot = filename.lastIndexOf('.');
                const baseName = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
                const extension = lastDot !== -1 ? filename.substring(lastDot) : "";

                const isSummary = filename.toLowerCase().includes("summary");

                let targetPath = "";
                if (keepStructure) {
                    if (isSummary || fileObj.partyCode === "__BATCH_ROOT__") {
                        // Single Master Summary sits directly at the root of the ZIP (e.g. "flipkart invoice summary 12-09-2026 12-06-38.xlsx")
                        targetPath = filename;
                    } else {
                        // DT, OD, 2 MORE INVOICE, GST NOT APPLICABLE sit inside party subFolder:
                        // e.g. "101/101-(FK27S101-374-456)/101-(FK27S101-374-456)-DT.xlsx"
                        let cleanName = filename;
                        if (filename.includes("2 MORE INVOICE")) {
                            cleanName = "2 MORE INVOICE.xlsx";
                        } else if (filename.includes("GST NOT APPLICABLE")) {
                            cleanName = "GST NOT APPLICABLE.xlsx";
                        }
                        targetPath = `${baseFolder}/${subFolder}/${cleanName}`;
                    }
                } else {
                    targetPath = filename;
                }

                let counter = 1;
                while (usedPaths.has(targetPath.toLowerCase())) {
                    if (keepStructure) {
                        if (isSummary || fileObj.partyCode === "__BATCH_ROOT__") {
                            targetPath = `${baseName} (${counter})${extension}`;
                        } else {
                            targetPath = `${baseFolder}/${subFolder}/${baseName} (${counter})${extension}`;
                        }
                    } else {
                        targetPath = `${baseName} (${counter})${extension}`;
                    }
                    counter++;
                }

                usedPaths.add(targetPath.toLowerCase());
                newZip.file(targetPath, fileObj.originalFile);
            }

            invNewUpdateProgress(85, "Generating ZIP download package...");
            const content = await newZip.generateAsync({ type: "blob" });

            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = zipName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);

            invNewHideLoading();
            invNewAddLog(`Downloaded ZIP package: ${zipName}`, "success");
        } catch (error) {
            console.error(error);
            invNewHideLoading();
            alert("Failed to create ZIP: " + error.message);
        }
    }

    if (invNewBtnDownloadZip) {
        invNewBtnDownloadZip.addEventListener('click', invNewDownloadAllAsZip);
    }

    // -------------------------------------------------------------
    // CLIPBOARD COPY HELPERS
    // -------------------------------------------------------------
    function invNewCopyToClipboard(text, successMsg) {
        if (!text || text === "—") {
            alert("No data available to copy.");
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                alert(successMsg);
            }).catch(() => {
                invNewFallbackCopy(text, successMsg);
            });
        } else {
            invNewFallbackCopy(text, successMsg);
        }
    }

    function invNewFallbackCopy(text, successMsg) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert(successMsg);
    }

    if (invNewBtnCopyLog) {
        invNewBtnCopyLog.addEventListener('click', () => {
            const fName = invNewLogTdFilename ? invNewLogTdFilename.textContent : "";
            const range = invNewLogTdRange ? invNewLogTdRange.textContent : "";
            const dates = invNewLogTdDates ? invNewLogTdDates.textContent : "";
            const b2p2 = invNewLogTdB2p2 ? invNewLogTdB2p2.textContent : "";
            const rowStr = [fName, range, dates, b2p2].join('\t');
            invNewCopyToClipboard(rowStr, "Details log row copied! Paste directly into Excel.");
        });
    }

    if (invNewBtnCopyRange) {
        invNewBtnCopyRange.addEventListener('click', () => {
            const range = invNewRangeValue ? invNewRangeValue.textContent : "";
            invNewCopyToClipboard(range, "Invoice range copied to clipboard!");
        });
    }

    if (invNewBtnCopyCancelled) {
        invNewBtnCopyCancelled.addEventListener('click', () => {
            if (!invNewCancelledInvoicesList) return;
            const badges = invNewCancelledInvoicesList.querySelectorAll('.cancelled-invoice-badge');
            const list = Array.from(badges).map(b => b.textContent.trim());
            invNewCopyToClipboard(list.join(', '), "Cancelled/Duplicate invoices copied!");
        });
    }

    // -------------------------------------------------------------
    // RESET & DROPZONE EVENT LISTENERS
    // -------------------------------------------------------------
    function invNewResetAll() {
        invNewFilesList = [];
        invNewNextId = 1;
        invNewUploadedZipBaseName = "";
        invNewIsProcessed = false;
        if (invNewFileInput) invNewFileInput.value = '';
        if (invNewFolderInput) invNewFolderInput.value = '';
        if (invNewEmptyState) invNewEmptyState.style.display = 'block';
        if (invNewTableContainer) invNewTableContainer.style.display = 'none';
        if (invNewMappingCard) invNewMappingCard.style.display = 'none';
        if (invNewDashboardControls) invNewDashboardControls.style.display = 'none';
        if (invNewFilesTbody) invNewFilesTbody.innerHTML = '';
        if (invNewLogTdFilename) invNewLogTdFilename.textContent = '—';
        if (invNewLogTdRange) invNewLogTdRange.textContent = '—';
        if (invNewLogTdDates) invNewLogTdDates.textContent = '—';
        if (invNewLogTdB2p2) invNewLogTdB2p2.textContent = '—';
        if (invNewRangeValue) invNewRangeValue.textContent = '—';
        if (invNewCancelledInvoicesList) invNewCancelledInvoicesList.innerHTML = '<span style="color: #94a3b8;">None logged yet...</span>';
        invNewClearLogs();
    }

    if (btnInvNewReset) btnInvNewReset.addEventListener('click', invNewResetAll);
    if (invNewBtnClear) invNewBtnClear.addEventListener('click', invNewResetAll);

    if (invNewSelectFilesBtn && invNewFileInput) {
        invNewSelectFilesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            invNewFileInput.click();
        });
    }

    if (invNewSelectFolderBtn && invNewFolderInput) {
        invNewSelectFolderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            invNewFolderInput.click();
        });
    }

    if (invNewDropzone) {
        invNewDropzone.addEventListener('click', () => {
            if (invNewFileInput) invNewFileInput.click();
        });

        ['dragenter', 'dragover'].forEach(evt => {
            invNewDropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                invNewDropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            invNewDropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                invNewDropzone.classList.remove('dragover');
            });
        });

        invNewDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                invNewHandleDroppedFiles(Array.from(e.dataTransfer.files));
            }
        });
    }

    if (invNewFileInput) {
        invNewFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                invNewHandleDroppedFiles(Array.from(e.target.files));
            }
        });
    }

    if (invNewFolderInput) {
        invNewFolderInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                invNewHandleDroppedFiles(Array.from(e.target.files));
            }
        });
    }

    if (invNewSearchInput) {
        invNewSearchInput.addEventListener('input', invNewRenderFilesTable);
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

            // Cache party list in memory & localStorage
            window.flipkartPartyList = data;
            try {
                localStorage.setItem('flipkart_parties_cache', JSON.stringify(data));
            } catch (e) {}

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
