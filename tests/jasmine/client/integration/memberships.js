
describe('memberships', function() {

  var userIds;
  var orgId;

  beforeAll(function() {
    userIds = [];
    for (var i = 0; i < 10; ++i) {
      userIds[i] = Meteor.call('registerUser', {
        profile: {
          firstName: 'Test' + i,
          lastName: 'User'
        },
        password: 'password123',
        email: i + 'test@user.com'
      });
    }
    orgId = Organisations.insert({
      name: 'org'
    });
  });

  afterEach(function() {
    Meteor.call('clearCollection', 'Memberships');
  });

  describe('inviteUser', function() {

    it('should create inactive membership', function() {

      var userId = userIds[0];
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

      console.log(userIds);
      console.log(mem);

    });

  });

});
