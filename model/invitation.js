
/**
 * Schemas used to model the 'invite user' form.
 *
 * @author Steve Fortune
 */
Schemas.Email = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    max: 500,
    optional: true,
    isa: {
      fieldType: 'isaInvitation',
      placeholder: 'Invite a user.'
    }
  }
});
Schemas.Invitations = new SimpleSchema({
  welcomeMessage: {
    type: String,
    max : 1000,
    label: "Welcome Message",
    optional: true,
    isa: {
      fieldType: 'isaTextarea',
      placeholder: 'Enter a welcome message.'
    }
  },
  emails: {
    type: [Schemas.Email],
  }
});
