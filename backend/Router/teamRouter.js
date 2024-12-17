const mongoose = require("mongoose");
const router = require("express").Router();
const teamModal = require("../Modals/teamModal");
const userModel = require("../Modals/UserModal");
const projectModal = require("../Modals/projectModal");
const dotenv = require("dotenv");
const { verifyToken } = require("./verifyToken");
dotenv.config();

////////////////////////// Create a new team ///////////////////////
///////////////////////////////////////////////////////////////////
router.post("/create", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      teamName,
      teamUsers,
      teamProjects,
      permissions,
      subPermissions,
      teamStatus,
      teamStartDate,
    } = req.body;

    // Create new team
    const newTeam = new teamModal({
      teamName,
      teamUsers,
      teamProjects,
      permissions,
      subPermissions,
      teamStatus,
      teamStartDate,
    });

    const savedTeam = await newTeam.save({ session });

    // Update each user with the new team ID and role
    for (const user of teamUsers) {
      await userModel.findByIdAndUpdate(
        user.userId,
        {
          $push: {
            teams: {
              teamId: savedTeam._id,
              teamRole: user.teamRole,
              isTeamLead: user.isTeamLead,
            },
          },
        },
        { session }
      );
    }

    // Update each project with the new team ID and add team members to the project
    for (const projectId of teamProjects) {
      // Add team ID to project
      await projectModal.findByIdAndUpdate(
        projectId,
        {
          $push: {
            projectTeams: savedTeam._id,
          },
        },
        { session }
      );

      // Add each team member to the projectUsers list, avoiding duplication
      for (const user of teamUsers) {
        const project = await projectModal.findById(projectId).session(session);

        const isUserInProject = project.projectUsers.some(
          (projectUser) =>
            projectUser.userId.toString() === user.userId.toString()
        );

        if (!isUserInProject) {
          await projectModal.findByIdAndUpdate(
            projectId,
            {
              $push: {
                projectUsers: {
                  userId: user.userId,
                  role: user.teamRole,
                  addedViaTeam: savedTeam._id,
                },
              },
            },
            { session }
          );
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Team Created Successfully",
      data: savedTeam,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: err.message,
    });
  }
});

////////////////////////// Get all teams //////////////////////////
///////////////////////////////////////////////////////////////////
router.get("/get-all", async (req, res) => {
  try {
    const data = await teamModal.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

/////////////////////// Delete team by ID ////////////////////////
//////////////////////////////////////////////////////////////////
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const team = await teamModal.findById(id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    await userModel.updateMany(
      { "teams.teamId": id },
      { $pull: { teams: { teamId: id } } },
      { session }
    );

    await projectModal.updateMany(
      { projectTeams: id },
      { $pull: { projectTeams: id } },
      { session }
    );

    await projectModal.updateMany(
      { "projectUsers.addedViaTeam": id },
      { $pull: { projectUsers: { addedViaTeam: id } } },
      { session }
    );

    await teamModal.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Team Deleted Successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: err.message,
    });
  }
});

