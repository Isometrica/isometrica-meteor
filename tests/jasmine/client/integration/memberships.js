
describe('memberships', function() {

  var userId;
  var orgId;

  beforeAll(function(done) {
    userId = Meteor.call('registerUser', {
      profile: {
        firstName: 'Test',
        lastName: 'User'
      },
      password: 'password123',
      email: 'test@user.com'
    }, function(err, res) {
      userId = res;
      orgId = Organisations.insert({
        name: 'org'
      });
      done();
    });
  });

  beforeEach(function(done) {
    Meteor.call('clearCollection', 'Memberships', done);
  });

  describe('inviteUser', function() {

    it('should throw if membership already exists', function(done) {

      var compKey = {
        userId: userId,
        organisationId: orgId
      };
      Meteor.call('inviteUser', compKey);
      var err = Meteor.call('inviteUser', compKey, function(err, res) {
        expect(err).toBeTruthy();
        expect(err.error).toBe('not-found');
        expect(err.reason).toBe('Membership already exists');
        done();
      });

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
