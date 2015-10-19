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

    var html = pdfGeneration.getDocWikiAsHTML(this.params._id);
      
    var r = wkhtmltopdf(
      html, 
      pdfGeneration.getPDFOptions()
    ).pipe(this.response);

 // this.response.end(html);

});

