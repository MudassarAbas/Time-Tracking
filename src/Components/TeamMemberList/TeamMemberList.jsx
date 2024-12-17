import React, { useState, useRef, useEffect } from "react";
import searchLight from "../Assets/Search_light.png";
import chevronDown from "../Assets/chevron-down.png";
import chevronUp from "../Assets/chevron-up.png";
import "./teamMemberList.css";
import { useSelector } from "react-redux";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import AddTeamMember from "../AddTeamMembers/AddTeamMember";
import { Link } from "react-router-dom";

const TeamMemberList = ({
  showModal,
  toggleModal,
  teamDetails,
  fetchTeamDetails,
}) => {
  const accessToken = useSelector((state) => state.auth.token);

  const ToggleButton = ({ selected, handleToggle }) => (
    <div className="custom-toggle-container">
      <div
        className={`custom-toggle-option ${
          selected === "user" ? "custom-active" : ""
        }`}
        onClick={() => handleToggle("user")}
      >
        User
      </div>
      <div
        className={`custom-toggle-option ${
          selected === "manager" ? "custom-active" : ""
        }`}
        onClick={() => handleToggle("manager")}
      >
        Manager
      </div>
      <div
        className={`custom-toggle-option ${
          selected === "viewer" ? "custom-active" : ""
        }`}
        onClick={() => handleToggle("viewer")}
      >
        Viewer
      </div>
      <div className={`custom-toggle-background ${selected}`}></div>
    </div>
  );

  const YesNoToggleButton = ({ selected, handleToggle }) => (
    <div className="custom-toggle-container">
      <div
        className={`custom-toggle-option ${
          selected === "No" ? "custom-active-no" : ""
        }`}
        onClick={() => handleToggle("No")}
      >
        No
      </div>
      <div
        className={`custom-toggle-option ${
          selected === "Yes" ? "custom-active" : ""
        }`}
        onClick={() => handleToggle("Yes")}
      >
        Yes
      </div>
      <div className={`custom-toggle-background ${selected}`}></div>
    </div>
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [toggleStates, setToggleStates] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const itemsPerPage = 10;
  const dropdownRefs = useRef([]);
  const actionButtonRefs = useRef([]);

  useEffect(() => {
    // Initialize selectedRoles and toggleStates based on teamDetails
    const initialRoles = {};
    const initialStates = {};

    teamDetails.teamData.forEach((member, index) => {
      initialRoles[index] = member.teamRole;
      initialStates[index] = member.isTeamLead ? "Yes" : "No";
    });

    setSelectedRoles(initialRoles);
    setToggleStates(initialStates);
  }, [teamDetails]);

  const handleToggleRole = (index, role) => {
    setSelectedRoles((prev) => {
      const newRoles = { ...prev, [index]: role };
      const originalRole = teamDetails.teamData[index].teamRole;
      if (newRoles[index] !== originalRole) {
        setHasChanges(true);
      }
      return newRoles;
    });
  };

  const handleToggleStatus = (index, status) => {
    setToggleStates((prev) => {
      const newStates = { ...prev, [index]: status };
      const originalStatus = teamDetails.teamData[index].isTeamLead
        ? "Yes"
        : "No";
      if (newStates[index] !== originalStatus) {
        setHasChanges(true);
      }

      // Automatically set role to "Manager" if status is "Yes"
      if (status === "Yes") {
        setSelectedRoles((prevRoles) => ({
          ...prevRoles,
          [index]: "manager",
        }));
      }

      return newStates;
    });
  };

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

  const filteredMembers = teamDetails.teamData.filter((member) =>
    `${member.firstName} ${member.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

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

  const saveChanges = async () => {
    try {
      const updatedTeamData = teamDetails.teamData.map((member, index) => {
        const isTeamLead =
          toggleStates[index] === "Yes"
            ? true
            : toggleStates[index] === "No"
            ? false
            : member.isTeamLead;
        return {
          userId: member._id,
          teamRole: selectedRoles[index] || member.teamRole,
          isTeamLead: isTeamLead,
        };
      });
      console.log(updatedTeamData);
      const response = await axios.put(
        `http://localhost:5000/api/team/update-members/${teamDetails.teamId}`,
        { teamUsers: updatedTeamData },
        {
          headers: {
            token: accessToken,
          },
        }
      );
      toast.success(response.data.message || "Changes saved successfully.");
      fetchTeamDetails(); // Refresh the team details
      setHasChanges(false); // Reset hasChanges after saving
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes. Please try again.");
    }
  };

  const deleteMember = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/team/delete-member/${teamDetails.teamId}/${id}`,
        {
          headers: {
            token: accessToken,
          },
        }
      );
      toast.success(response.data.message || "Member deleted successfully.");
      fetchTeamDetails();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete member. Please try again.");
    }
  };

  const nestedFetchTeamDetails = async () => {
    await fetchTeamDetails();
  };

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="custom-members-search">
        <div className="custom-search-div">
          <img src={searchLight} alt="search" className="custom-search-icon" />
          <input
            type="text"
            placeholder="Search for members"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div>
          {hasChanges && (
            <button
              className="custom-add-members-button"
              style={{ marginRight: "20px" }}
              onClick={saveChanges}
            >
              Save Changes
            </button>
          )}
          <button className="custom-add-members-button" onClick={toggleModal}>
            Add Members
          </button>
        </div>
      </div>
      <div className="custom-members-grid">
        <div className="custom-members-grid-header">
          <div className="custom-members-grid-cell custom-member-name">
            Name
          </div>
          <div className="custom-members-grid-cell">Project Role</div>
          <div className="custom-members-grid-cell">Team Lead</div>
          <div className="custom-members-grid-cell"></div>
        </div>
        {currentMembers.map((member, index) => (
          <div className="custom-members-grid-row" key={index}>
            <div className="custom-members-grid-cell custom-member-name">
              <div className="custom-member-avatar">
                {member.firstName.charAt(0).toUpperCase()}
              </div>
              <span>{member.firstName + " " + member.lastName}</span>
            </div>
            <div className="custom-members-grid-cell">
              <ToggleButton
                selected={selectedRoles[index] || member.teamRole}
                handleToggle={(role) =>
                  toggleStates[index] === "Yes"
                    ? null
                    : handleToggleRole(index, role)
                }
              />
            </div>
            <div className="custom-members-grid-cell">
              <YesNoToggleButton
                selected={
                  toggleStates[index] || (member.isTeamLead ? "Yes" : "No")
                }
                handleToggle={(status) => handleToggleStatus(index, status)}
              />
            </div>
            <div
              className="custom-members-grid-cell"
              style={{ position: "relative" }}
            >
              <div
                className="custom-actions-button"
                onClick={() => handleDropdownToggle(index)}
                ref={(el) => (actionButtonRefs.current[index] = el)}
              >
                <p>Actions</p>
                <img
                  src={dropdownOpenIndex === index ? chevronUp : chevronDown}
                  alt="chevron"
                  className="custom-members-action-chevron"
                />
              </div>
              {dropdownOpenIndex === index && (
                <div
                  className="custom-dropdown-menu"
                  ref={(el) => (dropdownRefs.current[index] = el)}
                >
                  <Link
                    to={`/people/members/${member._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div>View Profile</div>
                  </Link>
                  <div onClick={() => deleteMember(member._id)}>
                    Remove Member
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="custom-members-pagination">
        <span>
          Showing {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of{" "}
          {filteredMembers.length} members
        </span>
        <div className="custom-pagination-buttons">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? "custom-active" : ""}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      <AddTeamMember
        show={showModal}
        onClose={toggleModal}
        fetchTeamDetails={nestedFetchTeamDetails}
      />
    </div>
  );
};

export default TeamMemberList;
