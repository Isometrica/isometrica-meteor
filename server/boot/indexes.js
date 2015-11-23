
Meteor.startup(function () {

   console.log("- creating index for DocWiki pages full text search");
    
   search_index_name = 'docwikipages_index';

    try {
        // Remove old indexes as you can only have one text index and if you add 
        // more fields to your index then you will need to recreate it.
        DocwikiPages._dropIndex(search_index_name);
    } catch (e) {
        //don't care about this error
    }
 
    DocwikiPages._ensureIndex({
        contents: 'text',
        section: 'text',
        title: 'text'
    }, {
        name: search_index_name
    });
    
});