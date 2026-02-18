import { Link } from "react-router-dom";

const VideoCard = ({ video }) => {
  return (
    <div className="card h-100 shadow-sm border-0">
      <Link to={`/watch/${video._id}`}>
        <img
          src={video.thumbnailUrl}
          className="card-img-top video-thumb"
          alt={video.title}
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/640x360?text=No+Thumbnail";
          }}
        />
      </Link>
      <div className="card-body">
        <h6 className="card-title mb-1 text-truncate" title={video.title}>
          {video.title}
        </h6>
        <p className="text-muted small mb-1">{video.owner?.username}</p>
        <p className="text-muted small mb-0">{video.views || 0} views</p>
      </div>
    </div>
  );
};

export default VideoCard;
