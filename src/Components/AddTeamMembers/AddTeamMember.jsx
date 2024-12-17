import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import chevDown from "../Assets/chevron-down.png";
import chevUp from "../Assets/chevron-up.png";
import crossIcon from "../Assets/close-cross.png";
import "./addTeamMember.css"; // Ensure this CSS file exists and is properly linked
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const AddTeamMember = ({ show, onClose, fetchTeamDetails }) => {
  const { id } = useParams();
  const [role, setRole] = useState("no");
  const [allMembers, setAllMembers] = useState([]); // Ensure allMembers is an empty array initially
  const [teamMembers, setTeamMembers] = useState([]);
  const [existingTeamMembers, setExistingTeamMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const memberDropdownRef = useRef(null);

  const accessToken = useSelector((state) => state.auth.token);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/user/all-users",
        {
          headers: {
            token: accessToken,
          },
        }
      );
      setAllMembers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/team/team-id/${id}`,
        {
          headers: {
            token: accessToken,
          },
        }
      );
      setExistingTeamMembers(response.data.teamData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchTeamMembers();
  }, []);

  const roles = [
    {
      value: "yes",
      label: "Yes",
    },
    {
      value: "no",
      label: "No",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const invitePromise = axios.put(
      `http://localhost:5000/api/team/add-members/${id}`,
      {
        teamUsers: teamMembers.map((member) => ({
          userId: member._id.toString(), // Ensure userId is a string
          isTeamLead: role === "yes",
          teamRole: role === "yes" ? "manager" : "user",
        })),
      },
      {
        headers: {
          token: accessToken,
        },
      }
    );

    toast.promise(invitePromise, {
      loading: "Adding members...",
      success: "Members added successfully",
      error: "Failed to add members. Please try again.",
    });

    try {
      await invitePromise;
      setTeamMembers([]);
      setRole("no");
      onClose();
      fetchTeamDetails(); // Refetch the team data to update the component
    } catch (err) {
      console.log("An error occurred", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item) => {
    if (!teamMembers.some((i) => i._id === item._id)) {
      setTeamMembers([...teamMembers, item]);
    }
  };

  const handleRemoveItem = (item) => {
    setTeamMembers(teamMembers.filter((i) => i._id !== item._id));
  };

  const filterOptions = (options) => {
    const existingMemberIds = new Set(
      existingTeamMembers.map((member) => member._id)
    );
    const selectedMemberIds = new Set(teamMembers.map((member) => member._id));
    return options.filter(
      (option) =>
        !existingMemberIds.has(option._id) && !selectedMemberIds.has(option._id)
    );
  };

  const searchFilter = (item, search) =>
    item.firstName.toLowerCase().includes(search.toLowerCase()) ||
    item.lastName.toLowerCase().includes(search.toLowerCase()) ||
    `${item.firstName} ${item.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        memberDropdownOpen &&
        memberDropdownRef.current &&
        !memberDropdownRef.current.contains(event.target)
      ) {
        setMemberDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [memberDropdownOpen]);

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Add Member</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Add Members<span className="red-star">*</span>
            </label>
            <div className="project-select" ref={memberDropdownRef}>
              <div
                className={`selected-projects ${
                  memberDropdownOpen ? "open" : ""
                }`}
              >
                {teamMembers.map((member) => (
                  <span key={member._id} className="selected-project">
                    {member.firstName + " " + member.lastName}
                    <img
                      src={crossIcon}
                      alt="remove"
                      onClick={() => handleRemoveItem(member)}
                      className="close-cross"
                    />
                  </span>
                ))}
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  onClick={() => setMemberDropdownOpen(true)}
                  placeholder="Search Members"
                />
                {teamMembers.length === 0 && (
                  <img
                    src={memberDropdownOpen ? chevUp : chevDown}
                    alt="dropdown icon"
                    className="dropdown-icon"
                  />
                )}
              </div>
              {memberDropdownOpen && (
                <div className="project-options">
                  {filterOptions(allMembers)
                    .filter((member) => searchFilter(member, memberSearch))
                    .map((member) => (
                      <div
                        key={member._id}
                        className="project-option"
                        onClick={() => handleAddItem(member)}
                      >
                        {member.firstName + " " + member.lastName}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>
              Team Lead<span className="red-star">*</span>
            </label>
            <div
              className={`custom-select ${dropdownOpen ? "open" : ""}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="role-select-div-arrow">
                <div className="selected-value">{role}</div>
                <img
                  src={dropdownOpen ? chevUp : chevDown}
                  alt="expand arrow"
                />
              </div>
              <div className="options">
                {roles.map((roleOption) => (
                  <div
                    key={roleOption.value}
                    className="option"
                    onClick={() => {
                      setRole(roleOption.value);
                      setDropdownOpen(false);
                    }}
                  >
                    <div className="option-label">{roleOption.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="send-button" disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamMember;
