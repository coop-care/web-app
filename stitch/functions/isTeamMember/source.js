exports = function (teamMemberUserId) {
  const teams = context.services.get("mongodb-atlas")
    .db("openomaha").collection("teams");

  return teams
    .find({
      $or: [
        { admins: context.user.id },
        { members: context.user.id },
      ]
    }, {})
    .toArray()
    .then(teams => {
      return teams
        .flatMap(team => team.admins.concat(team.members))
        .indexOf(teamMemberUserId) > -1;
    }).catch(e => {
      console.log(e);
      return false;
    });
};