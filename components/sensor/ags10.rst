AGS10 Volatile Organic Compound (VOC) Sensor
============================================

.. seo::
    :description: Instructions for setting up AGS10 VOC sensors with ESPHome
    :image: ags10.jpg
    :keywords: AGS10

The ``ags10`` sensor platform VOC sensor allows you to use your ASAIR AGS10
(`datasheet <http://www.aosong.com/userfiles/files/Datasheet%20AGS10.pdf>`__,
`ASAIR`_ ) sensors with
ESPHome. The :ref:`I²C Bus <i2c>` is
required to be set up in your configuration for this sensor to work.

.. note::

    The sensor supports up to 15kHz operation, so you should specify up to ``frequency: 15kHz`` in your ``i2c`` configuration.


.. _ASAIR: http://www.aosong.com/en/products-86.html

.. figure:: images/ags10.jpg
    :align: center
    :width: 30.0%

    AGS10 VOC Sensor

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: ags10
        tvoc:
          name: TVOC

Configuration variables:
------------------------

- **tvoc** (**Required**): The information for the total Volatile Organic Compounds sensor.
  All options from :ref:`Sensor <config-sensor>`.
- **address** (*Optional*, int): Manually specify the I²C address of
  the sensor. Defaults to ``0x1A``.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the
  sensor. Defaults to ``60s``.
- **version** (*Optional*): The firmware version of the sensor.
  All options from :ref:`Sensor <config-sensor>`.
- **resistance** (*Optional*): The initial value of the sensor resistance.
  All options from :ref:`Sensor <config-sensor>`.

Actions:
--------

.. _sensor-AGS10SetZeroPointAction:

``ags10.set_zero_point`` Action
-------------------------------

Zero-point of AGS10 has been calibrated before leaving factory. User can re-calibrate the zero-point as
needed.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: ags10
        id: ags10_1_id
        # ...

    # in some trigger
    on_...:
      - ags10.set_zero_point:
          id: ags10_1_id
          mode: CURRENT_VALUE

Configuration option:

- **id** (**Required**, :ref:`config-id`): The ID of the AGS10 sensor.
- **mode** (**Required**, enum): One of supported modes:

  - ``FACTORY_DEFAULT`` - reset to the factory zero-point
  - ``CURRENT_VALUE`` - set zero-point calibration with current resistance
  - ``CUSTOM_VALUE`` - set zero-point calibration with resistance pointed with ``value`` option

- **value** (**Optional**, int): nominated resistance value to set (unit: 0.1 kΩ).


.. _sensor-AGS10NewI2cAddressAction:

``ags10.new_i2c_address`` Action
--------------------------------

I2C address of AGS10 can be modified, and it is possible to use multiple AGS10 sensors on one bus.
After sending the command for address changing, the new address is saved and takes effect immediately even
after power-off.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: ags10
        id: ags10_1_id
        # ...

    # in some trigger
    on_...:
      - ags10.new_i2c_address:
          id: ags10_1_id
          address: 0x1E

Configuration options:

- **id** (**Required**, :ref:`config-id`): The ID of the AGS10 sensor.
- **address** (**Required**, int): New I2C address.

  
See Also
--------

- :ref:`sensor-filters`
- :apiref:`ags10/ags10.h`
- :ghedit:`Edit`
