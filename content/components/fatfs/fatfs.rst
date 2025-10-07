Fatfs Component
===============

.. seo::
    :description: Information about the base representation of all FATfs devices.
    :image: folder-open.svg


FATFS is the API for files and directory access storage devices with FAT filesystems.  


Base fatfs Configuration
------------------------

 Each FATFS device represented by the platform component with coresponding type. 
 Each platform type inherits parameters from fatfs configuration schema.
 
 .. code-block:: yaml

    fatfs:
      - platform: ...
        ...
      - platform: ...
        ...

.. _config-fatfs:

Configuration variables:
^^^^^^^^^^^^^^^^^^^^^^^^

- **platform** (**Required**, :ref:`platform<platforms-canbus>`): One of the supported fatfs [Platforms](#platforms-fatfs).
- **id** (*Optional*, :ref:`ID<config-id>`): Manually specify the ID used for code generation.
- **drive_id** (*Optional*, string): Manually specify the mounted ID in range: 0-10
- **cd_pin** (*Optional*, :ref:`PIN<config-pin_schema>` ): The pin used for storage media detect in case it removasle media like sdcard. CD pin used in some card holders

.. _fatfs-exist_condition:

Exist Condition
---------------

This is an condition for checking if file or directory by are present. 
File pointed by its path path.

 .. code-block:: yaml

    - if:
      condition:
        - sdfs.is_exist:
            id: fatfs_id
            path: "/"
      then:
      ...

Configuration variables:
^^^^^^^^^^^^^^^^^^^^^^^^

    - **id** (**Required**, :ref:`ID<config-id>`): The ID of the fatfs device.
    - **path** (*Required*, string, :ref:`templatable<config-templatable>`): path for fs object to check for existing


lambda calls
------------

From [lambdas](#config-lambda), you can call several methods on all fatfs objects to do some
advanced stuff.

- Attributes: All fatfs devices have  attributes to get access to files and directory

 .. code-block:: cpp

        // Check if FS mounted
    id(my_fatfs).is_mount()
    // Get Filesystems object info
    id(my_fatfs).get_info(path) 
    // if path exist
    id(my_fatfs).is_exist(path)
    // Open file by path
    id(my_fatfs).open_file(path,mode) 
    // open file by fs info object
    id(my_fatfs).open_file(obj,mode) 
    // open dir for contents listing by path
    id(my_fatfs).open_dir(path) 
    // open dir for contents listing by info object
    id(my_fatfs).open_dir(obj) 
    // create directory
    id(my_fatfs).mk_dir(path) 
    // create directory as child for file info object
    id(my_fatfs).mk_dir(obj,name) 
    // delete file
    id(my_fatfs).del(path) 
    // rename fs objects 
    id(my_fatfs).rename(path_from,path_to)


See Also
--------

- apiref :ref:`fatfs/fatfs.h <fatfs/fatfs.h>`
