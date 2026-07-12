// Code.gs - Google Apps Script for syncing Google Sheets with Flipkart Order Excel Toolset
var SPREADSHEET_ID = "14_Vxc8gCvTYuRsPvLzefVgzRlJjRDMHfMQHPGVYuZbI";

function getSpreadsheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch(e) {}
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : "getParties";
  
  if (action === "getTrackedErrors") {
    try {
      var ss = getSpreadsheet();
      var sheet = ss.getSheetByName("ERROR TRACKING");
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({status: "success", errors: []}))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var data = sheet.getDataRange().getValues();
      var header = data[0];
      var now = new Date().getTime();
      var THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      var rowsToKeep = [header];
      var errors = [];
      
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (row.length < 9) continue;
        var createdDateStr = row[6];
        var createdTime = new Date(createdDateStr).getTime();
        
        if (now - createdTime >= THIRTY_DAYS_MS) {
          continue;
        }
        
        rowsToKeep.push(row);
        errors.push({
          id: String(row[0]),
          type: String(row[1]),
          fileName: String(row[2]),
          partyOrWh: String(row[3]),
          errorType: String(row[4]),
          rowsCount: Number(row[5]),
          createdDate: String(row[6]),
          solved: row[7] === true || String(row[7]).toLowerCase() === "true",
          solvedDate: String(row[8])
        });
      }
      
      if (rowsToKeep.length < data.length) {
        sheet.clearContents();
        sheet.getRange(1, 1, rowsToKeep.length, rowsToKeep[0].length).setValues(rowsToKeep);
      }
      
      return ContentService.createTextOutput(JSON.stringify({status: "success", errors: errors}))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Default/fallback action is getting parties
  var sheetName = "FLIPKART PARTY NAME";
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["CODE", "PARTY CODE"]);
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    row["row_index"] = i + 1;
    rows.push(row);
  }
  
  return ContentService.createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = getSpreadsheet();
  
  var params;
  try {
    params = JSON.parse(e.postData.contents);
  } catch(err) {
    params = e.parameter;
  }
  
  var action = params.action;
  
  function getSheetRobust(name) {
    var sheets = ss.getSheets();
    var target = name.toUpperCase().trim();
    for (var i = 0; i < sheets.length; i++) {
      var sName = sheets[i].getName().toUpperCase().trim();
      if (sName === target) return sheets[i];
    }
    return null;
  }
  
  // Tracked Errors Actions
  if (action === "addTrackedError") {
    var sheet = getSheetRobust("ERROR TRACKING");
    if (!sheet) {
      sheet = ss.insertSheet("ERROR TRACKING");
      sheet.appendRow(["ID", "TYPE", "FILENAME", "PARTY_OR_WH", "ERROR_TYPE", "ROWS_COUNT", "CREATED_DATE", "SOLVED", "SOLVED_DATE"]);
    }
    sheet.appendRow([
      params.id,
      params.type,
      params.fileName,
      params.partyOrWh,
      params.errorType,
      params.rowsCount,
      params.createdDate,
      params.solved,
      params.solvedDate
    ]);
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "solveTrackedError") {
    var sheet = getSheetRobust("ERROR TRACKING");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({status: "error", message: "ERROR TRACKING sheet not found"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var data = sheet.getDataRange().getValues();
    var updated = false;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(params.id).trim()) {
        sheet.getRange(i + 1, 8).setValue(true);
        sheet.getRange(i + 1, 9).setValue(params.solvedDate);
        updated = true;
        break;
      }
    }
    if (!updated) {
      return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Tracked error not found"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "clearTrackedErrors") {
    var sheet = getSheetRobust("ERROR TRACKING");
    if (sheet) {
      sheet.clearContents();
      sheet.appendRow(["ID", "TYPE", "FILENAME", "PARTY_OR_WH", "ERROR_TYPE", "ROWS_COUNT", "CREATED_DATE", "SOLVED", "SOLVED_DATE"]);
    }
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "deleteTrackedError") {
    var sheet = getSheetRobust("ERROR TRACKING");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({status: "error", message: "ERROR TRACKING sheet not found"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var data = sheet.getDataRange().getValues();
    var deleted = false;
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][0]).trim() === String(params.id).trim()) {
        sheet.deleteRow(i + 1);
        deleted = true;
      }
    }
    if (!deleted) {
      return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Tracked error not found"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Parties Actions (Legacy names)
  var sheetName = "FLIPKART PARTY NAME";
  var sheetParties = getSheetRobust(sheetName);
  if (!sheetParties) {
    sheetParties = ss.insertSheet(sheetName);
    sheetParties.appendRow(["CODE", "PARTY CODE"]);
  }
  
  if (action === "add") {
    var code = params.code;
    var partyCode = params.partyCode;
    sheetParties.appendRow([code, partyCode]);
    return ContentService.createTextOutput(JSON.stringify({status: "success", message: "Party added successfully"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "update") {
    var rowIndex = parseInt(params.rowIndex);
    var code = params.code;
    var partyCode = params.partyCode;
    
    sheetParties.getRange(rowIndex, 1).setValue(code);
    sheetParties.getRange(rowIndex, 2).setValue(partyCode);
    
    return ContentService.createTextOutput(JSON.stringify({status: "success", message: "Party updated successfully"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "delete") {
    var rowIndex = parseInt(params.rowIndex);
    sheetParties.deleteRow(rowIndex);
    return ContentService.createTextOutput(JSON.stringify({status: "success", message: "Party deleted successfully"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Invalid action"}))
    .setMimeType(ContentService.MimeType.JSON);
}
