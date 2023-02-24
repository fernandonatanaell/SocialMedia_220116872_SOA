const { QueryTypes } = require("sequelize")
const databaseApp = require("../databases/connection")

// FUNCTION
async function getUserFromUsername (username) {
    const result = await databaseApp.query(
        "SELECT * FROM users WHERE user_username = ? LIMIT 1",
        {
            type: QueryTypes.SELECT,
            replacements: [username]
        }
    );

    if (result && result.length > 0) {
        return result[0];
    } else {
        return null;
    }
}

function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
}

// CONTROLLER
const getAllUsers = async (req,res) => {
    const result = await databaseApp.query(
        "SELECT * FROM users",
        {
            type: QueryTypes.SELECT
        }
    )

    return res.status(200).json(result)
}

const registerNewUser = async (req,res) => {
    const {
        username,
        password,
        nama,
        alamat,
        nomorhp
    } = req.body;

    if(!username || !password || !nama || !alamat || !nomorhp){
        return res.status(400).send({msg: "Field tidak sesuai ketentuan!"})
    }

    if(!containsOnlyNumbers(nomorhp)){
        return res.status(400).send({msg: "Nomor HP hanya boleh mengandung angka saja!"})
    }

    let getUserByUsername = await getUserFromUsername(username);
    if(getUserByUsername !== null) {
        return res.status(400).json({msg: "Username telah dipakai!"})
    } 

    const result = await databaseApp.query(
        "INSERT INTO users(user_username, user_password, user_name, user_address, user_phone_number) VALUES(:username, :password, :name, :address, :phone_number)",
        {
            type: QueryTypes.INSERT,
            replacements: {
                username: username,
                password: password,
                name: nama,
                address: alamat,
                phone_number: nomorhp
            }
        } 
    )

    if(result) {
        return res.status(200).json({msg: `Proses registrasi telah berhasil dengan ID ${result[0]}`})
    } else {
        return res.status(500).json({msg: "Silahkan coba lagi"})
    }
}

const loginUser = async (req,res) => {
    const {
        username,
        password
    } = req.body;

    if(!username || !password){
        return res.status(400).send({msg: "Field tidak sesuai ketentuan!"})
    }

    const result = await getUserFromUsername(username);
    // CHECK USER IS REGISTER OR NOT IN DATABASE
    if(result === null) {
        return res.status(404).json({msg: `User tidak ditemukan!`})
    } else {
        // CHECK PASSWORD CORRECT OR OR NOT
        if(result.user_password != password) {
            return res.status(200).json({msg: `Password salah!`})
        } else {
            return res.status(200).json({msg: `Berhasil login!`})
        }
    }
}

const updateProfile = async (req,res) => {
    let {
        nama,
        alamat,
        nomorhp,
        oldpassword,
        newpassword
    } = req.body;

    if(!nama || !alamat || !nomorhp || !oldpassword || req.params.username === undefined){
        return res.status(400).send({msg: "Field tidak sesuai ketentuan!"})
    }

    if(!containsOnlyNumbers(nomorhp)){
        return res.status(400).send({msg: "Nomor HP hanya boleh mengandung angka saja!"})
    }

    const username = req.params.username;
    const currUser = await getUserFromUsername(username);
    // CHECK USER IS REGISTER OR NOT IN DATABASE
    if(currUser === null){
        return res.status(404).json({msg: `User tidak ditemukan!`})
    }

    // CHECK PASSWORD CORRECT OR NOT
    if(currUser.user_password != oldpassword) {
        return res.status(200).json({msg: `Password salah!`})
    } else {
        if(newpassword){
            oldpassword = newpassword;
        }

        const result = await databaseApp.query(
            "UPDATE users SET user_password = :password, user_name = :name, user_address = :address, user_phone_number = :phone_number WHERE user_username = :username",
            {
                type: QueryTypes.UPDATE,
                replacements: {
                    username: username,
                    password: oldpassword,
                    name: nama,
                    address: alamat,
                    phone_number: nomorhp
                }
            } 
        )
    
        if(result) {
            return res.status(200).json({msg: `Proses update telah berhasil!`})
        } else {
            return res.status(500).json({msg: "Silahkan coba lagi"})
        }
    }
}

