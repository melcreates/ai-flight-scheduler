const bcrypt = require('bcrypt');

const password = 'password123'; // choose per instructor if you want

(async () => {
    const hash = await bcrypt.hash(password, 10);
    console.log(hash);
})();