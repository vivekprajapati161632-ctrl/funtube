# FunTube MongoDB Schema

## users
- `_id`: ObjectId
- `username`: String (unique)
- `email`: String (unique)
- `password`: String (bcrypt hash)
- `role`: `user` | `admin`
- `avatarUrl`: String
- `channelDescription`: String
- `createdAt`, `updatedAt`

## videos
- `_id`: ObjectId
- `owner`: ObjectId -> users
- `title`: String
- `description`: String
- `thumbnailUrl`: String
- `videoUrl`: String
- `tags`: [String]
- `views`: Number
- `createdAt`, `updatedAt`

## subscriptions
- `_id`: ObjectId
- `subscriber`: ObjectId -> users
- `channel`: ObjectId -> users
- `createdAt`, `updatedAt`

## likes
- `_id`: ObjectId
- `user`: ObjectId -> users
- `video`: ObjectId -> videos
- `createdAt`, `updatedAt`

## histories
- `_id`: ObjectId
- `user`: ObjectId -> users
- `video`: ObjectId -> videos
- `watchedAt`: Date
- `createdAt`, `updatedAt`
