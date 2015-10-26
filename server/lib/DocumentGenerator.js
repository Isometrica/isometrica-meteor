
/*
 * Library used to create a PDF from a DocWiki module
 *
 * @author Mark Leusink
 */

DocumentGenerator = function(moduleId) {

	this.moduleId = moduleId;
	this.module = Modules.findOne( this.moduleId );
	this.pages = DocwikiPages.find( { 
			_orgId : this.module._orgId, 
			documentId : this.module._id, 
			currentVersion : true,
			inTrash: false
		}, 
		{ reactive: false, sort: { section : 1 }} );

	this.hostName = Settings.findOne().hostName;

	this.getDocWikiAsHTML  = function() {
		//returns the contents of a docwiki as HTML

		var html = [];

		html.push( this.getStyles() );
		html.push( this.getPagesAsHTML() );

		return html.join("");
	};

	this.getStyles = function() {
		//basic CSS styles

	  return '<style type="text/css">' +
	    'html, body { font-family: "serif" },' +
	  	'.frontpage { padding-top: 250px; }' +
	    '.section { margin-top: 10px; }' +
	    '.page-break-before { page-break-before: always; }' +
	    '.page-break-after { page-break-after: always; }' +
	    '</style>\n';
	};

	this.getSectionTitle = function(section, title) {

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

	};

	this.getSectionLevel = function(section) {

		//determine the level at which this section resides

		var level = 1;

		if (section && section.length && section.indexOf('.')) {
			if (section.indexOf('.') == section.length-1) {
				section = section.substring(0, section.length-1);
			}
			sectionComps = section.split('.');
			level = sectionComps.length;
		}

		return level;

	};

	this.getPagesAsHTML = function() {
	  //all pages in a docwiki converted to HTML

	  var html = [];

	  var sectionPageBreak = '<div class="page-break-before">';
	  var sectionNoBreak = '<div class="section">';

	  var that = this;

	  this.pages.forEach( function(page) {

	  	var level = that.getSectionLevel(page.section);
	  	//console.log('- level ' + level + ': ' + that.getSectionTitle( page.section, page.title) );

	  	switch (level) {

	  		case 1:
	  			html.push( (that.module.pageBreakOnLevel1 ? sectionPageBreak : sectionNoBreak ) );
	  			html.push(' <h2>' + that.getSectionTitle( page.section, page.title) + '</h2>');
	  			break;
	  		case 2:
	  			html.push( (that.module.pageBreakOnLevel2 ? sectionPageBreak : sectionNoBreak ) );
	  			html.push(' <h3>' + that.getSectionTitle( page.section, page.title) + '</h3>');
	  			break;
	  		case 3:
	  			html.push( (that.module.pageBreakOnLevel3 ? sectionPageBreak : sectionNoBreak ) );
	  			html.push(' <h4>' + that.getSectionTitle( page.section, page.title) + '</h4>');
	  			break;
	  		default:
	  			html.push(sectionNoBreak);
	  			break;
	  	}

	    html.push( ( page.contents ? '<div>' + page.contents + '</div>' : '') );
	    html.push('</div>\n');

	  });

	  return html.join("");

	};

	this.getPDFOptions = function() {
		//options to send to the wkhtmltopdf conversion

		return {
	      encoding : 'utf-8',
	      pageSize : 'A4',
	      marginTop : 20,
	      marginLeft : 20,
	      marginRight: 20,
	      marginBottom: 30,
	      footerLeft : this.module.title,
	      footerRight : 'Page [page] of [toPage]',
	      footerFontName : 'Times New Roman',
	      footerFontSize : 10,
	      footerLine : true,
	      footerSpacing: 10,
	      cover : this.hostName + '/api/docwiki/static/cover/' + encodeURIComponent(this.module.title),
	      toc : ['--xsl-style-sheet', process.env.DOCWIKI_PDF_TOC_XSL]
	    };
	};

};
