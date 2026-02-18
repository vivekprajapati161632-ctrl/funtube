// MongoDB init script for FunTube
// Run with: mongosh "mongodb://localhost:27017/funtube" database/init-mongo.js

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.videos.createIndex({ owner: 1, createdAt: -1 });
db.videos.createIndex({ title: "text", description: "text" });
db.subscriptions.createIndex({ subscriber: 1, channel: 1 }, { unique: true });
db.likes.createIndex({ user: 1, video: 1 }, { unique: true });
db.histories.createIndex({ user: 1, watchedAt: -1 });

print("Indexes created for FunTube collections");
print("Default admin user is seeded automatically by backend startup: Admin / 1234");
