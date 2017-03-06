'use strict';

console.log('\'Allo \'Allo! Background');

var bookmarksObj = {};
var bookmarkParents = [];

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.bookmarks.getTree(function callback(data){
	//console.log(data);
})

chrome.bookmarks.getChildren('3', function callback(data){
	bookmarksObj = data;
	//console.log(bookmarksObj);
	chrome.bookmarks.getRecent(100, getBookMarks);
});

function getBookMarks(_bookmarksObj) {
	Object.assign(bookmarksObj, _bookmarksObj);
	console.log(bookmarksObj);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('Background get Messages')
    //if (request.get == "bookmarks")
      sendResponse({bookmarks: bookmarksObj});
  });