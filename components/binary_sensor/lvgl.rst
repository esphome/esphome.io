LVGL Binary Sensor
==================

.. seo::
    :description: Instructions for setting up an LVGL widget binary sensor.
    :image: ../images/lvgl_c_bns.png

The ``lvgl`` binary sensor platform creates a binary sensor from an LVGL widget
and requires :doc:`LVGL </components/lvgl/index>` to be configured.

Supported widget is :ref:`lvgl-widget-button`. A single binary sensor supports only a single widget; in other words, it's not possible to have multiple widgets associated with a single ESPHome binary sensor component.

Configuration variables:
------------------------

- **widget** (**Required**): The ID of a supported widget configured in LVGL, which will reflect the state of the binary sensor.
- All other variables from :ref:`Binary Sensor <config-binary_sensor>`.

Example:

.. code-block:: yaml

    binary_sensor:
      - platform: lvgl
        widget: btn_id
        name: LVGL push button

See Also
--------
- :doc:`LVGL Main component </components/lvgl/index>`
- :ref:`Button widget <lvgl-widget-button>`
- :doc:`/components/sensor/lvgl`
- :doc:`/components/number/lvgl`
- :doc:`/components/switch/lvgl`
- :doc:`/components/select/lvgl`
- :doc:`/components/light/lvgl`
- :doc:`/components/text/lvgl`
- :doc:`/components/text_sensor/lvgl`
- :ghedit:`Edit`
