// This file is created by egg-ts-helper@2.1.0
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExtendRequest = require('../../../app/extend/request');
type ExtendRequestType = typeof ExtendRequest;
declare module 'egg' {
  interface Request extends ExtendRequestType { }
}