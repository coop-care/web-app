exports = function (teamMemberUserId) {
  const teams = context.services.get("mongodb-atlas")
    .db("openomaha").collection("teams");
  const email = (context.user.data.email || "").toLowerCase();

  return teams
    .find({
      $or: [
        { admins: teamMemberUserId },
        { members: teamMemberUserId }
      ]
    }, {})
    .toArray()
    .then(teams => {
      return !!teams.find(team =>
        team.admins.concat(team.members).indexOf(context.user.id) >= 0 ||
        !!team.invites.find(invitation => invitation.invitee == email)
      );
    }).catch(e => {
      console.log(e);
      return false;
    });
};