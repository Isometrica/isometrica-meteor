
/**
 * Schemas used to model the 'invite user' form.
 *
 * @author Steve Fortune
 */

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
  'emails': {
    type: [String],
    regEx: SimpleSchema.RegEx.Email,
    label: "Email",
    max: 500,
    isa: {
      fieldType: 'isaInvitation',
      placeholder: 'Enter an email.'
    }
  }
});
