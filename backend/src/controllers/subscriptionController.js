const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");
const User = require("../models/User");

const subscribe = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel id" });
    }

    if (String(req.user._id) === channelId) {
      return res.status(400).json({ message: "You cannot subscribe to yourself" });
    }

    const channelExists = await User.exists({ _id: channelId });
    if (!channelExists) {
      return res.status(404).json({ message: "Channel not found" });
    }

    await Subscription.updateOne(
      { subscriber: req.user._id, channel: channelId },
      { subscriber: req.user._id, channel: channelId },
      { upsert: true }
    );

    const subscriberCount = await Subscription.countDocuments({ channel: channelId });
    return res.json({ subscriberCount, isSubscribed: true });
  } catch (error) {
    return next(error);
  }
};

const unsubscribe = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel id" });
    }

    await Subscription.deleteOne({ subscriber: req.user._id, channel: channelId });
    const subscriberCount = await Subscription.countDocuments({ channel: channelId });

    return res.json({ subscriberCount, isSubscribed: false });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  subscribe,
  unsubscribe
};
