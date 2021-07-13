const bcrypt = require("bcrypt");

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash("password", salt, (err, hash) => {
    if (err) throw err;
    //save hash to pass
    console.log(hash);
  });
});
