const url = "cloudinary:// :synapscare1a6yP5-anAn97wsBGiZYOga8xZ0@dao7fkewx";
const regex = /cloudinary:\/\/([^:]*):([^@]+)@(.+)/;
const match = url.match(regex);
console.log(match);
