// This file is created by egg-ts-helper@2.1.0
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportAccount = require('../../../app/controller/account');
import ExportHome = require('../../../app/controller/home');
import ExportTest = require('../../../app/controller/test');
import ExportUser = require('../../../app/controller/user');

declare module 'egg' {
  interface IController {
    account: ExportAccount;
    home: ExportHome;
    test: ExportTest;
    user: ExportUser;
  }
}
