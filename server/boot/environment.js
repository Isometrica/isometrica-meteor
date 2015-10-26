Meteor.startup(function() {

	console.log("--------------------------");
	console.log("Isometrica is using the following environment variables:");
	console.log("TEMP_PATH : " + process.env.TEMP_PATH);
	console.log("DOCWIKI_PDF_TOC_XSL : " + process.env.DOCWIKI_PDF_TOC_XSL);
	console.log("--------------------------");

});