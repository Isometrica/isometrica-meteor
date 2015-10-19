/* iron-router routes */


/*
 * Default route. It only does one thing: rendering the contents of the
 * 'default' template into the main HTML body
 *
 * @author Mark Leusink
 */

Router.route('/(.*)', function() {
  this.render('default');
});

/*
 * We're using wkhtmltopdf to generate a PDF document from a HTML document.
 * That application allows only to insert a 'cover' page by specifying a URL,
 * so we setup a static route to the current application that returns that
 * cover page.
 */

Router.route('/api/docwiki/static/cover/:title', { where : 'server'})
.get( function() {
    this.response.end( Handlebars.templates['docwikiFrontpage']( {title : this.params.title } ) );
});

/*
 * See comment above, but now for an XSLT for the table of contents
 */

Router.route('/api/docwiki/static/toc-xslt', { where : 'server'})
.get( function() {
    this.response.end( Handlebars.templates['docwikiPdfXslt']() );
});

/*
 * Custom route to create a PDF from the contents of a DocWiki
 *
 * @author Mark Leusink
 */

Router.route('/api/docwiki/pdf/:_id', { where : 'server'})
.get( function() {

    var headers = {
      'Content-Type': 'application/pdf'
    };

    //check if we need to 'force' a download
    if (this.params.query.download == '✓') {
      headers['Content-Disposition'] = 'attachment; filename="' + module.title + '.pdf"';
    }

    this.response.writeHead(200, headers);

    var docGen = new DocumentGenerator(this.params._id);

    var html = docGen.getDocWikiAsHTML();
      
    var r = wkhtmltopdf(
      html, 
      docGen.getPDFOptions()
    ).pipe(this.response);

});



