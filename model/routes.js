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
 * Custom route to create a PDF from the contents of a DocWiki
 *
 * @author Mark Leusink
 */

Router.route('/api/:orgId/docwiki/pdf/:_id', { where : 'server', name : 'docwikipdf'})
.get( function() {

    var headers = {
      'Content-Type': 'application/pdf'
    };

    var docGen = new DocumentGenerator(this.params._id);

    //check if we need to 'force' a download
    if (this.params.query.download == '✓') {
      headers['Content-Disposition'] = 'attachment; filename="' + docGen.module.title + '.pdf"';
    }

    this.response.writeHead(200, headers);

    

    var html = docGen.getDocWikiAsHTML();
      
    var r = wkhtmltopdf(
      html, 
      docGen.getPDFOptions()
    ).pipe(this.response);

});



