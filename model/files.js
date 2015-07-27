
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