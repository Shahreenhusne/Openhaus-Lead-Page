import React, { useEffect, useState } from "react";
import LayoutPrimary from "../../Layouts/Homebuyer/LayoutPrimary";
import SectionContent from "../../Layouts/SectionContent";
import birlaLogo from "../../Assets/Images/icons/Birla.svg";
import QRCode from "../../Assets/Images/openhaus/QR1.png";
import QRCode2 from "../../Assets/Images/openhaus/QR2.png";
import { Button, Col, Form } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import moment from "moment";
import { FreeMode } from "swiper";
import { Link, useNavigate } from "react-router-dom";
import { BSModal } from "../../Contexts/BsModalContext";
import { AxiosGet, AxiosPatch, AxiosPost } from "../../Services/Axios/axios";
import { toast } from "react-toastify";
import Loader from "../../Components/Common/Loader";
import {
  API_CREATE_SITE_VISIT_INVITATION,
  API_CREATE_SITE_VISIT_RENEWAL,
  API_GET_SITE_VISIT_VALIDATION,
} from "../../Endpoints/red/url";
import AutoCarousel, {
  AutoCarouselItem,
} from "../../Components/Common/AutoCarousel";
import { getData } from "../../Services/storage";

const GuestSiteVisitForm = () => {
  const {
    setShowModal,
    setModalBody,
    setVerticalAlign,
    setDefaultModalClose,
    setCloseOnOutsideClick,
    extraContentClassName,
    setExtraContentClassName,
    onModalClosed,
  } = BSModal();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState("");
  const [wrongLink, setWrongLink] = useState(true);
  const [inactiveLink, setInactiveLink] = useState(false); //to check if user is getting into link after 48hrs, then user will see error screen
  const [newUser, setNewUser] = useState(true); //if the user is a new user then the form will show up, else the booked ticket will be shown
  const [currentPage, setCurrentPage] = useState(1);
  const [hasTicket, setHasTicket] = useState(false);
  const [requestedLink, setRequestedLink] = useState(false);
  const [unavailableTimeSlots, setUnavailableTimeSlots] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  //Page1 variables
  const [homebuyerName, setHomebuyerName] = useState("Saish Mankame");
  const [salesManager, setSalesManager] = useState("Kush Bhayani");
  // const [valid, setValid] = useState(false); //first page validation
  const [email, setEmail] = useState("");
  const [leadSource, setLeadSource] = useState("Direct");
  const [channelPartner, setChannelPartner] = useState("");
  const [channelPartnerRep, setChannelPartnerRep] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  // const [isValidEmail, setIsValidEmail] = useState(true);

  const leadSourceOptions = [
    {
      id: 0,
      label: "Channel Partner",
      value: "channel_partner",
    },
    {
      id: 1,
      label: "Meta Ads",
      value: "meta_ads",
    },
    {
      id: 2,
      label: "Google Ads",
      value: "google_ads",
    },
    {
      id: 3,
      label: "Property Portal",
      value: "property_portal",
    },
    {
      id: 4,
      label: "Direct Walk in",
      value: "direct_walk_in",
    },
    {
      id: 5,
      label: "Data Base",
      value: "data_base",
    },
  ];

  const handleEmailChange = (event) => {
    const inputValue = event.target.value;
    setEmail(inputValue);

    // Regular expression for basic email validation
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if the entered email matches the regex pattern
    // setIsValidEmail(emailRegex.test(inputValue));
  };

  //Page2 variables
  // const [valid2, setValid2] = useState(false);
  const [bookTime, setBookTime] = useState("");
  let firstSelectedTime = "";
  const [bookDay, setBookDay] = useState({
    d: moment().format("D"),
    label: moment().format("Do dddd"),
    weekDayName: moment().format("dddd"),
    m: moment().format("M"),
    monthLabel: moment().format("MMMM"),
    year: moment().format("YYYY"),
  }); // // e.g { "d": "19","label": "19th Saturday","weekDayName": "Saturday", "m": "8","monthLabel": "August","year": "2023"}
  const [adultVisitorCount, setAdultVisitorCount] = useState(1);
  const [childVisitorCount, setChildVisitorCount] = useState(0);
  const [foodPref, setFoodPref] = useState("veg");
  const [noteString, setNoteString] = useState("");
  const [apiBookTime, setApiBookTime] = useState("");

  // useEffect(() => {
  //   if (bookTime && bookDay && adultVisitorCount > 0 && foodPref) {
  //     setValid2(true);
  //   } else {
  //     setValid2(false);
  //   }
  // }, [bookTime, bookDay, adultVisitorCount, foodPref]);

  const devName = "Birla Niyaara";
  const devLocation = "Worli";

  const Slide = ({ number, totalSlides, QRImg }) => (
    <div className="qr-code">
      <img draggable="false" src={QRImg} height={200} width={200} />
      <span className="qr-text">
        Birla Niyaara - Phase {number} of {totalSlides}
      </span>
    </div>
  );

  const submitForm = async (e) => {
    e.preventDefault();
    // setCurrentPage(currentPage + 1);
    setShowModal(true);
    setVerticalAlign("center");
    setModalBody(<ConfirmFirstPage />);
    setDefaultModalClose(false);
    setCloseOnOutsideClick(false);
    setExtraContentClassName("birla-form");
  };

  const submitForm2 = async (e) => {
    const formattedDateTime = `${bookDay.year}-${bookDay.m
      .toString()
      .padStart(2, "0")}-${bookDay.d.toString().padStart(2, "0")} ${bookTime}`;
    // Check if the formatted value exists in the array
    const isTimeWrong = unavailableTimeSlots?.includes(formattedDateTime);
    if (isTimeWrong || hasDatePassed(formattedDateTime) || bookTime === "") {
      e.preventDefault();
      toast.error("Invalid Time Selected!");
    } else {
      e.preventDefault();
      setShowModal(true);
      setVerticalAlign("center");
      setModalBody(<ConfirmSecondPage />);
      setDefaultModalClose(false);
      setCloseOnOutsideClick(false);
      setExtraContentClassName("birla-form");
    }
  };

  const editForm = () => {
    setModalBody(null);
    setShowModal(false);
  };

  const editFormPage2 = () => {
    setCurrentPage(2);
    setNewUser(true);
  };

  const openReraDisclaimer = async (e) => {
    e.preventDefault();
    setShowModal(true);
    setVerticalAlign("center");
    setModalBody(<ReraDisclaimer />);
    setDefaultModalClose(false);
    setCloseOnOutsideClick(false);
    setExtraContentClassName("birla-form-2");
  };

  const nextPage = () => {
    onModalClosed();
    setCurrentPage(currentPage + 1);
  };

  const validateUserData = () => {
    setIsLoading(true);
    const getToken = getData("birla-invitation-token")
      ? getData("birla-invitation-token")
      : "";
    if (getToken) {
      setUserToken(getToken);
    }
    AxiosGet(API_GET_SITE_VISIT_VALIDATION + getToken)
      .then((res) => {
        if (res?.data) {
          setWrongLink(false);
          if (
            res.data.data.invitation.invitation_status === "site_visit_booked"
          ) {
            if (
              res.data?.data?.site_visit_booking?.current_state === "Completed"
            ) {
              navigate("/projects");
            }
            // when user has data, expired link does not matter here
            setInactiveLink(false);
            setNewUser(false);
            setEmail(res.data.data.invitation.guest.email);
            setHomebuyerName(res.data.data.invitation.guest.guest_name);
            setSalesManager(
              res.data.data.site_visit_booking.sales_manager.name
            );
            setLeadSource(res.data.data.site_visit_booking.lead_source);
            setChannelPartner(
              res.data.data.invitation.guest.channel_partner_firm
            );
            setChannelPartnerRep(
              res.data.data.site_visit_booking.channel_partner_representative
            );
            const bookingDate = res.data.data.site_visit_booking.booking_date;
            setBookDay({
              d: moment(bookingDate).format("D"),
              label: moment(bookingDate).format("Do dddd"),
              weekDayName: moment(bookingDate).format("dddd"),
              m: moment(bookingDate).format("M"),
              monthLabel: moment(bookingDate).format("MMMM"),
              year: moment(bookingDate).format("YYYY"),
            });
            const bookingTime = res.data.data.site_visit_booking.booking_time;
            setBookTime(res.data.data.site_visit_booking.booking_time);
            setApiBookTime(res?.data?.data?.site_visit_booking?.booking_time);
            setNoteString(res.data.data.site_visit_booking.remarks);
            setFoodPref(
              res.data.data.site_visit_booking.guest_preferences.food_preference
            );
            setAdultVisitorCount(
              res.data.data.site_visit_booking.guest_preferences.adult_count
            );
            setChildVisitorCount(
              res.data.data.site_visit_booking.guest_preferences.child_count
            );
            const combinedDateTimeString = `${bookingDate} ${bookingTime}`;

            // Parse the combined date and time string using moment
            const dateTime = moment(
              combinedDateTimeString,
              "YYYY-MM-DD hh:mm A"
            );

            // Format date and time using moment
            const formattedDateTime = dateTime.format("YYYY-MM-DD HH:mm:ss");
            setUnavailableTimeSlots(
              res.data.data.site_visit_booking.red_manager_schedules.filter(
                (schedule) => schedule !== formattedDateTime
              )
            );
            // if (!getToken) {
            // }
            if (res?.data?.data?.invitation?.token) {
              setUserToken(res?.data?.data?.invitation?.token);
            }
            setHasTicket(true);
          } else if (
            new Date(res.data.data.invitation.expires_at) < new Date()
          ) {
            //in case of inactive link
            setInactiveLink(true);
            setNewUser(true);
            if (
              res.data.data.invitation.invitation_status === "renewal_requested"
            ) {
              setRequestedLink(true);
            }
            if (res?.data?.data?.invitation?.token) {
              setUserToken(res?.data?.data?.invitation?.token);
            }
          } else {
            //in the scenario where the user is a new user and has non expired link
            setNewUser(true);
            setInactiveLink(false); //will come from API
            setEmail(res.data.data.invitation.guest.email);
            setHomebuyerName(res.data.data.invitation.guest.guest_name);
            setSalesManager(res.data.data.invitation.guest.sales_manager.name);
            setLeadSource(res.data.data.invitation.guest.lead_source);
            setChannelPartner(
              res.data.data.invitation.guest.channel_partner_firm
            );
            setChannelPartnerRep(
              res.data.data.invitation.guest.channel_partner_representative
            );
            setUnavailableTimeSlots(res.data.data.red_manager_schedules);
            if (res?.data?.data?.token) {
              setUserToken(res?.data?.data?.token);
            }
          }
        } else {
          setWrongLink(true);
        }
      })
      .catch((e) => {
        setWrongLink(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleRequestLink = () => {
    setIsLoading(true);
    const payload = {
      token: userToken,
    };
    AxiosPost(API_CREATE_SITE_VISIT_RENEWAL, payload)
      .then((res) => {
        if (res?.status === 200) {
          toast.success("Request Successful!");
          setRequestedLink(true);
        }
      })
      .catch((res) => {
        toast.error(res.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleBookTime = (value) => {
    setBookTime(value);
    firstSelectedTime = value;
  };

  const BirlaSvg = (props) => {
    return (
      <div
        className={
          props.hasBorder ? "birla-logo-bg has-border" : "birla-logo-bg"
        }
        style={{ height: props.height, width: props.width }}
      >
        <img
          src={birlaLogo}
          width={props.width - 0.14 * props.width}
          height={props.height - 0.255 * props.height}
        />
      </div>
    );
  };

  const [calendarDays, setCalendarDays] = useState([]);
  const calenderTimeStart = 10;
  const calenderTimeEnd = 19;
  const calendarDayHandler = (_day) => {
    setBookDay((prevDay) => {
      return {
        ...prevDay,
        ...{
          d: _day.d,
          label: _day.do + " " + _day.wdf,
          weekDayName: _day.wdf,
          m: _day.m,
          monthLabel: _day.monthName,
          year: _day.year,
        },
      };
    });
  };
  const generateCalendarDay = () => {
    const days = [];
    let dateStart = null;
    let dateEnd = null;

    // what we do is to take the today's date in the first line, and then add 30days to it.
    dateStart = moment();
    dateEnd = moment().add(7, "days");

    while (dateEnd.diff(dateStart, "days") >= 0) {
      days.push({
        d: dateStart.format("D"), // e.g  "10", Represents the day of the month as a number without leading zeros.
        do: dateStart.format("Do"), // e.g  "10th", Represents the day of the month with a suffix (ordinal indicator), such as "st", "nd", "rd", or "th".
        wd: dateStart.format("dd"), // e.g  "Th",  Represents the abbreviated day of the week (e.g., "Su", "Mo", "Tu", etc.)
        wdf: dateStart.format("dddd"), // e.g  "Thursday", Represents the full name of the day of the week (e.g., "Sunday", "Monday", etc.).
        m: dateStart.format("M"), // e.g  "8", Represents the month as a number without leading zeros
        monthName: dateStart.format("MMMM"), // Full name of the month
        year: dateStart.format("YYYY"), // Year
      });
      dateStart.add(1, "days");
    }
    setCalendarDays(days);
  };

  useEffect(() => {
    generateCalendarDay();
    validateUserData();
  }, []);

  const renderTimeSlots = () => {
    const timeSlots = [];

    for (let hour = calenderTimeStart; hour <= calenderTimeEnd; hour++) {
      const formattedTime = moment().hour(hour).minute(0).format("hh:mm A");
      timeSlots.push(formattedTime);
    }
    return timeSlots;
  };

  useEffect(() => {
    renderTimeSlots()?.map((timeDivs, i) => {
      if (availableTimeSlots.includes(bookTime)) {
        firstSelectedTime = bookTime;
      }
      if (firstSelectedTime === "" && availableTimeSlots.includes(timeDivs)) {
        firstSelectedTime = timeDivs;
        setBookTime(firstSelectedTime);
      }
    });
  }, [bookTime, availableTimeSlots]);

  const filterOverlappingTimeSlots = (selectedDate, timeSlots) => {
    // Find out time slots of selected date that are unavilable
    const formattedUnavailableTimeSlots = unavailableTimeSlots
      ?.filter(
        (slot) =>
          moment(slot, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD") ===
          selectedDate
      )
      .map((slot) => moment(slot, "YYYY-MM-DD HH:mm:ss").format("h:mm A"));
    // Remove time slots for the selected date that exist in unavailableTimeSlots
    const filteredTimeSlots = timeSlots?.filter((slot) => {
      const formattedSelectedDateSlot = moment(
        `${selectedDate} ${slot}`,
        "YYYY-MM-DD h:mm A"
      ).format("h:mm A");
      return (
        !formattedUnavailableTimeSlots?.includes(formattedSelectedDateSlot) &&
        moment()
          .add(1, "hour")
          .isBefore(moment(`${selectedDate} ${slot}`, "YYYY-MM-DD h:mm A"))
      );
    });

    return filteredTimeSlots;
  };

  const organizeFreeTimeSlots = (selectedDate) => {
    const timeSlots = renderTimeSlots();
    const freeTimeSlots = filterOverlappingTimeSlots(selectedDate, timeSlots);
    setAvailableTimeSlots(freeTimeSlots);
  };

  useEffect(() => {
    organizeFreeTimeSlots(
      bookDay.year +
        "-" +
        bookDay.m.toString().padStart(2, "0") +
        "-" +
        bookDay.d.toString().padStart(2, "0")
    );
  }, [bookDay]);

  function hasDatePassed(targetDate) {
    const targetDateTime = moment(targetDate, "YYYY-MM-DD h:mm A");
    const currentDateTime = moment();
    return targetDateTime.isBefore(currentDateTime);
  }

  const createSiteVisit = async () => {
    const formattedDateTime = `${bookDay.year}-${bookDay.m
      .toString()
      .padStart(2, "0")}-${bookDay.d.toString().padStart(2, "0")} ${bookTime}`;

    // Check if the formatted value exists in the array
    const isTimeWrong = unavailableTimeSlots?.includes(formattedDateTime);
    if (isTimeWrong || hasDatePassed(formattedDateTime)) {
      toast.error("Invalid Time Selected!");
    } else {
      setIsLoading(true);
      const payload = {
        email: email,
        food_preference: foodPref,
        booking_time: bookTime,
        booking_date: bookDay.d + "-" + bookDay.m + "-" + bookDay.year,
        remarks: !noteString?.trim().length ? null : noteString,
        lead_source: leadSource,
        channel_partner_firm: channelPartner,
        channel_partner_representative: channelPartnerRep,
        adult_count: adultVisitorCount,
        child_count: childVisitorCount,
      };
      if (hasTicket) {
        AxiosPatch(API_CREATE_SITE_VISIT_INVITATION, payload)
          .then((res) => {
            if (res?.status === 200) {
              toast.success("Site Visit Booked!");
              setApiBookTime(res?.data?.data?.booking_time);
              nextPage();
            }
          })
          .catch((res) => {
            toast.error(res.message);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        AxiosPost(API_CREATE_SITE_VISIT_INVITATION, payload)
          .then((res) => {
            if (res?.status === 201) {
              toast.success("Site Visit Booked!");
              setHasTicket(true);
              setApiBookTime(res?.data?.data?.booking_time);
              nextPage();
            }
          })
          .catch((res) => {
            toast.error(res.message);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  };

  const ConfirmFirstPage = () => {
    return (
      <div className="confirm-details-page">
        <div className="form-input">
          <div className="form-input-header">
            <span className="font-heavy text-dark">
              Please confirm, you will not be able to change these details once
              you click continue.
            </span>
          </div>
        </div>
        <div className="form-input">
          <div className="form-input-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="11"
              viewBox="0 0 13 11"
              fill="none"
            >
              <path
                d="M11.4516 0.150391H1.12903C0.830117 0.152084 0.543926 0.271579 0.332557 0.482948C0.121189 0.694317 0.00169361 0.980507 0 1.27942V9.02136C0.00169361 9.32027 0.121189 9.60647 0.332557 9.81783C0.543926 10.0292 0.830117 10.1487 1.12903 10.1504H11.4516C11.7505 10.1487 12.0367 10.0292 12.2481 9.81783C12.4595 9.60647 12.579 9.32027 12.5806 9.02136V1.27942C12.579 0.980507 12.4595 0.694317 12.2481 0.482948C12.0367 0.271579 11.7505 0.152084 11.4516 0.150391ZM1.12903 1.11813H11.4516C11.4944 1.11813 11.5354 1.13513 11.5657 1.16537C11.5959 1.19562 11.6129 1.23665 11.6129 1.27942V2.28587L6.29032 5.24071L0.967742 2.28587V1.27942C0.967742 1.23665 0.984735 1.19562 1.01498 1.16537C1.04523 1.13513 1.08626 1.11813 1.12903 1.11813ZM11.4516 9.18265H1.12903C1.08626 9.18265 1.04523 9.16566 1.01498 9.13541C0.984735 9.10516 0.967742 9.06413 0.967742 9.02136V3.3891L6.05806 6.22136C6.12963 6.25921 6.20936 6.279 6.29032 6.279C6.37128 6.279 6.45101 6.25921 6.52258 6.22136L11.6129 3.3891V9.02136C11.6129 9.06413 11.5959 9.10516 11.5657 9.13541C11.5354 9.16566 11.4944 9.18265 11.4516 9.18265Z"
                fill="#828282"
              />
            </svg>
            <span className="input-title text-dimmed">Email</span>
            <div className="input-field">{email}</div>
          </div>
        </div>

        <div className="form-input">
          <div className="form-input-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="15"
              viewBox="0 0 13 15"
              fill="none"
            >
              <path
                d="M10.9937 8.3146C10.5516 8.3146 10.1537 8.49144 9.87368 8.78618L8.56211 8.01986C8.66526 7.7546 8.72421 7.45986 8.72421 7.15039C8.72421 6.84092 8.66526 6.54618 8.56211 6.28092L9.87368 5.5146C10.1537 5.80934 10.5516 5.98618 10.9937 5.98618C11.8484 5.98618 12.5558 5.27881 12.5558 4.42407C12.5558 3.56934 11.8484 2.87671 10.9937 2.87671C10.1389 2.87671 9.43158 3.58407 9.43158 4.43881C9.43158 4.58618 9.46105 4.71881 9.49053 4.85144L8.16421 5.61776C7.79579 5.16092 7.26526 4.83671 6.66105 4.74829V3.21565C7.33895 3.03881 7.84 2.4346 7.84 1.7125C7.84 0.857759 7.14737 0.150391 6.27789 0.150391C5.40842 0.150391 4.71579 0.857759 4.71579 1.7125C4.71579 2.4346 5.21684 3.05355 5.89474 3.21565V4.74829C5.29053 4.85144 4.76 5.16092 4.39158 5.61776L3.06526 4.85144C3.10947 4.71881 3.12421 4.57144 3.12421 4.43881C3.12421 3.56934 2.43158 2.87671 1.56211 2.87671C0.692632 2.87671 0 3.56934 0 4.42407C0 5.27881 0.707368 5.98618 1.56211 5.98618C2.00421 5.98618 2.40211 5.80934 2.68211 5.5146L3.99368 6.28092C3.89053 6.54618 3.83158 6.84092 3.83158 7.15039C3.83158 7.45986 3.89053 7.7546 3.99368 8.01986L2.68211 8.78618C2.40211 8.49144 2.00421 8.3146 1.56211 8.3146C0.707368 8.3146 0 9.02197 0 9.87671C0 10.7314 0.707368 11.4241 1.56211 11.4241C2.41684 11.4241 3.12421 10.7167 3.12421 9.86197C3.12421 9.7146 3.09474 9.58197 3.06526 9.44934L4.39158 8.68302C4.76 9.13986 5.29053 9.46408 5.89474 9.5525V11.0851C5.21684 11.262 4.71579 11.8662 4.71579 12.5883C4.71579 13.443 5.40842 14.1504 6.27789 14.1504C7.14737 14.1504 7.84 13.443 7.84 12.5883C7.84 11.8662 7.33895 11.2472 6.66105 11.0851V9.5525C7.26526 9.44934 7.79579 9.13986 8.16421 8.68302L9.49053 9.44934C9.44632 9.58197 9.43158 9.7146 9.43158 9.86197C9.43158 10.7314 10.1242 11.4241 10.9937 11.4241C11.8484 11.4241 12.5558 10.7167 12.5558 9.86197C12.5558 9.00723 11.8484 8.3146 10.9937 8.3146ZM10.9937 3.62829C11.4358 3.62829 11.7895 3.98197 11.7895 4.42407C11.7895 4.86618 11.4358 5.21986 10.9937 5.21986C10.5516 5.21986 10.1979 4.86618 10.1979 4.42407C10.1979 3.98197 10.5516 3.62829 10.9937 3.62829ZM1.56211 5.21986C1.12 5.21986 0.766316 4.86618 0.766316 4.42407C0.766316 3.98197 1.12 3.62829 1.56211 3.62829C2.00421 3.62829 2.35789 3.98197 2.35789 4.42407C2.35789 4.86618 2.00421 5.21986 1.56211 5.21986ZM1.56211 10.6725C1.12 10.6725 0.766316 10.3188 0.766316 9.87671C0.766316 9.4346 1.12 9.08092 1.56211 9.08092C2.00421 9.08092 2.35789 9.4346 2.35789 9.87671C2.35789 10.3188 2.00421 10.6725 1.56211 10.6725ZM5.4821 1.7125C5.4821 1.27039 5.83579 0.916706 6.27789 0.916706C6.72 0.916706 7.07368 1.27039 7.07368 1.7125C7.07368 2.1546 6.72 2.50829 6.27789 2.50829C5.83579 2.50829 5.4821 2.1546 5.4821 1.7125ZM7.07368 12.5883C7.07368 13.0304 6.72 13.3841 6.27789 13.3841C5.83579 13.3841 5.4821 13.0304 5.4821 12.5883C5.4821 12.1462 5.83579 11.7925 6.27789 11.7925C6.72 11.7925 7.07368 12.1462 7.07368 12.5883ZM6.27789 8.83039C5.34947 8.83039 4.59789 8.07881 4.59789 7.15039C4.59789 6.22197 5.34947 5.47039 6.27789 5.47039C7.20632 5.47039 7.95789 6.22197 7.95789 7.15039C7.95789 8.07881 7.20632 8.83039 6.27789 8.83039ZM10.9937 10.6725C10.5516 10.6725 10.1979 10.3188 10.1979 9.87671C10.1979 9.4346 10.5516 9.08092 10.9937 9.08092C11.4358 9.08092 11.7895 9.4346 11.7895 9.87671C11.7895 10.3188 11.4211 10.6725 10.9937 10.6725Z"
                fill="#828282"
              />
            </svg>
            <span className="input-title text-dimmed">Lead Source</span>
            <div
              className={
                leadSource === "channel_partner"
                  ? "input-field"
                  : "input-field no-border"
              }
            >
              {findLabelFromValue(leadSource)}
            </div>
          </div>
        </div>

        <div
          className="form-input"
          hidden={leadSource === "channel_partner" ? false : true}
        >
          <div className="form-input-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="16"
              viewBox="0 0 15 16"
              fill="none"
            >
              <mask
                id="path-1-outside-1_1412_26652"
                maskUnits="userSpaceOnUse"
                x="0"
                y="-0.849609"
                width="15"
                height="17"
                fill="black"
              >
                <rect fill="white" y="-0.849609" width="15" height="17" />
                <path d="M14.5899 12.6744C13.566 10.0748 10.941 9.28381 10.2372 9.1142L10.0533 7.46724C10.2705 7.14333 10.4263 6.78227 10.513 6.40203C10.719 6.27522 10.8887 5.95503 11.044 5.4034C11.2025 4.82482 11.2025 4.45232 11.0171 4.22881C10.9735 4.17654 10.9195 4.1339 10.8585 4.10359C10.8712 4.05128 10.8839 3.99421 10.8966 3.93556C11.0773 2.84816 10.9758 2.05084 10.5938 1.56737C10.4499 1.37618 10.2481 1.23661 10.0184 1.1695C9.82348 0.89429 9.56738 0.66803 9.27024 0.508503C8.78418 0.227124 8.22156 0.106721 7.66291 0.164529C7.4406 0.175754 7.22087 0.217353 7.00984 0.288169C6.76086 0.373242 6.52503 0.49276 6.30921 0.643239C6.04917 0.807371 5.81107 1.00392 5.60065 1.22815C5.21773 1.60427 4.94713 2.07961 4.81918 2.60088C4.71728 3.04101 4.71728 3.4986 4.81918 3.93873C4.82975 3.99474 4.84137 4.04758 4.85405 4.09725C4.79333 4.12652 4.73935 4.16808 4.69554 4.2193C4.51008 4.44122 4.50215 4.81531 4.66542 5.39706C4.82393 5.94868 4.98245 6.26888 5.19327 6.39569C5.28136 6.78745 5.44154 7.15942 5.66564 7.49261L5.48177 9.1142C4.77321 9.28381 2.15298 10.0748 1.12423 12.676C1.01706 12.9491 0.97836 13.2443 1.01152 13.5358C1.04467 13.8273 1.14868 14.1063 1.31445 14.3483C1.48223 14.5953 1.70789 14.7975 1.97175 14.9373C2.2356 15.0771 2.52965 15.1503 2.82825 15.1504H12.8859C13.1846 15.1504 13.4787 15.0773 13.7425 14.9375C14.0064 14.7977 14.232 14.5954 14.3997 14.3483C14.5658 14.1061 14.6699 13.8268 14.7031 13.535C14.7362 13.2432 14.6974 12.9477 14.5899 12.6744ZM5.28045 2.71501C5.38953 2.27569 5.61899 1.8755 5.94304 1.55945C6.13132 1.36068 6.34443 1.187 6.57709 1.04269C6.75609 0.915386 6.95187 0.813497 7.15884 0.739932C7.33396 0.681129 7.51642 0.646986 7.70095 0.638484C8.16775 0.588502 8.63837 0.687843 9.04515 0.922223C9.29961 1.05389 9.51499 1.25013 9.66969 1.49129C9.68885 1.52617 9.71615 1.55592 9.74926 1.57799C9.78238 1.60007 9.82034 1.61383 9.85991 1.6181C10.0144 1.65208 10.1497 1.74471 10.2372 1.87647C10.4337 2.13644 10.6271 2.69123 10.4353 3.84997C10.4147 3.94983 10.3941 4.03384 10.3703 4.1131L10.2578 3.04472C10.252 2.98317 10.2224 2.92632 10.1753 2.8862L9.39863 2.22679C9.36905 2.20177 9.3338 2.18436 9.29595 2.17607C9.2581 2.16778 9.2188 2.16887 9.18147 2.17923L5.79879 3.09861C5.75348 3.1111 5.71288 3.13673 5.68212 3.17228C5.65137 3.20783 5.63185 3.2517 5.62601 3.29834L5.5103 4.20187L5.36288 4.13846C5.33103 4.04532 5.30613 3.94995 5.28838 3.85314C5.19803 3.47945 5.19532 3.08992 5.28045 2.71501ZM5.64028 6.1928C5.63263 6.1423 5.60891 6.09561 5.57266 6.05964C5.5364 6.02366 5.48952 6.00032 5.43897 5.99307C5.41202 5.97246 5.28045 5.85199 5.12194 5.275C4.95075 4.66948 5.05378 4.53474 5.05854 4.52999L5.59907 4.763C5.63291 4.77754 5.66967 4.78401 5.70644 4.78191C5.74321 4.77981 5.77899 4.7692 5.81096 4.75091C5.84293 4.73262 5.87021 4.70715 5.89066 4.67651C5.9111 4.64588 5.92415 4.61091 5.92877 4.57437L6.06351 3.5155L9.1672 2.67063L9.7759 3.18738L9.92173 4.56803C9.92607 4.60949 9.94123 4.64909 9.9657 4.68284C9.99016 4.71659 10.0231 4.74332 10.0611 4.76034C10.0992 4.77736 10.141 4.78408 10.1825 4.77981C10.224 4.77555 10.2636 4.76046 10.2974 4.73606L10.6002 4.51889C10.6132 4.51817 10.6262 4.5221 10.6366 4.52999C10.6366 4.52999 10.7444 4.66948 10.5732 5.27342C10.4147 5.84882 10.2831 5.97088 10.2562 5.99148C10.2056 5.99874 10.1588 6.02208 10.1225 6.05805C10.0862 6.09402 10.0625 6.14071 10.0549 6.19121C9.93916 6.94573 9.3384 7.88255 8.41426 8.21701C8.04236 8.35099 7.63536 8.35099 7.26346 8.21701C6.36152 7.8984 5.76392 6.95683 5.64028 6.1928ZM9.76163 9.22674L8.96906 10.0669C8.95787 10.0416 8.94231 10.0185 8.92309 9.9987L8.01798 9.09359C7.9734 9.04906 7.91297 9.02405 7.84996 9.02405C7.78695 9.02405 7.72651 9.04906 7.68193 9.09359L6.77682 9.9987C6.7576 10.0185 6.74204 10.0416 6.73085 10.0669L5.93828 9.22674L6.07144 8.01253C6.36228 8.30536 6.71483 8.52956 7.10336 8.66878C7.57929 8.84002 8.10002 8.84002 8.57595 8.66878C8.96828 8.52268 9.32339 8.29153 9.6158 7.99192L9.76163 9.22674ZM2.83301 14.6733C2.61189 14.6731 2.39416 14.6189 2.19882 14.5153C2.00348 14.4117 1.83645 14.2618 1.71232 14.0788C1.58915 13.9013 1.51193 13.6961 1.48759 13.4814C1.46324 13.2667 1.49253 13.0493 1.57282 12.8488C2.5239 10.4552 5.03793 9.71338 5.62601 9.57072L7.05263 11.1035L6.11582 14.6733H2.83301ZM6.60721 14.6733L7.55829 11.0687C7.57238 11.0159 7.56791 10.96 7.54561 10.9102L7.2381 10.219L7.85947 9.59766L8.48084 10.219L8.17649 10.9102C8.1542 10.96 8.14972 11.0159 8.16381 11.0687L9.11489 14.6733H6.60721ZM14.0082 14.0788C13.8841 14.2618 13.717 14.4117 13.5217 14.5153C13.3264 14.6189 13.1086 14.6731 12.8875 14.6733H9.60312L8.65203 11.1035L10.0787 9.57072C10.6667 9.71338 13.1871 10.4552 14.1318 12.8488C14.2142 13.0482 14.2459 13.2649 14.224 13.4796C14.2021 13.6942 14.1275 13.9001 14.0066 14.0788H14.0082Z" />
              </mask>
              <path
                d="M14.5899 12.6744C13.566 10.0748 10.941 9.28381 10.2372 9.1142L10.0533 7.46724C10.2705 7.14333 10.4263 6.78227 10.513 6.40203C10.719 6.27522 10.8887 5.95503 11.044 5.4034C11.2025 4.82482 11.2025 4.45232 11.0171 4.22881C10.9735 4.17654 10.9195 4.1339 10.8585 4.10359C10.8712 4.05128 10.8839 3.99421 10.8966 3.93556C11.0773 2.84816 10.9758 2.05084 10.5938 1.56737C10.4499 1.37618 10.2481 1.23661 10.0184 1.1695C9.82348 0.89429 9.56738 0.66803 9.27024 0.508503C8.78418 0.227124 8.22156 0.106721 7.66291 0.164529C7.4406 0.175754 7.22087 0.217353 7.00984 0.288169C6.76086 0.373242 6.52503 0.49276 6.30921 0.643239C6.04917 0.807371 5.81107 1.00392 5.60065 1.22815C5.21773 1.60427 4.94713 2.07961 4.81918 2.60088C4.71728 3.04101 4.71728 3.4986 4.81918 3.93873C4.82975 3.99474 4.84137 4.04758 4.85405 4.09725C4.79333 4.12652 4.73935 4.16808 4.69554 4.2193C4.51008 4.44122 4.50215 4.81531 4.66542 5.39706C4.82393 5.94868 4.98245 6.26888 5.19327 6.39569C5.28136 6.78745 5.44154 7.15942 5.66564 7.49261L5.48177 9.1142C4.77321 9.28381 2.15298 10.0748 1.12423 12.676C1.01706 12.9491 0.97836 13.2443 1.01152 13.5358C1.04467 13.8273 1.14868 14.1063 1.31445 14.3483C1.48223 14.5953 1.70789 14.7975 1.97175 14.9373C2.2356 15.0771 2.52965 15.1503 2.82825 15.1504H12.8859C13.1846 15.1504 13.4787 15.0773 13.7425 14.9375C14.0064 14.7977 14.232 14.5954 14.3997 14.3483C14.5658 14.1061 14.6699 13.8268 14.7031 13.535C14.7362 13.2432 14.6974 12.9477 14.5899 12.6744ZM5.28045 2.71501C5.38953 2.27569 5.61899 1.8755 5.94304 1.55945C6.13132 1.36068 6.34443 1.187 6.57709 1.04269C6.75609 0.915386 6.95187 0.813497 7.15884 0.739932C7.33396 0.681129 7.51642 0.646986 7.70095 0.638484C8.16775 0.588502 8.63837 0.687843 9.04515 0.922223C9.29961 1.05389 9.51499 1.25013 9.66969 1.49129C9.68885 1.52617 9.71615 1.55592 9.74926 1.57799C9.78238 1.60007 9.82034 1.61383 9.85991 1.6181C10.0144 1.65208 10.1497 1.74471 10.2372 1.87647C10.4337 2.13644 10.6271 2.69123 10.4353 3.84997C10.4147 3.94983 10.3941 4.03384 10.3703 4.1131L10.2578 3.04472C10.252 2.98317 10.2224 2.92632 10.1753 2.8862L9.39863 2.22679C9.36905 2.20177 9.3338 2.18436 9.29595 2.17607C9.2581 2.16778 9.2188 2.16887 9.18147 2.17923L5.79879 3.09861C5.75348 3.1111 5.71288 3.13673 5.68212 3.17228C5.65137 3.20783 5.63185 3.2517 5.62601 3.29834L5.5103 4.20187L5.36288 4.13846C5.33103 4.04532 5.30613 3.94995 5.28838 3.85314C5.19803 3.47945 5.19532 3.08992 5.28045 2.71501ZM5.64028 6.1928C5.63263 6.1423 5.60891 6.09561 5.57266 6.05964C5.5364 6.02366 5.48952 6.00032 5.43897 5.99307C5.41202 5.97246 5.28045 5.85199 5.12194 5.275C4.95075 4.66948 5.05378 4.53474 5.05854 4.52999L5.59907 4.763C5.63291 4.77754 5.66967 4.78401 5.70644 4.78191C5.74321 4.77981 5.77899 4.7692 5.81096 4.75091C5.84293 4.73262 5.87021 4.70715 5.89066 4.67651C5.9111 4.64588 5.92415 4.61091 5.92877 4.57437L6.06351 3.5155L9.1672 2.67063L9.7759 3.18738L9.92173 4.56803C9.92607 4.60949 9.94123 4.64909 9.9657 4.68284C9.99016 4.71659 10.0231 4.74332 10.0611 4.76034C10.0992 4.77736 10.141 4.78408 10.1825 4.77981C10.224 4.77555 10.2636 4.76046 10.2974 4.73606L10.6002 4.51889C10.6132 4.51817 10.6262 4.5221 10.6366 4.52999C10.6366 4.52999 10.7444 4.66948 10.5732 5.27342C10.4147 5.84882 10.2831 5.97088 10.2562 5.99148C10.2056 5.99874 10.1588 6.02208 10.1225 6.05805C10.0862 6.09402 10.0625 6.14071 10.0549 6.19121C9.93916 6.94573 9.3384 7.88255 8.41426 8.21701C8.04236 8.35099 7.63536 8.35099 7.26346 8.21701C6.36152 7.8984 5.76392 6.95683 5.64028 6.1928ZM9.76163 9.22674L8.96906 10.0669C8.95787 10.0416 8.94231 10.0185 8.92309 9.9987L8.01798 9.09359C7.9734 9.04906 7.91297 9.02405 7.84996 9.02405C7.78695 9.02405 7.72651 9.04906 7.68193 9.09359L6.77682 9.9987C6.7576 10.0185 6.74204 10.0416 6.73085 10.0669L5.93828 9.22674L6.07144 8.01253C6.36228 8.30536 6.71483 8.52956 7.10336 8.66878C7.57929 8.84002 8.10002 8.84002 8.57595 8.66878C8.96828 8.52268 9.32339 8.29153 9.6158 7.99192L9.76163 9.22674ZM2.83301 14.6733C2.61189 14.6731 2.39416 14.6189 2.19882 14.5153C2.00348 14.4117 1.83645 14.2618 1.71232 14.0788C1.58915 13.9013 1.51193 13.6961 1.48759 13.4814C1.46324 13.2667 1.49253 13.0493 1.57282 12.8488C2.5239 10.4552 5.03793 9.71338 5.62601 9.57072L7.05263 11.1035L6.11582 14.6733H2.83301ZM6.60721 14.6733L7.55829 11.0687C7.57238 11.0159 7.56791 10.96 7.54561 10.9102L7.2381 10.219L7.85947 9.59766L8.48084 10.219L8.17649 10.9102C8.1542 10.96 8.14972 11.0159 8.16381 11.0687L9.11489 14.6733H6.60721ZM14.0082 14.0788C13.8841 14.2618 13.717 14.4117 13.5217 14.5153C13.3264 14.6189 13.1086 14.6731 12.8875 14.6733H9.60312L8.65203 11.1035L10.0787 9.57072C10.6667 9.71338 13.1871 10.4552 14.1318 12.8488C14.2142 13.0482 14.2459 13.2649 14.224 13.4796C14.2021 13.6942 14.1275 13.9001 14.0066 14.0788H14.0082Z"
                fill="#828282"
              />
              <path
                d="M14.5899 12.6744C13.566 10.0748 10.941 9.28381 10.2372 9.1142L10.0533 7.46724C10.2705 7.14333 10.4263 6.78227 10.513 6.40203C10.719 6.27522 10.8887 5.95503 11.044 5.4034C11.2025 4.82482 11.2025 4.45232 11.0171 4.22881C10.9735 4.17654 10.9195 4.1339 10.8585 4.10359C10.8712 4.05128 10.8839 3.99421 10.8966 3.93556C11.0773 2.84816 10.9758 2.05084 10.5938 1.56737C10.4499 1.37618 10.2481 1.23661 10.0184 1.1695C9.82348 0.89429 9.56738 0.66803 9.27024 0.508503C8.78418 0.227124 8.22156 0.106721 7.66291 0.164529C7.4406 0.175754 7.22087 0.217353 7.00984 0.288169C6.76086 0.373242 6.52503 0.49276 6.30921 0.643239C6.04917 0.807371 5.81107 1.00392 5.60065 1.22815C5.21773 1.60427 4.94713 2.07961 4.81918 2.60088C4.71728 3.04101 4.71728 3.4986 4.81918 3.93873C4.82975 3.99474 4.84137 4.04758 4.85405 4.09725C4.79333 4.12652 4.73935 4.16808 4.69554 4.2193C4.51008 4.44122 4.50215 4.81531 4.66542 5.39706C4.82393 5.94868 4.98245 6.26888 5.19327 6.39569C5.28136 6.78745 5.44154 7.15942 5.66564 7.49261L5.48177 9.1142C4.77321 9.28381 2.15298 10.0748 1.12423 12.676C1.01706 12.9491 0.97836 13.2443 1.01152 13.5358C1.04467 13.8273 1.14868 14.1063 1.31445 14.3483C1.48223 14.5953 1.70789 14.7975 1.97175 14.9373C2.2356 15.0771 2.52965 15.1503 2.82825 15.1504H12.8859C13.1846 15.1504 13.4787 15.0773 13.7425 14.9375C14.0064 14.7977 14.232 14.5954 14.3997 14.3483C14.5658 14.1061 14.6699 13.8268 14.7031 13.535C14.7362 13.2432 14.6974 12.9477 14.5899 12.6744ZM5.28045 2.71501C5.38953 2.27569 5.61899 1.8755 5.94304 1.55945C6.13132 1.36068 6.34443 1.187 6.57709 1.04269C6.75609 0.915386 6.95187 0.813497 7.15884 0.739932C7.33396 0.681129 7.51642 0.646986 7.70095 0.638484C8.16775 0.588502 8.63837 0.687843 9.04515 0.922223C9.29961 1.05389 9.51499 1.25013 9.66969 1.49129C9.68885 1.52617 9.71615 1.55592 9.74926 1.57799C9.78238 1.60007 9.82034 1.61383 9.85991 1.6181C10.0144 1.65208 10.1497 1.74471 10.2372 1.87647C10.4337 2.13644 10.6271 2.69123 10.4353 3.84997C10.4147 3.94983 10.3941 4.03384 10.3703 4.1131L10.2578 3.04472C10.252 2.98317 10.2224 2.92632 10.1753 2.8862L9.39863 2.22679C9.36905 2.20177 9.3338 2.18436 9.29595 2.17607C9.2581 2.16778 9.2188 2.16887 9.18147 2.17923L5.79879 3.09861C5.75348 3.1111 5.71288 3.13673 5.68212 3.17228C5.65137 3.20783 5.63185 3.2517 5.62601 3.29834L5.5103 4.20187L5.36288 4.13846C5.33103 4.04532 5.30613 3.94995 5.28838 3.85314C5.19803 3.47945 5.19532 3.08992 5.28045 2.71501ZM5.64028 6.1928C5.63263 6.1423 5.60891 6.09561 5.57266 6.05964C5.5364 6.02366 5.48952 6.00032 5.43897 5.99307C5.41202 5.97246 5.28045 5.85199 5.12194 5.275C4.95075 4.66948 5.05378 4.53474 5.05854 4.52999L5.59907 4.763C5.63291 4.77754 5.66967 4.78401 5.70644 4.78191C5.74321 4.77981 5.77899 4.7692 5.81096 4.75091C5.84293 4.73262 5.87021 4.70715 5.89066 4.67651C5.9111 4.64588 5.92415 4.61091 5.92877 4.57437L6.06351 3.5155L9.1672 2.67063L9.7759 3.18738L9.92173 4.56803C9.92607 4.60949 9.94123 4.64909 9.9657 4.68284C9.99016 4.71659 10.0231 4.74332 10.0611 4.76034C10.0992 4.77736 10.141 4.78408 10.1825 4.77981C10.224 4.77555 10.2636 4.76046 10.2974 4.73606L10.6002 4.51889C10.6132 4.51817 10.6262 4.5221 10.6366 4.52999C10.6366 4.52999 10.7444 4.66948 10.5732 5.27342C10.4147 5.84882 10.2831 5.97088 10.2562 5.99148C10.2056 5.99874 10.1588 6.02208 10.1225 6.05805C10.0862 6.09402 10.0625 6.14071 10.0549 6.19121C9.93916 6.94573 9.3384 7.88255 8.41426 8.21701C8.04236 8.35099 7.63536 8.35099 7.26346 8.21701C6.36152 7.8984 5.76392 6.95683 5.64028 6.1928ZM9.76163 9.22674L8.96906 10.0669C8.95787 10.0416 8.94231 10.0185 8.92309 9.9987L8.01798 9.09359C7.9734 9.04906 7.91297 9.02405 7.84996 9.02405C7.78695 9.02405 7.72651 9.04906 7.68193 9.09359L6.77682 9.9987C6.7576 10.0185 6.74204 10.0416 6.73085 10.0669L5.93828 9.22674L6.07144 8.01253C6.36228 8.30536 6.71483 8.52956 7.10336 8.66878C7.57929 8.84002 8.10002 8.84002 8.57595 8.66878C8.96828 8.52268 9.32339 8.29153 9.6158 7.99192L9.76163 9.22674ZM2.83301 14.6733C2.61189 14.6731 2.39416 14.6189 2.19882 14.5153C2.00348 14.4117 1.83645 14.2618 1.71232 14.0788C1.58915 13.9013 1.51193 13.6961 1.48759 13.4814C1.46324 13.2667 1.49253 13.0493 1.57282 12.8488C2.5239 10.4552 5.03793 9.71338 5.62601 9.57072L7.05263 11.1035L6.11582 14.6733H2.83301ZM6.60721 14.6733L7.55829 11.0687C7.57238 11.0159 7.56791 10.96 7.54561 10.9102L7.2381 10.219L7.85947 9.59766L8.48084 10.219L8.17649 10.9102C8.1542 10.96 8.14972 11.0159 8.16381 11.0687L9.11489 14.6733H6.60721ZM14.0082 14.0788C13.8841 14.2618 13.717 14.4117 13.5217 14.5153C13.3264 14.6189 13.1086 14.6731 12.8875 14.6733H9.60312L8.65203 11.1035L10.0787 9.57072C10.6667 9.71338 13.1871 10.4552 14.1318 12.8488C14.2142 13.0482 14.2459 13.2649 14.224 13.4796C14.2021 13.6942 14.1275 13.9001 14.0066 14.0788H14.0082Z"
                stroke="#828282"
                strokeWidth="0.2"
                mask="url(#path-1-outside-1_1412_26652)"
              />
              <path
                d="M6.83571 5.48802C7.09619 5.48802 7.30735 5.27686 7.30735 5.01637C7.30735 4.75589 7.09619 4.54473 6.83571 4.54473C6.57523 4.54473 6.36406 4.75589 6.36406 5.01637C6.36406 5.27686 6.57523 5.48802 6.83571 5.48802Z"
                fill="#828282"
                stroke="#828282"
                strokeWidth="0.1"
              />
              <path
                d="M8.88454 5.48802C9.14502 5.48802 9.35618 5.27686 9.35618 5.01637C9.35618 4.75589 9.14502 4.54473 8.88454 4.54473C8.62405 4.54473 8.41289 4.75589 8.41289 5.01637C8.41289 5.27686 8.62405 5.48802 8.88454 5.48802Z"
                fill="#828282"
                stroke="#828282"
                strokeWidth="0.1"
              />
            </svg>
            <span className="input-title text-dimmed">
              Channel Partner Firm
            </span>
            <div className="input-field">{channelPartner}</div>
          </div>
        </div>

        <div
          className="form-input"
          hidden={leadSource === "channel_partner" ? false : true}
        >
          <div className="form-input-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="16"
              viewBox="0 0 15 16"
              fill="none"
            >
              <mask
                id="path-1-outside-1_1412_26656"
                maskUnits="userSpaceOnUse"
                x="0"
                y="-0.849609"
                width="15"
                height="17"
                fill="black"
              >
                <rect fill="white" y="-0.849609" width="15" height="17" />
                <path d="M14.5899 12.6744C13.566 10.0748 10.941 9.28381 10.2372 9.1142L10.0533 7.46724C10.2705 7.14333 10.4263 6.78227 10.513 6.40203C10.719 6.27522 10.8887 5.95503 11.044 5.4034C11.2025 4.82482 11.2025 4.45232 11.0171 4.22881C10.9735 4.17654 10.9195 4.1339 10.8585 4.10359C10.8712 4.05128 10.8839 3.99421 10.8966 3.93556C11.0773 2.84816 10.9758 2.05084 10.5938 1.56737C10.4499 1.37618 10.2481 1.23661 10.0184 1.1695C9.82348 0.89429 9.56738 0.66803 9.27024 0.508503C8.78418 0.227124 8.22156 0.106721 7.66291 0.164529C7.4406 0.175754 7.22087 0.217353 7.00984 0.288169C6.76086 0.373242 6.52503 0.49276 6.30921 0.643239C6.04917 0.807371 5.81107 1.00392 5.60065 1.22815C5.21773 1.60427 4.94713 2.07961 4.81918 2.60088C4.71728 3.04101 4.71728 3.4986 4.81918 3.93873C4.82975 3.99474 4.84137 4.04758 4.85405 4.09725C4.79333 4.12652 4.73935 4.16808 4.69554 4.2193C4.51008 4.44122 4.50215 4.81531 4.66542 5.39706C4.82393 5.94868 4.98245 6.26888 5.19327 6.39569C5.28136 6.78745 5.44154 7.15942 5.66564 7.49261L5.48177 9.1142C4.77321 9.28381 2.15298 10.0748 1.12423 12.676C1.01706 12.9491 0.97836 13.2443 1.01152 13.5358C1.04467 13.8273 1.14868 14.1063 1.31445 14.3483C1.48223 14.5953 1.70789 14.7975 1.97175 14.9373C2.2356 15.0771 2.52965 15.1503 2.82825 15.1504H12.8859C13.1846 15.1504 13.4787 15.0773 13.7425 14.9375C14.0064 14.7977 14.232 14.5954 14.3997 14.3483C14.5658 14.1061 14.6699 13.8268 14.7031 13.535C14.7362 13.2432 14.6974 12.9477 14.5899 12.6744ZM5.28045 2.71501C5.38953 2.27569 5.61899 1.8755 5.94304 1.55945C6.13132 1.36068 6.34443 1.187 6.57709 1.04269C6.75609 0.915386 6.95187 0.813497 7.15884 0.739932C7.33396 0.681129 7.51642 0.646986 7.70095 0.638484C8.16775 0.588502 8.63837 0.687843 9.04515 0.922223C9.29961 1.05389 9.51499 1.25013 9.66969 1.49129C9.68885 1.52617 9.71615 1.55592 9.74926 1.57799C9.78238 1.60007 9.82034 1.61383 9.85991 1.6181C10.0144 1.65208 10.1497 1.74471 10.2372 1.87647C10.4337 2.13644 10.6271 2.69123 10.4353 3.84997C10.4147 3.94983 10.3941 4.03384 10.3703 4.1131L10.2578 3.04472C10.252 2.98317 10.2224 2.92632 10.1753 2.8862L9.39863 2.22679C9.36905 2.20177 9.3338 2.18436 9.29595 2.17607C9.2581 2.16778 9.2188 2.16887 9.18147 2.17923L5.79879 3.09861C5.75348 3.1111 5.71288 3.13673 5.68212 3.17228C5.65137 3.20783 5.63185 3.2517 5.62601 3.29834L5.5103 4.20187L5.36288 4.13846C5.33103 4.04532 5.30613 3.94995 5.28838 3.85314C5.19803 3.47945 5.19532 3.08992 5.28045 2.71501ZM5.64028 6.1928C5.63263 6.1423 5.60891 6.09561 5.57266 6.05964C5.5364 6.02366 5.48952 6.00032 5.43897 5.99307C5.41202 5.97246 5.28045 5.85199 5.12194 5.275C4.95075 4.66948 5.05378 4.53474 5.05854 4.52999L5.59907 4.763C5.63291 4.77754 5.66967 4.78401 5.70644 4.78191C5.74321 4.77981 5.77899 4.7692 5.81096 4.75091C5.84293 4.73262 5.87021 4.70715 5.89066 4.67651C5.9111 4.64588 5.92415 4.61091 5.92877 4.57437L6.06351 3.5155L9.1672 2.67063L9.7759 3.18738L9.92173 4.56803C9.92607 4.60949 9.94123 4.64909 9.9657 4.68284C9.99016 4.71659 10.0231 4.74332 10.0611 4.76034C10.0992 4.77736 10.141 4.78408 10.1825 4.77981C10.224 4.77555 10.2636 4.76046 10.2974 4.73606L10.6002 4.51889C10.6132 4.51817 10.6262 4.5221 10.6366 4.52999C10.6366 4.52999 10.7444 4.66948 10.5732 5.27342C10.4147 5.84882 10.2831 5.97088 10.2562 5.99148C10.2056 5.99874 10.1588 6.02208 10.1225 6.05805C10.0862 6.09402 10.0625 6.14071 10.0549 6.19121C9.93916 6.94573 9.3384 7.88255 8.41426 8.21701C8.04236 8.35099 7.63536 8.35099 7.26346 8.21701C6.36152 7.8984 5.76392 6.95683 5.64028 6.1928ZM9.76163 9.22674L8.96906 10.0669C8.95787 10.0416 8.94231 10.0185 8.92309 9.9987L8.01798 9.09359C7.9734 9.04906 7.91297 9.02405 7.84996 9.02405C7.78695 9.02405 7.72651 9.04906 7.68193 9.09359L6.77682 9.9987C6.7576 10.0185 6.74204 10.0416 6.73085 10.0669L5.93828 9.22674L6.07144 8.01253C6.36228 8.30536 6.71483 8.52956 7.10336 8.66878C7.57929 8.84002 8.10002 8.84002 8.57595 8.66878C8.96828 8.52268 9.32339 8.29153 9.6158 7.99192L9.76163 9.22674ZM2.83301 14.6733C2.61189 14.6731 2.39416 14.6189 2.19882 14.5153C2.00348 14.4117 1.83645 14.2618 1.71232 14.0788C1.58915 13.9013 1.51193 13.6961 1.48759 13.4814C1.46324 13.2667 1.49253 13.0493 1.57282 12.8488C2.5239 10.4552 5.03793 9.71338 5.62601 9.57072L7.05263 11.1035L6.11582 14.6733H2.83301ZM6.60721 14.6733L7.55829 11.0687C7.57238 11.0159 7.56791 10.96 7.54561 10.9102L7.2381 10.219L7.85947 9.59766L8.48084 10.219L8.17649 10.9102C8.1542 10.96 8.14972 11.0159 8.16381 11.0687L9.11489 14.6733H6.60721ZM14.0082 14.0788C13.8841 14.2618 13.717 14.4117 13.5217 14.5153C13.3264 14.6189 13.1086 14.6731 12.8875 14.6733H9.60312L8.65203 11.1035L10.0787 9.57072C10.6667 9.71338 13.1871 10.4552 14.1318 12.8488C14.2142 13.0482 14.2459 13.2649 14.224 13.4796C14.2021 13.6942 14.1275 13.9001 14.0066 14.0788H14.0082Z" />
              </mask>
              <path
                d="M14.5899 12.6744C13.566 10.0748 10.941 9.28381 10.2372 9.1142L10.0533 7.46724C10.2705 7.14333 10.4263 6.78227 10.513 6.40203C10.719 6.27522 10.8887 5.95503 11.044 5.4034C11.2025 4.82482 11.2025 4.45232 11.0171 4.22881C10.9735 4.17654 10.9195 4.1339 10.8585 4.10359C10.8712 4.05128 10.8839 3.99421 10.8966 3.93556C11.0773 2.84816 10.9758 2.05084 10.5938 1.56737C10.4499 1.37618 10.2481 1.23661 10.0184 1.1695C9.82348 0.89429 9.56738 0.66803 9.27024 0.508503C8.78418 0.227124 8.22156 0.106721 7.66291 0.164529C7.4406 0.175754 7.22087 0.217353 7.00984 0.288169C6.76086 0.373242 6.52503 0.49276 6.30921 0.643239C6.04917 0.807371 5.81107 1.00392 5.60065 1.22815C5.21773 1.60427 4.94713 2.07961 4.81918 2.60088C4.71728 3.04101 4.71728 3.4986 4.81918 3.93873C4.82975 3.99474 4.84137 4.04758 4.85405 4.09725C4.79333 4.12652 4.73935 4.16808 4.69554 4.2193C4.51008 4.44122 4.50215 4.81531 4.66542 5.39706C4.82393 5.94868 4.98245 6.26888 5.19327 6.39569C5.28136 6.78745 5.44154 7.15942 5.66564 7.49261L5.48177 9.1142C4.77321 9.28381 2.15298 10.0748 1.12423 12.676C1.01706 12.9491 0.97836 13.2443 1.01152 13.5358C1.04467 13.8273 1.14868 14.1063 1.31445 14.3483C1.48223 14.5953 1.70789 14.7975 1.97175 14.9373C2.2356 15.0771 2.52965 15.1503 2.82825 15.1504H12.8859C13.1846 15.1504 13.4787 15.0773 13.7425 14.9375C14.0064 14.7977 14.232 14.5954 14.3997 14.3483C14.5658 14.1061 14.6699 13.8268 14.7031 13.535C14.7362 13.2432 14.6974 12.9477 14.5899 12.6744ZM5.28045 2.71501C5.38953 2.27569 5.61899 1.8755 5.94304 1.55945C6.13132 1.36068 6.34443 1.187 6.57709 1.04269C6.75609 0.915386 6.95187 0.813497 7.15884 0.739932C7.33396 0.681129 7.51642 0.646986 7.70095 0.638484C8.16775 0.588502 8.63837 0.687843 9.04515 0.922223C9.29961 1.05389 9.51499 1.25013 9.66969 1.49129C9.68885 1.52617 9.71615 1.55592 9.74926 1.57799C9.78238 1.60007 9.82034 1.61383 9.85991 1.6181C10.0144 1.65208 10.1497 1.74471 10.2372 1.87647C10.4337 2.13644 10.6271 2.69123 10.4353 3.84997C10.4147 3.94983 10.3941 4.03384 10.3703 4.1131L10.2578 3.04472C10.252 2.98317 10.2224 2.92632 10.1753 2.8862L9.39863 2.22679C9.36905 2.20177 9.3338 2.18436 9.29595 2.17607C9.2581 2.16778 9.2188 2.16887 9.18147 2.17923L5.79879 3.09861C5.75348 3.1111 5.71288 3.13673 5.68212 3.17228C5.65137 3.20783 5.63185 3.2517 5.62601 3.29834L5.5103 4.20187L5.36288 4.13846C5.33103 4.04532 5.30613 3.94995 5.28838 3.85314C5.19803 3.47945 5.19532 3.08992 5.28045 2.71501ZM5.64028 6.1928C5.63263 6.1423 5.60891 6.09561 5.57266 6.05964C5.5364 6.02366 5.48952 6.00032 5.43897 5.99307C5.41202 5.97246 5.28045 5.85199 5.12194 5.275C4.95075 4.66948 5.05378 4.53474 5.05854 4.52999L5.59907 4.763C5.63291 4.77754 5.66967 4.78401 5.70644 4.78191C5.74321 4.77981 5.77899 4.7692 5.81096 4.75091C5.84293 4.73262 5.87021 4.70715 5.89066 4.67651C5.9111 4.64588 5.92415 4.61091 5.92877 4.57437L6.06351 3.5155L9.1672 2.67063L9.7759 3.18738L9.92173 4.56803C9.92607 4.60949 9.94123 4.64909 9.9657 4.68284C9.99016 4.71659 10.0231 4.74332 10.0611 4.76034C10.0992 4.77736 10.141 4.78408 10.1825 4.77981C10.224 4.77555 10.2636 4.76046 10.2974 4.73606L10.6002 4.51889C10.6132 4.51817 10.6262 4.5221 10.6366 4.52999C10.6366 4.52999 10.7444 4.66948 10.5732 5.27342C10.4147 5.84882 10.2831 5.97088 10.2562 5.99148C10.2056 5.99874 10.1588 6.02208 10.1225 6.05805C10.0862 6.09402 10.0625 6.14071 10.0549 6.19121C9.93916 6.94573 9.3384 7.88255 8.41426 8.21701C8.04236 8.35099 7.63536 8.35099 7.26346 8.21701C6.36152 7.8984 5.76392 6.95683 5.64028 6.1928ZM9.76163 9.22674L8.96906 10.0669C8.95787 10.0416 8.94231 10.0185 8.92309 9.9987L8.01798 9.09359C7.9734 9.04906 7.91297 9.02405 7.84996 9.02405C7.78695 9.02405 7.72651 9.04906 7.68193 9.09359L6.77682 9.9987C6.7576 10.0185 6.74204 10.0416 6.73085 10.0669L5.93828 9.22674L6.07144 8.01253C6.36228 8.30536 6.71483 8.52956 7.10336 8.66878C7.57929 8.84002 8.10002 8.84002 8.57595 8.66878C8.96828 8.52268 9.32339 8.29153 9.6158 7.99192L9.76163 9.22674ZM2.83301 14.6733C2.61189 14.6731 2.39416 14.6189 2.19882 14.5153C2.00348 14.4117 1.83645 14.2618 1.71232 14.0788C1.58915 13.9013 1.51193 13.6961 1.48759 13.4814C1.46324 13.2667 1.49253 13.0493 1.57282 12.8488C2.5239 10.4552 5.03793 9.71338 5.62601 9.57072L7.05263 11.1035L6.11582 14.6733H2.83301ZM6.60721 14.6733L7.55829 11.0687C7.57238 11.0159 7.56791 10.96 7.54561 10.9102L7.2381 10.219L7.85947 9.59766L8.48084 10.219L8.17649 10.9102C8.1542 10.96 8.14972 11.0159 8.16381 11.0687L9.11489 14.6733H6.60721ZM14.0082 14.0788C13.8841 14.2618 13.717 14.4117 13.5217 14.5153C13.3264 14.6189 13.1086 14.6731 12.8875 14.6733H9.60312L8.65203 11.1035L10.0787 9.57072C10.6667 9.71338 13.1871 10.4552 14.1318 12.8488C14.2142 13.0482 14.2459 13.2649 14.224 13.4796C14.2021 13.6942 14.1275 13.9001 14.0066 14.0788H14.0082Z"
                fill="#828282"
              />
              <path
                d="M14.5899 12.6744C13.566 10.0748 10.941 9.28381 10.2372 9.1142L10.0533 7.46724C10.2705 7.14333 10.4263 6.78227 10.513 6.40203C10.719 6.27522 10.8887 5.95503 11.044 5.4034C11.2025 4.82482 11.2025 4.45232 11.0171 4.22881C10.9735 4.17654 10.9195 4.1339 10.8585 4.10359C10.8712 4.05128 10.8839 3.99421 10.8966 3.93556C11.0773 2.84816 10.9758 2.05084 10.5938 1.56737C10.4499 1.37618 10.2481 1.23661 10.0184 1.1695C9.82348 0.89429 9.56738 0.66803 9.27024 0.508503C8.78418 0.227124 8.22156 0.106721 7.66291 0.164529C7.4406 0.175754 7.22087 0.217353 7.00984 0.288169C6.76086 0.373242 6.52503 0.49276 6.30921 0.643239C6.04917 0.807371 5.81107 1.00392 5.60065 1.22815C5.21773 1.60427 4.94713 2.07961 4.81918 2.60088C4.71728 3.04101 4.71728 3.4986 4.81918 3.93873C4.82975 3.99474 4.84137 4.04758 4.85405 4.09725C4.79333 4.12652 4.73935 4.16808 4.69554 4.2193C4.51008 4.44122 4.50215 4.81531 4.66542 5.39706C4.82393 5.94868 4.98245 6.26888 5.19327 6.39569C5.28136 6.78745 5.44154 7.15942 5.66564 7.49261L5.48177 9.1142C4.77321 9.28381 2.15298 10.0748 1.12423 12.676C1.01706 12.9491 0.97836 13.2443 1.01152 13.5358C1.04467 13.8273 1.14868 14.1063 1.31445 14.3483C1.48223 14.5953 1.70789 14.7975 1.97175 14.9373C2.2356 15.0771 2.52965 15.1503 2.82825 15.1504H12.8859C13.1846 15.1504 13.4787 15.0773 13.7425 14.9375C14.0064 14.7977 14.232 14.5954 14.3997 14.3483C14.5658 14.1061 14.6699 13.8268 14.7031 13.535C14.7362 13.2432 14.6974 12.9477 14.5899 12.6744ZM5.28045 2.71501C5.38953 2.27569 5.61899 1.8755 5.94304 1.55945C6.13132 1.36068 6.34443 1.187 6.57709 1.04269C6.75609 0.915386 6.95187 0.813497 7.15884 0.739932C7.33396 0.681129 7.51642 0.646986 7.70095 0.638484C8.16775 0.588502 8.63837 0.687843 9.04515 0.922223C9.29961 1.05389 9.51499 1.25013 9.66969 1.49129C9.68885 1.52617 9.71615 1.55592 9.74926 1.57799C9.78238 1.60007 9.82034 1.61383 9.85991 1.6181C10.0144 1.65208 10.1497 1.74471 10.2372 1.87647C10.4337 2.13644 10.6271 2.69123 10.4353 3.84997C10.4147 3.94983 10.3941 4.03384 10.3703 4.1131L10.2578 3.04472C10.252 2.98317 10.2224 2.92632 10.1753 2.8862L9.39863 2.22679C9.36905 2.20177 9.3338 2.18436 9.29595 2.17607C9.2581 2.16778 9.2188 2.16887 9.18147 2.17923L5.79879 3.09861C5.75348 3.1111 5.71288 3.13673 5.68212 3.17228C5.65137 3.20783 5.63185 3.2517 5.62601 3.29834L5.5103 4.20187L5.36288 4.13846C5.33103 4.04532 5.30613 3.94995 5.28838 3.85314C5.19803 3.47945 5.19532 3.08992 5.28045 2.71501ZM5.64028 6.1928C5.63263 6.1423 5.60891 6.09561 5.57266 6.05964C5.5364 6.02366 5.48952 6.00032 5.43897 5.99307C5.41202 5.97246 5.28045 5.85199 5.12194 5.275C4.95075 4.66948 5.05378 4.53474 5.05854 4.52999L5.59907 4.763C5.63291 4.77754 5.66967 4.78401 5.70644 4.78191C5.74321 4.77981 5.77899 4.7692 5.81096 4.75091C5.84293 4.73262 5.87021 4.70715 5.89066 4.67651C5.9111 4.64588 5.92415 4.61091 5.92877 4.57437L6.06351 3.5155L9.1672 2.67063L9.7759 3.18738L9.92173 4.56803C9.92607 4.60949 9.94123 4.64909 9.9657 4.68284C9.99016 4.71659 10.0231 4.74332 10.0611 4.76034C10.0992 4.77736 10.141 4.78408 10.1825 4.77981C10.224 4.77555 10.2636 4.76046 10.2974 4.73606L10.6002 4.51889C10.6132 4.51817 10.6262 4.5221 10.6366 4.52999C10.6366 4.52999 10.7444 4.66948 10.5732 5.27342C10.4147 5.84882 10.2831 5.97088 10.2562 5.99148C10.2056 5.99874 10.1588 6.02208 10.1225 6.05805C10.0862 6.09402 10.0625 6.14071 10.0549 6.19121C9.93916 6.94573 9.3384 7.88255 8.41426 8.21701C8.04236 8.35099 7.63536 8.35099 7.26346 8.21701C6.36152 7.8984 5.76392 6.95683 5.64028 6.1928ZM9.76163 9.22674L8.96906 10.0669C8.95787 10.0416 8.94231 10.0185 8.92309 9.9987L8.01798 9.09359C7.9734 9.04906 7.91297 9.02405 7.84996 9.02405C7.78695 9.02405 7.72651 9.04906 7.68193 9.09359L6.77682 9.9987C6.7576 10.0185 6.74204 10.0416 6.73085 10.0669L5.93828 9.22674L6.07144 8.01253C6.36228 8.30536 6.71483 8.52956 7.10336 8.66878C7.57929 8.84002 8.10002 8.84002 8.57595 8.66878C8.96828 8.52268 9.32339 8.29153 9.6158 7.99192L9.76163 9.22674ZM2.83301 14.6733C2.61189 14.6731 2.39416 14.6189 2.19882 14.5153C2.00348 14.4117 1.83645 14.2618 1.71232 14.0788C1.58915 13.9013 1.51193 13.6961 1.48759 13.4814C1.46324 13.2667 1.49253 13.0493 1.57282 12.8488C2.5239 10.4552 5.03793 9.71338 5.62601 9.57072L7.05263 11.1035L6.11582 14.6733H2.83301ZM6.60721 14.6733L7.55829 11.0687C7.57238 11.0159 7.56791 10.96 7.54561 10.9102L7.2381 10.219L7.85947 9.59766L8.48084 10.219L8.17649 10.9102C8.1542 10.96 8.14972 11.0159 8.16381 11.0687L9.11489 14.6733H6.60721ZM14.0082 14.0788C13.8841 14.2618 13.717 14.4117 13.5217 14.5153C13.3264 14.6189 13.1086 14.6731 12.8875 14.6733H9.60312L8.65203 11.1035L10.0787 9.57072C10.6667 9.71338 13.1871 10.4552 14.1318 12.8488C14.2142 13.0482 14.2459 13.2649 14.224 13.4796C14.2021 13.6942 14.1275 13.9001 14.0066 14.0788H14.0082Z"
                stroke="#828282"
                strokeWidth="0.2"
                mask="url(#path-1-outside-1_1412_26656)"
              />
              <path
                d="M6.83571 5.48802C7.09619 5.48802 7.30735 5.27686 7.30735 5.01637C7.30735 4.75589 7.09619 4.54473 6.83571 4.54473C6.57523 4.54473 6.36406 4.75589 6.36406 5.01637C6.36406 5.27686 6.57523 5.48802 6.83571 5.48802Z"
                fill="#828282"
                stroke="#828282"
                strokeWidth="0.1"
              />
              <path
                d="M8.88454 5.48802C9.14502 5.48802 9.35618 5.27686 9.35618 5.01637C9.35618 4.75589 9.14502 4.54473 8.88454 4.54473C8.62405 4.54473 8.41289 4.75589 8.41289 5.01637C8.41289 5.27686 8.62405 5.48802 8.88454 5.48802Z"
                fill="#828282"
                stroke="#828282"
                strokeWidth="0.1"
              />
            </svg>
            <span className="input-title text-dimmed">
              Channel Partner Representative
            </span>
            <div className="input-field no-border">{channelPartnerRep}</div>
          </div>
        </div>
        <div className="confirm-page-footer">
          <div className="footer-btns">
            <Button className="btn-block btn edit-btn" onClick={editForm}>
              Edit
            </Button>
            <Button
              className="btn-block btn btn-primary continue-btn"
              onClick={nextPage}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmSecondPage = () => {
    return (
      <div className="confirm-details-page">
        <div className="form-input">
          <div className="form-input-header">
            <span className="font-heavy text-dark">
              Please confirm these details before proceeding to book a site
              visit.
            </span>
          </div>
        </div>
        <div className="form-input-row">
          <div className="form-input-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="17"
              viewBox="0 0 18 17"
              fill="none"
            >
              <path
                d="M12.9677 2.50033V2.65033H13.1177H13.8188C14.5143 2.65033 15.0709 3.19019 15.0709 3.83366V13.167C15.0709 13.8105 14.5143 14.3503 13.8188 14.3503H4.00371C3.30166 14.3503 2.75156 13.8109 2.75156 13.167L2.75857 3.83377V3.83366C2.75857 3.18876 3.30266 2.65033 4.00371 2.65033H4.70479H4.85479V2.50033V1.31699H5.95694V2.50033V2.65033H6.10694H11.7155H11.8655V2.50033V1.31699H12.9677V2.50033ZM13.8188 13.317H13.9688V13.167V5.83366V5.68366H13.8188H4.00371H3.85371V5.83366V13.167V13.317H4.00371H13.8188ZM5.55586 8.35033V7.31699H12.2666V8.35033H5.55586ZM5.55586 9.98366H10.1634V11.017H5.55586V9.98366Z"
                fill="#828282"
                stroke="#FCFCFC"
                strokeWidth="0.3"
              />
            </svg>
            <span className="input-title text-dimmed">Date</span>
            <div className="input-field">
              {bookDay?.weekDayName +
                ", " +
                bookDay?.monthLabel +
                " " +
                bookDay?.d}
            </div>
          </div>
        </div>

        <div className="form-input-row">
          <div className="form-input-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
            >
              <g clipPath="url(#clip0_1554_31538)">
                <path
                  d="M8.49398 1.46777C4.81398 1.46777 1.83398 4.45444 1.83398 8.13444C1.83398 11.8144 4.81398 14.8011 8.49398 14.8011C12.1807 14.8011 15.1673 11.8144 15.1673 8.13444C15.1673 4.45444 12.1807 1.46777 8.49398 1.46777ZM8.5 14.1348C5.55333 14.1348 2.5 11.0811 2.5 8.13444C2.5 5.18777 5.55333 2.13477 8.5 2.13477C11.4467 2.13477 14.5 5.1881 14.5 8.13477C14.5 11.0814 11.4467 14.1348 8.5 14.1348Z"
                  fill="#828282"
                />
                <path
                  d="M8.83398 4.80176H7.83398V8.80176L11.334 10.9018L11.834 10.0818L8.83398 8.30176V4.80176Z"
                  fill="#828282"
                />
              </g>
              <defs>
                <clipPath id="clip0_1554_31538">
                  <rect
                    width="16"
                    height="16"
                    fill="white"
                    transform="translate(0.5 0.134766)"
                  />
                </clipPath>
              </defs>
            </svg>
            {/* Timeeee excluded */}
            <span className="input-title text-dimmed">Time</span>
            <div className="input-field">{bookTime}</div>
          </div>
        </div>

        <div className="form-input-row">
          <div className="form-input-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="14"
              viewBox="0 0 15 14"
              fill="none"
            >
              <path
                d="M7.49195 1.8875C5.41156 1.8875 3.92556 4.07388 4.85041 6.08777C5.8958 8.36145 9.10265 8.35937 10.148 6.08777C11.0438 4.14247 9.69704 1.91451 7.49195 1.8875ZM2.64116 13.5365C2.43333 13.5219 2.31279 13.364 2.31279 13.1437H2.31071C2.31071 12.1481 2.58713 11.2191 3.06306 10.4273H0.442306C0.22824 10.4273 0.0931491 10.2714 0.0889924 10.0407C0.0474261 8.35106 1.18634 6.75907 2.76586 6.17506C0.182517 4.71608 1.2196 0.731952 4.16665 0.731952C4.88159 0.731952 5.55912 0.997976 6.08077 1.46975C6.98069 1.08527 8.01984 1.08527 8.91975 1.46975C10.7611 -0.19082 13.7123 1.12891 13.7123 3.63744C13.7123 4.70777 13.1304 5.66795 12.2347 6.17506C13.8495 6.77154 14.8887 8.27831 14.9115 10.074C14.9115 10.2693 14.7536 10.4273 14.5582 10.4273H11.9208C12.3905 11.2067 12.6898 12.2188 12.6898 13.1852C12.6898 13.3806 12.5319 13.5385 12.3365 13.5385L2.64116 13.5365ZM3.57433 9.72066C4.19782 8.99325 5.0146 8.44458 5.94153 8.14946C5.25984 7.82524 4.6987 7.29112 4.33083 6.63437C2.49984 6.55331 0.974355 7.925 0.810168 9.72066H3.57433ZM9.05277 8.15362C9.97554 8.44666 10.7882 8.99741 11.4096 9.72066H14.1904C14.0262 7.925 12.5007 6.55331 10.6697 6.63437C10.3018 7.29319 9.73653 7.82732 9.05277 8.15362ZM11.9562 12.8319C11.7005 9.00157 7.0555 7.18304 4.32668 9.94097C3.58472 10.6912 3.10047 11.7325 3.02773 12.8319H11.9562ZM11.0001 5.83006C12.8478 5.68873 13.6791 3.40259 12.3698 2.08078C11.6216 1.32427 10.4432 1.22451 9.58066 1.83969C10.8339 2.72298 11.42 4.31497 11.0001 5.83006ZM5.41987 1.83969C3.99207 0.819242 1.99481 1.84593 1.99481 3.63744C1.99481 4.78675 2.8677 5.74277 4.00038 5.83006C3.58056 4.31497 4.16665 2.72298 5.41987 1.83969Z"
                fill="#828282"
              />
              <path
                d="M8.48487 5.54366C8.69893 5.13215 9.32451 5.45429 9.11252 5.86579C8.43499 7.17929 6.5645 7.17929 5.88697 5.86579C5.67499 5.45429 6.30056 5.13215 6.51255 5.54366C6.92821 6.34796 8.0692 6.35004 8.48487 5.54366Z"
                fill="#828282"
              />
            </svg>
            <span className="input-title text-dimmed">Visitors</span>
            <div className="input-field">
              {adultVisitorCount + " Adults, " + childVisitorCount + " Kids"}
            </div>
          </div>
        </div>

        <div className="form-input-row">
          <div
            className={
              noteString?.trim().length
                ? "form-input-header"
                : "form-input-header no-border"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="13"
              viewBox="0 0 15 13"
              fill="none"
            >
              <path
                d="M6.59099 2.35307C6.40498 2.11801 6.29232 1.80977 6.29232 1.47344C6.29232 0.734988 6.83432 0.134766 7.49967 0.134766C8.16501 0.134766 8.70702 0.734988 8.70702 1.47344C8.70702 1.80977 8.59435 2.11801 8.40835 2.35307C11.5531 2.82985 14.0078 5.74374 14.1671 9.31624C14.2944 9.31698 14.4118 9.39829 14.4671 9.52543C14.5224 9.65331 14.5071 9.80484 14.4278 9.91646L12.9397 11.9951C12.8764 12.083 12.7797 12.1348 12.6784 12.1348H2.3216C2.2196 12.1348 2.12359 12.083 2.06026 11.9951L0.572241 9.91646C0.492907 9.80484 0.477573 9.65331 0.532907 9.52543C0.587575 9.39829 0.704909 9.31698 0.832245 9.31624C0.99158 5.74374 3.44628 2.82985 6.59099 2.35307ZM2.48227 11.3956H12.5177L13.4764 10.0562H1.52359L2.48227 11.3956ZM13.4997 9.31624C13.3257 5.81396 10.701 3.02426 7.49967 3.02426C4.29829 3.02426 1.67359 5.81396 1.49959 9.31624H13.4997ZM7.49767 8.49943C7.48233 8.49943 7.46633 8.49795 7.45167 8.49574C7.01566 8.42699 6.61499 8.26067 6.26165 8.00048C6.10698 7.88591 4.7663 6.85104 5.07763 5.56337C5.2123 5.00455 5.62431 4.55068 6.12765 4.4058C6.60565 4.26831 7.11366 4.41763 7.49767 4.78944C7.88367 4.41763 8.39301 4.26831 8.86902 4.4058C9.37169 4.54994 9.7837 5.00381 9.91837 5.56263C10.2304 6.8503 8.88835 7.88591 8.73435 7.99974C8.38034 8.26067 7.98034 8.42699 7.54433 8.49574C7.529 8.49795 7.51367 8.49943 7.49767 8.49943ZM6.47765 5.0962C6.41565 5.0962 6.35365 5.10434 6.29432 5.12134C5.98231 5.21078 5.78164 5.5035 5.72164 5.75408C5.56564 6.39718 6.24832 7.10163 6.63099 7.38474C6.88766 7.57471 7.17966 7.69889 7.49767 7.75581C7.81634 7.69889 8.10768 7.57471 8.36435 7.38474C8.74702 7.10163 9.43036 6.39718 9.27502 5.75482C9.21369 5.50424 9.01369 5.21078 8.70235 5.12134C8.37301 5.0282 7.99701 5.20043 7.76834 5.55228C7.70567 5.64838 7.605 5.7053 7.49767 5.7053C7.39033 5.7053 7.29033 5.64838 7.227 5.55155C7.04099 5.264 6.75566 5.0962 6.47765 5.0962ZM7.49967 0.873955C7.20166 0.873955 6.95899 1.14302 6.95899 1.47344C6.95899 1.80386 7.20166 2.07292 7.49967 2.07292C7.79767 2.07292 8.04034 1.80386 8.04034 1.47344C8.04034 1.14302 7.79767 0.873955 7.49967 0.873955Z"
                fill="#828282"
              />
            </svg>
            <span className="input-title text-dimmed">Food Preference</span>
            <div className="input-field">
              {foodPref === "veg" || foodPref === "jain" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <rect
                    x="1.00391"
                    y="1.08984"
                    width="14"
                    height="14"
                    rx="1.5"
                    stroke="#12A012"
                  />
                  <circle cx="8.00391" cy="8.08984" r="3.5" fill="#12A012" />
                </svg>
              ) : foodPref === "non-veg" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <rect
                    x="1.00391"
                    y="1.08984"
                    width="14"
                    height="14"
                    rx="1.5"
                    stroke="#D54C4C"
                  />
                  <circle cx="8.00391" cy="8.08984" r="3.5" fill="#D54C4C" />
                </svg>
              ) : foodPref === "vegan" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="margin-right-5"
                  width={15}
                  height={15}
                  viewBox="0 0 15 15"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.9416 3.16513C11.9286 3.11251 11.8876 3.07142 11.8349 3.05845C11.5984 3.0002 11.3502 2.9854 11.0971 3.01462C10.5003 3.08343 9.91381 3.37919 9.44561 3.84736C8.97744 4.31554 8.6817 4.90206 8.61287 5.49888C8.587 5.72327 8.59582 5.9438 8.63876 6.15578C8.63672 6.15792 8.63448 6.15978 8.63256 6.16208C7.99383 6.92092 7.56041 7.74481 7.27084 8.56072C7.24215 8.45621 7.2114 8.35314 7.17879 8.25153C6.9338 7.41024 6.59297 6.63154 6.16063 5.92866C5.43598 4.75059 4.4473 3.77251 3.22199 3.0215C3.15793 2.98223 3.07453 2.9981 3.02934 3.0581C2.98415 3.11811 2.99194 3.20263 3.04736 3.25334C4.53563 4.61549 5.58408 6.1986 6.16364 7.95868C6.40771 8.69993 6.7322 9.91021 6.7322 11.8542C6.7322 11.9348 6.79747 12 6.87798 12H7.50002C7.58053 12 7.6458 11.9348 7.6458 11.8542C7.6458 11.7485 7.64524 11.6403 7.64466 11.5298C7.63705 10.0796 7.62746 8.24395 8.88289 6.37681C8.99533 6.07086 9.72685 4.26142 11.7254 3.22811C11.7582 3.21114 11.7402 3.22404 11.6842 3.26409C11.3457 3.50635 9.61859 4.74241 9.35306 6.37511C9.35173 6.38329 9.35041 6.39139 9.3491 6.39943C9.39956 6.39711 9.45027 6.39301 9.50117 6.38714C10.098 6.31832 10.6845 6.02257 11.1527 5.55439C11.6208 5.08622 11.9166 4.49968 11.9854 3.90288C12.0146 3.64985 11.9999 3.40162 11.9416 3.16513Z"
                    fill="#12A012"
                  />
                  <rect
                    x="0.5"
                    y="0.5"
                    width={14}
                    height={14}
                    rx="1.5"
                    stroke="#12A012"
                  />
                </svg>
              ) : (
                <></>
              )}
              <div
                className={
                  foodPref === "veg" || foodPref === "jain"
                    ? "px-2 text-green"
                    : "px-2 text-red"
                }
              >
                {foodPref.charAt(0).toUpperCase() + foodPref.slice(1)}
              </div>
            </div>
          </div>
        </div>
        {noteString?.trim().length ? (
          <div className="form-input">
            <div className="form-input-header">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="13"
                viewBox="0 0 14 13"
                fill="none"
              >
                <path
                  d="M12.5681 4.22711C12.3878 4.06541 12.1606 3.95913 11.9159 3.9221C11.6713 3.88507 11.4207 3.91901 11.1966 4.01949V2.88637C11.4862 2.57709 11.6425 2.17504 11.634 1.76075C11.617 1.32105 11.4202 0.905074 11.0858 0.601392C10.7514 0.297711 10.3056 0.130317 9.84345 0.134856H2.92803C2.89406 0.135266 2.86037 0.140753 2.82819 0.151114C2.50867 0.170708 2.20239 0.279941 1.948 0.465037C1.71013 0.63873 1.51212 0.856941 1.36616 1.10623C1.22021 1.35553 1.12941 1.63062 1.09934 1.91458L0.502909 7.61397C0.495111 7.68953 0.50303 7.76581 0.526213 7.83845C0.549397 7.91109 0.587391 7.97867 0.638022 8.03733C0.688654 8.09599 0.750932 8.14457 0.821296 8.1803C0.891659 8.21603 0.96873 8.23821 1.0481 8.24557L2.28562 8.36063V10.1791C2.28597 10.4212 2.38712 10.6532 2.5669 10.8244C2.74667 10.9955 2.9904 11.0918 3.24464 11.0921H5.40308L5.2612 11.7587C5.24983 11.811 5.25273 11.8652 5.26961 11.9162C5.28649 11.9671 5.31679 12.0131 5.35763 12.0497C5.39846 12.0863 5.44847 12.1124 5.50288 12.1254C5.55729 12.1384 5.61429 12.1379 5.66845 12.124L8.02001 11.5249C8.07922 11.51 8.13289 11.4796 8.17502 11.4373L8.51396 11.0934H10.2362C10.4905 11.0931 10.7342 10.9968 10.914 10.8256C11.0938 10.6545 11.1949 10.4224 11.1953 10.1804V8.37439L13.1658 6.37329C13.3896 6.14601 13.5095 5.84356 13.4994 5.53223C13.4893 5.22091 13.35 4.92608 13.112 4.71237L12.5681 4.22711ZM11.7037 4.53352C11.7807 4.52947 11.8578 4.54059 11.9302 4.5662C12.0025 4.59181 12.0685 4.63135 12.1241 4.68236L12.6693 5.17138C12.7777 5.27215 12.8404 5.40938 12.8439 5.55364C12.8473 5.6979 12.7912 5.8377 12.6876 5.94305L12.5694 6.06812L11.1834 4.82494L11.3004 4.70612C11.3523 4.6534 11.4146 4.611 11.4839 4.58137C11.5531 4.55175 11.6278 4.53548 11.7037 4.53352ZM8.08701 10.6106C8.01078 10.4161 7.90355 10.2338 7.76909 10.0703L11.6708 6.1244L12.1241 6.52337L8.08701 10.6106ZM10.7328 5.28019L11.1926 5.69291L7.29089 9.63758C7.1101 9.51908 6.91112 9.42795 6.70103 9.36743L10.7328 5.28019ZM10.9759 1.77826C10.9776 1.91491 10.9508 2.05054 10.8971 2.17725C10.8433 2.30397 10.7636 2.41925 10.6627 2.51641C10.5617 2.61357 10.4415 2.69066 10.309 2.74322C10.1765 2.79578 10.0343 2.82276 9.89074 2.82258H4.05389L4.07622 2.80132C4.24332 2.62925 4.37051 2.42562 4.4495 2.20368C4.52849 1.98173 4.55752 1.74644 4.53471 1.51311C4.53471 1.46892 4.52902 1.42723 4.51763 1.38804C4.47711 1.16139 4.38076 0.947089 4.2365 0.762701H9.84213C10.1325 0.757534 10.4136 0.860546 10.6254 1.04978C10.8371 1.23902 10.9629 1.49952 10.9759 1.77576V1.77826ZM3.59277 2.38234C3.41995 2.5607 3.1881 2.67724 2.93592 2.71252V2.31606C2.93592 2.27828 2.94373 2.24087 2.95892 2.20597C2.9741 2.17107 2.99636 2.13936 3.02441 2.11265C3.05247 2.08594 3.08578 2.06475 3.12244 2.05029C3.1591 2.03584 3.19839 2.0284 3.23807 2.0284H3.81217C3.76385 2.15806 3.68932 2.27746 3.59277 2.37984V2.38234ZM1.1624 7.63523L1.75357 1.98337C1.77468 1.7847 1.83825 1.59223 1.94036 1.4178C2.04248 1.24337 2.18099 1.09066 2.34737 0.969064C2.48186 0.870849 2.64089 0.807667 2.80882 0.785737C2.97674 0.763807 3.14777 0.783885 3.30507 0.843996C3.43469 0.88956 3.5513 0.963415 3.64552 1.05963C3.73974 1.15585 3.80897 1.27176 3.84764 1.39805H3.24464C2.9904 1.39838 2.74667 1.49468 2.5669 1.66583C2.38712 1.83698 2.28597 2.06901 2.28562 2.31105V7.73278L1.1624 7.63523ZM3.24595 10.4743C3.16582 10.4743 3.08896 10.444 3.0323 10.39C2.97563 10.3361 2.9438 10.2629 2.9438 10.1866V3.44793H9.89074C10.1122 3.44788 10.3316 3.40755 10.5371 3.32911V4.56729L5.82872 9.33617C5.78693 9.37833 5.75828 9.43073 5.74596 9.4875L5.53576 10.4668L3.24595 10.4743ZM6.32531 9.93275C6.61419 9.97775 6.88252 10.1034 7.09629 10.2938C7.31006 10.4842 7.45964 10.7307 7.52605 11.0021L6.01002 11.3885L6.32531 9.93275ZM10.541 10.1829C10.541 10.2592 10.5092 10.3323 10.4525 10.3863C10.3959 10.4402 10.319 10.4705 10.2389 10.4705H9.1301L10.5397 9.0385L10.541 10.1829Z"
                  fill="#828282"
                />
              </svg>
              <span className="input-title text-dimmed">Special Notes</span>
              <div className="input-field no-border">
                {!noteString?.trim().length ? "None" : noteString}
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}

        <div className="confirm-page-footer">
          <div className="footer-btns">
            <Button className="btn-block btn edit-btn" onClick={editForm}>
              Edit
            </Button>
            <Button
              className="btn-block btn btn-primary continue-btn"
              onClick={createSiteVisit}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const ReraDisclaimer = () => {
    return (
      <div className="rera-page">
        <div className="text-heavy">RERA Information</div>
        <AutoCarousel scrollDelay={3000}>
          <AutoCarouselItem>
            <Slide number={1} totalSlides={2} QRImg={QRCode} />
          </AutoCarouselItem>
          <AutoCarouselItem>
            <Slide number={2} totalSlides={2} QRImg={QRCode2} />
          </AutoCarouselItem>
        </AutoCarousel>
        <span className="form-input">
          The Project “Birla Niyaara Phase – 1” is registered with MahaRERA
          under the Project Registration No. P51900031916 and project Birla
          Niyaara phase – 2 registered with MahaRERA under Project Registration
          No. P51900054455. Plans for the project are subject to further
          approvals /modifications from the concerned authority/ies and/or the
          Promoter. All intending purchasers are required to inspect all plans
          and approvals which are available at
          <Link
            to="https://maharera.mahaonline.gov.in"
            className="hyperlink"
            target="_blank"
          >
            {" "}
            https://maharera.mahaonline.gov.in
          </Link>{" "}
          or our sales office. Birla Niyaara Phase-1 is mortgaged with Catalyst
          Trusteeship Limited acting on behalf of ICICI Bank Ltd and HDFC Bank
          Ltd. No Objection Certificate (NOC) / permission of the mortgagee for
          sale of flats / property would be provided, if required. The Project
          Birla Niyaara is an integrated development spread across 14 acres
          being developed in phases and Birla Niyaara Phase-1 and Phase -2 are a
          part thereof.
        </span>
        <Button
          className="btn-block btn btn-green height-40 mt-4"
          onClick={() => onModalClosed()}
        >
          Close
        </Button>
      </div>
    );
  };

  const findLabelFromValue = (value) => {
    const foundOption = leadSourceOptions.find(
      (option) => option.value === value
    );
    return foundOption ? foundOption.label : "";
  };

  const backToTicket = () => {
    setCurrentPage(1);
    setNewUser(false);
  };
  return (
    <>
      {isLoading ? (
        <Loader theme={"birla"} />
      ) : (
        <div className="theme-birla">
          <LayoutPrimary
            appFooter={false}
            appHeader={"none"}
            fixedGap={45}
            hideProfileIcon={true}
            appThemeName={"niyaara-theme"}
          >
            <SectionContent
              sectionClass="hb-site-visit-registration"
              fluid={false}
            >
              <div className="valid-pages" hidden={wrongLink}>
                <div className="form-pages" hidden={newUser && inactiveLink}>
                  <Form onSubmit={submitForm}>
                    <div
                      className="first-page"
                      hidden={currentPage === 1 && newUser ? false : true}
                    >
                      <div className="header-text input-border">
                        <h5 className="text-dimmed mb-1">Hello,</h5>
                        <h3 className="user-name text-dark">{homebuyerName}</h3>
                        <span className="text-dimmed">Sales Manager </span>
                        <span className="text-highlight text-dark font-heavy">
                          {" "}
                          {salesManager}
                        </span>
                        <span className="text-dimmed">
                          , has invited you to visit Birla Niyaara - homes
                          designed to complement your fine tastes, creating a
                          haven that truly reflects your discerning preferences.
                        </span>
                      </div>
                      <div className="site-visit-form">
                        <div className="form-header">
                          <div className="developer-logo">
                            <BirlaSvg width={54} height={58} />
                          </div>
                          <div className="developer-info">
                            <h3>{devName}</h3>
                            <span>
                              {devName}
                              {" - "}
                              {devLocation}
                            </span>
                          </div>
                        </div>
                        <div className="form-data">
                          <div className="form-input">
                            <span className="input-title text-dark">Email</span>
                            <input
                              className="input-field"
                              type="email"
                              placeholder="Type Here"
                              value={email}
                              required={true}
                              onChange={handleEmailChange}
                            />
                            {/* {!isValidEmail && (
                  <span className="text-danger">Please enter a valid email address</span>
                )} */}
                          </div>

                          <div className="form-input">
                            <span className="input-title text-dark">
                              Lead Source
                            </span>
                            <select
                              className="input-field dropdown-input"
                              onChange={(e) => setLeadSource(e.target.value)}
                              required={true}
                              value={leadSource}
                            >
                              <option
                                value="DEFAULT"
                                className="option-values"
                                hidden
                              >
                                Direct Walk in
                              </option>
                              {leadSourceOptions.map((option) => (
                                <option
                                  key={option.id}
                                  value={option.value}
                                  className="option-values"
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {leadSource === "channel_partner" ? (
                            <>
                              <div className="form-input">
                                <span className="input-title text-dark">
                                  Channel Partner Firm
                                </span>
                                <input
                                  className="input-field"
                                  type="text"
                                  placeholder="Type Here"
                                  required={true}
                                  value={channelPartner}
                                  onChange={(e) =>
                                    setChannelPartner(e.target.value)
                                  }
                                />
                              </div>

                              <div className="form-input">
                                <span className="input-title text-dark">
                                  Channel Partner Representative
                                </span>
                                <input
                                  className="input-field"
                                  type="text"
                                  placeholder="Type Here"
                                  required={true}
                                  value={channelPartnerRep}
                                  onChange={(e) =>
                                    setChannelPartnerRep(e.target.value)
                                  }
                                />
                              </div>
                            </>
                          ) : (
                            <></>
                          )}

                          <div className="form-input mt-4">
                            <Button
                              type="submit"
                              // className={`btn-block btn confirm-btn mt-5 ${
                              //   !valid ? 'diasbled-btn' : 'btn-green'
                              // }`}
                              // onClick={submitForm}
                              // disabled={!valid}>
                              className="btn-block btn confirm-btn mt-5 btn-green"
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Form>
                  <Form onSubmit={submitForm2}>
                    <div
                      className="second-page"
                      hidden={currentPage === 2 && newUser ? false : true}
                    >
                      <div className="site-visit-form">
                        <div className="form-header">
                          <div className="developer-logo">
                            <BirlaSvg width={54} height={58} />
                          </div>
                          <div className="developer-info">
                            <h3>{devName}</h3>
                            <span>
                              {devName}
                              {" - "}
                              {devLocation}
                            </span>
                          </div>
                        </div>
                        <div className="form-data">
                          {/* <SiteVisitDatePicker /> */}
                          <>
                            <Col sm={12} className="advanced-filter">
                              <div className="adv-filter-accrodion ophs-calendar">
                                <div className="input-header split-divs form-input">
                                  <div className="input-title text-dark font-heavy">
                                    Pick a Date
                                  </div>
                                  {/* <div className="input-title highlight-text text-right">
                          {bookDay?.weekDayName +
                            ', ' +
                            bookDay?.monthLabel +
                            ' ' +
                            bookDay?.d +
                            ', ' +
                            bookDay?.year}
                        </div> */}
                                </div>
                                <Swiper
                                  slidesPerView="auto"
                                  spaceBetween={0}
                                  freeMode={true}
                                  modules={[FreeMode, Navigation]}
                                  navigation={true}
                                  className="calendar-slides slides-day"
                                  required={true}
                                >
                                  {calendarDays?.map((day, i) => {
                                    return (
                                      <SwiperSlide key={i}>
                                        <div key={i} className={`slide-item`}>
                                          <Button
                                            variant="calendar-item"
                                            className={`calendar-item calendar-day ${
                                              day?.d?.toString() ===
                                                bookDay?.d?.toString() &&
                                              day?.m?.toString() ===
                                                bookDay?.m?.toString()
                                                ? "calendar-current"
                                                : ""
                                            }`}
                                            onClick={() =>
                                              calendarDayHandler(day)
                                            }
                                          >
                                            <span className="item-subtitle">
                                              {day?.wd}
                                            </span>
                                            <span className="item-title">
                                              {day?.d}
                                            </span>
                                          </Button>
                                        </div>
                                      </SwiperSlide>
                                    );
                                  })}
                                </Swiper>
                              </div>
                            </Col>
                            <Col sm={12} className="advanced-filter">
                              <div className="adv-filter-accrodion ophs-calendar">
                                <div className="input-header input-title text-dimmed">
                                  <div className="text-dark font-heavy form-input">
                                    Select Time (in IST)
                                  </div>
                                </div>
                                <Swiper
                                  slidesPerView="auto"
                                  spaceBetween={0}
                                  navigation={true}
                                  freeMode={true}
                                  modules={[FreeMode, Navigation]}
                                  required={true}
                                  className="calendar-slides slides-day"
                                >
                                  {renderTimeSlots()?.map((timeDivs, i) => {
                                    return (
                                      <SwiperSlide key={i}>
                                        <div key={i} className={`slide-item`}>
                                          <Button
                                            variant="calendar-item"
                                            disabled={
                                              !availableTimeSlots.includes(
                                                timeDivs
                                              )
                                            }
                                            className={`calendar-item calender-time ${
                                              !availableTimeSlots.includes(
                                                timeDivs
                                              )
                                                ? "calendar-disabled"
                                                : ""
                                            } ${
                                              bookTime === timeDivs
                                                ? "calendar-current"
                                                : bookTime === "" &&
                                                  firstSelectedTime === timeDivs
                                                ? "calendar-current"
                                                : null
                                            }`}
                                            onClick={() =>
                                              handleBookTime(timeDivs)
                                            }
                                          >
                                            <span className="item-subtitle">
                                              {timeDivs}
                                            </span>
                                          </Button>
                                        </div>
                                      </SwiperSlide>
                                    );
                                  })}
                                </Swiper>
                              </div>
                            </Col>
                          </>
                          <div className="form-input">
                            <span className="input-header input-title text-dark font-heavy">
                              Select Visitor Details
                            </span>
                            <div className="visitor-selector-parent">
                              <div className="visitor-input me-4">
                                <div
                                  className="decrement-btn visitor-counter"
                                  onClick={() => {
                                    adultVisitorCount > 1
                                      ? setAdultVisitorCount(
                                          adultVisitorCount - 1
                                        )
                                      : null;
                                  }}
                                  disabled={adultVisitorCount === 1}
                                >
                                  <div className="counter-btn">-</div>
                                </div>
                                <div className="adult visitor-count">
                                  <div className="counter">
                                    {adultVisitorCount}
                                  </div>{" "}
                                  <div className="counter-type">Adults</div>
                                </div>
                                <div
                                  className="increment-btn visitor-counter"
                                  onClick={() => {
                                    adultVisitorCount < 10
                                      ? setAdultVisitorCount(
                                          adultVisitorCount + 1
                                        )
                                      : null;
                                  }}
                                  disabled={adultVisitorCount === 10}
                                >
                                  <div className="counter-btn">+</div>
                                </div>
                              </div>
                              <div className="visitor-input ms-4">
                                <div
                                  className="decrement-btn visitor-counter"
                                  onClick={() => {
                                    childVisitorCount > 0
                                      ? setChildVisitorCount(
                                          childVisitorCount - 1
                                        )
                                      : null;
                                  }}
                                  disabled={childVisitorCount === 0}
                                >
                                  <div className="counter-btn">-</div>
                                </div>
                                <div className="child visitor-count">
                                  <div className="counter">
                                    {childVisitorCount}
                                  </div>{" "}
                                  <div className="counter-type">Kids</div>
                                </div>
                                <div
                                  className="increment-btn visitor-counter"
                                  onClick={() => {
                                    childVisitorCount < 10
                                      ? setChildVisitorCount(
                                          childVisitorCount + 1
                                        )
                                      : null;
                                  }}
                                  disabled={childVisitorCount === 10}
                                >
                                  <div className="counter-btn">+</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="form-input">
                            <span className="input-header input-title text-dark font-heavy">
                              Food Preference
                            </span>
                            <div className="food-selector-parent">
                              <div
                                className="selector input"
                                onChange={(e) => setFoodPref(e.target.value)}
                              >
                                <div className="selector-item">
                                  <input
                                    type="radio"
                                    id="veg"
                                    name="selector"
                                    className="selector-item_radio"
                                    defaultChecked={
                                      foodPref === "veg" ? true : false
                                    }
                                    value={"veg"}
                                  />
                                  <label
                                    htmlFor="veg"
                                    className="selector-item_label label-green"
                                  >
                                    <svg
                                      className="margin-right-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                    >
                                      <rect
                                        x="1.00391"
                                        y="1.08984"
                                        width="14"
                                        height="14"
                                        rx="1.5"
                                        stroke="#12A012"
                                      />
                                      <circle
                                        cx="8.00391"
                                        cy="8.08984"
                                        r="3.5"
                                        fill="#12A012"
                                      />
                                    </svg>
                                    <span>Veg</span>
                                  </label>
                                </div>
                                <div className="selector-item">
                                  <input
                                    type="radio"
                                    id="jain"
                                    name="selector"
                                    className="selector-item_radio"
                                    defaultChecked={
                                      foodPref === "jain" ? true : false
                                    }
                                    value={"jain"}
                                  />
                                  <label
                                    htmlFor="jain"
                                    className="selector-item_label label-green"
                                  >
                                    <svg
                                      className="margin-right-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                    >
                                      <rect
                                        x="1.00391"
                                        y="1.08984"
                                        width="14"
                                        height="14"
                                        rx="1.5"
                                        stroke="#12A012"
                                      />
                                      <circle
                                        cx="8.00391"
                                        cy="8.08984"
                                        r="3.5"
                                        fill="#12A012"
                                      />
                                    </svg>
                                    <span>Jain</span>
                                  </label>
                                </div>
                                <div className="selector-item">
                                  <input
                                    type="radio"
                                    id="vegan"
                                    name="selector"
                                    className="selector-item_radio"
                                    defaultChecked={
                                      foodPref === "vegan" ? true : false
                                    }
                                    value={"vegan"}
                                  />
                                  <label
                                    htmlFor="vegan"
                                    className="selector-item_label label-green"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="margin-right-5"
                                      width={15}
                                      height={15}
                                      viewBox="0 0 15 15"
                                      fill="none"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M11.9416 3.16513C11.9286 3.11251 11.8876 3.07142 11.8349 3.05845C11.5984 3.0002 11.3502 2.9854 11.0971 3.01462C10.5003 3.08343 9.91381 3.37919 9.44561 3.84736C8.97744 4.31554 8.6817 4.90206 8.61287 5.49888C8.587 5.72327 8.59582 5.9438 8.63876 6.15578C8.63672 6.15792 8.63448 6.15978 8.63256 6.16208C7.99383 6.92092 7.56041 7.74481 7.27084 8.56072C7.24215 8.45621 7.2114 8.35314 7.17879 8.25153C6.9338 7.41024 6.59297 6.63154 6.16063 5.92866C5.43598 4.75059 4.4473 3.77251 3.22199 3.0215C3.15793 2.98223 3.07453 2.9981 3.02934 3.0581C2.98415 3.11811 2.99194 3.20263 3.04736 3.25334C4.53563 4.61549 5.58408 6.1986 6.16364 7.95868C6.40771 8.69993 6.7322 9.91021 6.7322 11.8542C6.7322 11.9348 6.79747 12 6.87798 12H7.50002C7.58053 12 7.6458 11.9348 7.6458 11.8542C7.6458 11.7485 7.64524 11.6403 7.64466 11.5298C7.63705 10.0796 7.62746 8.24395 8.88289 6.37681C8.99533 6.07086 9.72685 4.26142 11.7254 3.22811C11.7582 3.21114 11.7402 3.22404 11.6842 3.26409C11.3457 3.50635 9.61859 4.74241 9.35306 6.37511C9.35173 6.38329 9.35041 6.39139 9.3491 6.39943C9.39956 6.39711 9.45027 6.39301 9.50117 6.38714C10.098 6.31832 10.6845 6.02257 11.1527 5.55439C11.6208 5.08622 11.9166 4.49968 11.9854 3.90288C12.0146 3.64985 11.9999 3.40162 11.9416 3.16513Z"
                                        fill="#12A012"
                                      />
                                      <rect
                                        x="0.5"
                                        y="0.5"
                                        width={14}
                                        height={14}
                                        rx="1.5"
                                        stroke="#12A012"
                                      />
                                    </svg>
                                    <span>Vegan</span>
                                  </label>
                                </div>
                                <div className="selector-item">
                                  <input
                                    type="radio"
                                    id="non-veg"
                                    name="selector"
                                    className="selector-item_radio"
                                    defaultChecked={
                                      foodPref === "non-veg" ? true : false
                                    }
                                    value={"non-veg"}
                                  />
                                  <label
                                    htmlFor="non-veg"
                                    className="selector-item_label label-red"
                                  >
                                    <svg
                                      className="margin-right-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                    >
                                      <rect
                                        x="1.00391"
                                        y="1.08984"
                                        width="14"
                                        height="14"
                                        rx="1.5"
                                        stroke="#D54C4C"
                                      />
                                      <circle
                                        cx="8.00391"
                                        cy="8.08984"
                                        r="3.5"
                                        fill="#D54C4C"
                                      />
                                    </svg>
                                    <span className="text-start">Non-veg</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="form-input">
                            <span className="input-title text-dark font-heavy">
                              Notes
                            </span>
                            <input
                              className="input-field"
                              type="text"
                              maxLength={150}
                              placeholder="Please include any special requests here"
                              value={noteString ? noteString : ""}
                              onChange={(e) => setNoteString(e.target.value)}
                            />
                          </div>

                          <div className="form-input">
                            <Button
                              type="submit"
                              // className={`btn-block btn confirm-btn mt-5 ${
                              //   !valid2 ? 'diasbled-btn' : 'btn-green'
                              // }`}
                              onClick={submitForm2}
                              // disabled={!valid2}>
                              className="btn-block btn confirm-btn mt-5 btn-green"
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Form>
                  <div
                    className="error-message"
                    hidden={currentPage === 3 && newUser ? false : true}
                  >
                    <div className="welcome-page">
                      <BirlaSvg width={196} height={196} hasBorder={true} />
                      <div className="input-header input-border">
                        <div className="developer-welcome text-dimmed">
                          <span>We&apos;re all set to welcome you!</span>
                        </div>
                        <h4 className="text-dark text-middle">
                          {bookDay?.weekDayName +
                            ", " +
                            bookDay?.monthLabel +
                            " " +
                            bookDay?.d}
                          {" at "}
                          {bookTime}
                        </h4>
                      </div>
                      <div
                        className={`btn-block btn home-btn btn-green`}
                        onClick={backToTicket}
                      >
                        Home
                      </div>
                      <span className="thanks-text text-dimmed mt-4">
                        Use the same link to reschedule the visit if required
                      </span>
                    </div>
                    {/* Debug */}
                    {/* <div className={`btn-block btn home-btn btn-green`} onClick={() => setNewUser(false)}>
                    Show Edit Page
                  </div> */}
                  </div>
                  <div className="user-data" hidden={newUser}>
                    <div className="site-visit-form no-border">
                      <div className="form-header ticket-page">
                        <div className="developer-logo">
                          <BirlaSvg width={84} height={88} />
                        </div>
                        <div className="developer-info">
                          <h3>{devName}</h3>
                          <span className="developer-location">
                            {devName}
                            {" - "}
                            {devLocation}
                          </span>
                          <div className="input-title-small">
                            Source:{" "}
                            {leadSource === "channel_partner"
                              ? findLabelFromValue(leadSource) +
                                ", " +
                                channelPartnerRep
                              : findLabelFromValue(leadSource)}
                          </div>
                          <div className="input-title-small">
                            Manager: {salesManager}
                          </div>
                        </div>
                      </div>
                      <div className="divider">
                        <div className="divider-circle divider-left">
                          <div className="divider-circle divider-left-white" />
                        </div>
                        <div className="divider-circle divider-right">
                          <div className="divider-circle divider-right-white" />
                        </div>
                      </div>
                      <div className="ticket-edit-page">
                        <div className="form-input">
                          <div className="form-input-header split-divs">
                            <div className="d-flex align-items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="17"
                                viewBox="0 0 18 17"
                                fill="none"
                              >
                                <path
                                  d="M12.9501 2.42977V2.57977H13.1001H13.8012C14.4967 2.57977 15.0533 3.11964 15.0533 3.7631V13.0964C15.0533 13.7399 14.4967 14.2798 13.8012 14.2798H3.98613C3.28408 14.2798 2.73398 13.7404 2.73398 13.0964L2.741 3.76321V3.7631C2.741 3.1182 3.28508 2.57977 3.98613 2.57977H4.68721H4.83721V2.42977V1.24644H5.93936V2.42977V2.57977H6.08936H11.698H11.848V2.42977V1.24644H12.9501V2.42977ZM13.8012 13.2464H13.9512V13.0964V5.7631V5.6131H13.8012H3.98613H3.83613V5.7631V13.0964V13.2464H3.98613H13.8012ZM5.53829 8.27977V7.24644H12.249V8.27977H5.53829ZM5.53829 9.9131H10.1458V10.9464H5.53829V9.9131Z"
                                  fill="#382F06"
                                  stroke="#FFFDF7"
                                  strokeWidth="0.3"
                                />
                              </svg>
                              <span className="input-title text-dimmed">
                                Date
                              </span>
                            </div>
                            <div className="input-field">
                              {bookDay?.weekDayName +
                                ", " +
                                bookDay?.monthLabel +
                                " " +
                                bookDay?.d}
                            </div>
                          </div>
                        </div>

                        <div className="form-input">
                          <div className="form-input-header split-divs">
                            <div className="d-flex align-items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <g clipPath="url(#clip0_1472_25120)">
                                  <path
                                    d="M7.99594 1.33203C4.31594 1.33203 1.33594 4.3187 1.33594 7.9987C1.33594 11.6787 4.31594 14.6654 7.99594 14.6654C11.6826 14.6654 14.6693 11.6787 14.6693 7.9987C14.6693 4.3187 11.6826 1.33203 7.99594 1.33203ZM8.00195 13.999C5.05529 13.999 2.00195 10.9454 2.00195 7.9987C2.00195 5.05203 5.05529 1.99902 8.00195 1.99902C10.9486 1.99902 14.002 5.05236 14.002 7.99902C14.002 10.9457 10.9486 13.999 8.00195 13.999Z"
                                    fill="#414141"
                                  />
                                  <path
                                    d="M8.33594 4.66406H7.33594V8.66406L10.8359 10.7641L11.3359 9.94406L8.33594 8.16406V4.66406Z"
                                    fill="#414141"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_1472_25120">
                                    <rect width="16" height="16" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                              {/* time ticket */}
                              <span className="input-title text-dimmed">
                                Time
                              </span>
                            </div>
                            <div className="input-field">{apiBookTime}</div>
                          </div>
                        </div>
                        <div className="form-input">
                          <div className="form-input-header split-divs">
                            <div className="d-flex align-items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="14"
                                viewBox="0 0 16 14"
                                fill="none"
                              >
                                <path
                                  d="M7.99195 1.75297C5.91156 1.75297 4.42556 3.93936 5.35041 5.95325C6.3958 8.22693 9.60265 8.22485 10.648 5.95325C11.5438 4.00795 10.197 1.77999 7.99195 1.75297ZM3.14116 13.4019C2.93333 13.3874 2.81279 13.2294 2.81279 13.0091H2.81071C2.81071 12.0136 3.08713 11.0846 3.56306 10.2928H0.942306C0.72824 10.2928 0.593149 10.1369 0.588992 9.9062C0.547426 8.21653 1.68634 6.62455 3.26586 6.04054C0.682517 4.58156 1.7196 0.597431 4.66665 0.597431C5.38159 0.597431 6.05912 0.863455 6.58077 1.33523C7.48069 0.950744 8.51984 0.950744 9.41975 1.33523C11.2611 -0.325341 14.2123 0.994389 14.2123 3.50292C14.2123 4.57325 13.6304 5.53343 12.7347 6.04054C14.3495 6.63701 15.3887 8.14379 15.4115 9.93946C15.4115 10.1348 15.2536 10.2928 15.0582 10.2928H12.4208C12.8905 11.0721 13.1898 12.0843 13.1898 13.0507C13.1898 13.2461 13.0319 13.404 12.8365 13.404L3.14116 13.4019ZM4.07433 9.58614C4.69782 8.85873 5.5146 8.31006 6.44153 8.01494C5.75984 7.69072 5.1987 7.15659 4.83083 6.49985C2.99984 6.41879 1.47435 7.79048 1.31017 9.58614H4.07433ZM9.55277 8.01909C10.4755 8.31214 11.2882 8.86289 11.9096 9.58614H14.6904C14.5262 7.79048 13.0007 6.41879 11.1697 6.49985C10.8018 7.15867 10.2365 7.6928 9.55277 8.01909ZM12.4562 12.6974C12.2005 8.86705 7.5555 7.04852 4.82668 9.80645C4.08472 10.5567 3.60047 11.598 3.52773 12.6974H12.4562ZM11.5001 5.69554C13.3478 5.55421 14.1791 3.26807 12.8698 1.94626C12.1216 1.18975 10.9432 1.08999 10.0807 1.70517C11.3339 2.58846 11.92 4.18045 11.5001 5.69554ZM5.91987 1.70517C4.49207 0.68472 2.49481 1.71141 2.49481 3.50292C2.49481 4.65222 3.3677 5.60825 4.50038 5.69554C4.08056 4.18045 4.66665 2.58846 5.91987 1.70517Z"
                                  fill="#414141"
                                />
                                <path
                                  d="M8.98487 5.40865C9.19893 4.99714 9.82451 5.31928 9.61252 5.73078C8.93499 7.04428 7.0645 7.04428 6.38697 5.73078C6.17499 5.31928 6.80056 4.99714 7.01255 5.40865C7.42821 6.21295 8.5692 6.21503 8.98487 5.40865Z"
                                  fill="#414141"
                                />
                              </svg>
                              <span className="input-title text-dimmed">
                                Visitors
                              </span>
                            </div>
                            <div className="input-field">
                              {adultVisitorCount +
                                " Adults, " +
                                childVisitorCount +
                                " Kids"}
                            </div>
                          </div>
                        </div>
                        <div
                          className={
                            noteString?.trim().length
                              ? "form-input"
                              : "form-input no-border"
                          }
                        >
                          <div className="form-input-header split-divs">
                            <div className="d-flex align-items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="12"
                                viewBox="0 0 14 12"
                                fill="none"
                              >
                                <path
                                  d="M6.09099 2.21831C5.90498 1.98324 5.79232 1.675 5.79232 1.33867C5.79232 0.600222 6.33432 0 6.99967 0C7.66501 0 8.20702 0.600222 8.20702 1.33867C8.20702 1.675 8.09435 1.98324 7.90835 2.21831C11.0531 2.69508 13.5078 5.60897 13.6671 9.18147C13.7944 9.18221 13.9118 9.26352 13.9671 9.39066C14.0224 9.51854 14.0071 9.67007 13.9278 9.78169L12.4397 11.8603C12.3764 11.9483 12.2797 12 12.1784 12H1.8216C1.7196 12 1.62359 11.9483 1.56026 11.8603L0.0722412 9.78169C-0.00709323 9.67007 -0.0224268 9.51854 0.0329073 9.39066C0.0875747 9.26352 0.204909 9.18221 0.332245 9.18147C0.49158 5.60897 2.94628 2.69508 6.09099 2.21831ZM1.98227 11.2608H12.0177L12.9764 9.9214H1.02359L1.98227 11.2608ZM12.9997 9.18147C12.8257 5.67919 10.201 2.88949 6.99967 2.88949C3.79829 2.88949 1.17359 5.67919 0.999587 9.18147H12.9997ZM6.99767 8.36467C6.98233 8.36467 6.96633 8.36319 6.95167 8.36097C6.51566 8.29223 6.11499 8.12591 5.76165 7.86571C5.60698 7.75114 4.2663 6.71627 4.57763 5.42861C4.7123 4.86978 5.12431 4.41592 5.62765 4.27104C6.10565 4.13355 6.61366 4.28286 6.99767 4.65468C7.38367 4.28286 7.89301 4.13355 8.36902 4.27104C8.87169 4.41518 9.2837 4.86904 9.41837 5.42787C9.73037 6.71554 8.38835 7.75114 8.23435 7.86498C7.88034 8.12591 7.48034 8.29223 7.04433 8.36097C7.029 8.36319 7.01367 8.36467 6.99767 8.36467ZM5.97765 4.96144C5.91565 4.96144 5.85365 4.96957 5.79432 4.98657C5.48231 5.07601 5.28164 5.36873 5.22164 5.61932C5.06564 6.26241 5.74832 6.96686 6.13099 7.24997C6.38766 7.43994 6.67966 7.56413 6.99767 7.62104C7.31634 7.56413 7.60768 7.43994 7.86435 7.24997C8.24702 6.96686 8.93036 6.26241 8.77502 5.62006C8.71369 5.36947 8.51369 5.07601 8.20235 4.98657C7.87301 4.89343 7.49701 5.06566 7.26834 5.41752C7.20567 5.51361 7.105 5.57053 6.99767 5.57053C6.89033 5.57053 6.79033 5.51361 6.727 5.41678C6.54099 5.12924 6.25566 4.96144 5.97765 4.96144ZM6.99967 0.73919C6.70166 0.73919 6.45899 1.00825 6.45899 1.33867C6.45899 1.66909 6.70166 1.93815 6.99967 1.93815C7.29767 1.93815 7.54034 1.66909 7.54034 1.33867C7.54034 1.00825 7.29767 0.73919 6.99967 0.73919Z"
                                  fill="#414141"
                                />
                              </svg>
                              <span className="input-title text-dimmed">
                                Food Preference
                              </span>
                            </div>
                            <div className="input-field">
                              {foodPref === "veg" || foodPref === "jain" ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="15"
                                  height="15"
                                  viewBox="0 0 15 15"
                                  fill="none"
                                >
                                  <rect
                                    x="0.5"
                                    y="0.5"
                                    width="14"
                                    height="14"
                                    rx="1.5"
                                    stroke="#449944"
                                  />
                                  <circle
                                    cx="7.5"
                                    cy="7.5"
                                    r="3.5"
                                    fill="#449944"
                                  />
                                </svg>
                              ) : foodPref === "non-veg" ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="15"
                                  height="16"
                                  viewBox="0 0 15 16"
                                  fill="none"
                                >
                                  <rect
                                    x="0.5"
                                    y="1.07666"
                                    width="14"
                                    height="14"
                                    rx="1.5"
                                    stroke="#D87373"
                                  />
                                  <circle
                                    cx="7.5"
                                    cy="8.07666"
                                    r="3.5"
                                    fill="#D87373"
                                  />
                                </svg>
                              ) : foodPref === "vegan" ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="margin-right-5"
                                  width={15}
                                  height={15}
                                  viewBox="0 0 15 15"
                                  fill="none"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M11.9416 3.16513C11.9286 3.11251 11.8876 3.07142 11.8349 3.05845C11.5984 3.0002 11.3502 2.9854 11.0971 3.01462C10.5003 3.08343 9.91381 3.37919 9.44561 3.84736C8.97744 4.31554 8.6817 4.90206 8.61287 5.49888C8.587 5.72327 8.59582 5.9438 8.63876 6.15578C8.63672 6.15792 8.63448 6.15978 8.63256 6.16208C7.99383 6.92092 7.56041 7.74481 7.27084 8.56072C7.24215 8.45621 7.2114 8.35314 7.17879 8.25153C6.9338 7.41024 6.59297 6.63154 6.16063 5.92866C5.43598 4.75059 4.4473 3.77251 3.22199 3.0215C3.15793 2.98223 3.07453 2.9981 3.02934 3.0581C2.98415 3.11811 2.99194 3.20263 3.04736 3.25334C4.53563 4.61549 5.58408 6.1986 6.16364 7.95868C6.40771 8.69993 6.7322 9.91021 6.7322 11.8542C6.7322 11.9348 6.79747 12 6.87798 12H7.50002C7.58053 12 7.6458 11.9348 7.6458 11.8542C7.6458 11.7485 7.64524 11.6403 7.64466 11.5298C7.63705 10.0796 7.62746 8.24395 8.88289 6.37681C8.99533 6.07086 9.72685 4.26142 11.7254 3.22811C11.7582 3.21114 11.7402 3.22404 11.6842 3.26409C11.3457 3.50635 9.61859 4.74241 9.35306 6.37511C9.35173 6.38329 9.35041 6.39139 9.3491 6.39943C9.39956 6.39711 9.45027 6.39301 9.50117 6.38714C10.098 6.31832 10.6845 6.02257 11.1527 5.55439C11.6208 5.08622 11.9166 4.49968 11.9854 3.90288C12.0146 3.64985 11.9999 3.40162 11.9416 3.16513Z"
                                    fill="#12A012"
                                  />
                                  <rect
                                    x="0.5"
                                    y="0.5"
                                    width={14}
                                    height={14}
                                    rx="1.5"
                                    stroke="#12A012"
                                  />
                                </svg>
                              ) : (
                                <></>
                              )}
                              <div
                                className={
                                  foodPref === "veg" ||
                                  foodPref === "jain" ||
                                  foodPref === "vegan"
                                    ? "px-2 text-green"
                                    : "px-2 text-red"
                                }
                              >
                                {foodPref.charAt(0).toUpperCase() +
                                  foodPref.slice(1)}
                              </div>
                            </div>
                          </div>
                        </div>
                        {noteString?.trim().length ? (
                          <div className="form-input no-border">
                            <div className="form-input-header divs-below">
                              <div className="d-flex align-items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="13"
                                  height="12"
                                  viewBox="0 0 13 12"
                                  fill="none"
                                >
                                  <path
                                    d="M12.0681 4.09234C11.8878 3.93065 11.6606 3.82437 11.4159 3.78734C11.1713 3.75031 10.9207 3.78424 10.6966 3.88473V2.7516C10.9862 2.44232 11.1425 2.04028 11.134 1.62598C11.117 1.18629 10.9202 0.770308 10.5858 0.466627C10.2514 0.162945 9.8056 -0.00444814 9.34345 8.99171e-05H2.42803C2.39406 0.000500386 2.36037 0.00598688 2.32819 0.0163489C2.00867 0.035942 1.70239 0.145175 1.448 0.330272C1.21013 0.503965 1.01212 0.722176 0.866164 0.971468C0.720212 1.22076 0.629405 1.49586 0.599337 1.77982L0.00290865 7.4792C-0.00488933 7.55476 0.00302979 7.63104 0.0262134 7.70368C0.049397 7.77633 0.0873905 7.84391 0.138022 7.90256C0.188654 7.96122 0.250932 8.0098 0.321296 8.04553C0.391659 8.08126 0.46873 8.10344 0.548102 8.1108L1.78562 8.22587V10.0444C1.78597 10.2864 1.88712 10.5184 2.0669 10.6896C2.24667 10.8607 2.4904 10.957 2.74464 10.9574H4.90308L4.7612 11.624C4.74983 11.6763 4.75273 11.7305 4.76961 11.7814C4.78649 11.8323 4.81679 11.8783 4.85763 11.9149C4.89846 11.9515 4.94847 11.9776 5.00288 11.9906C5.05729 12.0036 5.11429 12.0031 5.16845 11.9892L7.52001 11.3901C7.57922 11.3752 7.63289 11.3449 7.67502 11.3026L8.01396 10.9586H9.73625C9.99049 10.9583 10.2342 10.862 10.414 10.6908C10.5938 10.5197 10.6949 10.2877 10.6953 10.0456V8.23962L12.6658 6.23852C12.8896 6.01124 13.0095 5.7088 12.9994 5.39747C12.9893 5.08614 12.85 4.79132 12.612 4.57761L12.0681 4.09234ZM11.2037 4.39876C11.2807 4.3947 11.3578 4.40583 11.4302 4.43144C11.5025 4.45704 11.5685 4.49659 11.6241 4.54759L12.1693 5.03661C12.2777 5.13738 12.3404 5.27461 12.3439 5.41887C12.3473 5.56313 12.2912 5.70293 12.1876 5.80829L12.0694 5.93335L10.6834 4.69017L10.8004 4.57135C10.8523 4.51863 10.9146 4.47623 10.9839 4.44661C11.0531 4.41698 11.1278 4.40072 11.2037 4.39876ZM7.58701 10.4759C7.51078 10.2813 7.40355 10.0991 7.26909 9.93556L11.1708 5.98963L11.6241 6.3886L7.58701 10.4759ZM10.2328 5.14542L10.6926 5.55815L6.79089 9.50282C6.6101 9.38431 6.41112 9.29318 6.20103 9.23267L10.2328 5.14542ZM10.4759 1.64349C10.4776 1.78015 10.4508 1.91577 10.3971 2.04249C10.3433 2.1692 10.2636 2.28448 10.1627 2.38164C10.0617 2.4788 9.94147 2.5559 9.80896 2.60846C9.67645 2.66102 9.53429 2.68799 9.39074 2.68782H3.55389L3.57622 2.66656C3.74332 2.49449 3.87051 2.29086 3.9495 2.06891C4.02849 1.84697 4.05752 1.61168 4.03471 1.37835C4.03471 1.33416 4.02902 1.29247 4.01763 1.25328C3.97711 1.02662 3.88076 0.812324 3.7365 0.627935H9.34213C9.63253 0.622768 9.91357 0.725781 10.1254 0.915018C10.3371 1.10425 10.4629 1.36475 10.4759 1.64099V1.64349ZM3.09277 2.24758C2.91995 2.42594 2.6881 2.54248 2.43592 2.57776V2.18129C2.43592 2.14351 2.44373 2.10611 2.45892 2.07121C2.4741 2.03631 2.49636 2.0046 2.52441 1.97788C2.55247 1.95117 2.58578 1.92998 2.62244 1.91553C2.6591 1.90107 2.69839 1.89363 2.73807 1.89363H3.31217C3.26385 2.0233 3.18932 2.1427 3.09277 2.24507V2.24758ZM0.662395 7.50047L1.25357 1.84861C1.27468 1.64993 1.33825 1.45746 1.44036 1.28303C1.54248 1.1086 1.68099 0.955896 1.84737 0.834299C1.98186 0.736083 2.14089 0.672901 2.30882 0.650971C2.47674 0.629042 2.64777 0.64912 2.80507 0.70923C2.93469 0.754795 3.0513 0.828649 3.14552 0.924869C3.23974 1.02109 3.30897 1.13699 3.34764 1.26328H2.74464C2.4904 1.26362 2.24667 1.35991 2.0669 1.53106C1.88712 1.70221 1.78597 1.93425 1.78562 2.17629V7.59802L0.662395 7.50047ZM2.74595 10.3395C2.66582 10.3395 2.58896 10.3092 2.5323 10.2553C2.47563 10.2013 2.4438 10.1282 2.4438 10.0519V3.31316H9.39074C9.61217 3.31312 9.83156 3.27279 10.0371 3.19435V4.43253L5.32872 9.2014C5.28693 9.24357 5.25828 9.29596 5.24596 9.35273L5.03576 10.332L2.74595 10.3395ZM5.82531 9.79798C6.11419 9.84298 6.38252 9.96863 6.59629 10.159C6.81006 10.3494 6.95964 10.5959 7.02605 10.8673L5.51002 11.2538L5.82531 9.79798ZM10.041 10.0481C10.041 10.1244 10.0092 10.1976 9.95253 10.2515C9.89587 10.3055 9.81901 10.3358 9.73888 10.3358H8.6301L10.0397 8.90374L10.041 10.0481Z"
                                    fill="#414141"
                                  />
                                </svg>
                                <span className="input-title text-dimmed">
                                  Special Notes
                                </span>
                              </div>
                              <div className="input-field py-2 text-small input-notes">
                                {noteString}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                    <div className="form-input">
                      <Button
                        type="submit"
                        className={`btn-block btn confirm-btn mt-5 btn-green`}
                        onClick={() => {
                          editFormPage2();
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
                <div
                  className="error-message"
                  hidden={!(newUser && inactiveLink)}
                >
                  {!requestedLink ? (
                    <div className="welcome-page error-1">
                      <div className="input-header">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="80"
                          height="81"
                          viewBox="0 0 80 81"
                          fill="none"
                        >
                          <path
                            d="M72.348 53.3907L64.348 50.6907C62.348 50.0907 60.248 51.2907 59.648 53.1907C59.148 55.0907 60.048 57.0907 61.948 57.7907L69.948 60.4907C71.948 61.1907 74.048 60.0907 74.648 58.0907C75.248 56.0907 74.348 54.0907 72.348 53.3907Z"
                            fill="#1C3C34"
                          />
                          <path
                            d="M52.6506 27.791C51.1506 26.291 48.8506 26.291 47.3506 27.791L26.1506 49.091C24.7506 50.591 24.8506 52.991 26.3506 54.391C27.7506 55.691 30.0506 55.691 31.4506 54.391L52.6506 33.091C54.0506 31.591 54.0506 29.291 52.6506 27.791Z"
                            fill="#1C3C34"
                          />
                          <path
                            d="M56.144 63.7907C55.444 61.7907 53.344 60.7907 51.444 61.3907C49.444 62.0907 48.444 64.1907 49.044 66.0907L51.744 74.0907C52.444 76.0907 54.544 77.0907 56.544 76.3907C58.544 75.6907 59.544 73.5907 58.844 71.5907L56.144 63.7907Z"
                            fill="#1C3C34"
                          />
                          <path
                            d="M22.5477 18.3913C23.1477 20.3913 25.2477 21.4913 27.2477 20.8913C29.2477 20.2913 30.3477 18.1913 29.7477 16.1913C29.7477 16.0913 29.6477 15.9913 29.6477 15.8913L26.9477 7.89129C26.2477 5.89129 24.1477 4.89129 22.2477 5.49129C20.3477 6.09129 19.2477 8.29129 19.8477 10.1913L22.5477 18.3913Z"
                            fill="#1C3C34"
                          />
                          <path
                            d="M6.34931 28.6908L14.3493 31.3908C16.3493 32.0908 18.4493 30.9908 19.0493 28.9908C19.7493 26.9908 18.6493 24.8908 16.6493 24.2908L8.64931 21.6908C6.64931 20.9908 4.54931 22.0908 3.94931 24.0908C3.34931 26.0908 4.44931 28.0908 6.34931 28.6908Z"
                            fill="#1C3C34"
                          />
                          <path
                            d="M42.049 22.4909L52.649 11.8909C57.049 7.4909 64.149 7.4909 68.549 11.8909C72.949 16.2909 72.949 23.3909 68.549 27.7909L57.949 38.3909C56.449 39.7909 56.349 42.1909 57.749 43.6909C59.149 45.1909 61.549 45.2909 63.049 43.8909C63.149 43.7909 63.149 43.7909 63.249 43.6909L73.849 33.0909C81.449 26.0909 82.049 14.1909 75.049 6.5909C68.049 -1.0091 56.149 -1.6091 48.549 5.3909C48.149 5.7909 47.749 6.1909 47.349 6.5909L36.749 17.1909C35.249 18.5909 35.149 20.9909 36.549 22.4909C37.949 23.9909 40.349 24.0909 41.849 22.6909C41.949 22.6909 41.949 22.5909 42.049 22.4909Z"
                            fill="#1C3C34"
                          />
                          <path
                            d="M31.4466 75.591L42.0466 64.991C43.4466 63.491 43.3466 61.091 41.8466 59.691C40.4466 58.391 38.1466 58.391 36.7466 59.691L26.1466 70.291C21.7466 74.691 14.6466 74.691 10.2466 70.291C5.84657 65.891 5.84657 58.791 10.2466 54.391L20.8466 43.691C22.2466 42.191 22.1466 39.791 20.6466 38.391C19.2466 37.091 16.9466 37.091 15.5466 38.391L4.94657 49.091C-2.05343 56.691 -1.45343 68.591 6.14657 75.591C13.2466 82.091 24.2466 82.091 31.4466 75.591Z"
                            fill="#1C3C34"
                          />
                        </svg>
                      </div>
                      <h5 className="site-visit-date text-dark my-5">
                        Uh ohh!
                      </h5>
                      <span className="thanks-text text-dimmed">
                        This link has expired. Please request another link to
                        book a site visit
                      </span>
                      <Button
                        className={`btn-block btn home-btn btn-green`}
                        onClick={handleRequestLink}
                      >
                        Request another link
                      </Button>
                    </div>
                  ) : null}

                  {requestedLink ? (
                    <div className="error-message error-2">
                      <div className="welcome-page">
                        <div className="input-header">
                          {/* <img src={brokenLink} height={82} width={82} />
                           */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="96"
                            height="80"
                            viewBox="0 0 96 80"
                            fill="none"
                          >
                            <path
                              d="M44.9178 50.966C45.9178 50.966 46.9177 50.566 47.6177 49.766L61.1178 35.166C62.5177 33.666 62.4178 31.366 60.9178 29.966C59.4178 28.566 57.1178 28.666 55.7178 30.166L44.9178 41.766L40.4178 36.866C39.0178 35.366 36.7178 35.266 35.2178 36.666C33.7178 38.066 33.6178 40.366 35.0178 41.866L42.3177 49.666C42.9178 50.566 43.9178 50.966 44.9178 50.966Z"
                              fill="#1C3C34"
                            />
                            <path
                              d="M68.7187 64.4654C62.9187 69.3654 55.6187 72.0654 48.0187 72.0654C30.3187 72.0654 15.9187 57.6654 15.9187 39.9654V37.9654H20.5187C21.7187 37.9654 22.8187 37.2654 23.4187 36.2654C24.0187 35.1654 23.9187 33.8654 23.3187 32.8654L15.0187 19.8654C13.8187 17.9654 10.6187 17.9654 9.41869 19.8654L1.01869 32.8654C0.318691 33.8654 0.318691 35.1654 0.918691 36.2654C1.51869 37.2654 2.61869 37.9654 3.81869 37.9654H8.41869V39.9654C8.41869 61.7654 26.1187 79.4654 47.9187 79.4654C57.2187 79.4654 66.3187 76.1654 73.4187 70.1654C75.0187 68.8654 75.2187 66.4654 73.8187 64.9654C72.6187 63.3654 70.3187 63.1654 68.7187 64.4654Z"
                              fill="#1C3C34"
                            />
                            <path
                              d="M95.1175 43.6658C94.5175 42.5658 93.4175 41.9658 92.2175 41.9658H87.6175V39.9658C87.6175 18.1658 69.9175 0.46582 48.1175 0.46582C38.8175 0.46582 29.7175 3.76582 22.6175 9.76582C21.0175 11.0658 20.8175 13.4658 22.2175 14.9658C23.5175 16.5658 25.9175 16.7658 27.4175 15.3658C33.2175 10.4658 40.5175 7.76582 48.1175 7.76582C65.8175 7.76582 80.2175 22.1658 80.2175 39.8658V41.8658H75.6175C74.4175 41.8658 73.3175 42.5658 72.7175 43.5658C72.1175 44.6658 72.2175 45.9658 72.8175 46.9658L81.1175 59.9658C81.7175 60.9658 82.8175 61.4658 83.9175 61.4658C85.0175 61.4658 86.1175 60.8658 86.7175 59.9658L95.0175 46.9658C95.6175 46.0658 95.7175 44.7658 95.1175 43.6658Z"
                              fill="#1C3C34"
                            />
                          </svg>
                        </div>
                        <h5 className="site-visit-date text-dark my-5">
                          We’ve initiated a request!
                        </h5>
                        <span className="thanks-text text-dimmed">
                          Our sales manager will get in touch with you to help
                          you book a site visit shortly.
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="error-message error-404" hidden={!wrongLink}>
                <div className="welcome-page error-1" hidden={requestedLink}>
                  <div className="input-header">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="80"
                      height="81"
                      viewBox="0 0 80 81"
                      fill="none"
                    >
                      <path
                        d="M72.348 53.3907L64.348 50.6907C62.348 50.0907 60.248 51.2907 59.648 53.1907C59.148 55.0907 60.048 57.0907 61.948 57.7907L69.948 60.4907C71.948 61.1907 74.048 60.0907 74.648 58.0907C75.248 56.0907 74.348 54.0907 72.348 53.3907Z"
                        fill="#1C3C34"
                      />
                      <path
                        d="M52.6506 27.791C51.1506 26.291 48.8506 26.291 47.3506 27.791L26.1506 49.091C24.7506 50.591 24.8506 52.991 26.3506 54.391C27.7506 55.691 30.0506 55.691 31.4506 54.391L52.6506 33.091C54.0506 31.591 54.0506 29.291 52.6506 27.791Z"
                        fill="#1C3C34"
                      />
                      <path
                        d="M56.144 63.7907C55.444 61.7907 53.344 60.7907 51.444 61.3907C49.444 62.0907 48.444 64.1907 49.044 66.0907L51.744 74.0907C52.444 76.0907 54.544 77.0907 56.544 76.3907C58.544 75.6907 59.544 73.5907 58.844 71.5907L56.144 63.7907Z"
                        fill="#1C3C34"
                      />
                      <path
                        d="M22.5477 18.3913C23.1477 20.3913 25.2477 21.4913 27.2477 20.8913C29.2477 20.2913 30.3477 18.1913 29.7477 16.1913C29.7477 16.0913 29.6477 15.9913 29.6477 15.8913L26.9477 7.89129C26.2477 5.89129 24.1477 4.89129 22.2477 5.49129C20.3477 6.09129 19.2477 8.29129 19.8477 10.1913L22.5477 18.3913Z"
                        fill="#1C3C34"
                      />
                      <path
                        d="M6.34931 28.6908L14.3493 31.3908C16.3493 32.0908 18.4493 30.9908 19.0493 28.9908C19.7493 26.9908 18.6493 24.8908 16.6493 24.2908L8.64931 21.6908C6.64931 20.9908 4.54931 22.0908 3.94931 24.0908C3.34931 26.0908 4.44931 28.0908 6.34931 28.6908Z"
                        fill="#1C3C34"
                      />
                      <path
                        d="M42.049 22.4909L52.649 11.8909C57.049 7.4909 64.149 7.4909 68.549 11.8909C72.949 16.2909 72.949 23.3909 68.549 27.7909L57.949 38.3909C56.449 39.7909 56.349 42.1909 57.749 43.6909C59.149 45.1909 61.549 45.2909 63.049 43.8909C63.149 43.7909 63.149 43.7909 63.249 43.6909L73.849 33.0909C81.449 26.0909 82.049 14.1909 75.049 6.5909C68.049 -1.0091 56.149 -1.6091 48.549 5.3909C48.149 5.7909 47.749 6.1909 47.349 6.5909L36.749 17.1909C35.249 18.5909 35.149 20.9909 36.549 22.4909C37.949 23.9909 40.349 24.0909 41.849 22.6909C41.949 22.6909 41.949 22.5909 42.049 22.4909Z"
                        fill="#1C3C34"
                      />
                      <path
                        d="M31.4466 75.591L42.0466 64.991C43.4466 63.491 43.3466 61.091 41.8466 59.691C40.4466 58.391 38.1466 58.391 36.7466 59.691L26.1466 70.291C21.7466 74.691 14.6466 74.691 10.2466 70.291C5.84657 65.891 5.84657 58.791 10.2466 54.391L20.8466 43.691C22.2466 42.191 22.1466 39.791 20.6466 38.391C19.2466 37.091 16.9466 37.091 15.5466 38.391L4.94657 49.091C-2.05343 56.691 -1.45343 68.591 6.14657 75.591C13.2466 82.091 24.2466 82.091 31.4466 75.591Z"
                        fill="#1C3C34"
                      />
                    </svg>
                  </div>
                  <h5 className="site-visit-date text-dark my-5">Uh ohh!</h5>
                  <span className="thanks-text text-dimmed">
                    This link is broken! Please request your sales manager for a
                    new link!
                  </span>
                  <Link className={`btn-block btn home-btn btn-green`} to={"/"}>
                    Home
                  </Link>
                </div>
              </div>
              <div className="openhaus-footer">
                <div
                  className={
                    (currentPage === 1 || currentPage === 2) &&
                    newUser &&
                    !wrongLink
                      ? "visible openhaus-footer-left text-dimmed"
                      : "invisible"
                  }
                >
                  <span className="hyperlink" onClick={openReraDisclaimer}>
                    Click here
                  </span>
                  <span>
                    {" "}
                    to view the RERA information for Birla Niyaara - Worli
                  </span>
                </div>
                <div className="openhaus-footer-child">
                  <span className="text-dimmed small">powered by</span>
                  <svg
                    width={64}
                    height={45}
                    viewBox="0 0 64 45"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                  >
                    <rect
                      x="0.0078125"
                      y="0.353516"
                      width={64}
                      height="44.6008"
                      fill="url(#pattern0)"
                    />
                    <defs>
                      <pattern
                        id="pattern0"
                        patternContentUnits="objectBoundingBox"
                        width={1}
                        height={1}
                      >
                        <use
                          xlinkHref="#image0_1745_11754"
                          transform="scale(0.00067659 0.000970874)"
                        />
                      </pattern>
                      <image
                        id="image0_1745_11754"
                        width={1478}
                        height={1030}
                      />
                    </defs>
                  </svg>
                </div>
              </div>
            </SectionContent>
          </LayoutPrimary>
        </div>
      )}
    </>
  );
};

export default GuestSiteVisitForm;