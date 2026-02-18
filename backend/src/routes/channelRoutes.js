const express = require("express");
const { getChannelById, getMyChannel } = require("../controllers/channelController");
const { optionalProtect, protect } = require("../middleware/auth");

const router = express.Router();

router.get("/me", protect, getMyChannel);
router.get("/:channelId", optionalProtect, getChannelById);

module.exports = router;
