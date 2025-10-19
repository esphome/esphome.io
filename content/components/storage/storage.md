---
description: "Interface for storage devices."
title: "Storage"
params:
  seo:
    description: Information about base storage device interface.
    image: fatfs.svg
---

Storage is the API for different kind of devise for save and retrive datas. It can be used for read and write data blocks, but primary target is to use as device driver for filesystems library.

{{< anchor "storage-base-config" >}}

## Base Stroage Configuration

Each Storage device represented by the platform component with coresponding type. Each platform type inherits parameters from storage configuration schema.

```yaml

storage:
  - platform: ...
    ...
  - platform: ...
    ...
    
```

**Configuration variables:**

- **platform** (**Required**, [platform](#platforms-storage)): One of the supported storage [Platforms](#platforms-storage).
- **id** (*Optional*, [ID](#config-id)): Manually specify the ID used for code generation.
- **cd_pin** (*Optional*, [Pin Schema](#config-pin_schema)): The pin used for storage media detect in case it is a removable media like sdcard. CD pin used in some card holders.

{{< anchor "storage-is_pressent-condition" >}}

## Exist Condition

This is an condition for checking if file or directory by are present. File pointed by its path path.

```yaml
- if:
    condition:
      - storage.is_present: storage_1
    then:
    ...
```

Configuration variables:

- **id** (**Required**, [ID](#config-id)): The ID of storage component

{{< anchor "storage-lambda-calls" >}}

### lambda calls

From [lambdas](#config-lambda), you can call several methods on all storage objects to do some
advanced stuff.
Attributes: All storage devices have  forlowing attributes 
```cpp
  // Initialize device
  id(my_fatfs).initialize()
  // Read sectors
  id(my_fatfs).read_sectors(path) 
  // wriet sectors
  id(my_fatfs).write_sectors(buff*, bloack, count)
  // Reset initialization status
  id(my_fatfs).reset(path,mode) 
  // Return true if media present
  id(my_fatfs).state_media() 
  // Id drives iitialized
  id(my_fatfs).state_init() 
  // return error of last operation
  id(my_fatfs).error(path) 

```

## See Also

- {{< apiref "Component" "esphome/core/component.h" >}}
- {{< apiref "api" "content/components/api.md">}}
- {{< apiref "storage" "esphome/components/storage/storage.h">}}
