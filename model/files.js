
IsaFiles = new FS.Collection("files", {

  stores: [
    new FS.Store.GridFS("isaFiles")
  ]
  
});

//TODO: make a bit more secure

IsaFiles.allow({
  insert: function (userId) {
    return (userId ? true : true);
  },
  remove: function (userId) {
    return (userId ? true : true);
  },
  download: function () {
    return true;
  },
  update: function (userId) {
    return (userId ? true : true);
  }
});