const express = require('express')
const { queryBuku, getSingleBuku, insertBuku, updateBuku, patchBuku, deleteBuku, getAllUsers, registerNewUser, loginUser, updateProfile, addFriend, viewFriend, deleteFriend, sendMessage, viewMessage } = require('../controllers/chatAkuDong')
const router = express.Router()

router.post("/user", registerNewUser)
router.post("/login", loginUser)
router.put("/user/:username", updateProfile)
router.post("/friend", addFriend)
router.get("/friend/:username", viewFriend)
router.delete("/friend", deleteFriend)
router.post("/message", sendMessage)
router.get("/message/:username", viewMessage)

module.exports = router