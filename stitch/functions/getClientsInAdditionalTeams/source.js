exports = function (clientIds, teamIds) {
  const teams = context.services.get("mongodb-atlas")
    .db("openomaha").collection("teams");

  return teams
    .find({
      clients: {
        $in: clientIds
      },
    }, {})
    .toArray()
    .then(teams => {
      return teams
        .flatMap(team => teamIds.indexOf(team._id.toString()) < 0 ? team.clients : [])
        .filter(clientId => clientIds.indexOf(clientId) >= 0);
    }).catch(e => {
      console.log(e);
      return false;
    });
};