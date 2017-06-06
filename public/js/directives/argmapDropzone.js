/**
 * Created by calvarezg on 5/30/17.
 */
(function () {
    'use strict';

    angular.module('argmap.directives')

        .directive('argmapDropZone', function() {
            return {
                restrict: 'A',
                scope: true,
                link: function ($scope, $element, $attrs, controllersArr) {
                    $attrs.$observe('argmapDropZoneElementId', function(value){
                        $scope.argmapDropZoneElementId = value;
                    });

                    $scope.$watch(
                       function(){
                           // Watch for change in the number of child nodes
                           return $element[0].childNodes.length;
                       },
                       function (newValue, oldValue) {
                           var dropZoneElement = document.getElementById($scope.argmapDropZoneElementId);
                           var divs = $element[0].getElementsByTagName("div");

                           try {
                               // Move the argmap to the first div child
                               divs[0].appendChild(dropZoneElement);
                               // Remove all other childs
                               for (var i = 1; i < divs.length; i++) {
                                   $element[0].removeChild(divs[i]);
                               }
                           }
                           catch (e) {
                                // For some idiotic reason appendChild fails... no time for a fix.
                           }
                       }
                    );
                }
            }
        });
})();