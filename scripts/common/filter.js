'use strict';
OSC
//current date
.filter('currentdate', [ '$filter', function($filter) {
  return function(input) {
    return $filter('date')(input,"dd/MM/yyyy");
  };
} ])


