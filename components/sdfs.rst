Sdfs Component
==============

.. https://github.com/abel-msk/esphome-docs/tree/next

.. seo::
    :description: Instructions for setting up sdfs components in ESPHome.
    :image: folder-open.svg

With this component it is possible to access  SD, SDHC or MMC card  and mount filesystem on it.
Cdfs can mount FAT12, FAT16 and ExFAT.
Files on filesystems can be wrirtten trought automation actions or accessed in CPP code from other components.

Component support sd card access over spi or mmc protocol.

.. note::

  - MMC communication available only on ESP platforms witch support MMC_HOST. Typicaly ESP32-S3 and ESP32.
    On otehr ESP platfor it is possibe access to cart through SPI interface.
  - Both MMC and SPI comminication available with arduino and idf frameworks.

Component support insertion/ejection of the card in card holder.  
For this purposes component pereodicly check card state.   
Check frequency defined with polling interval. If card found it try to mount FS.   
In case the card holder equiped addition pin for card detection card state will detect immediately with 
wait for poll interval expired.
If filesystem not found or unknown component it does not mount and **does not** formating the card. 
So you data (if any) will not be deleted. 

During check the card in holder, component will change card status depends of is card are present and is 
filesystem is mounted.
See :ref:`on_state<sdfs-on_state>` for states description.

.. _config-sdfs:

Base sdfs Configuration
-----------------------

Configuration Sdfs depends on communication type you select. So main option is the `type` witch can 
be `sdmmc` os `sdspi`. For *sdspi* you need just id of spi configuration. 

.. code-block:: yaml

    spi:
      id: spi_id
      # ...
    sdfs:
      type: "sdspi"
      spi_id: spi_id
      cs_pin: GPIOXX

For *sdmmc*  communication you have to define all comminication pins. 

.. code-block:: yaml

    sdfs:
      type: "sdmmc"
      bus_width: "1bit"
      clk_pin: GPIOXX
      cmd_pin: GPIOXX
      data0_pin: GPIOXX


Common configuration variables:
*******************************

- **id** (*Required*, string): Manually specify the ID for code generation.
- **type** (*Required*, string): `sdspi` or `sdmmc`
- **mountpoint** (*Optional*, string): internal mount point forconstruc full path to filesystems objects. 
  Actualy does not required.
- **cd_pin** (*Optional*, pin): The card detect ESP pin.  If sdcard accessed through card holders with 
  addition ping for card detection.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to check is card present. Defaults to ``10s``.

sdfs variables:
***************

- **spi_id** (*Required*, :ref:`config-id`): Manually specify the ID of the :ref:`SPI Component <spi>` if you want
  to use multiple SPI buses.
- All other options from :ref:`SPI Component <spi>`.

sdmmc variables:
****************

- **bus_width** (*Optional*, string): mmc bus width `1bit` or `4bit`.  
  1bit width required only one data line connected on pin `data0-pin`. 4bit width requires four data lines 
  conected to `data0-pin`, `data1-pin`, `data2-pin`, `data3-pin` respectively. Default is `1bit`.
- **bus_slot** (*Optional*, string): sdmmc host slot on the chip. Usualy slot 0 is used for flash memory access.
  so in most cases you need slot 1, witch is default.
- **cmd_pin** (*Required*, pin): CMD line pin.
- **clk_pin** (*Required*, pin): clock line pin.
- **data0_pin** (*Required*, pin):  data0 line pin used in 1bit and 4bit bus width.
- **data1_pin** (*Optional*, pin):  data1 line pin used in 4bit bus width.
- **data2_pin** (*Optional*, pin):  data2 line pin used in 4bit bus width.
- **data3_pin** (*Optional*, pin):  data3 line pin used in 4bit bus width.

.. _sdfs-automation:

Automation
----------
- **on_state** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  when sd card state changed.  State changed when user plug or eject card.

.. _sdfs-on_state:

``on_state`` Trigger
********************

This automation will be triggered whenever a card ejected, mounted or inerted. 
In :ref:`Lambdas <config-lambda>` you can get the new state value from the trigger with ``x``

.. code-block:: yaml

    sdfs:
      # ...
      on_state:
        then:
          - logger.log:
              format: "card state %d"
              args: ["x"]

States represented by decimal number in range 0 .. 4 and can be accesed with ``x`` parameter. 
There is next states:

  - `0` - the slot not initilized (SD_SLOT_ST_NOTINIT);
  - `1` - slot initializd but card not detected yet (SD_SLOT_ST_INIT);
  - `2` - no card in slot (SD_SLOT_ST_EMPTY);
  - `3` - card found but not mounted (SD_SLOT_ST_CARD);    
  - `4` - card present and mouted (SD_SLOT_ST_MOUNT);

Configuration variables: See :ref:`Automation <automation>`.

.. _sdfs-write_file_action:

Actions
-------

**sdfs.write_file**: Write to file. Create if not exist.

``sdfs.write_file`` Action
**************************

This is an :ref:`Action <config-action>` for setting the active option using its index offset.

.. code-block:: yaml

    - sdfs.write_file:
        id: my_sdfs
        path: "/testfile.txt"
        data: !lambda |-
          std::string tstring("Hello world.");
          return std::vector<uint8_t>(tstring.begin(), tstring.end())

Configuration variables:

