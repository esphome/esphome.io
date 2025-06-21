Substitutions
=============

.. seo::
    :description: How to use substitutions in ESPHome
    :image: settings.svg

ESPHome has a powerful way to reduce repetition in configuration files: substitutions.
With substitutions, you can have a single generic source file for all nodes of one kind and
substitute expressions in as required.

.. code-block:: yaml

    substitutions:
      bme280_temperature_offset: "-1.0"

    sensor:
      - platform: bme280_i2c
        temperature:
          name: BME280 Temperature
          filters:
            - offset: ${bme280_temperature_offset}


In the top-level ``substitutions`` section, you can put as many key-value pairs as you want. Before
validating your configuration, ESPHome will automatically replace all occurrences of substitutions
by their value. The syntax for a substitution is based on bash and is case-sensitive: ``$substitution_key`` or
``${substitution_key}`` (same).

Two substitution passes are performed allowing compound replacements.

.. code-block:: yaml

    substitutions:
      foo: yellow
      bar_yellow_value: !secret yellow_secret
      bar_green_value: !secret green_secret

    something:
      test: ${bar_${foo}_value}

.. _substitute-include-variables:

Substitute !include variables
-----------------------------

ESPHome's ``!include`` accepts a list of variables that can be substituted within the included file.

.. code-block:: yaml

    binary_sensor:
      - platform: gpio
        id: button1
        pin: GPIOXX
        on_multi_click: !include { file: on-multi-click.yaml, vars: { id: 1 } } # inline syntax
      - platform: gpio
        id: button2
        pin: GPIOXX
        on_multi_click: !include
          # multi-line syntax
          file: on-multi-click.yaml
          vars:
            id: 2

``on-multi-click.yaml``:

.. code-block:: yaml

    - timing: !include click-single.yaml
      then:
        - mqtt.publish:
            topic: ${device_name}/button${id}/status
            payload: single
    - timing: !include click-double.yaml
      then:
        - mqtt.publish:
            topic: ${device_name}/button${id}/status
            payload: double

.. _command-line-substitutions:

Command line substitutions
--------------------------

You can define or override substitutions from the command line by adding the ``-s`` switch with arguments ``KEY`` and
``VALUE``. This will override the substitution ``KEY`` and assign it the value ``VALUE``. This switch can be included
multiple times. Consider the following ``example.yaml`` file:

.. code-block:: yaml

    substitutions:
      name: my_default_name

    esphome:
      name: $name

...and the following command:

.. code-block:: bash

    esphome -s name my_device01 config example.yaml

You will get something like the following output:

.. code-block:: yaml

    substitutions:
      name: my_device01

    esphome:
      name: my_device01
      # ...

Command line substitutions take precedence over those in your configuration file. This can be used to create generic
"template" configuration files (like ``example.yaml`` above) which can be used by multiple devices, leveraging
substitutions which are provided on the command line.

.. _YAML-insertion-operator:

Bonus: YAML insertion operator
------------------------------

Additionally, you can use the YAML insertion operator ``<<`` syntax to create a single YAML file from which a number
of nodes inherit:

.. code-block:: yaml

    # In common.yaml
    esphome:
      name: $devicename
      # ...

    sensor:
    - platform: dht
      # ...
      temperature:
        name: Temperature
      humidity:
        name: Humidity

.. code-block:: yaml

    # In nodemcu1.yaml
    substitutions:
      devicename: nodemcu1

    <<: !include common.yaml

.. tip::

    To hide these base files from the dashboard, you can

    - Place them in a subdirectory (dashboard only shows files in top-level directory)
    - Prepend a dot to the filename, like ``.base.yaml``

See Also
--------

- :doc:`ESPHome index </index>`
- :doc:`/guides/getting_started_command_line`
- :doc:`/guides/faq`
- :ghedit:`Edit`
