const express = require("express");
const app = express();
const port = 3000;
const chatAkuDong = require("./src/routes/chatAkuDong")
const databaseApp = require("./src/databases/connection")

// to run program, write this in CMD "npx nodemon app"

app.use(express.urlencoded({ extended: true }));
// localhost:3000/api/chatakudong
app.use("/api", chatAkuDong)

const initApp = async() => {
    try {
        await databaseApp.authenticate()

        /**
         * Start the web server on the specified port.
         */
        app.listen(port, () =>
        console.log(`Example app listening on port ${port}!`)
        );
    } catch(error) {
        console.error("Tidak bisa konek database : ", error.original)
    }
}

initApp()