
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
 *
 * @todo Secure
 */
 IsaProfileImages = new FS.Collection("profileImages", {
   stores: [
     new FS.Store.GridFS("profileImages", {
       transformWrite: function(file, read, write) {
         var width  = 100,
             height = 100;
         gm(read, file.name())
          .resize(width, height, '^')
          .gravity('Center')
          .crop(width, height)
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
