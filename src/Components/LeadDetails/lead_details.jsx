import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import "./lead_details.css";
import Jsondata from "./homebuyer.json";

function LeadDetailsComponent() {

   const navigate = useNavigate();

  function handleAddBuilding() {
     navigate(`/addbuilding`);
  }

  function findHighestApartmentElapsedTimes(projects) {
    const resultArray = [];
    projects.forEach((project) => {
      const apartmentElapsedTimes = project.apartment_types.map(
        (apartment_types) => ({
          name: apartment_types.name,
          seconds: apartment_types.total_elapsed_seconds,
        })
      );
      if (apartmentElapsedTimes.length > 0) {
        resultArray.push(apartmentElapsedTimes.slice(0, 2));
      }
    });
    const flattenedArray = resultArray
      .flat()
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 2);
    if (flattenedArray.length === 0) {
      return "---";
    } else {
      const namesOnly = flattenedArray.map((item) => item.name).join(", ");
      return namesOnly;
    }
  }


  function findHighestAmenityElapsedTimes(projects) {
    const resultArray = [];
    projects.forEach((project) => {
      const amenityElapsedTimes = project.amenities
        .filter((amenity) => amenity.name !== "Building View")
        .map((amenity) => ({
          name: amenity.name,
          seconds: amenity.total_elapsed_seconds,
        }));
      if (amenityElapsedTimes.length > 0) {
        resultArray.push(amenityElapsedTimes.slice(0, 2));
      }
    });
    const flattenedArray = resultArray.flat().sort((a, b) => b.seconds - a.seconds).slice(0, 2);
   
    if (flattenedArray.length === 0) {
      return "---";
    } else {
      const namesOnly = flattenedArray.map((item) => item.name).join(", ");
      return namesOnly;
    }
  }


  function convertSecondsToTime(seconds) {
    if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
      return "Invalid input";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedTime = `${minutes}min ${remainingSeconds}s`;
    return formattedTime;
  }


  const { homebuyer_id } = useParams();
  return (
    <>
      <div className="header header_section">
        <section>
          <div className="div_header">
            <nav className="back-section">
              <a href="http://localhost:5173" className="btn-icon btn-back">
                <span className="back-thik">Back</span>
              </a>
            </nav>
            <div className="profile-section">
              <a className="profile-link" href="/">
                <span className="profile-avatar">
                  {Jsondata.data.homebuyer_name.charAt(0)}
                  <i className="badge live-status-off"></i>
                </span>
                {Jsondata.data.homebuyer_name}
              </a>
            </div>
          </div>
        </section>
      </div>
      <div className="total-engagement-card">
        <div className="total-engagement-section">
          <div className="total-engagement-header">
            <span className="total-engagement-text">Total Engagement</span>
            <div className="total-engagement-time">
              {convertSecondsToTime(Jsondata.data.all_total_elapsed_time)}
            </div>
          </div>
          <div className="engagement-stat">
            <span className="engagement-stat-header">Most seen Units</span>
            <span className="engagement-stat-data">
              {findHighestApartmentElapsedTimes(Jsondata.data.projects)}
            </span>
          </div>
          <div className="engagement-stat">
            <span className="engagement-stat-header">Most seen Amenities</span>
            <div className="engagement-stat-data">
              {findHighestAmenityElapsedTimes(Jsondata.data.projects)}
            </div>
          </div>
          <div className="engagement-stat">
            <span className="engagement-stat-header">Budget</span>
            <span className="engagement-stat-data">-- to --</span>
          </div>
          <div className="engagement-stat">
            <span className="engagement-stat-header">Last engaged</span>
            <span className="engagement-stat-data">
              {Jsondata.data.recent_engagement}
            </span>
          </div>
          <div className="engagement-stat">
            <span className="engagement-stat-header">Lead source</span>
            <span className="engagement-stat-data">
              {Jsondata.data.host_name}
            </span>
          </div>
        </div>
      </div>
      <br></br>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => handleAddBuilding()}
      >
        Add Building
      </button>
    </>
  );
}
export default LeadDetailsComponent;
