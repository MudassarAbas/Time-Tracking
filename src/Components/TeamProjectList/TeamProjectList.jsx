import React, { useEffect, useRef, useState } from "react";
import searchLight from "../Assets/Search_light.png";
import chevronDown from "../Assets/chevron-down.png";
import "./teamProjectList.css";
import AddProjectModal from "../AddTeamProjectModal/AddTeamProjectModal";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

function TeamProjectList({
  showModal,
  toggleModal,
  teamDetails,
  fetchTeamDetails,
}) {
  const accessToken = useSelector((state) => state.auth.token);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const itemsPerPage = 10;
  const dropdownRefs = useRef([]);
  const actionButtonRefs = useRef([]);

  const projects = teamDetails.teamProjects || [];
  console.log("Projects ", projects);

  const filteredInvites = projects.filter(
    (invite) =>
      invite !== null &&
      invite.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInvites.length / itemsPerPage);
  const currentInvites = filteredInvites.slice(
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

  const removeProject = async (projectId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/project/delete/${teamDetails.teamId}/${projectId}`,
        {
          headers: {
            token: accessToken,
          },
        }
      );
      console.log(response.data);
      toast.success(response.data.message || "Project removed successfully!");
      fetchTeamDetails();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove project. Please try again.");
    }
  };

  const nestedFetchTeamDetails = async () => {
    await fetchTeamDetails();
  };

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="invite-search">
        <div className="invite-search-div">
          <img src={searchLight} alt="search" className="search-icon" />
          <input
            type="text"
            placeholder="Search for projects"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <button className="invite-members-button" onClick={toggleModal}>
          Add Project
        </button>
      </div>

      <div className="team-project-invite-grid">
        <div className="invite-grid-header">
          <div className="invite-grid-cell invite-email">Project</div>
          <div className="invite-grid-cell"></div>
        </div>
        {currentInvites.map((invite, index) => (
          <div className="invite-grid-row" key={index}>
            <div className="invite-grid-cell invite-email">
               <div className="invite-avatar">
                {invite.projectName.charAt(0).toUpperCase()}
              </div>
              <span>{invite.projectName}</span>
            </div>
            <div className="invite-grid-cell " style={{ position: "relative" }}>
              <div
                className="invite-actions-button team-project-invite-grid-action"
                onClick={() => handleDropdownToggle(index)}
                ref={(el) => (actionButtonRefs.current[index] = el)}
              >
                <p>Actions</p>
                <img
                  src={chevronDown}
                  alt="chevron down"
                  className="invite-action-chevron"
                />
              </div>
              {dropdownOpenIndex === index && (
                <div
                  className="custom-dropdown-menu invite-custom-dropdown-menu"
                  ref={(el) => (dropdownRefs.current[index] = el)}
                >
                  {/* <div onClick={() => (window.location.href = "/view-project")}>
                    View Project
                  </div> */}
                  <div onClick={() => removeProject(invite._id)}>
                    Remove Project
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="invite-pagination">
        <span>
          Showing {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, filteredInvites.length)} of{" "}
          {filteredInvites.length} projects
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
      <AddProjectModal
        show={showModal}
        onClose={toggleModal}
        fetchTeamDetails={nestedFetchTeamDetails}
        teamDetails={teamDetails}
      />
    </div>
  );
}

export default TeamProjectList;
