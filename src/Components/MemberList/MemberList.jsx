import React, { useState, useRef, useEffect } from "react";
import AddMember from "../../Components/AddMembers/AddMember";
import searchLight from "../Assets/Search_light.png";
import chevronDown from "../Assets/chevron-down.png";
import chevronUp from "../Assets/chevron-up.png";
import "./memberList.css";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

const MemberList = ({ showModal, toggleModal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [membersData, setMembersData] = useState([]);
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const itemsPerPage = 10;
  const dropdownRefs = useRef([]);
  const actionButtonRefs = useRef([]);
  const loginUser = useSelector((state) => state.auth);
  const accessToken = loginUser.token;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpenIndex !== null) {
        const dropdownNode = dropdownRefs.current[dropdownOpenIndex];
        const actionButtonNode = actionButtonRefs.current[dropdownOpenIndex];
        if (
          dropdownNode &&
          !dropdownNode.contains(event.target) &&
          actionButtonNode &&
          !actionButtonNode.contains(event.target)
        ) {
          setDropdownOpenIndex(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpenIndex]);

  //Fetching members from the database

  const fetchMembers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/user/all", {
        headers: {
          token: accessToken,
        },
        // use JSON.stringyfy to convert the object into string
      });
      setMembersData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = membersData.filter((member) =>
    (member.firstName + " " + member.lastName)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // member.firstName.toLowerCase().includes(searchQuery.toLowerCase())
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const currentMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleDropdownToggle = (index) => {
    setDropdownOpenIndex(index === dropdownOpenIndex ? null : index);
  };
  function formattedDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short", // abbreviated day of the week
      year: "numeric",
      month: "short", // abbreviated month
      day: "numeric",
    });
  }

  const deleteMember = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;
    try {
      const responce = await axios.delete(
        `http://localhost:5000/api/user/delete/${id}`,
        {
          headers: {
            token: accessToken,
          },
        }
      );
      fetchMembers();
      console.log(responce.data.message);
      toast.success(responce.data.message);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete member");
    }
  };

  return (
    <div>
      <div className="members-search">
        <Toaster position="top-right" reverseOrder={false} />
        <div className="search-div">
          <img src={searchLight} alt="search" className="search-icon" />
          <input
            type="text"
            placeholder="Search for members"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <button className="add-members-button" onClick={toggleModal}>
          Add Members
        </button>
      </div>
      <div className="members-grid">
        <div className="members-grid-header">
          <div className="members-grid-cell member-name">Members</div>
          <div className="members-grid-cell">Status</div>
          <div className="members-grid-cell">Role</div>
          <div className="members-grid-cell">Teams</div>
          <div className="members-grid-cell">Projects</div>
          <div className="members-grid-cell">Time Tracking Status</div>
          <div className="members-grid-cell">Date Added</div>
          <div className="members-grid-cell"></div>
        </div>
        {currentMembers &&
          currentMembers.map((member, index) => (
            <div className="members-grid-row abc" key={index}>
              <div className="members-grid-cell member-name">
                <div className="member-avatar">
                  {member.firstName
                    ? member.firstName.charAt(0).toUpperCase()
                    : ""}
                </div>
                <span>{member.firstName + " " + member.lastName}</span>
              </div>
              <div className="members-grid-cell">
                {member.employeeStatus === "active" ? "Active" : "Inactive"}
              </div>
              <div className="members-grid-cell text-center">{member.role}</div>
              <div className="members-grid-cell">{member.teams.length}</div>
              <div className="members-grid-cell">{member.projects.length}</div>
              <div className="members-grid-cell">
                <span
                  className={`status-label ${
                    member.timeTrackingStatus ? "enabled" : "disabled"
                  }`}
                >
                  {member.timeTrackingStatus ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="members-grid-cell">
                {formattedDate(member.dateAdded)}
              </div>
              <div
                className="members-grid-cell"
                style={{ position: "relative" }}
              >
                <div
                  className="actions-button"
                  onClick={() => handleDropdownToggle(index)}
                  ref={(el) => (actionButtonRefs.current[index] = el)}
                >
                  <p>Actions</p>
                  <img
                    src={dropdownOpenIndex === index ? chevronUp : chevronDown}
                    alt="chevron"
                    className="members-action-chevron"
                  />
                </div>
                {dropdownOpenIndex === index && (
                  <div
                    className="custom-dropdown-menu"
                    ref={(el) => (dropdownRefs.current[index] = el)}
                  >
                    <div
                      onClick={() =>
                        (window.location.href = `/people/members/${member._id}`)
                      }
                    >
                      View Profile
                    </div>
                    <div onClick={() => deleteMember(member._id)}>
                      Delete Member
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
      <div className="members-pagination">
        <span>
          Showing {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of{" "}
          {filteredMembers.length} members
        </span>
        <div className="pagination-buttons">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      <AddMember show={showModal} onClose={toggleModal} />
    </div>
  );
};

export default MemberList;
