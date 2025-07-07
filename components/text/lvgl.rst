LVGL Text
=========

.. seo::
    :description: Instructions for setting up an LVGL Text component.
    :image: ../images/lvgl_c_txt.png

The ``lvgl`` text platform creates an editable text component from an LVGL textual widget and requires :doc:`LVGL </components/lvgl/index>` to be configured.

Supported widgets are :ref:`lvgl-widget-label` and :ref:`lvgl-widget-textarea`. A single text supports only a single widget; in other words, it's not possible to have multiple widgets associated with a single ESPHome text component.

Configuration variables:
------------------------

- **widget** (**Required**): The ID of a ``textarea`` widget configured in LVGL, which will reflect the state of the text component.
- All other variables from :ref:`Text <config-text>`.

Example:

.. code-block:: yaml

    text:
      - platform: lvgl
        widget: textarea_id
        name: "Textarea 1 text"

.. note::

    Widget-specific actions (``lvgl.label.update``, ``lvgl.textarea.update``) will trigger correspponding component updates to be sent to Home Assistant.

See Also
--------
- :doc:`LVGL Main component </components/lvgl/index>`
- :ref:`Label widget <lvgl-widget-label>`
- :ref:`Textarea widget <lvgl-widget-textarea>`
- :doc:`/components/binary_sensor/lvgl`
- :doc:`/components/sensor/lvgl`
- :doc:`/components/number/lvgl`
- :doc:`/components/switch/lvgl`
- :doc:`/components/light/lvgl`
- :doc:`/components/select/lvgl`
- :doc:`/components/text_sensor/lvgl`
- :ghedit:`Edit`
