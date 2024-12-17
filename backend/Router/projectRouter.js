const router = require("express").Router();
const projectModal = require("../Modals/projectModal");
const teamModal = require("../Modals/teamModal");
const dotenv = require("dotenv");
const { verifyToken } = require("./verifyToken");
const UserModal = require("../Modals/UserModal");
dotenv.config();

////////////////////////// Create a new project //////////////////////////
//////////////////////////////////////////////////////////////////////////
router.post("/create", verifyToken, async (req, res) => {
  console.log("Request to create a new project");
  try {
    const { projectName, projectUsers, projectTeams } = req.body;

    const teamsUsers = await Promise.all(
      projectTeams.map(async (teamId) => {
        const team = await teamModal.findById(teamId);
        const teamUsers = team.teamUsers;
        const userDetailsPromises = teamUsers.map(async (user) => {
          const userDetails = await UserModal.findById(user.userId);
          return {
            userId: userDetails._id,
            role: user.teamRole,
            addedViaTeam: teamId,
          };
        });
        const userDetails = await Promise.all(userDetailsPromises);
        return userDetails;
      })
    );

    // Flatten the teamsUsers array
    const flattenedTeamsUsers = teamsUsers.flat();

    // Merge teamsUsers and projectUsers into a single array, ensuring unique users without addedViaTeam if they exist in projectUsers
    const mergedUsers = [
      ...projectUsers,
      ...flattenedTeamsUsers.filter(
        (teamUser) =>
          !projectUsers.some(
            (projectUser) =>
              projectUser.userId.toString() === teamUser.userId.toString()
          )
      ),
    ];

    const finalUsers = mergedUsers.map((mergedUser) => {
      const matchingUser = projectUsers.find(
        (user) => user.userId.toString() === mergedUser.userId.toString()
      );
      if (matchingUser) {
        return {
          ...mergedUser,
          role: matchingUser.role,
          addedViaTeam: undefined,
        };
      }
      return mergedUser;
    });

    const newProject = new projectModal({
      projectName,
      projectUsers: finalUsers,
      projectTeams,
      projectStatus: "active",
    });
    await newProject.save();

    // Adding project details to the user's projects array
    for (const user of finalUsers) {
      const userDetails = await UserModal.findById(user.userId);
      if (userDetails) {
        userDetails.projects.push({
          projectId: newProject._id,
          projectRole: user.role, // Assign the user's role in the project
        });
        await userDetails.save();
      }
    }

    // Adding project to team's teamProjects array
    for (const teamId of projectTeams) {
      const team = await teamModal.findById(teamId);
      if (team) {
        team.teamProjects.push(newProject._id);
        await team.save();
      }
    }

    res.status(200).json({
      message: "Project Created Successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

////////////////////////// Get all projects //////////////////////////
/////////////////////////////////////////////////////////////////////
router.get("/get-all", verifyToken, async (req, res) => {
  try {
    const data = await projectModal.find({ projectStatus: "active" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

//////////////// Delete project all together from everywhere /////////////////
//////////////////////////////////////////////////////////////////////////////
router.delete("/delete/:id", verifyToken, async (req, res) => {
  console.log(`Request to delete project by ID`);

  try {
    const { id } = req.params;
    console.log(`Project ID: ${id}`);

    // Find the project by ID
    const project = await projectModal.findById(id);

    // If the project is not found, return an error
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Remove the project from all users' projects array
    await Promise.all(
      project.projectUsers.map(async (user) => {
        const userDetails = await UserModal.findById(user.userId);
        if (userDetails) {
          userDetails.projects = userDetails.projects.filter(
            (proj) => proj.projectId && proj.projectId.toString() !== id
          );
          await userDetails.save();
        }
      })
    );

    // Remove the project from all teams' teamProjects array
    await Promise.all(
      project.projectTeams.map(async (teamId) => {
        const team = await teamModal.findById(teamId);
        if (team) {
          team.teamProjects = team.teamProjects.filter(
            (proj) => proj.toString() !== id
          );
          await team.save();
        }
      })
    );

    // Remove the project from the database
    await projectModal.findByIdAndDelete(id);

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

///////////////////// Delete project by ID from a team ////////////////////
///////////////////////////////////////////////////////////////////////////
router.delete("/delete/:teamId/:projectId", verifyToken, async (req, res) => {
  try {
    const { teamId, projectId } = req.params;
    console.log(`Team ID: ${teamId}, Project ID: ${projectId}`);

    // Check if teamId and projectId are valid ObjectId
    if (
      !teamId.match(/^[0-9a-fA-F]{24}$/) ||
      !projectId.match(/^[0-9a-fA-F]{24}$/)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find the team by ID
    const team = await teamModal.findById(teamId);

    // If the team is not found, return an error
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    console.log("Found team:", team);

    // Find the index of the project in the team's teamProjects array
    const projectIndex = team.teamProjects.findIndex(
      (project) => project.toString() === projectId
    );
    console.log("Project Index:", projectIndex);

    // If the project is not found, return an error
    if (projectIndex === -1) {
      return res.status(404).json({ message: "Project not found in team" });
    }

    // Remove the project from the team's teamProjects array
    team.teamProjects.splice(projectIndex, 1);

    // Save the updated team document
    await team.save();
    console.log("Updated team saved successfully");

    res.status(200).json({
      message: "Project removed successfully",
    });
  } catch (error) {
    console.error("Error removing project:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

///////////////// Get Project Details That need to be edited //////////////
//////////////////////////////////////////////////////////////////////////
router.get("/edit/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Project ID: ${id}`);

    const project = await projectModal.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Use Promise.all to wait for all userDetails to be fetched
    const projectUsers = await Promise.all(
      project.projectUsers.map(async (user) => {
        const userDetails = await UserModal.findById(user.userId);
        return {
          user: userDetails,
          role: user.role,
        };
      })
    );
    const projectTeams = await Promise.all(
      project.projectTeams.map(async (teamId) => {
        const team = await teamModal.findById(teamId);
        return team;
      })
    );
    return res.status(200).json({
      projectName: project.projectName,
      projectUsers: projectUsers,
      projectTeams: projectTeams,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

//////////////////////// Fetch Single Project data ///////////////////////
//////////////////////////////////////////////////////////////////////////
router.get("/project-details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModal.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const projectUsers = await Promise.all(
      project.projectUsers.map(async (user) => {
        const userData = await UserModal.findById(user.userId).select(
          "email firstName lastName"
        );
        if (!userData) {
          // Log an error if userData is not found
          console.error(`User not found for userId: ${user.userId}`);
          return null;
        }
        return {
          ...user._doc, // Merge existing fields from projectUsers
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
        };
      })
    );

    const projectTeams = await Promise.all(
      project.projectTeams.map(async (teamId) => {
        const teamData = await teamModal
          .findById(teamId)
          .select("_id teamName teamUsers teamProjects");

        if (!teamData) {
          // Log an error if teamData is not found
          console.error(`Team not found for teamId: ${teamId}`);
          return null;
        }

        return {
          teamId: teamData._id,
          teamName: teamData.teamName,
          teamUsers: teamData.teamUsers,
          teamProjects: teamData.teamProjects,
        };
      })
    );

    // Filter out any null entries from the projectTeams array
    const validProjectTeams = projectTeams.filter((team) => team !== null);

    // Replace project.projectUsers with the new projectUsers array
    const updatedProject = {
      ...project._doc,
      projectUsers: projectUsers,
      projectTeams: validProjectTeams,
    };

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

//////////////////////// Update Project Details, Members, teams etc //////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
router.patch("/update/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { projectName, projectUsers } = req.body;

    // Find the project by ID
    const project = await projectModal.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update project name if provided
    if (projectName && projectName !== project.projectName) {
      project.projectName = projectName;
    }

    // Get the current project users' IDs and incoming users' IDs
    const existingUserIds = project.projectUsers.map((user) =>
      user.userId.toString()
    );
    const incomingUserIds = projectUsers.map((user) => user.userId.toString());

    // Determine users to add, update, and remove
    const usersToAdd = projectUsers.filter(
      (user) => !existingUserIds.includes(user.userId.toString())
    );
    const usersToUpdate = projectUsers.filter((user) =>
      existingUserIds.includes(user.userId.toString())
    );
    const usersToRemove = project.projectUsers.filter(
      (user) => !incomingUserIds.includes(user.userId.toString())
    );

    // Remove users from the project
    for (const user of usersToRemove) {
      const userDetails = await UserModal.findById(user.userId);
      if (userDetails) {
        userDetails.projects = userDetails.projects.filter(
          (proj) => proj.projectId.toString() !== id
        );
        await userDetails.save();
      }
    }

    // Add new users to the project
    for (const user of usersToAdd) {
      const userDetails = await UserModal.findById(user.userId);
      if (userDetails) {
        userDetails.projects.push({
          projectId: id,
          projectRole: user.role,
        });
        await userDetails.save();
      }
    }

    // Update roles for existing users
    for (const user of usersToUpdate) {
      const projectUser = project.projectUsers.find(
        (projUser) => projUser.userId.toString() === user.userId.toString()
      );
      if (projectUser) {
        projectUser.role = user.role;
      }

      const userDetails = await UserModal.findById(user.userId);
      if (userDetails) {
        const userProject = userDetails.projects.find(
          (proj) => proj.projectId && proj.projectId.toString() === id
        );
        if (userProject) {
          userProject.projectRole = user.role;
        }
        await userDetails.save();
      }
    }

    // Ensure unique users in the project
    project.projectUsers = [
      ...project.projectUsers.filter(
        (projectUser) =>
          !usersToAdd.some(
            (user) => user.userId.toString() === projectUser.userId.toString()
          )
      ),
      ...usersToAdd,
    ];

    // Remove users who are no longer part of the project
    project.projectUsers = project.projectUsers.filter((projectUser) =>
      incomingUserIds.includes(projectUser.userId.toString())
    );

    // Save the project with updated users
    await project.save();

    res.status(200).json({ message: "Project updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//////////////////////// Add to archive //////////////////////////
/////////////////////////////////////////////////////////////////
router.post("/archive/:id", verifyToken, async (req, res) => {
  console.log("Request to archive a project");
  try {
    const { id } = req.params;
    const project = await projectModal.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    project.projectStatus = "archived";
    await project.save();
    res.status(200).json({ message: "Project archived successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//////////////////////// Get Archives projects list ////////////////////////
///////////////////////////////////////////////////////////////////////
router.get("/archive", verifyToken, async (req, res) => {
  try {
    const data = await projectModal.find({ projectStatus: "archived" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

//////////////////////// Restore project from archive /////////////////////
//////////////////////////////////////////////////////////////////////////
router.post("/restore/:id", verifyToken, async (req, res) => {
  console.log("Request to restore a project");
  try {
    const { id } = req.params;
    const project = await projectModal.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project to active not found" });
    }
    project.projectStatus = "active";
    await project.save();
    res.status(200).json({ message: "Project restored successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//////////////////////// Add new members to the project //////////////////
//////////////////////////////////////////////////////////////////////////
router.put("/add-members/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { members } = req.body;
    const project = await projectModal.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Filter out existing members to avoid duplication
    const newMembers = members.filter(
      (member) =>
        !project.projectUsers.some((user) => user.userId.toString() === member)
    );

    // Add new members to the project's projectUsers array
    newMembers.forEach((member) => {
      project.projectUsers.push({ userId: member, role: "user" });
    });

    // Save the updated project
    await project.save();

    // Add the project to the new members' projects array
    for (const userId of newMembers) {
      const userDetails = await UserModal.findById(userId);
      if (userDetails) {
        userDetails.projects.push({
          projectId: id,
          projectRole: "user",
        });
        await userDetails.save();
      }
    }

    res.status(200).json({ message: "Members added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//////////////////////// Add Team To the Projecct //////////////////
///////////////////////////////////////////////////////////////////
router.put("/add-teams/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { teams } = req.body;

    const project = await projectModal.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Add each team in the teams array to the project's projectTeams array
    for (const teamId of teams) {
      // Check if the team is already added to the project
      if (project.projectTeams.includes(teamId)) {
        continue;
      }

      // Add the team to the project's projectTeams array
      project.projectTeams.push(teamId);

      // Add the project to the team's teamProjects array
      const team = await teamModal.findById(teamId);
      if (team) {
        team.teamProjects.push(id);
        await team.save();

        // Add team members to the project
        const teamUsers = team.teamUsers;
        for (const user of teamUsers) {
          const userDetails = await UserModal.findById(user.userId);
          if (userDetails) {
            const userProject = userDetails.projects.find(
              (proj) => String(proj.projectId) === String(id)
            );
            // Check if the user is already part of the project
            if (!userProject) {
              userDetails.projects.push({
                projectId: id,
                projectRole: user.teamRole,
              });
              await userDetails.save();
            }
            // Add user to the project's projectUsers array if not already added
            const projectUser = project.projectUsers.find(
              (projUser) => String(projUser.userId) === String(user.userId)
            );
            if (!projectUser) {
              project.projectUsers.push({
                userId: user.userId,
                role: user.teamRole,
                addedViaTeam: teamId,
              });
            }
          }
        }
      }
    }

    // Save the updated project
    await project.save();

    res.status(200).json({ message: "Teams and members added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//////////////////////// Update the user roles  //////////////////
//////////////////////////////////////////////////////////////////
router.put("/update-role/:id", verifyToken, async (req, res) => {
  console.log("Request to update roles of project members");
  try {
    // Get Project ID
    const { id } = req.params;

    // Get the project members with updated roles
    const { members } = req.body;
    // Find the project by ID
    const project = await projectModal.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update roles of members in the project
    members.forEach((updatedMember) => {
      const member = project.projectUsers.find(
        (m) => m.userId.toString() === updatedMember.userId
      );
      if (member) {
        member.role = updatedMember.role;
      }
    });

    // Save the updated project
    await project.save();

    // Update roles in the User model
    for (const updatedMember of members) {
      const user = await UserModal.findById(updatedMember.userId);
      if (user) {
        const projectIndex = user.projects.findIndex(
          (p) => p.projectId.toString() === id
        );
        if (projectIndex !== -1) {
          user.projects[projectIndex].projectRole = updatedMember.role;
          await user.save();
        }
      }
    }

    res.status(200).json({ message: "Roles updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//////////////////////// Remove members from the project //////////////////
//////////////////////////////////////////////////////////////////////////
router.delete(
  "/remove-member/:projectId/:id",
  verifyToken,
  async (req, res) => {
    console.log("Request to remove a member from the project");
    try {
      const { projectId, id } = req.params;

      // Find the project by ID
      const project = await projectModal.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Remove the member from the project
      const userIndex = project.projectUsers.findIndex(
        (user) => user.userId.toString() === id
      );

      if (userIndex !== -1) {
        project.projectUsers.splice(userIndex, 1);
      }

      // Save the updated project
      await project.save();

      // Update the User model
      const user = await UserModal.findById(id);
      if (user) {
        user.projects = user.projects.filter(
          (proj) => proj.projectId.toString() !== projectId
        );
        await user.save();
      }

      res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

//////////////////////// Remove team from the project //////////////////
////////////////////////////////////////////////////////////////////////
router.post(
  "/remove-team/:projectId/:teamId",
  verifyToken,
  async (req, res) => {
    console.log("Request to remove a team from the project");

    try {
      const { projectId, teamId } = req.params;

      // Find the project by ID
      const project = await projectModal.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      console.log("Project found");
      // Find the team by ID
      const team = await teamModal.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Remove the team from the project's projectTeams array
      project.projectTeams = project.projectTeams.filter(
        (id) => id.toString() !== teamId
      );
      console.log("Team Id", teamId);

      // Remove users added via this team from the project's projectUsers array
      // console.log(
      //   "Project Users",
      //   project.projectUsers.filter(
      //     (user) => user.addedViaTeam.toString() === teamId
      //   )
      // );
      const usersToRemove = project.projectUsers.filter(
        (user) => user.addedViaTeam && user.addedViaTeam.toString() === teamId
      );
      console.log("Users to remove", usersToRemove);

      project.projectUsers = project.projectUsers.filter(
        (user) =>
          user.addedViaTeam == null || user.addedViaTeam.toString() !== teamId
      );
      console.log("Project Users", project.projectUsers);

      // Save the project
      await project.save();

      // Remove the project from the team's teamProjects array
      team.teamProjects = team.teamProjects.filter(
        (id) => id.toString() !== projectId
      );
      await team.save();

      // Update each user document
      await Promise.all(
        usersToRemove.map(async (user) => {
          const userDetails = await UserModal.findById(user.userId);
          if (userDetails) {
            userDetails.projects = userDetails.projects.filter(
              (proj) => proj.projectId.toString() !== projectId
            );
            await userDetails.save();
          }
        })
      );

      res.status(200).json({
        message: "Team and associated users removed from project successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
