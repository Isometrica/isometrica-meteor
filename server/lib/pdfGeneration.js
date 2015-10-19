pdfGeneration = {

	getDocWikiAsHTML : function(moduleId) {

		console.log('get PDF for module with _id ' + moduleId);

		var module = Modules.find( moduleId ).fetch()[0];
		var pages = DocwikiPages.find( { 
			_orgId : module._orgId, 
			documentId : module._id, 
			currentVersion : true,
			inTrash: false
		}, 
		{ reactive: false, sort: { section : 1 }} );

		console.log('- module title is: ' + module.title);

		var html = [];

		html.push( this.getStyles() );
		html.push( this.getFrontPage(module) );
		html.push( this.getPagesAsHTML(pages) );

		console.log(html.join(""));

		return html.join("");
	},

	getStyles : function() {
	  //r//eturn //'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
	  return '<style type="text/css">' +
	    '.section { margin-top: 10px; }' +
	    '.page-break { page-break-after: always; }' +
	    '</style>\n';
	},

	getSectionTitle : function(section, title) {

	  //used for the title of sections (pages) in the docwiki: remove trailing zero's from the
	  //section no, add a trailing dot between the section and title

	  if (section && section.length) {

	      if (section.indexOf('.')>-1) {
	          var comps = section.split('.');

	          for (var i=0; i<comps.length; i++) {
	              if ( comps[i].length>0 && !isNaN( comps[i]) ) {
	                  comps[i] = parseInt(comps[i], 10) + '';
	              }
	          }

	          section = comps.join('.');
	      } else if (!isNaN( section) ) {
	          section = parseInt(section, 10) + '';
	      }

	      if (section.substr( section.length-1) != '.') {
	              section += '.';     //add trailing .
	      }

	      section += ' ';
	  }
	  
	  return section + title;

	},

	isChildSection : function(section) {

		/*indicates if the specified section no belongs to a parent section (e.g. 1.2 or 2.4)*/

		if (!section || section.length == 0 || section.indexOf('.')===-1) {
			return false;
		}

		var comps = section.split('.');
		if (comps.length===1) {
			return false;
		}

		return true;

	},

	getFrontPage : function(module) {

	  //front page for a PDF version of a docwiki
	  return '<div class="page-break">' +
	    '<h1>' + module.title + '</h1>' +
	    '</div>';

	},

	getPagesAsHTML : function(pages) {

	  //all pages in a docwiki converted to HTML
	  var html = [];

	  pages.forEach( function(page) {

	    if ( pdfGeneration.isChildSection(page.section) ) {
	    	console.log('  > child: ' + pdfGeneration.getSectionTitle( page.section, page.title) );
	      html.push('<div class="section">');
	    } else {
	    	console.log('- main: ' + pdfGeneration.getSectionTitle( page.section, page.title) );
	      html.push('<div class="page-break">');
	    }
	    
	    html.push(' <h3>' + pdfGeneration.getSectionTitle( page.section, page.title) + '</h3>');
	   // html.push(' <div>' + page.contents + '</div>' );
	    html.push('</div>\n');

	  });

	  return html.join("");

	},

	getPDFOptions : function() {
		return {
	      encoding : 'utf-8',
	      pageSize : 'A4'
	    };
	}

};