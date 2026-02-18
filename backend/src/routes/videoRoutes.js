const express = require("express");
const {
  addToHistory,
  deleteVideo,
  getMyHistory,
  getRecommendedVideos,
  getShareableUrl,
  getVideoById,
  likeVideo,
  listVideos,
  unlikeVideo,
  updateVideo,
  uploadVideo
} = require("../controllers/videoController");
const { optionalProtect, protect } = require("../middleware/auth");
const { videoUpload } = require("../middleware/upload");

const router = express.Router();

router.get("/", optionalProtect, listVideos);
router.get("/history/me", protect, getMyHistory);
router.get("/recommended/:id", optionalProtect, getRecommendedVideos);
router.get("/:id/share-url", getShareableUrl);
router.get("/:id", optionalProtect, getVideoById);

router.post("/", protect, videoUpload, uploadVideo);
router.put("/:id", protect, videoUpload, updateVideo);
router.delete("/:id", protect, deleteVideo);

router.post("/:id/like", protect, likeVideo);
router.delete("/:id/like", protect, unlikeVideo);
router.post("/:id/history", protect, addToHistory);

module.exports = router;