const addFriend = async (req,res) => {
    const {
        username,
        password,
        usercari
    } = req.body;

    if(!username || !password || !usercari){
        return res.status(400).send({msg: "Field tidak sesuai ketentuan!"})
    }

    const currUser = await getUserFromUsername(username);
    const friendUser = await getUserFromUsername(usercari);
    // CHECK USER IS REGISTER OR NOT IN DATABASE
    if(currUser === null || friendUser === null){
        return res.status(404).json({msg: `User tidak ditemukan!`})
    }

    // CHECK PASSWORD CORRECT OR NOT
    if(currUser.user_password != password) {
        return res.status(200).json({msg: `Password salah!`})
    } else if(currUser.user_id == friendUser.user_id){
        return res.status(200).json({msg: `Tidak bisa menambahkan diri sendiri!`})
    } else {
        let result = await databaseApp.query(
            "SELECT * FROM friends WHERE user_id = :user_id AND friend_user_id = :friend_user_id",
            {
                type: QueryTypes.SELECT,
                replacements: {
                    user_id: currUser.user_id,
                    friend_user_id: friendUser.user_id
                }
            } 
        )

        if (result && result.length > 0) {
            return res.status(200).json({msg: `Gagal, user sudah menjadi teman Anda!`})
        }

        result = await databaseApp.query(
            "INSERT INTO friends(user_id, friend_user_id) VALUES(:user_id, :friend_user_id)",
            {
                type: QueryTypes.INSERT,
                replacements: {
                    user_id: currUser.user_id,
                    friend_user_id: friendUser.user_id
                }
            } 
        )
    
        if(result) {
            return res.status(200).json({msg: `User berhasil ditambahkan sebagai Teman!`})
        } else {
            return res.status(500).json({msg: "Silahkan coba lagi"})
        }
    }
}

const viewFriend = async (req,res) => {
    const {
        password
    } = req.body;

    if(req.params.username === undefined || !password){
        return res.status(400).send({msg: "Field tidak sesuai ketentuan!"})
    }

    const currUser = await getUserFromUsername(req.params.username);
    // CHECK USER IS REGISTER OR NOT IN DATABASE
    if(currUser === null){
        return res.status(404).json({msg: `User tidak ditemukan!`})
    }

    // CHECK PASSWORD CORRECT OR NOT
    if(currUser.user_password != password) {
        return res.status(200).json({msg: `Password salah!`})
    } else {
        const result = await databaseApp.query(
            "SELECT * FROM friends WHERE user_id = :user_id",
            {
                type: QueryTypes.SELECT,
                replacements: {
                    user_id: currUser.user_id
                }
            } 
        )

        return res.status(200).json(await Promise.all(result.map(async (friend) => {
            let infoFriend = await databaseApp.query(
                "SELECT * FROM users WHERE user_id = ? LIMIT 1",
                {
                    type: QueryTypes.SELECT,
                    replacements: [friend.friend_user_id]
                }
            );

            infoFriend = infoFriend[0]
            return {
                [infoFriend.user_username]: {
                    "nama": infoFriend.user_name,
                    "alamat": infoFriend.user_address,
                    "nomorhp": infoFriend.user_phone_number
                }
            }
        })))
    }
}

const deleteFriend = async (req,res) => {
    const {
        username,
        password,
        usercari
    } = req.body;

    if(!username || !password || !usercari){
        return res.status(400).send({msg: "Field tidak sesuai ketentuan!"})
    }

    const currUser = await getUserFromUsername(username);
    const friendUser = await getUserFromUsername(usercari);
    // CHECK USER IS REGISTER OR NOT IN DATABASE
    if(currUser === null || friendUser === null){
        return res.status(404).json({msg: `User tidak ditemukan!`})
    }

    // CHECK PASSWORD CORRECT OR NOT
    if(currUser.user_password != password) {
        return res.status(200).json({msg: `Password salah!`})
    } else {
        let result = await databaseApp.query(
            "SELECT * FROM friends WHERE user_id = :user_id AND friend_user_id = :friend_user_id",
            {
                type: QueryTypes.SELECT,
                replacements: {
                    user_id: currUser.user_id,
                    friend_user_id: friendUser.user_id
                }
            } 
        )

        if (!result || result.length == 0) {
            return res.status(200).json({msg: `Gagal, user tidak terdaftar di list Teman Anda!`})
        }

        result = await databaseApp.query(
            "DELETE FROM friends WHERE user_id = :user_id AND friend_user_id = :friend_user_id;",
            {
                type: QueryTypes.DELETE,
                replacements: {
                    user_id: currUser.user_id,
                    friend_user_id: friendUser.user_id
                }
            } 
        )
    
        if(!result) {
            return res.status(200).json({msg: `User berhasil dihapus dari Teman Anda!`})
        } else {
            return res.status(500).json({msg: "Silahkan coba lagi"})
        }
    }
}

