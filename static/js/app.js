// Frontend Javascript - Flipkart Order Excel Toolset
document.addEventListener('DOMContentLoaded', () => {
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

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('drop', (e) => handleFilesSelection(e.dataTransfer.files));
    fileInput.addEventListener('change', (e) => handleFilesSelection(e.target.files));

    function handleFilesSelection(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop().toLowerCase();
            
            if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
                alert(`File "${file.name}" is not supported (supports Excel/CSV) and was skipped.`);
                continue;
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

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Server processing error.');

            hideLoader();
            successMessage.textContent = `Successfully merged ${selectedFiles.length} file(s). Total orders: ${data.total_orders}`;
            
            renderPreviewTable(data.columns, data.preview);
            
            resultCard.style.display = 'block';
            resultCard.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            hideLoader();
            alert(`Error: ${error.message}`);
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

    renameDropzone.addEventListener('click', () => renameFileInput.click());
    renameDropzone.addEventListener('drop', (e) => handleRenameFilesSelection(e.dataTransfer.files));
    renameFileInput.addEventListener('change', (e) => handleRenameFilesSelection(e.target.files));

    function handleRenameFilesSelection(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop().toLowerCase();
            
            if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
                alert(`File "${file.name}" is not supported. Please select Excel or CSV files.`);
                continue;
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

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Server processing error.');

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
            alert(`Error during renaming: ${error.message}`);
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

    function checkIsMergedFile(file) {
        return file.name.toUpperCase().includes('FLIPKART_MERGED_ORDERS');
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

        folderDropzone.addEventListener('click', () => {
            if (folderFileInput) folderFileInput.click();
        });
        
        folderDropzone.addEventListener('drop', (e) => {
            handleFolderFilesSelection(e.dataTransfer.files);
        });
    }

    if (folderFileInput) {
        folderFileInput.addEventListener('change', (e) => {
            handleFolderFilesSelection(e.target.files);
        });
    }

    function handleFolderFilesSelection(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop().toLowerCase();
            
            if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
                alert(`File "${file.name}" is not supported (supports Excel/CSV) and was skipped.`);
                continue;
            }

            const isDuplicate = selectedFolderFiles.some(f => f.name === file.name && f.size === file.size);
            if (!isDuplicate) selectedFolderFiles.push(file);
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
            const isMerged = checkIsMergedFile(file);
            const tagClass = isMerged ? 'tag-mapping' : 'tag-rename'; // Green tag for merged, Blue for prefix
            const tagText = isMerged ? 'Merged File' : 'Prefix File';

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
        });
    }

    if (folderProcessBtn) {
        folderProcessBtn.addEventListener('click', async () => {
            if (selectedFolderFiles.length === 0) return;

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

            const formData = new FormData();
            selectedFolderFiles.forEach(file => formData.append('files[]', file));

            showLoader("Grouping files by prefix and creating ZIP package...");
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
                    folderSuccessMessage.textContent = `Successfully created ${data.folders_count} prefix folder(s)!`;
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
            tdMerged.textContent = log.copied_merged;
            tdMerged.title = log.copied_merged;
            
            const tdMoved = document.createElement('td');
            tdMoved.textContent = log.moved_files.join(', ');
            tdMoved.title = log.moved_files.join(', ');

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

    if (errorProcessBtn) {
        errorProcessBtn.addEventListener('click', async () => {
            if (errorFiles.length !== 2) {
                alert('Please upload exactly 2 files (Details and Data).');
                return;
            }

            const formData = new FormData();
            errorFiles.forEach(f => formData.append('files[]', f));
            
            if (errorFromDate.value) formData.append('fromDate', errorFromDate.value);
            if (errorToDate.value) formData.append('toDate', errorToDate.value);

            showLoader('Processing Flipkart Error Data... This may take a minute.');

            try {
                const response = await fetch('/api/flipkart-error', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                hideLoader();
                
                if (response.ok) {
                    errorResultCard.style.display = 'block';
                    errorDownloadBtn.onclick = () => {
                        window.location.href = '/api/download-error-zip';
                    };
                    if (data.records && data.records.length > 0) {
                        for (const rec of data.records) {
                            await registerTrackedError('flipkart', rec.filename, rec.party, 'Price Dispute', rec.rows_count);
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
