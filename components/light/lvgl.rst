LVGL Light
==========

.. seo::
    :description: Instructions for setting up an LVGL widget light.
    :image: ../images/lvgl_c_lig.png

The ``lvgl`` light platform creates a light from an LVGL widget
and requires :doc:`LVGL </components/lvgl/index>` to be configured.

Supported widget is :ref:`lvgl-widget-led`. A single light supports only a single widget; in other words, it's not possible to have multiple widgets associated with a single ESPHome light component.

Configuration variables:
------------------------

- **widget** (**Required**): The ID of a ``led`` widget configured in LVGL, which will reflect the state of the light.
- All other options from :ref:`light <config-light>`.


Example:

.. code-block:: yaml

    light:
      - platform: lvgl
        widget: led_id
        name: LVGL light

.. note::

    To have linear brightness control, ``gamma_correct`` of the light is set by default to ``0``.

See Also
--------
- :doc:`LVGL Main component </components/lvgl/index>`
- :ref:`LED widget <lvgl-widget-led>`
- :doc:`/components/binary_sensor/lvgl`
- :doc:`/components/sensor/lvgl`
- :doc:`/components/number/lvgl`
- :doc:`/components/switch/lvgl`
- :doc:`/components/select/lvgl`
- :doc:`/components/text/lvgl`
- :doc:`/components/text_sensor/lvgl`
- :ghedit:`Edit`
