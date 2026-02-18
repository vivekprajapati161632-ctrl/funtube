const express = require("express");
const { subscribe, unsubscribe } = require("../controllers/subscriptionController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/:channelId", protect, subscribe);
router.delete("/:channelId", protect, unsubscribe);

module.exports = router;
