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

    // Move Renamed Files to Create Folder
    async function moveRenamedFilesToCreateFolder() {
        if (!currentRenameZipInstance && !currentRenameZipBlob) {
            alert('No renamed files available. Please run the rename process first.');
            return;
        }

        showLoader('Moving renamed files to Create Folder...');
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

            const modeFilesBtn1 = document.getElementById('fcModeFilesBtn') || document.getElementById('folderModeFilesBtn');
            if (folderMode !== 'files' && modeFilesBtn1) {
                modeFilesBtn1.click();
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

            if (renameFullViewModal) renameFullViewModal.style.display = 'none';

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
                `${filesToMove.length} renamed file(s) have been successfully added to Create Folder!`,
                'success'
            );

        } catch (err) {
            hideLoader();
            console.error('Error moving renamed files to Create Folder:', err);
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

    if (renameMoveToFolderBtn) renameMoveToFolderBtn.addEventListener('click', moveRenamedFilesToCreateFolder);
    if (fullViewMoveToFolderBtn) fullViewMoveToFolderBtn.addEventListener('click', moveRenamedFilesToCreateFolder);
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
    function switchFcMode(mode) {
        if (fcMode === mode) return;
        fcMode = mode;
        folderMode = mode;
        fcFiles = [];
        selectedFolderFiles = fcFiles;
        if (fcFileInput) fcFileInput.value = '';
        if (fcFolderInput) fcFolderInput.value = '';

        if (mode === 'files') {
            if (fcModeFilesBtn) fcModeFilesBtn.classList.add('active');
            if (fcModeFoldersBtn) fcModeFoldersBtn.classList.remove('active');
            if (fcUploadTitle) fcUploadTitle.textContent = "Select Files to Group (3 Files Rule)";
            if (fcUploadDesc) fcUploadDesc.textContent = "Drag & drop all files (including Merged file & prefix sheets) together.";
            if (fcFileDisplay) fcFileDisplay.innerHTML = 'Drag & drop files here or <span class="browse-link">Browse Files</span>';
        } else {
            if (fcModeFilesBtn) fcModeFilesBtn.classList.remove('active');
            if (fcModeFoldersBtn) fcModeFoldersBtn.classList.add('active');
            if (fcUploadTitle) fcUploadTitle.textContent = "Upload Folders Directly (3 Files Rule)";
            if (fcUploadDesc) fcUploadDesc.textContent = "Drag & drop whole folders here to verify 3 files per folder and package.";
            if (fcFileDisplay) fcFileDisplay.innerHTML = 'Drag & drop folders here or <span class="browse-link">Browse Folders</span>';
        }
        updateFcUploadedFileListUI();
        appendFcLog(`Switched mode to: ${mode === 'files' ? 'Group Files by Prefix' : 'Process Folders Directly'}`);
    }

    if (fcModeFilesBtn) fcModeFilesBtn.addEventListener('click', () => switchFcMode('files'));
    if (fcModeFoldersBtn) fcModeFoldersBtn.addEventListener('click', () => switchFcMode('folders'));

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

    if (clearFcFilesBtn) {
        clearFcFilesBtn.addEventListener('click', () => {
            fcFiles = [];
            selectedFolderFiles = fcFiles;
            updateFcUploadedFileListUI();
            if (fcFileInput) fcFileInput.value = '';
            if (fcFolderInput) fcFolderInput.value = '';
            appendFcLog('Cleared all selected files.');
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
            appendFcLog('Starting Folder Create process with Strict 3-File Rule...');

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

                if (fcProgressBar) {
                    fcProgressBar.style.width = '45%';
                    fcProgressPercent.textContent = '45%';
                    fcProgressStepText.textContent = 'Validating 3 files per folder...';
                }

                // Strict 3-File validation
                fcFolderGroups = Object.values(groupsMap);
                fcFolderGroups.forEach(grp => {
                    grp.isError = (grp.files.length !== 3);
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

                appendFcLog(`Folder Create completed. Total: ${totalFolders}, Ready (3 Files): ${readyCount}, Errors (< 3 Files): ${incompleteCount}.`, incompleteCount > 0 ? 'warning' : 'success');

                if (incompleteCount > 0) {
                    showCustomAlert(
                        'Folders Created with Incomplete Files',
                        `${incompleteCount} folder(s) have fewer than 3 files and triggered an ERROR! They are displayed first in the Folder Manager.`,
                        'warning'
                    );
                } else {
                    showCustomAlert(
                        'Folder Create Successful',
                        `All ${totalFolders} folder(s) have exactly 3 files! Your package is ready.`,
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

        fcFolderGroups.forEach(grp => {
            // Strict 3-File rule: exactly 3 files required
            grp.isError = (grp.files.length !== 3);
            if (grp.isError) {
                foldersWithIssues.push(grp);
                hasMissing = true;
            }

            const folder = zip.folder(grp.prefix);
            grp.files.forEach(fObj => {
                folder.file(fObj.name, fObj.blob || fObj.file);
            });
        });

        // Re-sort so error folders (< 3 files) appear first
        sortFolderGroups(fcFolderGroups);

        if (hasMissing) {
            const reportData = [
                ["Folder Name (Prefix)", "Files Found", "Current Files", "Status"]
            ];
            foldersWithIssues.forEach(item => {
                const fileNamesStr = item.files.map(f => f.name).join(", ");
                const statusStr = item.files.length < 3
                    ? `File Missing (Found ${item.files.length}, Expected 3)`
                    : `Extra Files Present (Found ${item.files.length}, Expected 3)`;
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
                                ${incompleteCount > 0 ? `${incompleteCount} folder(s) have missing files (< 3 files). Fix them in Folder Manager.` : `All ${totalFolders} folder(s) have exactly 3 files! Ready for Invoice Arrange.`}
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
                        <div style="font-size: 0.75rem; color: #059669; font-weight: 600; text-transform: uppercase;">Ready (3 Files)</div>
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

    // Render Folder Accordion inside Fullscreen Modal
    function renderFcAccordion(filter = 'all') {
        if (!modalFcAccordionContainer) return;
        modalFcAccordionContainer.innerHTML = '';

        const totalFolders = fcFolderGroups.length;
        const incompleteCount = fcFolderGroups.filter(f => f.isError).length;
        const readyCount = totalFolders - incompleteCount;

        // Update badges
        if (modalFcTotalBadge) modalFcTotalBadge.innerHTML = `<i class="fa-solid fa-folder"></i> Total: ${totalFolders} Folders`;
        if (modalFcReadyBadge) modalFcReadyBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Ready (3 Files): ${readyCount}`;
        if (modalFcErrorBadge) modalFcErrorBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Incomplete (< 3 Files): ${incompleteCount} (Shown First)`;

        if (modalFcDownloadReportBtn) {
            modalFcDownloadReportBtn.style.display = incompleteCount > 0 ? 'inline-flex' : 'none';
        }

        if (filterAllBtn) filterAllBtn.innerText = `All Folders (${totalFolders})`;
        if (filterIncBtn) filterIncBtn.innerText = `⚠️ Errors / Incomplete (${incompleteCount})`;
        if (filterRdyBtn) filterRdyBtn.innerText = `✅ Ready (3 Files) (${readyCount})`;

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
            // Strict 3-File rule: Incomplete (< 3 files) open by default!
            card.className = `fc-folder-card ${grp.isError ? 'error-card open' : 'success-card'}`;

            const isOk = grp.files.length === 3;
            const badgeColor = isOk ? '#059669' : '#dc2626';
            const badgeBg = isOk ? '#ecfdf5' : '#fee2e2';
            const badgeBorder = isOk ? '#a7f3d0' : '#fca5a5';
            const missingDiff = 3 - grp.files.length;
            const badgeText = isOk
                ? `✅ 3 Files (Complete)`
                : `⚠️ ${grp.files.length} / 3 Files (${missingDiff > 0 ? `Missing ${missingDiff}` : `Extra ${-missingDiff}`})`;

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
                        <div style="font-size: 0.75rem; color: #64748b;">${grp.files.length} of 3 file(s) attached</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-size: 0.78rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 6px;">
                        ${badgeText}
                    </span>
                    <i class="fa-solid fa-chevron-down fc-chevron"></i>
                </div>
            `;
            header.addEventListener('click', () => {
                card.classList.toggle('open');
            });
            card.appendChild(header);

            // Body
            const body = document.createElement('div');
            body.className = 'fc-folder-body';

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

        grp.files.splice(fileIndex, 1);
        grp.isError = (grp.files.length !== 3);
        appendFcLog(`Deleted "${fileName}" from folder [${prefix}]. Folder now has ${grp.files.length}/3 files.`);
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

        // Target folders: folders with < 3 files, excluding sourcePrefix
        const incompleteTargets = fcFolderGroups.filter(g => g.prefix !== fcSourcePrefixForCopy && g.files.length < 3);

        const search = (fcMoveSearchInput ? fcMoveSearchInput.value : '').trim().toLowerCase();

        const displayTargets = incompleteTargets.filter(g => {
            if (search === '') return true;
            return g.prefix.toLowerCase().includes(search);
        });

        if (displayTargets.length === 0) {
            fcMoveFoldersList.innerHTML = `
                <div style="text-align: center; padding: 1.5rem 0.5rem; color: #94a3b8; font-size: 0.85rem;">
                    <i class="fa-solid fa-circle-check" style="color: #059669; font-size: 1.5rem; margin-bottom: 6px;"></i>
                    <p style="margin: 0;">No incomplete folders (< 3 files) found!</p>
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
                            ${alreadyHasFile ? '⚠️ Already contains this file' : `Current: ${grp.files.length}/3 files (Needs ${3 - grp.files.length})`}
                        </div>
                    </div>
                </div>
                <span class="rename-badge-pill error" style="font-size: 0.72rem; padding: 2px 6px;">${grp.files.length}/3</span>
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
                        grp.isError = (grp.files.length !== 3);
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

            // Feed directly into Tab 5
            if (typeof handleInvoiceFilesSelection === 'function') {
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
                        grp.isError = (grp.files.length !== 3);
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
