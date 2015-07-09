
describe('memberships', function() {

  describe('inviteUser', function() {

    it('should create inactive membership', function() {

      var userId = Meteor.call('registerUser', {
        profile: {
          firstName: 'Test',
          lastName: 'User'
        },
        password: 'password123',
        email: 'test@user.com'
      });
      var orgId = Organisations.insert({
        name: 'org'
      });
      var compKey = {
        userId: userId,
        organisationId: orgId
      };

      Meteor.call('inviteUser', compKey);

      var mem = Memberships.findOne(compKey);

      expect(mem).notTo.beEmpty();
      expect(mem.userId).to.equal(userId);
      expect(mem.organisationId).to.equal(orgId);
      expect(mem.isAccepted).to.beFalsy();

    });

  });

});
