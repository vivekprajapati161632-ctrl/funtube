const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Video = require("../models/Video");

const getMyChannel = async (req, res, next) => {
  try {
    const [videos, subscriberCount, subscriptionsCount] = await Promise.all([
      Video.find({ owner: req.user._id }).sort({ createdAt: -1 }),
      Subscription.countDocuments({ channel: req.user._id }),
      Subscription.countDocuments({ subscriber: req.user._id })
    ]);

    return res.json({
      channel: req.user,
      subscriberCount,
      subscriptionsCount,
      videos
    });
  } catch (error) {
    return next(error);
  }
};

const getChannelById = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel id" });
    }

    const channel = await User.findById(channelId).select("username avatarUrl channelDescription createdAt");
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const [videos, subscriberCount, isSubscribed] = await Promise.all([
      Video.find({ owner: channelId }).sort({ createdAt: -1 }),
      Subscription.countDocuments({ channel: channelId }),
      req.user ? Subscription.exists({ subscriber: req.user._id, channel: channelId }) : false
    ]);

    return res.json({
      channel,
      subscriberCount,
      isSubscribed: Boolean(isSubscribed),
      videos
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyChannel,
  getChannelById
};
