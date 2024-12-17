import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import chevDown from "../Assets/chevron-down.png";
import chevUp from "../Assets/chevron-up.png";
import crossIcon from "../Assets/close-cross.png";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const AddProjectTeamModal = ({
  show,
  onClose,
  existingProjectTeams,
  fetchProjectDetails,
}) => {
  const { id } = useParams();
  const [allTeams, setAllTeams] = useState([]); // Ensure allTeams is an empty array initially
  const [projectTeams, setProjectTeams] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const memberDropdownRef = useRef(null);

  const accessToken = useSelector((state) => state.auth.token);
  const fetchTeams = async () => {
    console.log("Fetching teams");
    try {
      const response = await axios.get(
        "http://localhost:5000/api/team/get-all",
        {
          headers: {
            token: accessToken,
          },
        }
      );
      setAllTeams(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const teams = projectTeams.map((team) => team._id);
    console.log(teams);
    setLoading(true);

    const addPromise = axios.put(
      `http://localhost:5000/api/project/add-teams/${id}`,
      {
        teams,
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
      setProjectTeams([]);
      onClose();
      fetchProjectDetails(); // Refetch the team data to update the component
    } catch (err) {
      console.log("An error occurred", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item) => {
    if (!projectTeams.some((i) => i._id === item._id)) {
      setProjectTeams([...projectTeams, item]);
    }
  };

  const handleRemoveItem = (item) => {
    setProjectTeams(projectTeams.filter((i) => i._id !== item._id));
  };

  const filterOptions = (options) => {
    const existingTeamsIds = new Set(
      existingProjectTeams.map((team) => team.teamId)
    );
    const selectedMemberIds = new Set(projectTeams.map((member) => member._id));
    return options.filter(
      (option) =>
        !existingTeamsIds.has(option._id) && !selectedMemberIds.has(option._id)
    );
  };

  const searchFilter = (item, search) =>
    item.teamName.toLowerCase().includes(search.toLowerCase());

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
        <h2>Add Teams</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Add Teams<span className="red-star">*</span>
            </label>
            <div className="project-select" ref={memberDropdownRef}>
              <div
                className={`selected-projects ${
                  memberDropdownOpen ? "open" : ""
                }`}
              >
                {projectTeams.map((team) => (
                  <span key={team.teamId} className="selected-project">
                    {team.teamName}
                    <img
                      src={crossIcon}
                      alt="remove"
                      onClick={() => handleRemoveItem(team)}
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
                {projectTeams.length === 0 && (
                  <img
                    src={memberDropdownOpen ? chevUp : chevDown}
                    alt="dropdown icon"
                    className="dropdown-icon"
                  />
                )}
              </div>
              {memberDropdownOpen && (
                <div className="project-options">
                  {filterOptions(allTeams)
                    .filter((team) => searchFilter(team, memberSearch))
                    .map((team) => (
                      <div
                        key={team.teamId}
                        className="project-option"
                        onClick={() => handleAddItem(team)}
                      >
                        {team.teamName}
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

export default AddProjectTeamModal;
