export enum Permission {
  READABLE,
  WRITABLE,
  EXECUTABLE,
  DELETABLE,
}

export class LwM2MObject {
  id: number;
  singleton: boolean;
  instances: LwM2MObjectInstance[] = [];
}

export class LwM2MObjectInstance {
  id: number;
  permissions: Permission[];
  resources: Resource[];
}

export class Resource {
  id: number;
  name?: string;
  permissions: Permission[];
  value?: any;
}

export class ServerObject extends LwM2MObject {
  id = 1;
  singleton = false;
  name = 'Server';
  instances: ServerObjectInstance[];
}

export class ServerObjectInstance extends LwM2MObjectInstance {
  permissions = [
    Permission.DELETABLE,
    Permission.READABLE,
    Permission.WRITABLE,
  ];
  resources: Resource[] = [{
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
}

export class DeviceObject extends LwM2MObject {
  id = 3;
  name = 'Device';
  singleton = true;
  instances: DeviceObjectInstance[];
}

export class DeviceObjectInstance extends LwM2MObjectInstance {
  permissions = [
    Permission.READABLE,
    Permission.WRITABLE,
  ];
  resources: Resource[] = [{
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
}

export class FirmwareUpdateObject extends LwM2MObject {
  id = 5;
  name = 'Firmware Update';
  singleton = true;
  instances: FirmwareUpdateObjectInstance[];
}

export class FirmwareUpdateObjectInstance extends LwM2MObjectInstance {
  permissions = [
    Permission.READABLE,
    Permission.WRITABLE,
  ];
  resources: Resource[] = [{
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
}

export const OBJECT_MAPPING = {
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