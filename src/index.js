import angular from 'angular';

import {rxSubscribeDirective} from './directive.js';

export const module = angular.module('rxSubscribe', []);

module.directive('rxSubscribe', rxSubscribeDirective);
