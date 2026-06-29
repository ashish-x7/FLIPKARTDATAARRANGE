// Code.gs - Google Apps Script for syncing Google Sheets with Flipkart Order Excel Toolset
var SPREADSHEET_ID = "14_Vxc8gCvTYuRsPvLzefVgzRlJRDMHfMQHGPVVyUZbl";

function getSpreadsheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch(e) {}
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doGet(e) {
  var sheetName = "FLIPKART PARTY NAME";
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    // If the sheet doesn't exist, create it with headers
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
    row["row_index"] = i + 1; // 1-based index corresponding to actual row number
    rows.push(row);
  }
  
  return ContentService.createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheetName = "FLIPKART PARTY NAME";
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["CODE", "PARTY CODE"]);
  }
  
  var params;
  try {
    params = JSON.parse(e.postData.contents);
  } catch(err) {
    params = e.parameter;
  }
  
  var action = params.action;
  
  if (action === "add") {
    var code = params.code;
    var partyCode = params.partyCode;
    sheet.appendRow([code, partyCode]);
    return ContentService.createTextOutput(JSON.stringify({status: "success", message: "Party added successfully"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "update") {
    var rowIndex = parseInt(params.rowIndex);
    var code = params.code;
    var partyCode = params.partyCode;
    
    sheet.getRange(rowIndex, 1).setValue(code);
    sheet.getRange(rowIndex, 2).setValue(partyCode);
    
    return ContentService.createTextOutput(JSON.stringify({status: "success", message: "Party updated successfully"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "delete") {
    var rowIndex = parseInt(params.rowIndex);
    sheet.deleteRow(rowIndex);
    return ContentService.createTextOutput(JSON.stringify({status: "success", message: "Party deleted successfully"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Invalid action"}))
    .setMimeType(ContentService.MimeType.JSON);
}
