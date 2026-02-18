import { useEffect, useState } from "react";
import api from "../api/client";
import VideoCard from "../components/VideoCard";

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVideos = async (query = "") => {
    try {
      setLoading(true);
      const { data } = await api.get("/videos", {
        params: query ? { search: query } : {}
      });
      setVideos(data.items || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const onSearch = (event) => {
    event.preventDefault();
    fetchVideos(search.trim());
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between gap-2 align-items-center mb-3">
        <h4 className="mb-0">Trending on FunTube</h4>
        <form className="d-flex gap-2" onSubmit={onSearch}>
          <input
            className="form-control"
            placeholder="Search videos"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-danger">Search</button>
        </form>
      </div>

      {loading && <p>Loading videos...</p>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {!loading && !videos.length && <p className="text-muted">No videos found.</p>}

      <div className="row g-3">
        {videos.map((video) => (
          <div key={video._id} className="col-sm-6 col-lg-4 col-xl-3">
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
