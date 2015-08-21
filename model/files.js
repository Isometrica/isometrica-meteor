
IsaFiles = new FS.Collection("files", {

  stores: [
    new FS.Store.GridFS("isaFiles")
  ]

});

//TODO: secure

IsaFiles.allow({
  insert: function (userId) {
    return (userId ? true : false);
  },
  remove: function (userId) {
    return (userId ? true : false);
  },
  download: function () {
    return true;
  },
  update: function (userId) {
    return (userId ? true : false);
  }
});

/**
 * Collection to house profile images. These are scaled, cropped
 * and otherwise filtered before stored.
 */
 ProfileImages = new FS.Collection("profileImages", {
   stores: [
     new FS.Store.FileSystem("profileImages", function(file, read, write) {
       gm(read, file.name())
        .resize(100)
        .stream()
        .pipe();
     })
   ],
   filter: {
     allow: {
       contentTypes: ['image/*']
     }
   }
 });
