exports = function (invites) {
  const email = context.user.data.email.toLowerCase();
  return !!invites.find(invite => invite.invitee.toLowerCase() == email);
};