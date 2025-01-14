Generic Output Lock
=====================

.. seo::
    :description: Instructions for setting up generic output locks in ESPHome that control an output component.
    :image: upload.svg

The ``output`` lock platform allows you to use any output component as a lock.

.. figure:: images/output-ui.png
    :align: center
    :width: 80.0%

.. code-block:: yaml

    # Example configuration entry
    output:
      - platform: gpio
        pin: GPIOXX
        id: 'generic_out'
    lock:
      - platform: output
        name: "Generic Output"
        output: 'generic_out'

Configuration variables:
------------------------

- **output** (**Required**, :ref:`config-id`): The ID of the output component to use.
- All other options from :ref:`Lock <config-lock>`.

See Also
--------

- :doc:`/components/output/index`
- :apiref:`output/lock/output_lock.h`
- :ghedit:`Edit`
