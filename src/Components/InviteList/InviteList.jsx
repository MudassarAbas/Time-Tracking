import React, { useEffect, useRef, useState } from "react";
import searchLight from "../Assets/Search_light.png";
import chevronDown from "../Assets/chevron-down.png";
import AddMember from "../AddMembers/AddMember";
import "./inviteList.css";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

const InviteList = ({ showModal, toggleModal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  const dropdownRefs = useRef([]);
  const actionButtonRefs = useRef([]);
  const loginUser = useSelector((state) => state.auth);
  const accessToken = loginUser.token;

  const fetchInvites = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/user/invites/all",
        {
          headers: {
            token: accessToken,
          },
        }
      );
      setInvites(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []); // Fetch invites once on component mount

  const filteredInvites = invites?.filter((invite) =>
    invite.email.toLowerCase().includes(searchQuery.toLowerCase())
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

  const resendInvite = async (inviteId) => {
    setLoading(true);

    const resendInvitation = axios.post(
      `http://localhost:5000/api/user/resend-invitation/${inviteId}`,
      {},
      {
        headers: {
          token: accessToken,
        },
      }
    );
    toast.promise(resendInvitation, {
      loading: "Resending invitation...",
      success: "Invitation resent successfully!",
      error: "Failed to resend invitation. Please try again.",
    });
    try {
      const response = await resendInvitation;
      console.log(response.data);
      setDropdownOpenIndex(null); // Close the dropdown after successful resend
    } catch (error) {
      console.log(error);
      toast.error("Failed to resend invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="invite-search">
        <div className="invite-search-div">
          <img src={searchLight} alt="search" className="search-icon" />
          <input
            type="text"
            placeholder="Search for invites"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <button className="invite-members-button" onClick={toggleModal}>
          Add Members
        </button>
      </div>

      <div className="invite-grid">
        <div className="invite-grid-header">
          <div className="invite-grid-cell invite-email">Email</div>
          <div className="invite-grid-cell">Role</div>
          <div className="invite-grid-cell">Teams</div>
          <div className="invite-grid-cell">Projects</div>
          <div className="invite-grid-cell">Status</div>
          <div className="invite-grid-cell"></div>
        </div>
        {currentInvites &&
          currentInvites.map((invite, index) => (
            <div className="invite-grid-row" key={index}>
              <div className="invite-grid-cell invite-email">
                <div className="invite-avatar">
                  {invite.email.charAt(0).toUpperCase()}
                </div>
                <span>{invite.email}</span>
              </div>
              <div className="invite-grid-cell">{invite.role}</div>
              <div className="invite-grid-cell">{invite.teams.length}</div>
              <div className="invite-grid-cell">{invite.projects.length}</div>
              <div className="invite-grid-cell">
                <span
                  className={`status-label ${invite.invitationStatus.toLowerCase()}`}
                >
                  {invite.invitationStatus}
                </span>
              </div>
              <div
                className="invite-grid-cell "
                style={{ position: "relative" }}
              >
                <div
                  className="invite-actions-button"
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
                    <div onClick={() => resendInvite(invite._id)}>
                      Resend Invite
                    </div>
                    <div
                      onClick={() => (window.location.href = "/remove-member")}
                    >
                      Delete Invite
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
          {filteredInvites.length} invites
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

export default InviteList;
