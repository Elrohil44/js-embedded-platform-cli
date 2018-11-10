"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Permission;
(function (Permission) {
    Permission[Permission["READABLE"] = 0] = "READABLE";
    Permission[Permission["WRITABLE"] = 1] = "WRITABLE";
    Permission[Permission["EXECUTABLE"] = 2] = "EXECUTABLE";
    Permission[Permission["DELETABLE"] = 3] = "DELETABLE";
})(Permission = exports.Permission || (exports.Permission = {}));
var LwM2MObject = /** @class */ (function () {
    function LwM2MObject() {
        this.instances = [];
    }
    return LwM2MObject;
}());
exports.LwM2MObject = LwM2MObject;
var LwM2MObjectInstance = /** @class */ (function () {
    function LwM2MObjectInstance() {
    }
    return LwM2MObjectInstance;
}());
exports.LwM2MObjectInstance = LwM2MObjectInstance;
var Resource = /** @class */ (function () {
    function Resource() {
    }
    return Resource;
}());
exports.Resource = Resource;
var ServerObject = /** @class */ (function (_super) {
    __extends(ServerObject, _super);
    function ServerObject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 1;
        _this.singleton = false;
        _this.name = 'Server';
        return _this;
    }
    return ServerObject;
}(LwM2MObject));
exports.ServerObject = ServerObject;
var ServerObjectInstance = /** @class */ (function (_super) {
    __extends(ServerObjectInstance, _super);
    function ServerObjectInstance() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.permissions = [
            Permission.DELETABLE,
            Permission.READABLE,
            Permission.WRITABLE,
        ];
        _this.resources = [{
                id: 0,
                name: 'Short Server Id',
                permissions: [Permission.READABLE],
            }, {
                id: 1,
                name: 'Lifetime',
                permissions: [Permission.READABLE, Permission.WRITABLE],
            }, {
                id: 2,
                name: 'Default Minimum Period',
                permissions: [Permission.READABLE, Permission.WRITABLE],
            }, {
                id: 3,
                name: 'Default Maximum Period',
                permissions: [Permission.READABLE, Permission.WRITABLE],
            }, {
                id: 4,
                name: 'Disable',
                permissions: [Permission.EXECUTABLE],
            }, {
                id: 5,
                name: 'Disable Timeout',
                permissions: [Permission.READABLE, Permission.WRITABLE],
            }, {
                id: 6,
                name: 'Notification Storing When Disabled or Offline',
                permissions: [Permission.READABLE, Permission.WRITABLE],
            }, {
                id: 7,
                name: 'Binding',
                permissions: [Permission.READABLE, Permission.WRITABLE],
            }, {
                id: 8,
                name: 'Registration Update Trigger',
                permissions: [Permission.EXECUTABLE],
            }];
        return _this;
    }
    return ServerObjectInstance;
}(LwM2MObjectInstance));
exports.ServerObjectInstance = ServerObjectInstance;
var DeviceObject = /** @class */ (function (_super) {
    __extends(DeviceObject, _super);
    function DeviceObject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 3;
        _this.name = 'Device';
        _this.singleton = true;
        return _this;
    }
    return DeviceObject;
}(LwM2MObject));
exports.DeviceObject = DeviceObject;
var DeviceObjectInstance = /** @class */ (function (_super) {
    __extends(DeviceObjectInstance, _super);
    function DeviceObjectInstance() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.permissions = [
            Permission.READABLE,
            Permission.WRITABLE,
        ];
        _this.resources = [{
                id: 0,
                name: 'Manufacturer',
                permissions: [Permission.READABLE],
            }, {
                id: 1,
                name: 'Model Number',
                permissions: [Permission.READABLE],
            }, {
                id: 2,
                name: 'Serial Number',
                permissions: [Permission.READABLE],
            }, {
                id: 3,
                name: 'Firmware Version',
                permissions: [Permission.READABLE],
            }, {
                id: 4,
                name: 'Reboot',
                permissions: [Permission.EXECUTABLE],
            }, {
                id: 5,
                name: 'Factory Reset',
                permissions: [Permission.EXECUTABLE],
            }, {
                id: 6,
                name: 'Available Power Sources',
                permissions: [Permission.READABLE],
            }, {
                id: 7,
                name: 'Power Source Voltage',
                permissions: [Permission.READABLE],
            }, {
                id: 8,
                name: 'Power Source Current',
                permissions: [Permission.READABLE],
            }, {
                id: 9,
                name: 'Battery Level',
                permissions: [Permission.READABLE],
            }, {
                id: 10,
                name: 'Memory Free',
                permissions: [Permission.READABLE],
            }, {
                id: 11,
                name: 'Error Code',
                permissions: [Permission.READABLE],
            }, {
                id: 12,
                name: 'Reset Error Code',
                permissions: [Permission.EXECUTABLE],
            }, {
                id: 13,
                name: 'Current Time',
                permissions: [Permission.READABLE, Permission.WRITABLE],
            }, {
                id: 14,
                name: 'UTC Offset',
                permissions: [Permission.READABLE, Permission.WRITABLE],
            }, {
                id: 15,
                name: 'Timezone',
                permissions: [Permission.READABLE, Permission.WRITABLE],
            }, {
                id: 16,
                name: 'Supported Binding and Modes',
                permissions: [Permission.READABLE],
            }, {
                id: 17,
                name: 'Device Type',
                permissions: [Permission.READABLE],
            }, {
                id: 18,
                name: 'Hardware Version',
                permissions: [Permission.READABLE],
            }, {
                id: 19,
                name: 'Software Version',
                permissions: [Permission.READABLE],
            }, {
                id: 20,
                name: 'Battery Status',
                permissions: [Permission.READABLE],
            }, {
                id: 21,
                name: 'Memory Total',
                permissions: [Permission.READABLE],
            }, {
                id: 22,
                name: 'ExtDevInfo',
                permissions: [Permission.READABLE],
            }];
        return _this;
    }
    return DeviceObjectInstance;
}(LwM2MObjectInstance));
exports.DeviceObjectInstance = DeviceObjectInstance;
var FirmwareUpdateObject = /** @class */ (function (_super) {
    __extends(FirmwareUpdateObject, _super);
    function FirmwareUpdateObject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 5;
        _this.name = 'Firmware Update';
        _this.singleton = true;
        return _this;
    }
    return FirmwareUpdateObject;
}(LwM2MObject));
exports.FirmwareUpdateObject = FirmwareUpdateObject;
var FirmwareUpdateObjectInstance = /** @class */ (function (_super) {
    __extends(FirmwareUpdateObjectInstance, _super);
    function FirmwareUpdateObjectInstance() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.permissions = [
            Permission.READABLE,
            Permission.WRITABLE,
        ];
        _this.resources = [{
                id: 0,
                name: 'Package',
                permissions: [Permission.WRITABLE],
            }, {
                id: 1,
                name: 'Package URI',
                permissions: [Permission.READABLE, Permission.WRITABLE],
            }, {
                id: 2,
                name: 'Update',
                permissions: [Permission.EXECUTABLE],
            }, {
                id: 3,
                name: 'State',
                permissions: [Permission.READABLE],
            }, {
                id: 5,
                name: 'Update Result',
                permissions: [Permission.READABLE],
            }, {
                id: 6,
                name: 'PkgName',
                permissions: [Permission.READABLE],
            }, {
                id: 7,
                name: 'PkgVersion',
                permissions: [Permission.READABLE],
            }, {
                id: 8,
                name: 'Firmware Update Protocol Support',
                permissions: [Permission.READABLE],
            }, {
                id: 9,
                name: 'Firmware Update Delivery Method',
                permissions: [Permission.READABLE],
            }];
        return _this;
    }
    return FirmwareUpdateObjectInstance;
}(LwM2MObjectInstance));
exports.FirmwareUpdateObjectInstance = FirmwareUpdateObjectInstance;
exports.OBJECT_MAPPING = {
    1: {
        object: ServerObject,
        objectInstance: ServerObjectInstance,
    },
    3: {
        object: DeviceObject,
        objectInstance: DeviceObjectInstance,
    },
    5: {
        object: FirmwareUpdateObject,
        objectInstance: FirmwareUpdateObjectInstance,
    },
};
