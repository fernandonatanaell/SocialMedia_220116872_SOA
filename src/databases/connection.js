const Sequelize = require("sequelize")
const config = require("../config/config.json")

// const host = config.koneksi_buku.host
// const port = config.koneksi_buku.port
// const username = config.koneksi_buku.username
// const password = config.koneksi_buku.password
// const database = config.koneksi_buku.database
// const dialect = config.koneksi_buku.dialect

const {host,port,username,password,database,dialect} = config.koneksi_buku

const connectionBuku = new Sequelize(database, username, password, {
    host: host,
    port: port,
    dialect: dialect
})

module.exports = connectionBuku