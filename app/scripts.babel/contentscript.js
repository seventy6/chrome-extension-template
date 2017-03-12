//'use strict';
	var _todosArray = new Sugar.Array();

	var m = {};
		m.grid = {};
		m.grid.inbox = null;
		m.grid.all = null;
	  var $grid = $('.grid');
	  var $root = $('html');
	  var $filterField = $('.filter-field');
	  var $searchField = $('.search-field');
	  var currentView = 'inbox';
		
	//chrome.storage.sync.clear()
	chrome.storage.sync.get('_todosArray', function(_data) {
		
		//fill local storage
		if (_data._todosArray !== undefined && _data._todosArray.raw !== undefined) {
			_todosArray.append(_data._todosArray.raw);        
        	console.log(_data._todosArray);	
		}
		//ready to make the view
        buildView();

	});
	
	function storeToDOs (_item) {
		//store local
		_todosArray.append(_item);
		//store		
		chrome.storage.sync.set({'_todosArray': _todosArray});
	}

	chrome.storage.onChanged.addListener(function(changes, namespace) {
        console.log('changes', changes);
	});

	document.addEventListener('DOMContentLoaded', function() {	

	    document.getElementById('test').addEventListener('click', function() {
	        chrome.tabs.update({ url: 'chrome://bookmarks/' });
	    });

	    var currentSearchValue = $searchField.val();
	    $searchField.on('keyup', function () {
	          var newSearchValue = $searchField.val();
	          if (currentSearchValue !== newSearchValue) {
	            currentSearchValue = newSearchValue;
	            filter();
	          }
	        });

	    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

	      //reset the search results
	      $searchField.val('');

	      filter();
	      
	      //switch the view
	      currentView = $(e.target).attr('aria-controls');

	      //referesh view
	      m.grid[currentView].synchronize();
	      m.grid[currentView].refresh(); 	    			
	      m.grid[currentView].layout();

	    });
	    $('.input-group-search button.close').on('click', function (e) {

	      //reset the search results
	      $searchField.val('');
	      filter();
	    })

	});

	function buildView() {

		var colours = ["#2980b9","#2c3e50","#7f8c8d","#3498db"];//,"#9b59b6","#34495e","#16a085","#27ae60","#2980b9","#8e44ad","#2c3e50","#f1c40f","#e67e22","#e74c3c","#95a5a6","#f39c12","#d35400","#c0392b","#bdc3c7","#7f8c8d"];
	    chrome.runtime.sendMessage({get: 'bookmarks'}, function(response) {

	    	//console.log(response.bookmarks);

	    	if (response.bookmarks !== null) {
	    	
	    	var inbox_output = '';
	    	var all_output = '';

	  		for (var prop in response.bookmarks) {
	  		    // your code
	  		    var _date = moment( response.bookmarks[prop]['dateAdded'] ).format("ddd MMM Do YY"),
	  		    	_id = Number(response.bookmarks[prop]['id']),
	  		    	//_colour = colours[Math.floor(Math.random()*colours.length)],
	  		    	//_height = Math.floor(Math.random()*240) + 140,  height: ' + _height + 'px;
	  		    	_url = extractDomain(response.bookmarks[prop]['url']),
	  		    	_title = response.bookmarks[prop]['title'],
	  		    	_isMobile = response.bookmarks[prop]['parentId'] == '3' ? '<span class="glyphicon glyphicon-phone" aria-hidden="true"></span>' : '';
	  		    
		  		  	if (_todosArray.findIndex(_id).raw  == -1 ) {
		  		  		inbox_output = inbox_output + '<div class="item" data-title="' + _title + '" style="background-color: #27ae60;"><div class="item-content">' + _isMobile + '<a href="'+ response.bookmarks[prop]['url'] + '"><div class="title">' + _title + '</div><span class="url">'+ _url +'</span><span class="date">'+ _date +'</span></a><input type="checkbox" class="toggle todo" data-id="' + _id + '"></div></div>';
		  		  	}
		  		  	all_output = all_output + '<div class="item" data-title="' + _title + '" style="background-color: #7f8c8d;"><div class="item-content">' + _isMobile + '<a href="'+ response.bookmarks[prop]['url'] + '"><div class="title">' + _title + '</div><span class="url">'+ _url +'</span><span class="date">'+ _date +'</span></a></div></div>';
	  		}
	  		
	  		jQuery('#bookmarks-inbox').append(inbox_output);
	  		jQuery('#bookmarks-all').append(all_output);
	  		
	  		//give the item the tick functions
	  		done();

	  		makeGrid();	  		
	    }
	  		
		});
	}
	function done() {
    	jQuery('.todo').on( "click", function() {
    		
    		var _id = $( this ).data('id');

    		$( this ).parent().parent().hide('fast', function() {
				storeToDOs(_id); 
				m.grid.inbox.synchronize();
				m.grid.inbox.refresh(); 	    			
				m.grid.inbox.layout(); 	    			
    		});
		});
    }

    function makeGrid() {

    	var bookmarks_all = document.getElementById('bookmarks-all'),
    		bookmarks_inbox = document.getElementById('bookmarks-inbox')
    	
    	m.grid.all = new Muuri({
    		container: $('#bookmarks-all')[0],
    	    items: [].slice.call(bookmarks_all.getElementsByClassName('item'))
    	});
    	m.grid.inbox = new Muuri({
    		container: $('#bookmarks-inbox')[0],
    	    items: [].slice.call(bookmarks_inbox.getElementsByClassName('item'))
    	});

    }

    function filter() {
    
      var items = m.grid[currentView].get();
      var activeFilter = $filterField.val() || '';
      var searchQuery = $searchField.val() || '';
      var itemsToShow = [];
      var itemsToHide = [];

      // Check which items need to be shown/hidden
      if (activeFilter || searchQuery) {
        items.forEach(function (item) {
          var $elem = $(item._element);
          var isSearchMatch = searchQuery ? ($elem.attr('data-title') || '').toLowerCase().indexOf(searchQuery) > -1 : true;
          var isFilterMatch = activeFilter ? $elem.attr('data-color') === activeFilter : true;
          (isSearchMatch && isFilterMatch ? itemsToShow : itemsToHide).push(item);
        });
      }
      else {
        itemsToShow = items;
      }

      m.grid[currentView].hide(itemsToHide);
      m.grid[currentView].show(itemsToShow);
      // m.grid.all.hide(itemsToHide);
      // m.grid.all.show(itemsToShow);

    }

    //helper functions
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
      