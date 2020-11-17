exports = function (clientId) {
  const teams = context.services.get("mongodb-atlas")
    .db("openomaha").collection("teams");
  clientId = clientId.toString();

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
        .flatMap(team => team.clients)
        .indexOf(clientId) > -1;
    }).catch(e => {
      console.log(e);
      return false;
    });
};