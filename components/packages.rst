Packages
========

.. seo::
    :description: How to use packages in ESPHome
    :image: settings.svg

When you have many ESPHome devices (or are producing and distributing them at scale), a common need tends to surface:
configuration modularization. You'll likely want to break your configuration into common (groups of) elements, building
it into reusable pieces which can subsequently be used by many/all devices. Only unique pieces of your configuration
remain in any given device's YAML configuration file.

This can be accomplished with ESPHome's ``packages`` feature.

All definitions from packages will be merged with your device's main configuration in a non-destructive way. This
allows overriding (parts of) configuration contained in the package(s). Substitutions in your main configuration will
override substitutions with the same name in a package.

Dictionaries are merged key-by-key. Lists of components are merged by component ID (if specified). Other lists are
merged by concatenation. All other configuration values are replaced with the later value.

ESPHome uses ``!include`` to "bring in" packages; this is a syntax brought over from
`Home Assistant's YAML configuration directives <https://www.home-assistant.io/docs/configuration/splitting_configuration/>`__.

Local Packages
--------------

Consider the following example where the author put common pieces of configuration (like Wi-Fi and API) into base files
and then extends it with some device-specific configuration in the main configuration.

Note how the piece of configuration describing ``api`` component in ``device_base.yaml`` gets merged with the actions
definitions from main configuration file.

.. code-block:: yaml

    # In config.yaml
    packages:
      wifi: !include common/wifi.yaml
      device_base: !include common/device_base.yaml

    api:
      actions:
        - action: start_laundry
          then:
            - switch.turn_on: relay

    # any additional configuration...

.. code-block:: yaml

    # In wifi.yaml
    wifi:
      ssid: !secret wifi_ssid
      password: !secret wifi_password

.. code-block:: yaml

    # In device_base.yaml
    esphome:
      name: ${node_name}

    esp32:
      board: wemos_d1_mini32

    logger:

    api:
      encryption:
        key: !secret api_encryption_key

.. _config-git_packages:

Remote/Git Packages
-------------------

Packages can also be loaded from a Git repository by utilizing the correct configuration syntax.
:doc:`/components/substitutions` can be used inside the remote packages which allows users to override
them locally with their own substitution value.

.. note::

    Remote packages cannot have ``secret`` lookups in them. They should instead make use of substitutions with an
    optional default in the packaged YAML, which the local device YAML can set using values from the local secrets.

.. code-block:: yaml

    # Git repo examples
    packages:
      # shorthand form github://username/repository/[folder/]file-path.yml[@branch-or-tag]
      remote_package_shorthand: github://esphome/non-existant-repo/file1.yml@main

      remote_package_files:
        url: https://github.com/esphome/non-existant-repo
        files: [file1.yml, file2.yml]  # optional; if not specified, all files will be included
        ref: main  # optional
        refresh: 1d  # optional

Configuration variables:
------------------------

For each package:

- **url** (**Required**, string): The URL for the repository.
- **username** (*Optional*, string): Username to be used for authentication, if required.
- **password** (*Optional*, string): Password to be used for authentication, if required.
- **files** (**Required**, list of strings): List of files to include.
- **ref** (*Optional*, string): The Git ref(erence) to be used when pulling content from the repository.
- **refresh** (*Optional*, :ref:`config-time`): The interval at which the content from the repository should be refreshed.

Packages as Templates
---------------------

Since packages are incorporated using the ``!include`` system, variables can be provided to them. This means that
packages can be used as *templates*, allowing complex or repetitive configurations to be stored in a package file
and then incorporated into the configuration more than once.

Packages may also contain a ``defaults`` block which provides subsitutions for variables not provided by the
``!include`` block.

As an example, if the configuration needed to support three garage doors using the ``gpio`` switch platform and the
``time_based`` cover platform, it could be constructed like this:

.. code-block:: yaml

    # In config.yaml
    packages:
      left_garage_door: !include
        file: garage-door.yaml
        vars:
          door_name: Left
      middle_garage_door: !include
        file: garage-door.yaml
        vars:
          door_name: Middle
      right_garage_door: !include
        file: garage-door.yaml
        vars:
          door_name: Right


.. code-block:: yaml

    # In garage-door.yaml
    switch:
      - name: ${door_name} Garage Door Switch
        platform: gpio
        # ...

.. _config-packages_extend:

Extend
------

To make changes or add additional configuration to included configurations, ``!extend config_id`` can be used, where
``config_id`` is the ID of the configuration to modify.

For example, to set a specific update interval on a common uptime sensor that is shared between configurations:

.. code-block:: yaml

    # In common.yaml
    captive_portal:

    sensor:
      - platform: uptime
        id: uptime_sensor
        update_interval: 1min

.. code-block:: yaml

    packages:
      common: !include common.yaml

    sensor:
      - id: !extend uptime_sensor
        update_interval: 10s

.. _config-packages_remove:

Remove
------

To remove existing entries from included configurations, ``!remove [config_id]`` can be used, where ``config_id`` is
the ID of the entry to modify.

For example, to remove a common uptime sensor that is shared between configurations:

.. code-block:: yaml

    packages:
      common: !include common.yaml  # see above

    sensor:
      - id: !remove uptime_sensor

To remove captive portal for a specific device:

.. code-block:: yaml

    packages:
      common: !include common.yaml  # see above

    captive_portal: !remove

See Also
--------

- :doc:`ESPHome index </index>`
- :doc:`/guides/getting_started_command_line`
- :doc:`/guides/faq`
- :ghedit:`Edit`
