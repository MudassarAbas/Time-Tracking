import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import chevDown from "../Assets/chevron-down.png";
import chevUp from "../Assets/chevron-up.png";
import crossIcon from "../Assets/close-cross.png";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const AddProjectMember = ({
  show,
  onClose,
  existingProjectMembers,
  fetchProjectDetails,
}) => {
  console.log(existingProjectMembers);

  const { id } = useParams();
  const [allMembers, setAllMembers] = useState([]); // Ensure allMembers is an empty array initially
  const [projectMembers, setProjectMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
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

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const addPromise = axios.put(
      `http://localhost:5000/api/project/add-members/${id}`,
      {
        members: projectMembers.map((member) => member._id),
      },
      {
        headers: {
          token: accessToken,
        },
      }
    );

    toast.promise(addPromise, {
      loading: "Adding members...",
      success: "Members added successfully",
      error: "Failed to add members. Please try again.",
    });

    try {
      await addPromise;
      setProjectMembers([]);
      onClose();
      fetchProjectDetails(); // Refetch the team data to update the component
    } catch (err) {
      console.log("An error occurred", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item) => {
    if (!projectMembers.some((i) => i._id === item._id)) {
      setProjectMembers([...projectMembers, item]);
    }
  };

  const handleRemoveItem = (item) => {
    setProjectMembers(projectMembers.filter((i) => i._id !== item._id));
  };

  const filterOptions = (options) => {
    const existingMemberIds = new Set(
      existingProjectMembers.map((member) => member.userId)
    );
    const selectedMemberIds = new Set(
      projectMembers.map((member) => member._id)
    );
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
    return <div></div>;
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
                {projectMembers.map((member) => (
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
                {projectMembers.length === 0 && (
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
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="send-button" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectMember;
