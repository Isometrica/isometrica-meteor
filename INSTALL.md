## Installation of Isometrica

This application depends on the following software:

* imagemagick or graphicsmagick: required by https://atmospherejs.com/cfs/graphicsmagick
* wkhtmltopdf for PDF conversion (http://wkhtmltopdf.org/): required by https://atmospherejs.com/classcraft/meteor-wkhtmltopdf

### Environment variables

* **MAIL_URL**: URL used to send e-mails, example: smtp://<user>:<pass>@<smtp server>:<port>
* **DOCWIKI_PDF_TOC_XSL**: full path to the XSL file used to generate a table of contents. Needs to be set to  <meteor install>/server/templates/pdfToc.xsl
* **TEMP_PATH**: location to (temporarily) store files in. This is used to generate PDF files that will be attached to an email. Example: /tmp/isometrica/

