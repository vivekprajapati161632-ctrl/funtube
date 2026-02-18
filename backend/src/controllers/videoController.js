const mongoose = require("mongoose");
const History = require("../models/History");
const Like = require("../models/Like");
const Subscription = require("../models/Subscription");
const Video = require("../models/Video");
const { deleteFileByUrl, uploadFile } = require("../services/storageService");
const { buildPublicUrl } = require("../utils/publicUrl");

const parseTags = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((tag) => String(tag).trim()).filter(Boolean);
  return String(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const enrichVideos = async (videos, currentUserId) => {
  if (!videos.length) return [];

  const videoIds = videos.map((video) => video._id);

  const likeCounts = await Like.aggregate([
    { $match: { video: { $in: videoIds } } },
    { $group: { _id: "$video", count: { $sum: 1 } } }
  ]);

  const likedByMe = currentUserId
    ? await Like.find({ user: currentUserId, video: { $in: videoIds } }).select("video")
    : [];

  const likeMap = new Map(likeCounts.map((item) => [String(item._id), item.count]));
  const likedSet = new Set(likedByMe.map((item) => String(item.video)));

  return videos.map((video) => {
    const raw = video.toObject();
    return {
      ...raw,
      likesCount: likeMap.get(String(video._id)) || 0,
      likedByMe: likedSet.has(String(video._id))
    };
  });
};

const listVideos = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 12), 50);
    const search = (req.query.search || "").trim();

    const query = search
      ? { $text: { $search: search } }
      : {};

    const videos = await Video.find(query)
      .populate("owner", "username avatarUrl")
      .sort(search ? { score: { $meta: "textScore" }, createdAt: -1 } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Video.countDocuments(query);
    const items = await enrichVideos(videos, req.user?._id);

    return res.json({
      items,
      page,
      limit,
      total,
      hasMore: page * limit < total
    });
  } catch (error) {
    return next(error);
  }
};

const getVideoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    const video = await Video.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("owner", "username avatarUrl channelDescription");

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const [likesCount, likedByMe, subscriberCount, isSubscribed] = await Promise.all([
      Like.countDocuments({ video: video._id }),
      req.user ? Like.exists({ video: video._id, user: req.user._id }) : false,
      Subscription.countDocuments({ channel: video.owner._id }),
      req.user ? Subscription.exists({ subscriber: req.user._id, channel: video.owner._id }) : false
    ]);

    return res.json({
      ...video.toObject(),
      likesCount,
      likedByMe: Boolean(likedByMe),
      channel: {
        id: video.owner._id,
        username: video.owner.username,
        avatarUrl: video.owner.avatarUrl,
        channelDescription: video.owner.channelDescription,
        subscriberCount,
        isSubscribed: Boolean(isSubscribed)
      }
    });
  } catch (error) {
    return next(error);
  }
};

const getRecommendedVideos = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    const currentVideo = await Video.findById(id).lean();
    if (!currentVideo) {
      return res.status(404).json({ message: "Video not found" });
    }

    const tags = currentVideo.tags || [];

    let recommendations = await Video.find({
      _id: { $ne: currentVideo._id },
      ...(tags.length ? { tags: { $in: tags } } : {})
    })
      .populate("owner", "username avatarUrl")
      .sort({ createdAt: -1 })
      .limit(8);

    if (recommendations.length < 8) {
      const missing = 8 - recommendations.length;
      const existingIds = recommendations.map((item) => item._id);
      recommendations = recommendations.concat(
        await Video.find({
          _id: { $nin: [currentVideo._id, ...existingIds] }
        })
          .populate("owner", "username avatarUrl")
          .sort({ views: -1, createdAt: -1 })
          .limit(missing)
      );
    }

    const items = await enrichVideos(recommendations, req.user?._id);
    return res.json({ items });
  } catch (error) {
    return next(error);
  }
};