const sendMessage = async (req,res) => {
    const {
        username,
        password,
        message,
        usercari
    } = req.body;

    if(!username || !password || !message || !usercari){
        return res.status(400).send({msg: "Field tidak sesuai ketentuan!"})
    }

    const currUser = await getUserFromUsername(username);
    const friendUser = await getUserFromUsername(usercari);
    // CHECK USER IS REGISTER OR NOT IN DATABASE
    if(currUser === null || friendUser === null){
        return res.status(404).json({msg: `User tidak ditemukan!`})
    }

    // CHECK PASSWORD CORRECT OR NOT
    if(currUser.user_password != password) {
        return res.status(200).json({msg: `Password salah!`})
    } else {
        let result = await databaseApp.query(
            "SELECT * FROM friends WHERE user_id = :user_id AND friend_user_id = :friend_user_id",
            {
                type: QueryTypes.SELECT,
                replacements: {
                    user_id: currUser.user_id,
                    friend_user_id: friendUser.user_id
                }
            } 
        )

        if (!result || result.length == 0) {
            return res.status(200).json({msg: `Gagal, user tidak terdaftar di list Teman Anda!`})
        }

        result = await databaseApp.query(
            "INSERT INTO chats(from_user_id, to_user_id, chat_text) VALUES(:from_user_id, :to_user_id, :chat_text)",
            {
                type: QueryTypes.INSERT,
                replacements: {
                    from_user_id: currUser.user_id,
                    to_user_id: friendUser.user_id,
                    chat_text: message
                }
            } 
        )
    
        if(result) {
            return res.status(200).json({msg: `Pesan berhasil dikirim!`})
        } else {
            return res.status(500).json({msg: "Silahkan coba lagi"})
        }
    }
}

const viewMessage = async (req,res) => {
    const {
        password
    } = req.body;

    if(!password || req.params.username === undefined){
        return res.status(400).send({msg: "Field tidak sesuai ketentuan!"})
    }

    const currUser = await getUserFromUsername(req.params.username);
    // CHECK USER IS REGISTER OR NOT IN DATABASE
    if(currUser === null){
        return res.status(404).json({msg: `User tidak ditemukan!`})
    }

    // CHECK PASSWORD CORRECT OR NOT
    if(currUser.user_password != password) {
        return res.status(200).json({msg: `Password salah!`})
    } else {
        const result = await databaseApp.query(
            "SELECT * FROM chats WHERE from_user_id = :from_user_id",
            {
                type: QueryTypes.SELECT,
                replacements: {
                    from_user_id: currUser.user_id
                }
            } 
        )

        return res.status(200).json(await Promise.all(result.map(async (message) => {
            let getFrom = await databaseApp.query(
                "SELECT user_username FROM users WHERE user_id = ? LIMIT 1",
                {
                    type: QueryTypes.SELECT,
                    replacements: [message.from_user_id]
                }
            );
            getFrom = getFrom[0]

            let getTo = await databaseApp.query(
                "SELECT user_username FROM users WHERE user_id = ? LIMIT 1",
                {
                    type: QueryTypes.SELECT,
                    replacements: [message.to_user_id]
                }
            );
            getTo = getTo[0]

            return {
                "from": getFrom.user_username,
                "to": getTo.user_username,
                "message": message.chat_text
            }
        })))
    }
}

module.exports = {
    getAllUsers,
    registerNewUser,
    loginUser,
    updateProfile,
    addFriend,
    viewFriend,
    deleteFriend,
    sendMessage,
    viewMessage
}