'use strict';

angular
  .module('isa.addressbook')
  .directive('isaProfileImg', isaProfileImgDirective);

/**
 * @note To display profile images, a subscription to 'isaProfileImages'
 * must exist. Its recommended that you subscribe to this either in your
 * controller or at the route level.
 *
 * @param user  The user object from which to grab the profile image, or
 *              a user id.
 * @param url   Pass a `url` to the directive to override the image
 *              displayed entirely
 */
function isaProfileImgDirective() {
  return {
    restrict: 'E',
    replace: true,
    link: function(scope, elm) {
      if (scope.userId) {
        scope.user = scope.$meteorObject(Meteor.users, scope.userId).profile;
      }
      scope.$meteorAutorun(function() {
        scope.image = IsaProfileImages.findOne(scope.getReactively('user.photo._id'));
      });
    },
    templateUrl: 'client/addressBook/view/profileImg.ng.html',
    scope: {
      grey: '=',
      user: '=',
      userId: '=',
      url: '='
    }
  };
}
