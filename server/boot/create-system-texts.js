'use strict';

/**
 * Creates an initial set of system texts. These can be changed later in the admin UI.

 * @author Mark Leusink
 */
Meteor.startup(function() {

  //set up system texts
  createDefaultSystemTexts();

   var log = console.log;

} );

function createDefaultSystemTexts() {

  console.log('Creating default system texts');

  createSystemText( 'docwiki/email/approvedoc',
    'Please approve "{{title}}"',

    '<p>{{currentUser}} has just created a new issue in the document "{{title}}".</p>' +
        '<p>Since you are one of the approvers of the document you are requested to approve it.</p>' +
        '<p>Click <a href="{{pageLink}}">here</a> to open the document and approve it.</p>');

  createSystemText( 'docwiki/email/signdoc',
    'Please sign "{{title}}"',

    '<p>The document "{{title}}" has been approved.</p>' +
        '<p>Since you are one of the signers of the document you are requested to sign it.</p>' +
        '<p>Click <a href="{{pageLink}}">here</a> to open the document and sign it.</p>');

  createSystemText( 'docwiki/email/docapproved',
    'Document "{{title}}" has been approved',

    '<p>The document "{{title}}" has been approved by all approvers.</p>' +
    '<p>Click <a href="{{pageLink}}">here</a> to view the document.</p>');

  createSystemText( 'docwiki/email/newowner',
    'You are now the owner of the document "{{title}}"',

    '<p>{{currentUser}} just made you the owner of the document titled ' +
    '<b><a href="{{pageLink}}">{{title}}</a></b>.</p>');

  createSystemText( 'docwiki/guidance', null,
    'General guidance for the DocWiki goes here');

  createSystemText( 'docwiki/guidance/approve', null,
    'Guidance for approving a DocWiki');

  createSystemText( 'docwiki/guidance/saveAsTemplate', null,
    'Enter the title for the template');

  createSystemText( 'docwiki/guidance/archive', null,
    'Enter the title for the archived document');

  createSystemText( 'docwiki/guidance/duplicate', null,
    'Enter the title for the duplicated document');

  createSystemText( 'docwiki/guidance/sign', null,
    'Guidance for signing a DocWiki');

  createSystemText( 'docwiki/guidance/approve/page', null,
    'Guidance for approving a page in the DocWiki');

  createSystemText( 'docwiki/guidance/sign/page', null,
    'Guidance for signing a page in the DocWiki');

  createSystemText( 'overview/guidance/addModule', null,
    'Enter the title you want this template to get when it\'s copied to your workspace.');

  createSystemText( 'docwiki/email/page/added/published',
    'Page added to the document "{{title}}',
    '<p>{{currentUser}} has added a page titled <b>{{pageTitle}}</b> ' +
        'to the document <b>{{title}}</b>.</p>' +
        '<p>The page is automatically published. Click <a href=\"{{pageLink}}\">here</a> to view it.</p>');

  createSystemText( 'docwiki/email/page/added/forapproval',
    'Page added to the document "{{title}}',
    '<p>{{currentUser}} has added a page titled <b>{{pageTitle}}</b> ' +
        'to the document <b>{{title}}</b>.</p>' +
        '<p>The page isn\'t visible yet. Click <a href=\"{{pageLink}}\">here</a> to view the page and approve it for publication.</p>');

  createSystemText( 'docwiki/email/page/updated/published',
    'Page updated in the document "{{title}}',
    '<p>{{currentUser}} has updated a page titled <b>{{pageTitle}}</b> ' +
        ' in the document <b>{{title}}</b>.</p>' +
        '<p>The page is automatically published. Click <a href=\"{{pageLink}}\">here</a> to view the changes.</p>');

    createSystemText( 'docwiki/email/page/updated/forapproval',
    'Page updated in the document "{{title}}',
    '<p>{{currentUser}} has updated a page titled <b>{{pageTitle}}</b> ' +
        ' in the document <b>{{title}}</b>.</p>' +
        '<p>The page isn\'t visible yet. Click <a href=\"{{pageLink}}\">here</a> to view the changes and approve the page for publication.</p>');

    createSystemText( 'docwiki/email/page/sign',
      'Please sign "{{pageTitle}}"',

      '<p>The page {{pageTitle}} in document "{{title}}" has been approved.</p>' +
          '<p>Since you are one of the signers of the document you are requested to sign the page.</p>' +
          '<p>Click <a href="{{pageLink}}">here</a> to open the page and sign it.</p>');

    createSystemText('orgSetup/guidance/activities',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris egestas placerat ex, non laoreet neque tincidunt sed.',
      ['<p>Etiam suscipit nec sapien sit amet placerat. Nulla facilisis mauris velit, eget gravida mi rhoncus ac. Sed ultricies in nisi nec suscipit. Cras pulvinar risus ac risus pharetra efficitur.</p>',
       '<p>In dui felis, fermentum et lacus eu, pretium rhoncus dolor. Fusce in fringilla risus. Sed mauris sapien, vehicula at gravida in, venenatis in neque.</p>',
       '<ul class="text-muted">',
       '<li><small>ISO 9001:2015 clauses 4.1, 5.2, 6.1.1. 7.5</small></li>',
       '<li><small>ISO 14001:2015 clauses 4.1, 5.2, 8.1.1, 8.4, 8.5</small></li>',
       '<li><small>ISO 22301:2012 clauses 4.1, 4.2, 4.3</small></li>',
       '<li><small>ISO 27001:2013 clauses 4.1, 5.5, 8.3.3, 8.4, 8.6</small></li>',
       '</ul>'
      ].join('\n'),
      'http://www.teamstudio.com'
      );

  createSystemText('orgSetup/guidance/mission',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris egestas placerat ex, non laoreet neque tincidunt sed.',
    ['<p>Etiam suscipit nec sapien sit amet placerat. Nulla facilisis mauris velit, eget gravida mi rhoncus ac. Sed ultricies in nisi nec suscipit. Cras pulvinar risus ac risus pharetra efficitur.</p>',
      '<p>In dui felis, fermentum et lacus eu, pretium rhoncus dolor. Fusce in fringilla risus. Sed mauris sapien, vehicula at gravida in, venenatis in neque.</p>',
      '<ul class="text-muted">',
      '<li><small>ISO 9001:2015 clauses 4.1, 5.2, 6.1.1. 7.5</small></li>',
      '<li><small>ISO 14001:2015 clauses 4.1, 5.2, 8.1.1, 8.4, 8.5</small></li>',
      '<li><small>ISO 22301:2012 clauses 4.1, 4.2, 4.3</small></li>',
      '<li><small>ISO 27001:2013 clauses 4.1, 5.5, 8.3.3, 8.4, 8.6</small></li>',
      '</ul>'
    ].join('\n'),
    'http://www.teamstudio.com'
  );

  createSystemText('orgSetup/guidance/performanceIndicators',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris egestas placerat ex, non laoreet neque tincidunt sed.',
    ['<p>Etiam suscipit nec sapien sit amet placerat. Nulla facilisis mauris velit, eget gravida mi rhoncus ac. Sed ultricies in nisi nec suscipit. Cras pulvinar risus ac risus pharetra efficitur.</p>',
      '<p>In dui felis, fermentum et lacus eu, pretium rhoncus dolor. Fusce in fringilla risus. Sed mauris sapien, vehicula at gravida in, venenatis in neque.</p>',
      '<ul class="text-muted">',
      '<li><small>ISO 9001:2015 clauses 4.1, 5.2, 6.1.1. 7.5</small></li>',
      '<li><small>ISO 14001:2015 clauses 4.1, 5.2, 8.1.1, 8.4, 8.5</small></li>',
      '<li><small>ISO 22301:2012 clauses 4.1, 4.2, 4.3</small></li>',
      '<li><small>ISO 27001:2013 clauses 4.1, 5.5, 8.3.3, 8.4, 8.6</small></li>',
      '</ul>'
    ].join('\n'),
    'http://www.teamstudio.com'
  );
}

function createSystemText( textId, subject, contents, helpUrl ) {

  if ( SystemTexts.find({ textId : textId}).count() === 0 ) {
    console.log('- create system text: ' + textId);

    SystemTexts.insert( {
      textId : textId,
      subject : subject,
      contents : contents,
      helpUrl: helpUrl
    });

  }

}
