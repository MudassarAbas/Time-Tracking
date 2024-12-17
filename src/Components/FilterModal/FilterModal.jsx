import React, { useState, useRef, useEffect, forwardRef } from "react";
import "./filterModal.css";
import axios from "axios";
import chevDown from "../Assets/chevron-down.png";
import chevUp from "../Assets/chevron-up.png";
import crossIcon from "../Assets/close-cross.png";
import { useSelector } from "react-redux";
import searchLight from "../../Components/Assets/Search_light.png";
import userIcon from "../../Components/Assets/userImage.png";

const FilterModal = ({ show, onClose, onSubmit, selectedMemberId }) => {
  const [teamProjects, setTeamProjects] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [timeTypeDropdownOpen, setTimeTypeDropdownOpen] = useState(false);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [activityLevelDropdownOpen, setActivityLevelDropdownOpen] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);
  const memberDropdownRef = useRef(null);
  const projectDropdownRef = useRef(null);
  const timeTypeDropdownRef = useRef(null);
  const sourceDropdownRef = useRef(null);
  const activityLevelDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [memberModal, setMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(selectedMemberId);
  const [selectedTimeType, setSelectedTimeType] = useState([]);
  const [selectedSource, setSelectedSource] = useState([]);
  const [selectedActivityLevel, setSelectedActivityLevel] = useState(null);

  const accessToken = useSelector((state) => state.auth.token);

  const timeTypes = ["idle", "manual", "normal", "resumed"];
  const sources = ["desktop", "mobile", "browser"];
  const activityLevels = [">90", ">80", ">70", ">60", ">50", "<50"];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/project/get-all",
          {
            headers: {
              token: accessToken,
            },
          }
        );
        setAllProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

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
        console.error("Error fetching members:", error);
      }
    };

    fetchProjects();
    fetchMembers();
  }, [accessToken]);

  useEffect(() => {
    // When selectedMemberId changes, update the selectedMember state
    const member = allMembers.find((member) => member._id === selectedMemberId);
    if (member) {
      setSelectedMember(member);
    }
  }, [selectedMemberId, allMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filterData = {
      selectedMember: selectedMember._id,
      selectedProjects: teamProjects.map((project) => project._id),
      selectedTimeType,
      selectedSource,
      selectedActivityLevel,
    };

    // Pass the filter data to the parent component
    onSubmit(filterData);
    onClose(); // Close the modal after submission (optional)
  };

  const handleAddItem = (item, setItems, items) => {
    if (!items.some((i) => i._id === item._id)) {
      setItems([...items, item]);
    }
  };

  const handleRemoveItem = (item, setItems, items) => {
    setItems(items.filter((i) => i._id !== item._id));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        memberDropdownOpen &&
        memberDropdownRef.current &&
        !memberDropdownRef.current.contains(event.target)
      ) {
        setMemberDropdownOpen(false);
      }
      if (
        projectDropdownOpen &&
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target)
      ) {
        setProjectDropdownOpen(false);
      }
      if (
        timeTypeDropdownOpen &&
        timeTypeDropdownRef.current &&
        !timeTypeDropdownRef.current.contains(event.target)
      ) {
        setTimeTypeDropdownOpen(false);
      }
      if (
        sourceDropdownOpen &&
        sourceDropdownRef.current &&
        !sourceDropdownRef.current.contains(event.target)
      ) {
        setSourceDropdownOpen(false);
      }
      if (
        activityLevelDropdownOpen &&
        activityLevelDropdownRef.current &&
        !activityLevelDropdownRef.current.contains(event.target)
      ) {
        setActivityLevelDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    memberDropdownOpen,
    projectDropdownOpen,
    timeTypeDropdownOpen,
    sourceDropdownOpen,
    activityLevelDropdownOpen,
  ]);

  useEffect(() => {
    const handleClickOutsideModal = (event) => {
      const modalContent = document.querySelector(".filter-modal-content");
      const memberDropdown = document.querySelector(
        ".timesheet-member-selection-modal"
      );

      // Check if the click was outside both the modal and the dropdown list
      if (
        show &&
        modalContent &&
        !modalContent.contains(event.target) &&
        (!memberDropdown || !memberDropdown.contains(event.target))
      ) {
        onClose(); // Close the modal when clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutsideModal);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideModal);
    };
  }, [show, onClose]);

  const filterOptions = (options, selectedItems = []) =>
    options.filter(
      (option) =>
        option && !selectedItems.some((item) => item && item._id === option._id)
    );

  const searchFilter = (item, search) =>
    item.firstName.toLowerCase().includes(search.toLowerCase()) ||
    item.lastName.toLowerCase().includes(search.toLowerCase()) ||
    `${item.firstName} ${item.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase());
  const handleMemberModalToggle = () => {
    setMemberModal(!memberModal);
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleMemberSelect = (member, event) => {
    event.stopPropagation(); // Stop the click event from propagating
    setSelectedMember(member);
    setMemberModal(false); // Close the member dropdown, but not the entire modal
  };
  const handleDropdownToggle = (dropdownType, setDropdownOpen) => {
    setDropdownOpen((prev) => !prev);
  };

  const handleSelectOption = (option, setSelectedOption, setDropdownOpen) => {
    setSelectedOption(option);
    setDropdownOpen(false);
  };

  const handleSelectTimeType = (timeType) => {
    if (!selectedTimeType.includes(timeType)) {
      setSelectedTimeType([...selectedTimeType, timeType]);
    }
  };

  const handleRemoveTimeType = (timeType) => {
    setSelectedTimeType(selectedTimeType.filter((t) => t !== timeType));
  };

  const handleSelectSource = (source) => {
    if (!selectedSource.includes(source)) {
      setSelectedSource([...selectedSource, source]);
    }
  };

  const handleRemoveSource = (source) => {
    setSelectedSource(selectedSource.filter((s) => s !== source));
  };

  const clearFilter = () => {
    setTeamProjects([]);
    setSelectedTimeType([]);
    setSelectedSource([]);
    setSelectedActivityLevel(null);
  };

  if (!show) {
    return null;
  }

  return (
    <div className={`filter-modal ${show ? "show" : ""}`}>
      <div className="filter-modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2 className="filter-modal-title">Filter</h2>
        <form onSubmit={handleSubmit}>
          <div className="filter-modal-form-group">
            <label>Member</label>
            <div
              className="filter-modal-user-selector"
              onClick={handleMemberModalToggle}
            >
              <img
                src={userIcon}
                alt="User Icon"
                className="user-selector-user-icon"
              />
              <div>
                {selectedMember
                  ? `${selectedMember.firstName} ${selectedMember.lastName}`
                  : "Select a member"}
              </div>
            </div>
            {memberModal && (
              <div className="timesheet-member-selection-modal">
                <div className="timesheet-modal-content">
                  <div className="search-input">
                    <img
                      src={searchLight}
                      alt="search"
                      className="search-icon"
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search members"
                    />
                  </div>
                  <ul className="member-list">
                    {filterOptions(allMembers, [selectedMember])
                      .filter((member) => searchFilter(member, searchQuery))
                      .map((member) => (
                        <li
                          key={member._id}
                          className={`member-item ${
                            selectedMember && selectedMember._id === member._id
                              ? "selected"
                              : ""
                          }`}
                          onClick={(event) => handleMemberSelect(member, event)} // Pass the event to stop propagation
                        >
                          <img
                            src={userIcon}
                            alt="User Icon"
                            className="user-icon"
                          />
                          {`${member.firstName} ${member.lastName}`}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="filter-modal-form-group">
            <label>Projects</label>
            <div className="project-select" ref={projectDropdownRef}>
              <div
                className={`selected-projects ${
                  projectDropdownOpen ? "open" : ""
                }`}
              >
                {teamProjects.map((project) => (
                  <span key={project._id} className="selected-project">
                    {project.projectName}
                    <img
                      src={crossIcon}
                      alt="remove"
                      onClick={() =>
                        handleRemoveItem(project, setTeamProjects, teamProjects)
                      }
                      className="close-cross"
                    />
                  </span>
                ))}
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  onClick={() =>
                    handleDropdownToggle("project", setProjectDropdownOpen)
                  }
                  placeholder="Enter project name"
                />
                {projectSearch === "" && (
                  <img
                    src={projectDropdownOpen ? chevUp : chevDown}
                    alt="dropdown icon"
                    className="dropdown-icon"
                    onClick={() =>
                      handleDropdownToggle("project", setProjectDropdownOpen)
                    }
                  />
                )}
              </div>
              {projectDropdownOpen && (
                <div className="project-options">
                  {filterOptions(allProjects, teamProjects)
                    .filter((project) =>
                      project.projectName
                        .toLowerCase()
                        .includes(projectSearch.toLowerCase())
                    )
                    .map((project) => (
                      <div
                        key={project._id}
                        className="project-option"
                        onClick={() =>
                          handleAddItem(project, setTeamProjects, teamProjects)
                        }
                      >
                        {project.projectName}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <Dropdown
            label="Time Type"
            options={timeTypes}
            selectedOptions={selectedTimeType} // Pass multiple selected time types
            onSelect={handleSelectTimeType}
            onRemove={handleRemoveTimeType}
            dropdownOpen={timeTypeDropdownOpen}
            setDropdownOpen={setTimeTypeDropdownOpen}
            placeholder="Select a time type"
            multiSelect={true} // Enable multi-select
            ref={timeTypeDropdownRef}
          />

          <Dropdown
            label="Source"
            options={sources}
            selectedOptions={selectedSource} // Pass multiple selected sources
            onSelect={handleSelectSource}
            onRemove={handleRemoveSource}
            dropdownOpen={sourceDropdownOpen}
            setDropdownOpen={setSourceDropdownOpen}
            placeholder="Select a source"
            multiSelect={true} // Enable multi-select
            ref={sourceDropdownRef}
          />
          <Dropdown
            label="Activity Level"
            options={activityLevels}
            selectedOption={selectedActivityLevel} // Use single selection
            onSelect={(option) =>
              handleSelectOption(
                option,
                setSelectedActivityLevel,
                setActivityLevelDropdownOpen
              )
            }
            onRemove={() => setSelectedActivityLevel(null)} // Clear the selected option
            dropdownOpen={activityLevelDropdownOpen}
            setDropdownOpen={setActivityLevelDropdownOpen}
            placeholder="Select an activity level"
            ref={activityLevelDropdownRef}
          />

          <div className="filter-action-button">
            <button
              type="submit"
              className="filter-apply-button"
              disabled={loading}
            >
              Apply
            </button>
            <button onClick={clearFilter} className="filter-clear-button">
              Clear Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dropdown = forwardRef(
  (
    {
      label,
      options,
      selectedOption, // For single selected option
      selectedOptions, // For multiple selected options
      onSelect,
      onRemove, // Handles removing an option
      dropdownOpen,
      setDropdownOpen,
      placeholder,
      multiSelect = false, // New flag to indicate multi-selection
    },
    ref
  ) => (
    <div className="filter-modal-form-group">
      <label>{label}</label>
      <div className="project-select" ref={ref}>
        <div
          className={`selected-projects ${dropdownOpen ? "open" : ""}`}
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          {multiSelect ? (
            selectedOptions.length > 0 ? (
              selectedOptions.map((option, idx) => (
                <span key={idx} className="selected-project">
                  {option}
                  <img
                    src={crossIcon}
                    alt="remove"
                    onClick={() => onRemove(option)}
                    className="close-cross"
                  />
                </span>
              ))
            ) : (
              <input type="text" value="" placeholder={placeholder} readOnly />
            )
          ) : selectedOption ? ( // Handling single selected option here
            <span className="selected-project">
              {selectedOption}
              <img
                src={crossIcon}
                alt="remove"
                onClick={() => onRemove(null)} // Removes the selected single option
                className="close-cross"
              />
            </span>
          ) : (
            <input type="text" value="" placeholder={placeholder} readOnly />
          )}
          {!selectedOption && !selectedOptions && (
            <img
              src={dropdownOpen ? chevUp : chevDown}
              alt="dropdown icon"
              className="dropdown-icon"
            />
          )}
        </div>
        {dropdownOpen && (
          <div className="project-options">
            {options.map((option) => (
              <div
                key={option}
                className="project-option"
                onClick={() => onSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
);

export default FilterModal;
