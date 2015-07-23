var app = angular.module('isa.filehandler');

/*
 * Used to handle file uploads:
 * - will upload all selected files
 * - will updated the metadata (linked files) in the parent document
 *
 * @author Mark Leusink
 */

app.factory('fileHandlerFactory', function($q, $meteor) {

	var fsFiles = $meteor.collectionFS(IsaFiles, false).subscribe('files');
	var deferred = $q.defer();

	var _saveAndClose = function(pagesCollection, pageId, fileMetaData, removed) {

		pagesCollection.save( {
			_id : pageId,
			files : fileMetaData
		} ).then( function( res) {
			
			deferred.resolve( {
				removed : removed,
				saved : true
			});
		});
	};

	return {

		saveFiles : function(pagesCollection, pageId, currentFiles, selectedFiles) {
			
			var fileMetaData = [];
			var filesRemoved = false;

			if (currentFiles && currentFiles.length) {

				//remove files 'marked for deletion' from the metadata
				angular.forEach( currentFiles, function(file) {
					//we only remove the metadata (=pointer to the file)
					//not the actual file: that can be done by a maintenance function
					//(no references > file can be deleted)
					if ( file.markedForDeletion) {
						filesRemoved = true;
					} else {
						delete file['markedForDeletion'];
						fileMetaData.push(file);
					}
				});

			}

			if (selectedFiles && selectedFiles.length) {

				//save the selected files to the fsFiles collection
				fsFiles.save(selectedFiles)
				.then( function(res) {

					//add a pointer to the uploaded files in the current doc
					angular.forEach( res, function(savedFile) {
						//console.log('file saved, action performed: ' + savedFile.action);

			    		var fsFile = savedFile._id;	//instance of FS.File

			    		//console.log('file saved with _id ', fsFile._id, 'name is', fsFile.name(), 'size is ', fsFile.size() );

						//store the reference to this file in the parent object
						fileMetaData.push( {
							_id : fsFile._id,
							name : fsFile.name(),
							size : fsFile.size(),
							isImage : fsFile.isImage()
						} );

					});
					
					_saveAndClose(pagesCollection, pageId, fileMetaData, true);

				}, function(err) {
					console.error('upload err: ', err);
				});

				selectedFiles = [];		//clear selected files

			} else if (filesRemoved) {

				//no files selected, but there were files selected for removal: store updated metadata
				_saveAndClose(pagesCollection, pageId, fileMetaData, true);
				
			} else {

				deferred.resolve( {
					removed : filesRemoved,
					saved : false
				});

			}

			return deferred.promise;

		}

	};

});