// This file is created by egg-ts-helper@2.1.0
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportAccount = require('../../../app/service/account');
import ExportUser = require('../../../app/service/user');

declare module 'egg' {
  interface IService {
    account: AutoInstanceType<typeof ExportAccount>;
    user: AutoInstanceType<typeof ExportUser>;
  }
}
