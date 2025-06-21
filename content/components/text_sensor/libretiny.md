LibreTiny Text Sensor
=====================

.. seo::
    :description: Instructions for setting up LibreTiny text sensors.
    :image: libretiny.svg

The ``libretiny`` text sensor platform exposes various LibreTiny core
information via text sensors.

.. code-block:: yaml

    # Example configuration entry
    text_sensor:
      - platform: libretiny
        version:
          name: LibreTiny Version

Configuration variables:
------------------------

- **version** (*Optional*): Expose the version of LibreTiny core as a text sensor. All options from
  :ref:`Text Sensor <config-text_sensor>`.


See Also
--------

- :doc:`/components/libretiny`
- :apiref:`libretiny/lt_component.h`
- :ghedit:`Edit`
