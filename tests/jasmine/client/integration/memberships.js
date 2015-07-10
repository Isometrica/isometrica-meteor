
describe('memberships', function() {

  var userId;
  var orgId;

  beforeAll(function() {
    userId = Meteor.call('registerUser', {
      profile: {
        firstName: 'Test',
        lastName: 'User'
      },
      password: 'password123',
      email: 'test@user.com'
    });
    orgId = Organisations.insert({
      name: 'org'
    });
  });

  afterEach(function() {
    Meteor.call('clearCollection', 'Memberships');
  });

  describe('inviteUser', function() {

    it('should throw if membership already exists', function() {

      var compKey = {
        userId: userId,
        organisationId: orgId
      };
      Meteor.call('inviteUser', compKey);
      var err = Meteor.call('inviteUser', compKey);
      expect(err.error).toBe('not-found');
      expect(err.reason).toBe('Membership already exists');

    });

    it('should create inactive membership', function() {

      var compKey = {
        userId: userId,
        organisationId: orgId
      };

      Meteor.call('inviteUser', compKey);

      var mem = Memberships.findOne(compKey);

      expect(mem).toBeTruthy();
      expect(mem.userId).toBe(userId);
      expect(mem.organisationId).toBe(orgId);
      expect(mem.isAccepted).toBeFalsy();

    });

  });

});
