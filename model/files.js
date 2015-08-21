
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
 IsaProfileImages = new FS.Collection("profileImages", {
   stores: [
     new FS.Store.GridFS("profileImages", {
       transformWrite: function(file, read, write) {
         gm(read, file.name())
          .resize(100)
          .crop(100, 100, 0, 0)
          .stream()
          .pipe(write);
       }
     })
   ],
   filter: {
     allow: {
       contentTypes: ['image/*']
     }
   }
 });

/**
 * @todo Secure
 */
IsaProfileImages.allow({
  insert: function() {
    return true;
  },
  remove: function() {
    return true;
  },
  download: function() {
    return true;
  },
  update: function() {
    return true;
  }
 });
