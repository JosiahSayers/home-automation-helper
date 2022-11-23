export const inviteUserToGroup = async (groupId: string, inviterId: string, inviteeEmail: string): Promise<boolean> => {
  // figure out if inviter has access to group
  // figure out if invitee is in group
  // setup group invite record
  // figure out if invitee has an account
  // - No account
  //     send email inviting user to create an account
  // - Account
  //     Send push notification about group invite if available
  //     Send email about group invite if push not available
};
