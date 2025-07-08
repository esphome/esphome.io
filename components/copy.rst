Copy Component
==============

.. seo::
    :description: Instructions for setting up the copy component in ESPHome
    :image: content-copy.svg

The ``copy`` component can be used to copy an existing component (like a sensor, switch, etc.)
and create a duplicate mirroring the source's state and forwarding actions such as turning on to the source.

For each of the supported platforms, the configuration consists of the required configuration
variable ``source_id``, which is used to indicate the source of the object being mirorred.

Copy Binary Sensor
------------------

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: copy
        source_id: source_binary_sensor
        name: "Copy of source_binary_sensor"

Configuration variables:
************************

- **source_id** (**Required**, :ref:`config-id`): The binary sensor that should be mirrored.
- All other options from :ref:`Binary Sensor <config-binary_sensor>`.

Copy Button
-----------

.. code-block:: yaml

    # Example configuration entry
    button:
      - platform: copy
        source_id: source_button
        name: "Copy of source_button"

Configuration variables:
************************

- **source_id** (**Required**, :ref:`config-id`): The button that should be mirrored.
- All other options from :ref:`Button <config-button>`.

Copy Cover
----------

.. code-block:: yaml

    # Example configuration entry
    cover:
      - platform: copy
        source_id: source_cover
        name: "Copy of source_cover"

Configuration variables:
************************

- **source_id** (**Required**, :ref:`config-id`): The cover that should be mirrored.
- All other options from :ref:`Cover <config-cover>`.

Copy Fan
--------

.. code-block:: yaml

    # Example configuration entry
    fan:
      - platform: copy
        source_id: source_fan
        name: "Copy of source_fan"

Configuration variables:
************************

- **source_id** (**Required**, :ref:`config-id`): The fan that should be mirrored.
- All other options from :ref:`Fan <config-fan>`.

Copy Lock
---------

.. code-block:: yaml

    # Example configuration entry
    lock:
      - platform: copy
        source_id: source_lock
        name: "Copy of source_lock"

Configuration variables:
************************

- **source_id** (**Required**, :ref:`config-id`): The lock that should be mirrored.
- All other options from :ref:`Lock <config-lock>`.

Copy Number
-----------

.. code-block:: yaml

    # Example configuration entry
    number:
      - platform: copy
        source_id: source_number
        name: "Copy of source_number"

Configuration variables:
************************

- **source_id** (**Required**, :ref:`config-id`): The number that should be mirrored.
- All other options from :ref:`Number <config-number>`.

Copy Select
-----------

.. code-block:: yaml

    # Example configuration entry
    select:
      - platform: copy
        source_id: source_select
        name: "Copy of source_select"

Configuration variables:
************************

- **source_id** (**Required**, :ref:`config-id`): The select that should be mirrored.
- All other options from :ref:`Select <config-select>`.

.. _copy-sensor:

Copy Sensor
-----------

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: copy
        source_id: source_sensor
        name: "Copy of source_sensor"

Configuration variables:
************************

- **source_id** (**Required**, :ref:`config-id`): The sensor that should be mirrored.
- All other options from :ref:`Sensor <config-sensor>`.

Copy Switch
-----------

.. code-block:: yaml

    # Example configuration entry
    switch:
      - platform: copy
        source_id: source_switch
        name: "Copy of source_switch"

Configuration variables:
************************

- **source_id** (**Required**, :ref:`config-id`): The switch that should be mirrored.
- All other options from :ref:`Switch <config-switch>`.

Copy Text Sensor
----------------

.. code-block:: yaml

    # Example configuration entry
    text_sensor:
      - platform: copy
        source_id: source_text_sensor
        name: "Copy of source_text_sensor"

Configuration variables:
************************

- **source_id** (**Required**, :ref:`config-id`): The text sensor that should be mirrored.
- All other options from :ref:`Text Sensor <config-text_sensor>`.

Copy Text
---------

.. code-block:: yaml

    # Example configuration entry
    text:
      - platform: copy
        source_id: source_text
        name: "Copy of source_text"

Configuration variables:
************************

- **source_id** (**Required**, :ref:`config-id`): The text that should be mirrored.
- All other options from :ref:`Text <config-text>`.

See Also
--------

- :ghedit:`Edit`