const uploadVideo = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const tags = parseTags(req.body.tags);

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    const videoFile = req.files?.video?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (!videoFile || !thumbnailFile) {
      return res.status(400).json({ message: "video and thumbnail are required" });
    }

    const [videoUploadResult, thumbnailUploadResult] = await Promise.all([
      uploadFile(videoFile, "videos"),
      uploadFile(thumbnailFile, "thumbnails")
    ]);

    const video = await Video.create({
      owner: req.user._id,
      title,
      description,
      tags,
      videoUrl: videoUploadResult.url,
      thumbnailUrl: thumbnailUploadResult.url
    });

    const populated = await Video.findById(video._id).populate("owner", "username avatarUrl");
    return res.status(201).json(populated);
  } catch (error) {
    return next(error);
  }
};

const updateVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (String(video.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const update = {};

    if (typeof req.body.title === "string") update.title = req.body.title;
    if (typeof req.body.description === "string") update.description = req.body.description;
    if (req.body.tags !== undefined) update.tags = parseTags(req.body.tags);

    const newVideoFile = req.files?.video?.[0];
    const newThumbnailFile = req.files?.thumbnail?.[0];

    if (newVideoFile) {
      const uploadResult = await uploadFile(newVideoFile, "videos");
      await deleteFileByUrl(video.videoUrl).catch(() => {});
      update.videoUrl = uploadResult.url;
    }

    if (newThumbnailFile) {
      const uploadResult = await uploadFile(newThumbnailFile, "thumbnails");
      await deleteFileByUrl(video.thumbnailUrl).catch(() => {});
      update.thumbnailUrl = uploadResult.url;
    }

    const updated = await Video.findByIdAndUpdate(id, update, { new: true }).populate("owner", "username avatarUrl");
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};

const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (String(video.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Promise.all([
      deleteFileByUrl(video.videoUrl).catch(() => {}),
      deleteFileByUrl(video.thumbnailUrl).catch(() => {}),
      Like.deleteMany({ video: id }),
      History.deleteMany({ video: id }),
      Video.findByIdAndDelete(id)
    ]);

    return res.json({ message: "Video deleted" });
  } catch (error) {
    return next(error);
  }
};

const likeVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    const video = await Video.findById(id).select("_id");
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    await Like.updateOne(
      { user: req.user._id, video: id },
      { user: req.user._id, video: id },
      { upsert: true }
    );

    const likesCount = await Like.countDocuments({ video: id });
    return res.json({ likesCount, likedByMe: true });
  } catch (error) {
    return next(error);
  }
};

const unlikeVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    await Like.deleteOne({ user: req.user._id, video: id });
    const likesCount = await Like.countDocuments({ video: id });

    return res.json({ likesCount, likedByMe: false });
  } catch (error) {
    return next(error);
  }
};

const addToHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    await History.updateOne(
      { user: req.user._id, video: id },
      {
        user: req.user._id,
        video: id,
        watchedAt: new Date()
      },
      { upsert: true }
    );

    return res.json({ message: "History updated" });
  } catch (error) {
    return next(error);
  }
};

const getMyHistory = async (req, res, next) => {
  try {
    const history = await History.find({ user: req.user._id })
      .populate({
        path: "video",
        populate: { path: "owner", select: "username avatarUrl" }
      })
      .sort({ watchedAt: -1 })
      .limit(100);

    const items = history
      .filter((entry) => entry.video)
      .map((entry) => ({
        watchedAt: entry.watchedAt,
        video: entry.video
      }));

    return res.json({ items });
  } catch (error) {
    return next(error);
  }
};

const getShareableUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    const exists = await Video.exists({ _id: id });
    if (!exists) {
      return res.status(404).json({ message: "Video not found" });
    }

    const shareUrl = buildPublicUrl(`/watch/${id}`);
    return res.json({ shareUrl });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listVideos,
  getVideoById,
  getRecommendedVideos,
  uploadVideo,
  updateVideo,
  deleteVideo,
  likeVideo,
  unlikeVideo,
  addToHistory,
  getMyHistory,
  getShareableUrl
};
