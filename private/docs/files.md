Isometrica uses Mongo's GridFS to store file attachments. In Meteor this is implemented using the CollectionFS library with the GridFS adapter.

A directive is available to add a 'file picker' to a form: `<isa-file-upload model="selectedFiles"></isa-file-upload>`. The 'model' attribute holds the name of the $scope variable in which the selected files are stored.

## Saving files

The normal flow to save the selected files will be :

- save the 'parent' document
- save the selected files as attachments in GridFS
- store a reference to every uploaded file in the `files` field of the parent document.

The above can easily be accomplished using the `fileHandlerFactory` servie:

    fileHandlerFactory.saveFiles(pages, pageId, currentFiles, $scope.selectedFiles)

    Where: 
    - docCollection: reference to the collection in which the document will be stored/ updated
    - pageId: id of the 'parent' document
    - currentFiles: array containing all the files that were previously attached

    - selectedFiles: array of selected files (set this to the same model as used in the 'isa-fileupload' directive)

## Displaying files

To display the attached files, create a repeat that loops over the attached files' metadata field ('files'). For every entry in the repeat, use the `<isa-file-link>` directive to show the attached file as a link to open it. 

    <!--uploaded files-->
    <table class="table table-condensed files-list" ng-if="page.files.length>0"><tbody>
                        <tr ng-repeat="file in page.files">
                            <td>

                                <isa-file-link file="file" allow-remove="true"></isa-file-link>

                            </td>
                        </tr>
                    </tbody></table>

See for a basic implementation the DocWiki.

## Use with a seperate MongoDB instance

By default the CollectionFS GridFS adapter connects to the local (Meteor) MongoDB instance. An optional configuration setting can be passed when setting up the store to connect to another MongoDB instance, either local or remote:

    var filesStore = new FS.Store.GridFS("isaFiles", {
        mongoUrl: 'mongodb://127.0.0.1:27017/test/', // optional, defaults to Meteor's local MongoDB
    });

    IsaFiles = new FS.Collection("files", {
        stores: [ filesStore ]
    });