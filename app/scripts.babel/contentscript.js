//'use strict';
	var _todosArray = [];
	
	//chrome.storage.sync.clear()

	chrome.storage.sync.get('_todosArray', function(_data) {
		_todosArray = _todosArray;
        // for (var key in _data) {
        //   console.log(key, _data[key]);
        // }
        console.log(_todosArray);
	});
	function storeToDOs (_item) {
		_todosArray.push(_item);
		console.log(_todosArray);
		chrome.storage.sync.set({'_todosArray': _todosArray})//, function() {
         // Notify that we saved.
        	//console.log();
       //   var storageChange = changes[key];
       //    console.log('Storage key "%s" in namespace "%s" changed. ' +
       //                'Old value was "%s", new value is "%s".',
       //                key,
       //                namespace,
       //                storageChange.oldValue,
       //                storageChange.newValue);
       // });
	}
	chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (var key in changes) {
          var storageChange = changes[key];
          	console.log('Storage key "%s" in namespace "%s" changed. ' + 'Old value was "%s", new value is "%s".',  key, namespace,  storageChange.oldValue, storageChange.newValue);
        }
	});

	document.addEventListener('DOMContentLoaded', function() {
	    document.getElementById('test').addEventListener('click', function() {
	        chrome.tabs.update({ url: 'chrome://bookmarks/' });
	    });
	});
	var colours = ["#1abc9c","#2ecc71","#3498db","#9b59b6","#34495e","#16a085","#27ae60","#2980b9","#8e44ad","#2c3e50","#f1c40f","#e67e22","#e74c3c","#95a5a6","#f39c12","#d35400","#c0392b","#bdc3c7","#7f8c8d"];
    chrome.runtime.sendMessage({get: 'bookmarks'}, function(response) {

    	console.log(response.bookmarks);

    	if (response.bookmarks !== null) {
    	
    	var out = '';// = '<ul>';
  		for (var prop in response.bookmarks) {
  		    // your code
  		    var _date = moment( response.bookmarks[prop]['dateAdded'] ).format("ddd MMM Do YY"),
  		    	_id = response.bookmarks[prop]['id'],
  		    	_colour = colours[Math.floor(Math.random()*colours.length)],
  		    	//_height = Math.floor(Math.random()*240) + 140,  height: ' + _height + 'px;
  		    	_url = extractDomain(response.bookmarks[prop]['url']),
  		    	_isMobile = response.bookmarks[prop]['parentId'] == '3' ? '<span class="glyphicon glyphicon-phone" aria-hidden="true"></span>' : '';
  		  
  		    out = out + '<div class="card" style="background-color: ' + _colour + ';">' + _isMobile + '<a href="'+ response.bookmarks[prop]['url'] + '"><div class="title">' + response.bookmarks[prop]['title'] + '</div><span class="url">'+ _url +'</span><span class="date">'+ _date +'</span></a><input type="checkbox" class="toggle todo" data-id="' + _id + '"></div>';
  		}
  		//out + '</ul>';
  		
  		jQuery('#bookmarks').append(out);

  		fixGrid();
  		addToDos();
    }
  		
	});
	function addToDos() {
    	jQuery('.todo').on( "click", function() {
    		storeToDOs($( this ).data('id'));  			
		});
    }
    function fixGrid() {
    	var grid;
    	//function init() {
    	  grid = new Minigrid({
    	    container: '.cards',
    	    item: '.card',
    	    gutter: 12
    	  });
    	  grid.mount();
    	//}
    	
    	// mount
    	function update() {
    		console.log('update');
    	  grid.mount();
    	}

    	
    	window.addEventListener('resize', update);
    }
    function extractDomain(url) {
        var domain;
        //find & remove protocol (http, ftp, etc.) and get domain
        if (url.indexOf("://") > -1) {
            domain = url.split('/')[2];
        }
        else {
            domain = url.split('/')[0];
        }

        //find & remove port number
        domain = domain.split(':')[0];

        return domain;
    }
      