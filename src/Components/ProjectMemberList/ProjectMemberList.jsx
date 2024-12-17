import React, { useState, useRef, useEffect } from "react";
import AddMember from "../../Components/AddMembers/AddMember";
import searchLight from "../Assets/Search_light.png";
import chevronDown from "../Assets/chevron-down.png";
import chevronUp from "../Assets/chevron-up.png";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import "./projectMemberList.css";
import AddProjectMember from "../AddProjectMember/AddProjectMember";

function ProjectMemberList({ showModal, toggleModal, membersData, projectId }) {
  console.log(membersData);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [actionDropdownOpenIndex, setActionDropdownOpenIndex] = useState(null);
  const [roles, setRoles] = useState(membersData.map((member) => member.role));
  const [originalRoles, setOriginalRoles] = useState([...roles]);
  const [changes, setChanges] = useState(false);
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
          setActionDropdownOpenIndex(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpenIndex, actionDropdownOpenIndex]);

  const roleOptions = [
    {
      value: "user",
      label: "User",
    },
    {
      value: "manager",
      label: "Manager",
    },
    {
      value: "viewer",
      label: "Viewer",
    },
  ];

  const filteredMembers = membersData.filter((member) =>
    (member.firstName + " " + member.lastName)
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
    setCurrentPage(1);
  };

  const handleDropdownToggle = (index) => {
    setDropdownOpenIndex(index === dropdownOpenIndex ? null : index);
    setActionDropdownOpenIndex(null); // Close action dropdown
  };

  const handleActionDropdownToggle = (index) => {
    setActionDropdownOpenIndex(
      index === actionDropdownOpenIndex ? null : index
    );
    setDropdownOpenIndex(null); // Close role dropdown
  };

  const formattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const removeMember = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/project/remove-member/${projectId}/${id}`,
        {
          headers: {
            token: accessToken,
          },
        }
      );

      if (response.status === 200) {
        toast.success(response.data.message);
        const updatedMembers = membersData.filter(
          (member) => member._id !== id
        );
        setChanges(false);
      } else {
        toast.error("Failed to remove member.");
      }
    } catch (error) {
      toast.error("Failed to remove member.");
    }
  };

  const handleRoleChange = (index, newRole) => {
    setRoles((prevRoles) => {
      const updatedRoles = [...prevRoles];
      updatedRoles[index] = newRole;
      return updatedRoles;
    });
    setDropdownOpenIndex(null); // Close the dropdown after selecting a role
    setChanges(true); // Mark changes as true to show save button
  };

  const saveChanges = async () => {
    const changedMembers = currentMembers
      .filter((member, index) => member.role !== roles[index])
      .map((member, index) => ({
        ...member,
        role: roles[index],
      }));

    if (changedMembers.length === 0) {
      toast.error("No changes to save.");
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:5000/api/project/update-role/${projectId}`,
        { members: changedMembers },
        {
          headers: {
            token: accessToken,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Changes saved successfully!");
        setOriginalRoles([...roles]);
        setChanges(false);
      } else {
        toast.error("Failed to save changes.");
      }
    } catch (error) {
      toast.error("Failed to save changes.");
    }
  };

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="members-search">
        <div className="search-div">
          <img src={searchLight} alt="search" className="search-icon" />
          <input
            type="text"
            placeholder="Search for members"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div>
          {changes && (
            <button className="add-members-button" onClick={saveChanges}>
              Save Changes
            </button>
          )}
          <button className="add-members-button" onClick={toggleModal}>
            Add Members
          </button>
        </div>
      </div>
      <div className="project-members-grid">
        <div className="members-grid-header">
          <div className="members-grid-cell member-name">Members</div>
          <div className="members-grid-cell">Role</div>
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

              <div className="members-grid-cell text-center">
                <div
                  className={`custom-select custom-select-project-member-role ${
                    dropdownOpenIndex === index ? "open" : ""
                  }`}
                  onClick={() => handleDropdownToggle(index)}
                >
                  <div className="role-select-div-arrow">
                    <div className="selected-value">{roles[index]}</div>
                    <img
                      src={
                        dropdownOpenIndex === index ? chevronUp : chevronDown
                      }
                      alt="expand arrow"
                    />
                  </div>
                  {dropdownOpenIndex === index && (
                    <div className="options">
                      {roleOptions.map((role) => (
                        <div
                          key={role.value}
                          className="option project-members-option"
                          onClick={() => handleRoleChange(index, role.value)}
                        >
                          <div className="option-label project-members-option-label">
                            {role.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div
                className="members-grid-cell"
                style={{ position: "relative" }}
              >
                <div
                  className="actions-button"
                  onClick={() => handleActionDropdownToggle(index)}
                  ref={(el) => (actionButtonRefs.current[index] = el)}
                >
                  <p>Actions</p>
                  <img
                    src={
                      actionDropdownOpenIndex === index
                        ? chevronUp
                        : chevronDown
                    }
                    alt="chevron"
                    className="members-action-chevron"
                  />
                </div>
                {actionDropdownOpenIndex === index && (
                  <div
                    className="custom-dropdown-menu"
                    ref={(el) => (dropdownRefs.current[index] = el)}
                  >
                    <div
                      onClick={() =>
                        (window.location.href = `/people/members/${member.userId}`)
                      }
                    >
                      View Profile
                    </div>
                    <div onClick={() => removeMember(member.userId)}>
                      Remove Member
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
      <AddProjectMember
        show={showModal}
        onClose={toggleModal}
        existingProjectMembers={membersData}
      />
    </div>
  );
}

export default ProjectMemberList;
