import {Link} from "react-router-dom";

import "./card.css";
import calenderIcon from "../../Images/calender_icon.png"


function CardComponent({homebuyer_id,name,time,projectlist,hostname,host_number,date,lead_priority,}) {
  
  const project_name_list = projectlist.map((project) => {
    return project.name;
  });

  return (
    <>
      <div className={lead_priority + "-lead main-card main-card-body"}>
          <div className="card-header">
            <div className="name">{name}</div>
            <div className="time">{time}</div>
          </div>
          <div className="card-mainbody">
            <ul className="card-list">
              {project_name_list.map((item, index) => (
                <b className="card-item"> {item} </b>
              ))}
            </ul>
          </div>
          <div className="card-footer">
            <div className="lead-source">
              <span>Direct -</span>
              <b className="lead-name">{hostname}</b>
            </div>
            <div>
              <div  className="card-date">
                <img  className="ophs-icon icon-call" src={calenderIcon} alt="Openhaus"></img>
                <span className="date">{date}</span>
              </div>
              <div className="card-contact">
                <a className="btn btn-primary" href={"tel:+"+host_number}>
                  <span className="btn-txt">Lead</span>
                </a>
              </div>
            </div> 
          </div>
          <Link to={`/${homebuyer_id}/details`}  className="card-pointer"></Link>
      </div>
    </>
  );
}

export default CardComponent;
