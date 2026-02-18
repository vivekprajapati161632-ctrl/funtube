import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import VideoCard from "../components/VideoCard";

const ChannelPage = () => {
  const { channelId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/channels/${channelId}`);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load channel");
      }
    };

    load();
  }, [channelId]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <p>Loading channel...</p>;

  return (
    <div>
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <h4 className="mb-1">{data.channel.username}</h4>
          <p className="text-muted mb-1">{data.subscriberCount} subscribers</p>
          <p className="mb-0">{data.channel.channelDescription}</p>
        </div>
      </div>

      <h6 className="mb-3">Channel videos</h6>
      <div className="row g-3">
        {data.videos.map((video) => (
          <div key={video._id} className="col-sm-6 col-lg-4 col-xl-3">
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelPage;
