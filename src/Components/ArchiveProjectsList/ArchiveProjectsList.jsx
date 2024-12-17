import React, { useEffect, useRef, useState } from "react";
import AddMember from "../../Components/AddMembers/AddMember";
import searchLight from "../Assets/Search_light.png";
import chevronDown from "../Assets/chevron-down.png";
import chevronUp from "../Assets/chevron-up.png";
import { useSelector } from "react-redux";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import AddProjectModal from "../AddProjectModal/AddProjectModal";
import EditProjectModal from "../EditProjectModal/EditProjectModal";

function ArchiveProjectsList({ showModal, toggleModal }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [membersData, setMembersData] = useState([]);
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const itemsPerPage = 10;
  const dropdownRefs = useRef([]);
  const actionButtonRefs = useRef([]);
  const loginUser = useSelector((state) => state.auth);
  const accessToken = loginUser.token;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

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

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/project/archive",

        {
          headers: {
            token: accessToken,
          },
          // use JSON.stringyfy to convert the object into string
        }
      );
      setMembersData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredMembers = membersData.filter((member) =>
    (member.firstName + " " + member.lastName)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // member.firstName.toLowerCase().includes(searchQuery.toLowerCase())
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const currentProjects = filteredMembers.slice(
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
  const handleEditProject = (project) => {
    setProjectToEdit(project);
    setEditModalOpen(true);
    setDropdownOpenIndex(null);
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

  const deleteProject = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;
    try {
      const responce = await axios.delete(
        `http://localhost:5000/api/project/delete/${id}`,
        {
          headers: {
            token: accessToken,
          },
        }
      );
      fetchProjects();
      console.log(responce.data.message);
      toast.success(responce.data.message);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete member");
    }
  };

  const activateProject = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to activate the project?"
    );
    if (!confirmDelete) return;
    try {
      const responce = await axios.post(
        `http://localhost:5000/api/project/restore/${id}`,
        {},
        {
          headers: {
            token: accessToken,
          },
        }
      );
      fetchProjects();
      console.log(responce.data.message);
      toast.success(responce.data.message);
    } catch (error) {
      console.error(error);
      toast.error("Failed to archive project");
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
        {/* <button className="add-members-button" onClick={toggleModal}>
          Add Project
        </button> */}
      </div>
      <div className="projects-grid">
        <div className="members-grid-header">
          <div className="members-grid-cell member-name">Project Name</div>
          <div className="members-grid-cell">Teams</div>
          <div className="members-grid-cell">Members</div>
          <div className="members-grid-cell"></div>
        </div>
        {currentProjects &&
          currentProjects.map((member, index) => (
            <div className="members-grid-row abc" key={index}>
              <div className="members-grid-cell member-name">
                <div className="member-avatar">
                  {member.projectName
                    ? member.projectName.charAt(0).toUpperCase()
                    : ""}
                </div>
                <span>{member.projectName}</span>
              </div>
              <div className="members-grid-cell">
                {member.projectTeams.length}
              </div>
              <div className="members-grid-cell">
                {member.projectUsers.length}
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
                    <div onClick={() => handleEditProject(member._id)}>
                      Edit Project
                    </div>
                    <div
                      onClick={() =>
                        (window.location.href = `/projects/${member._id}`)
                      }
                    >
                      View Project
                    </div>
                    <div onClick={() => deleteProject(member._id)}>
                      Delete Project
                    </div>
                    <div onClick={() => activateProject(member._id)}>
                      Activate the project
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
      <AddProjectModal show={showModal} onClose={toggleModal} />
      <EditProjectModal
        show={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        projectId={projectToEdit}
      />
    </div>
  );
}

export default ArchiveProjectsList;