/////////////////////// Get team details by ID ////////////////////////
///////////////////////////////////////////////////////////////////////
router.get("/team-id/:id", async (req, res) => {
  try {
    // Fetch the team by ID
    const team = await teamModal.findById(req.params.id);

    // If the team is not found, return an error
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Fetch user data for each user in the team
    const teamData = await Promise.all(
      team.teamUsers.map(async (user) => {
        const userData = await userModel.findById(user.userId);

        // If the user is not found, return an error
        if (!userData) {
          throw new Error(`User with ID ${user.userId} not found`);
        }

        // Combine the user data with the relevant team data
        return {
          _id: userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          teamRole: user.teamRole,
          isTeamLead: user.isTeamLead,
        };
      })
    );

    const teamProjects = await Promise.all(
      team.teamProjects.map(async (projectId) => {
        const projectData = await projectModal.findById(projectId);
        if (!projectData) {
          console.log(`Project with ID ${projectId} not found`);
          return null;
        }
        return {
          _id: projectData._id,
          projectName: projectData.projectName,
          projectManager: projectData.projectManager,
          projectMembers: projectData.projectMembers,
          projectTeams: projectData.projectTeams,
          projectStatus: projectData.projectStatus,
          projectStartDate: projectData.projectStartDate,
          projectEndDate: projectData.projectEndDate,
        };
      })
    );

    // Return the combined data as the response
    res.status(200).json({
      teamName: team.teamName,
      teamId: team._id,
      teamData: teamData,
      teamProjects: teamProjects,
      permissions: team.permissions,
      subPermissions: team.subPermissions,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
});

/////////////////////// Delete Member by ID //////////////////////
//////////////////////////////////////////////////////////////////
router.delete("/delete-member/:teamId/:userId", async (req, res) => {
  const { teamId, userId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const team = await teamModal.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const userIndex = team.teamUsers.findIndex(
      (user) => user.userId.toString() === userId
    );

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found in team" });
    }

    team.teamUsers.splice(userIndex, 1);
    await team.save({ session });

    await userModel.findByIdAndUpdate(
      userId,
      { $pull: { teams: { teamId } } },
      { session }
    );

    await projectModal.updateMany(
      { "projectUsers.userId": userId, "projectUsers.addedViaTeam": teamId },
      { $pull: { projectUsers: { userId, addedViaTeam: teamId } } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "User removed from team successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: err.message,
    });
  }
});

/////////////////////////// Update team Data ///////////////////////
////////////////////////////////////////////////////////////////////
router.put("/update-members/:teamId", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { teamUsers } = req.body;
    const teamId = req.params.teamId;

    const team = await teamModal.findById(teamId).session(session);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const updatedUserIds = teamUsers.map((user) => user.userId);
    const currentTeamUserIds = team.teamUsers.map((user) =>
      user.userId.toString()
    );

    // Update each user's team information in the user model
    for (const user of teamUsers) {
      await userModel.updateOne(
        { _id: user.userId, "teams.teamId": teamId },
        {
          $set: {
            "teams.$.teamRole": user.teamRole,
            "teams.$.isTeamLead": user.isTeamLead,
          },
        },
        { upsert: true, session }
      );
    }

    // Ensure that users not in the updated list are removed from the team
    await userModel.updateMany(
      { _id: { $nin: updatedUserIds }, "teams.teamId": teamId },
      { $pull: { teams: { teamId: teamId } } },
      { session }
    );

    // Identify new members added to the team
    const newMembers = teamUsers.filter(
      (user) => !currentTeamUserIds.includes(user.userId)
    );

    // Add new members to the projects that the team is a part of
    console.log(team.teamProjects);
    for (const projectId of team.teamProjects) {
      for (const newUser of newMembers) {
        await projectModal.findByIdAndUpdate(
          projectId,
          console.log(projectId),
          {
            $push: {
              projectUsers: {
                userId: newUser.userId,
                role: newUser.teamRole,
                addedViaTeam: teamId,
              },
            },
          },
          { session }
        );
      }
    }

    // Remove members from projects if they are removed from the team
    const removedMembers = team.teamUsers.filter(
      (user) => !updatedUserIds.includes(user.userId.toString())
    );
    for (const projectId of team.teamProjects) {
      for (const removedUser of removedMembers) {
        await projectModal.findByIdAndUpdate(
          projectId,
          {
            $pull: {
              projectUsers: {
                userId: removedUser.userId,
                addedViaTeam: teamId,
              },
            },
          },
          { session }
        );
      }
    }

    // Update the team document
    team.teamUsers = teamUsers;
    await team.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Team members updated successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
});

/////////////////////////// Add Team Members ///////////////////////
////////////////////////////////////////////////////////////////////
router.put("/add-members/:teamId", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { teamUsers } = req.body;
    const { teamId } = req.params;

    if (!Array.isArray(teamUsers)) {
      return res.status(400).json({ message: "teamUsers must be an array" });
    }

    const team = await teamModal.findById(teamId).session(session);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Filter out users who are already in the team
    const existingUserIds = team.teamUsers.map((user) =>
      user.userId.toString()
    );
    const newUsers = teamUsers.filter(
      (user) => !existingUserIds.includes(user.userId)
    );

    // If there are no new users to add, respond with a message
    if (newUsers.length === 0) {
      return res
        .status(400)
        .json({ message: "All users are already members of the team" });
    }

    // Use the filtered newUsers array here
    const formattedTeamUsers = newUsers.map((user) => ({
      userId: new mongoose.Types.ObjectId(user.userId),
      isTeamLead: user.isTeamLead,
      teamRole: user.teamRole,
    }));

    // Update the team with only new users
    team.teamUsers = team.teamUsers.concat(formattedTeamUsers);
    await team.save({ session });

    // Update each user's teams field
    for (const user of newUsers) {
      await userModel.findByIdAndUpdate(
        user.userId,
        {
          $push: {
            teams: {
              teamId: team._id,
              teamRole: user.teamRole,
              isTeamLead: user.isTeamLead,
            },
          },
        },
        { session }
      );
    }

    // Add new team members to the projects that the team is part of
    for (const projectId of team.teamProjects) {
      for (const newUser of formattedTeamUsers) {
        await projectModal.findByIdAndUpdate(
          projectId,
          {
            $push: {
              projectUsers: {
                userId: newUser.userId,
                role: newUser.teamRole,
                addedViaTeam: teamId,
              },
            },
          },
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message:
        "Team members added successfully and updated in associated projects",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
});

/////////////////////////// Add Project to the team ///////////////////
///////////////////////////////////////////////////////////////////////
router.put("/add-project/:teamId", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { projects } = req.body;

    if (!Array.isArray(projects)) {
      return res.status(400).json({ message: "projects must be an array" });
    }

    const team = await teamModal.findById(req.params.teamId).session(session);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Add projects to team
    team.teamProjects = team.teamProjects.concat(projects);
    await team.save({ session });

    // Update each project to include the team and its users
    for (const projectId of projects) {
      // Add team to the project's team list
      await projectModal.findByIdAndUpdate(
        projectId,
        {
          $push: {
            projectTeams: team._id, // Add team ID to projectTeams
            projectUsers: {
              $each: team.teamUsers.map((user) => ({
                userId: user.userId,
                role: user.teamRole,
                addedViaTeam: team._id,
              })),
            },
          },
        },
        { session }
      );

      // Add each user to the project's users list
      for (const teamUser of team.teamUsers) {
        await userModel.findByIdAndUpdate(
          teamUser.userId,
          {
            $push: {
              projects: {
                projectId: projectId,
                role: teamUser.teamRole,
                addedViaTeam: team._id,
              },
            },
          },
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: "Projects added to team and users successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
});

/////////////////////////// Fetch invites from team ///////////////////
///////////////////////////////////////////////////////////////////////
router.get("/invites/:teamId", verifyToken, async (req, res) => {
  try {
    const team = await teamModal.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const pendingInvites = await userModel.find({
      "teams.teamId": req.params.teamId,
      invitationStatus: "pending",
    });

    const invitesWithStatus = pendingInvites.map((invite) => {
      if (invite.registrationTokenExpiry <= Date.now()) {
        return {
          ...invite.toObject(),
          invitationStatus: "expired",
        };
      }
      return invite;
    });

    res.status(200).json(invitesWithStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/////////////////////////// Get Onboarding for Team ///////////////////
///////////////////////////////////////////////////////////////////////
router.get("/onboarding/:teamId", verifyToken, async (req, res) => {
  try {
    const team = await teamModal.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const teamUsers = await userModel.find({
      "teams.teamId": req.params.teamId,
    });

    res.status(200).json(teamUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

////////////////////////// Update team permission /////////////////////
///////////////////////////////////////////////////////////////////////
router.put("/update-permissions/:teamId", verifyToken, async (req, res) => {
  // try {
  const { teamId } = req.params;
  const { permissions, subPermissions } = req.body;
  console.log(req.body);

  const team = await teamModal.findById(teamId);

  if (!team) {
    return res.status(404).json({ message: "Team not found" });
  }

  // Update team permissions and subPermissions
  const updatedTeam = await teamModal.findByIdAndUpdate(teamId, {
    $set: {
      permissions: permissions,
      subPermissions: subPermissions,
    },
  });

  res.status(200).json(updatedTeam);
  // } catch (err) {
  //   console.error("Error updating team permissions:", err);
  //   res.status(500).json({ message: err.message });
  // }
});

module.exports = router;
