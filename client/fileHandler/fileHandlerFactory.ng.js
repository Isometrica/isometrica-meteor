var app = angular.module('isa.filehandler');

/*
 * Used to handle file uploads:
 * - will upload all selected files
 * - will updated the metadata (linked files) in the parent document
 *
 * @author Mark Leusink
 */

app.factory('fileHandlerFactory', function($q, $meteor) {

  var deferred = $q.defer();

  var _saveAndClose = function(pagesCollection, pageId, fileMetaData, removed) {

    pagesCollection.save({
      _id: pageId,
      files: fileMetaData
    }).then(function(res) {

      deferred.resolve({
        removed: removed,
        saved: true
      });
    });
  };

  function upload(files, collection) {
    collection = collection || IsaFiles;
    var promises = [];
    _.each(files, function(file) {
      var defer = $q.defer();
      promises.push(defer.promise);

      collection.insert(file, function(err, fileObj) {
        if (err) {
          defer.reject(err);
        }
        else {
          defer.resolve(fileObj);
        }
      });
    });

    return $q.all(promises);
  }

  return {

    saveFiles: function(pagesCollection, pageId, currentFiles, selectedFiles) {

      var fileMetaData = [];
      var filesRemoved = false;

      if (currentFiles && currentFiles.length) {

        //remove files 'marked for deletion' from the metadata
        angular.forEach(currentFiles, function(file) {
          //we only remove the metadata (=pointer to the file)
          //not the actual file: that can be done by a maintenance function
          //(no references > file can be deleted)
          if (file.markedForDeletion) {
            filesRemoved = true;
          }
          else {
            delete file['markedForDeletion'];
            fileMetaData.push(file);
          }
        });

      }

      if (selectedFiles && selectedFiles.length) {
        upload(selectedFiles)
          .then(function(res) {
            _.each(res, function(fsFile) {
              fileMetaData.push({
                _id: fsFile._id,
                name: fsFile.name(),
                size: fsFile.size(),
                isImage: fsFile.isImage()
              });
            });

            _saveAndClose(pagesCollection, pageId, fileMetaData, true);
          }, function(err) {
            console.log('upload err:', err);
          });

        selectedFiles = [];		//clear selected files

      }
      else if (filesRemoved) {

        //no files selected, but there were files selected for removal: store updated metadata
        _saveAndClose(pagesCollection, pageId, fileMetaData, true);

      }
      else {

        deferred.resolve({
          removed: filesRemoved,
          saved: false
        });

      }

      return deferred.promise;

    }

  };

});
