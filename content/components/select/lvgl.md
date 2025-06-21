LVGL Select
===========

.. seo::
    :description: Instructions for setting up an LVGL widget select.
    :image: ../images/lvgl_c_sel.png

The ``lvgl`` select platform creates a select from an LVGL widget
and requires :doc:`LVGL </components/lvgl/index>` to be configured.

Supported widgets are :ref:`lvgl-widget-dropdown` and :ref:`lvgl-widget-roller`. A single select supports only a single widget; in other words, it's not possible to have multiple widgets associated with a single ESPHome select component.

Configuration variables:
------------------------

- **widget** (**Required**): The ID of a supported widget configured in LVGL, which will reflect the state of the select.
- **restore_value**: (*Optional*, bool) Restore the value of the select from non-volatile memory when the device is restarted. Defaults to ``false``.
- All other variables from :ref:`Select <config-select>`.

Example:

.. code-block:: yaml

    select:
      - platform: lvgl
        widget: dropdown_id
        name: LVGL Dropdown

.. note::

    Widget-specific actions (``lvgl.dropdown.update``, ``lvgl.roller.update``) will trigger correspponding component updates to be sent to Home Assistant.

See Also
--------
- :doc:`LVGL Main component </components/lvgl/index>`
- :ref:`Roller widget <lvgl-widget-roller>`
- :ref:`Dropdown widget <lvgl-widget-dropdown>`
- :doc:`/components/binary_sensor/lvgl`
- :doc:`/components/sensor/lvgl`
- :doc:`/components/number/lvgl`
- :doc:`/components/switch/lvgl`
- :doc:`/components/light/lvgl`
- :doc:`/components/text/lvgl`
- :doc:`/components/text_sensor/lvgl`
- :ghedit:`Edit`
