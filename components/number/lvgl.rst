LVGL Number
===========

.. seo::
    :description: Instructions for setting up an LVGL widget number component.
    :image: ../images/lvgl_c_num.png

The ``lvgl`` number platform creates a number component from an LVGL widget
and requires :doc:`LVGL </components/lvgl/index>` to be configured.

Supported widgets are :ref:`lvgl-widget-arc`, :ref:`lvgl-widget-bar`, :ref:`lvgl-widget-slider` and :ref:`lvgl-widget-spinbox`. A single number supports only a single widget; in other words, it's not possible to have multiple widgets associated with a single ESPHome number component.

Configuration variables:
------------------------

- **widget** (**Required**): The ID of a supported widget configured in LVGL, which will reflect the state of the number.
- **animated** (*Optional*, boolean): Whether to set the value of the widget with an animation (if supported by the widget). Defaults to ``true``.
- **update_on_release** (*Optional*, boolean): By default the number will publish a new value each time the value of the associated widget changes. If this option is ``true`` then the value will only be published when touch is released.
- **restore_value**: (*Optional*, bool) Restore the value of the number from non-volatile memory when the device is restarted. Defaults to ``false``.
- All other variables from :ref:`Number <config-number>`.

Example:

.. code-block:: yaml

    number:
      - platform: lvgl
        widget: slider_id
        name: LVGL Slider

.. note::

    Widget-specific actions (``lvgl.arc.update``, ``lvgl.bar.update``, ``lvgl.slider.update``, ``lvgl.spinbox.update``, ``lvgl.spinbox.decrement``, ``lvgl.spinbox.increment``) will trigger correspponding component updates to be sent to Home Assistant.

See Also
--------
- :doc:`LVGL Main component </components/lvgl/index>`
- :ref:`Arc widget <lvgl-widget-arc>`
- :ref:`Bar widget <lvgl-widget-bar>`
- :ref:`Slider widget <lvgl-widget-slider>`
- :ref:`Spinbox widget <lvgl-widget-spinbox>`
- :doc:`/components/binary_sensor/lvgl`
- :doc:`/components/sensor/lvgl`
- :doc:`/components/switch/lvgl`
- :doc:`/components/select/lvgl`
- :doc:`/components/light/lvgl`
- :doc:`/components/text/lvgl`
- :doc:`/components/text_sensor/lvgl`
- :ghedit:`Edit`
