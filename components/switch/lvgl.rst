LVGL Switch
===========

.. seo::
    :description: Instructions for setting up an LVGL widget switch.
    :image: ../images/lvgl_c_swi.png

The ``lvgl`` switch platform creates a switch from an LVGL widget
and requires :doc:`LVGL </components/lvgl/index>` to be configured.

Supported widgets are :ref:`lvgl-widget-button` (with ``checkable`` option enabled), :ref:`lvgl-widget-switch` and :ref:`lvgl-widget-checkbox`. A single switch supports only a single widget; in other words, it's not possible to have multiple widgets associated with a single ESPHome switch component.

Configuration variables:
------------------------

- **widget** (**Required**): The ID of a supported widget configured in LVGL, which will reflect the state of the switch.
- All other variables from :ref:`Switch <config-switch>`.

Example:

.. code-block:: yaml

    switch:
      - platform: lvgl
        widget: checkbox_id
        name: LVGL switch

See Also
--------
- :doc:`LVGL Main component </components/lvgl/index>`
- :ref:`Button widget <lvgl-widget-button>`
- :ref:`Switch widget <lvgl-widget-switch>`
- :ref:`Checkbox widget <lvgl-widget-checkbox>`
- :doc:`/components/binary_sensor/lvgl`
- :doc:`/components/sensor/lvgl`
- :doc:`/components/number/lvgl`
- :doc:`/components/select/lvgl`
- :doc:`/components/light/lvgl`
- :doc:`/components/text/lvgl`
- :doc:`/components/text_sensor/lvgl`
- :doc:`/components/output/index`
- :ghedit:`Edit`
