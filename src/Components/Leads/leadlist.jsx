
import "bootstrap/dist/css/bootstrap.min.css";

// files
import "./leadlist.css";
import Card from '../Cards/card';
import Jsondata from "./lead_list.json";
import Navbar  from "../Navbar/navbar";


function formatTime(timeVal) {
  if (timeVal === 0) {
    return "";
  } else 
  {
    const mins = Math.floor(timeVal / 60);
    const sec = timeVal - mins * 60;
    return `${mins}m ${sec}s`;
  }
}

function LeadComponent() {
  const { host_country_code, host_phone_number, projects } = Jsondata;
  const host_number = host_country_code + host_phone_number;

  return (
     <div className="main-page">
          <div className="main-header">
            <Navbar />
          </div>
          <div className="main-body">
                <div></div>
                <div className="leads">
                            {Jsondata.map((item, index) => (
                              <Card
                                key={index}
                                homebuyer_id = {item.homebuyer_id}
                                name={item.homebuyer_name}
                                time={formatTime(item.elapsed_time_seconds)}
                                projectlist={item.projects}
                                hostname={item.host_name}
                                host_number={host_number}
                                date={item.last_used_at_human}
                                lead_priority={item.lead_priority}
                              />
                            ))}
                </div>
          </div>
        </div>
  );
}

export default LeadComponent ;