- **id** (**Optional**, :ref:`config-id`): The ID of teh sdfs.
- **path** (**Required**, string, :ref:`templatable <config-templatable>`): The index 
  offset of the option to be activated.
- **mode** (**Optional**, string):  write mode "append" for append to and of file, "write" 
  for write to file from beginig, 
  "wtruncate" for write from begining and truncate finishing bytes after last written byte. 
  Action will create file if it does not exist.
- **data** (**Required**, ``const std::vector<uint8_t>&``) vector containing the datas to werite to file.


Condition
---------

.. _sdfs-is_state:

``sdfs.is_state`` Condition
***************************

This :ref:`Condition <config-condition>` checks if the curret sd card state equal to specifyed state num.

.. code-block:: yaml

    # In some trigger:
    on_...:
      - if:
          condition:
            # Check if mount
            sdfs.is_state: 
              id: sdfs_id
              state: 3
          then:
            # ...

Configuration variables:

- **id** (**Optional**, :ref:`config-id`): The ID of the sdfs block.
- **state** (**Optional**, int, :ref:`templatable <config-templatable>`): The current state to 
  compare with.  Default value 4 (MOUNT).

.. code-block:: yaml

    # In some trigger:
    on_...:
      if:
        condition:
          # Check if mount
          sdfs.is_state: sdfs_id


.. _sdfs-is_size_ge:

``sdfs.is_size_ge`` Condition
*****************************

This :ref:`Condition <config-condition>` Check if the size of file or whole sdcard is greate or 
equal of cpecifyed value.

.. code-block:: yaml

    # In some trigger:
    on_...:
      - if:
          condition:
            # Check if mount
            sdfs.is_size_ge: 
              id: sdfs_id
              path: "/test.txt"
              size: 40000
          then:
            # ...


Configuration variables:

- **id** (**Optional**, :ref:`config-id`): The ID of the sdfs block.
- **path** (**Optional**, string, :ref:`templatable <config-templatable>`): Path to  file for compare. 
  If `/` specified, it will check the size of whole cdcard.
- **size** (**Required**, size_t, :ref:`templatable <config-templatable>`):  Size value in bytes to 
  compare with selected file.


.. _sdfs-is_size_le:

``sdfs.is_size_le`` Condition
*****************************

This :ref:`Condition <config-condition>` Check if the size of file or whole sdcard is less or 
equal of cpecifyed value.

.. code-block:: yaml

    # In some trigger:
    on_...:
      - if:
          condition:
            # Check if mount
            sdfs.is_size_le: 
              id: sdfs_id
              path: "/test.txt"
              size: 40000
          then:
            # ...


Configuration variables:

- **id** (**Optional**, :ref:`config-id`): The ID of the sdfs block.
- **path** (**Optional**, string, :ref:`templatable <config-templatable>`): Path to  file for compare. 
  If `/` specified, it will check the size of whole cdcard.
- **size** (**Required**, size_t, :ref:`templatable <config-templatable>`):  Size value in bytes 
  to compare with selected file


.. _sdfs-is_dir:

``sdfs.is_dir`` Condition
*************************

This :ref:`Condition <config-condition>` Check if the object specifyed by path is directory.

.. code-block:: yaml

    # In some trigger:
    on_...:
      - if:
          condition:
            # Check if mount
            sdfs.is_dir: 
              id: sdfs_id
              path: "/test.txt"
          then:
            # ...


Configuration variables:

- **id** (**Optional**, :ref:`config-id`): The ID of the sdfs block.
- **path** (**Optional**, string, :ref:`templatable <config-templatable>`): Path to object to check. 


.. _sdfs-is_exist:

``sdfs.is_exist`` Condition
***************************

This :ref:`Condition <config-condition>` Check if the object specifyed by path is exist.

.. code-block:: yaml

    # In some trigger:
    on_...:
      - if:
          condition:
            # Check if mount
            sdfs.is_exist: 
              id: sdfs_id
              path: "/test.txt"
          then:
            # ...


Configuration variables:

- **id** (**Optional**, :ref:`config-id`): The ID of the sdfs block.
- **path** (**Optional**, string, :ref:`templatable <config-templatable>`): Path to object to check. 


.. _sdfs-lambda_calls:


lambda calls
------------

From :ref:`lambdas <config-lambda>`, you can get full accces to filesystem and file manipulation.
(see the full API Reference for more info).  To access filesystem use class ``FsInterface``.
This class provide unified methods for arduino or esp-idf frameworks.

  .. code-block:: cpp

      // In some trigger:
      then:
        - lambda: |-
              sdfs::FsInterface *fs = id(disk1).get_fs();
              sdfs::FsIterator *ls = fs->list(std::string("/")); 
              sdfs::FileInfo *info = NULL; 
              do {
                 info = ls->get_next();
                 if ( info != NULL ) {
                    ESP_LOGD("main", "%s - %s%s",info->is_dir?"DIR":"FILE", info->path.c_str(), info->name.c_str());
                 }
              } while (info != NULL);


Check the API reference :apiref:`fs_interface <sdfs/fs_interface.h>` for information on the methods 
that are available in ``FsInterface`` and ``FileInterface`` objects. You can create o remove directory,
delete file and more.

See Also
--------

- :apiref:`Fs access <sdfs/fs_interface.h>`
- :apiref:`SDFS <sdfs/sdfs.h>`
- :ref:`spi`


