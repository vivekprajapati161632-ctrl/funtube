import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import VideoCard from "../components/VideoCard";

const WatchPage = () => {
  const { videoId } = useParams();
  const { isAuthenticated } = useAuth();
  const [video, setVideo] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const shareUrl = useMemo(() => `${window.location.origin}/watch/${videoId}`, [videoId]);

  const loadVideo = async () => {
    try {
      const [{ data: videoData }, { data: recData }] = await Promise.all([
        api.get(`/videos/${videoId}`),
        api.get(`/videos/recommended/${videoId}`)
      ]);

      setVideo(videoData);
      setRecommended(recData.items || []);
      setError("");

      if (isAuthenticated) {
        await api.post(`/videos/${videoId}/history`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load video");
    }
  };

  useEffect(() => {
    loadVideo();
  }, [videoId, isAuthenticated]);

  const toggleLike = async () => {
    if (!isAuthenticated) {
      setInfo("Login required to like videos");
      return;
    }

    if (!video) return;

    try {
      const endpoint = `/videos/${video._id}/like`;
      const { data } = video.likedByMe ? await api.delete(endpoint) : await api.post(endpoint);
      setVideo((prev) => ({
        ...prev,
        likedByMe: data.likedByMe,
        likesCount: data.likesCount
      }));
      setInfo("");
    } catch (err) {
      setInfo(err.response?.data?.message || "Unable to update like");
    }
  };

  const toggleSubscribe = async () => {
    if (!isAuthenticated) {
      setInfo("Login required to subscribe channels");
      return;
    }

    if (!video?.channel) return;

    try {
      const endpoint = `/subscriptions/${video.channel.id}`;
      const { data } = video.channel.isSubscribed ? await api.delete(endpoint) : await api.post(endpoint);

      setVideo((prev) => ({
        ...prev,
        channel: {
          ...prev.channel,
          isSubscribed: data.isSubscribed,
          subscriberCount: data.subscriberCount
        }
      }));
      setInfo("");
    } catch (err) {
      setInfo(err.response?.data?.message || "Unable to update subscription");
    }
  };

  const onCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setInfo("Video link copied");
  };

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!video) {
    return <p>Loading video...</p>;
  }

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <video className="video-player rounded" src={video.videoUrl} controls autoPlay />
        <h4 className="mt-3 mb-2">{video.title}</h4>
        <p className="text-muted small mb-2">{video.views} views</p>
        <p>{video.description}</p>

        <div className="d-flex flex-wrap gap-2 mb-3">
          <button className="btn btn-outline-danger" onClick={toggleLike}>
            {video.likedByMe ? "Unlike" : "Like"} ({video.likesCount || 0})
          </button>
          <button className="btn btn-outline-primary" onClick={toggleSubscribe}>
            {video.channel?.isSubscribed ? "Unsubscribe" : "Subscribe"} ({video.channel?.subscriberCount || 0})
          </button>
          <a
            className="btn btn-outline-success"
            href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <a
            className="btn btn-outline-primary"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
          <a
            className="btn btn-outline-dark"
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
          >
            Twitter (X)
          </a>
          <button className="btn btn-outline-secondary" onClick={onCopyLink}>
            Copy Link
          </button>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body py-3">
            <p className="mb-1 fw-semibold">
              <Link to={`/channel/${video.channel?.id}`}>{video.channel?.username}</Link>
            </p>
            <p className="mb-0 text-muted small">{video.channel?.channelDescription}</p>
          </div>
        </div>

        {info && <p className="text-muted mt-2 small">{info}</p>}
      </div>

      <div className="col-lg-4">
        <h6 className="mb-3">Recommended</h6>
        <div className="d-grid gap-3">
          {recommended.map((item) => (
            <VideoCard key={item._id} video={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
