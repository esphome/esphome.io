.. _nextion_sensor:

Nextion Sensor Component
========================

.. seo::
    :description: Instructions for setting up Nextion sensor.
    :image: nextion.jpg

The ``nextion`` sensor platform supports integers or floats (Xfloat). It can be a component, a variable or a waveform in the Nextion display.
It is best to set the component's vscope to global in the Nextion Editor. This way the component will be available
if the page is shown or not.

.. note::

    The Nextion can receive an integer but it can only send 3 bytes for a negative integer. The range if using the :ref:`nextion_custom_sensor_protocol` is:
        -16777215 to 4294967295

See :doc:`/components/display/nextion` for setting up the display

.. code-block:: yaml

    # Example configuration entry
    display:
      - platform: nextion
        id: nextion1
        # ...

    sensor:
      - platform: nextion
        name: "Current Humidity"
        component_name: humidity # pageX.humidity for a global
        precision: 1
        update_interval: 4s
      - platform: nextion
        nextion_id: nextion1
        name: "Current Temperature"
        variable_name: temperature
      - platform: nextion
        id: s01
        component_id: 2
        wave_channel_id: 0
        wave_max_value: 100
        waveform_send_last_value: "true"
        wave_max_length: 400
        update_interval: 1s
      - platform: nextion
        id: s02
        component_id: 2
        wave_channel_id: 1
        wave_max_value: 100
        update_interval: 1s

Configuration variables:
------------------------

- **nextion_id** (*Optional*, :ref:`config-id`): Manually specify the ID of the Nextion display.
- **component_name** (*Optional*, string): Manually specify the name of the Nextion component.
- **variable_name** (*Optional*, string): Manually specify the name of the Nextion variable.
- **update_interval** (*Optional*, :ref:`config-time`):  The duration to update the sensor
- **precision** (*Optional*, int):  This is for Nextion float components. This sets
  the precision that the component is set to. This typically is the ``vvs1`` setting of the component.
- **background_color** (*Optional*, :ref:`config-color`):  The background color
- **foreground_color** (*Optional*, :ref:`config-color`):  The foreground color
- **visible** (*Optional*, boolean):  Visible or not

Waveform Settings
*****************
- **wave_channel_id** (*Optional*, int): The waveform ID in a range of 0-3
- **wave_max_value** (*Optional*, int): The max value. Set ``dis`` to the height of the component in the Nextion editor
  and this to the max value that will be sent. This will set up the proper scaling.
- **waveform_send_last_value** (*Optional*, int): This will send the last value set during an update interval. Setting to true will give a timeseries style graph
- **wave_max_length** (*Optional*, int): How many data points to store. Typically this is the width of the component in the Nextion
- **update_interval** (*Optional*, :ref:`config-time`):  The duration to update the sensor. This typically should be set for waveforms to send periodic updates.

- All other options from :ref:`Sensor <config-sensor>`.

**Only one** *component_name* **or** *variable_name* **can be set**

  .. note::

      ``background_color`` , ``foreground_color`` and ``visible`` do not retain their state on page change. :ref:`Sensor Settings<nextion_sensor_settings>`.
      A :ref:`Nextion Sensor <nextion_sensor>` with a custom protocol sending the current page can be used to execute the API call :ref:`Update Components By Prefix <update_components_by_prefix>` to update all the components for that page


See :ref:`nextion_sensor_how_things_update` for additional information

Globals
*******
The Nextion does not retain data on Nextion page changes. Additionally if a page is changed and the **component_name** does not exist on that page then
nothing will be updated. To get around this the Nextion components can be changed to have a vscope of ``global``. If this is set then the **component_name**
should be prefixed with the page name (page0/page1 or whatever you have changed it to).

*Example*

``component_name: page0.humidity``

.. _sensor-nextion-publish_action:

``sensor.nextion.publish`` Action
---------------------------------

You can also publish a state to a Nextion sensor from elsewhere in your YAML file
with the ``sensor.nextion.publish`` action.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: nextion
        id: nextion_sensor
        ...
    # in some trigger
    on_...:
      - sensor.nextion.publish:
          id: nextion_sensor
          state: 100.0
          # These are optional. Defaults to true.
          publish_state: true
          send_to_nextion: true
      # Templated
      - sensor.nextion.publish:
          id: nextion_sensor
          state: !lambda 'return 100.0;'
          # These are optional. Defaults to true.
          publish_state: true
          send_to_nextion: true

Configuration variables:

- **id** (**Required**, :ref:`config-id`): The ID of the Nextion sensor.
- **state** (**Required**, string, :ref:`templatable <config-templatable>`): The float state to publish.
- **publish_state** (**Optional**, bool, :ref:`templatable <config-templatable>`): Publish new state to Home Assistant.
  Default is true.
- **send_to_nextion** (**Optional**, bool, :ref:`templatable <config-templatable>`): Publish new state to Nextion
  display which will update component. Default is true.

.. note::

    This action can also be written in lambdas. See :ref:`nextion_sensor_lambda_calls`

.. _nextion_sensor_lambda_calls:

Lambda Calls
************

From :ref:`lambdas <config-lambda>`, you can call several methods to access
some more advanced functions (see the full :apiref:`nextion/sensor/nextion_sensor.h` for more info).

.. _nextion_sensor_set_state:

- ``set_state(bool value, bool publish, bool send_to_nextion)``: Set the state to **value**. Publish the new state to HASS. Send_to_Nextion is to publish the state to the Nextion.

.. _nextion_sensor_update:

- ``update()``: Poll from the Nextion

.. _nextion_sensor_settings:

- ``set_background_color(Color color)``: Sets the background color to **Color**
- ``set_foreground_color(Color color)``: Sets the background color to **Color**
- ``set_visible(bool visible)`` : Sets visible or not. If set to false, no updates will be sent to the component


.. _nextion_sensor_how_things_update:

How things Update
-----------------
A Nextion component with an integer value (.val) or Nextion variable will be automatically polled if **update_interval** is set.
To have the Nextion send the data you can use the :ref:`nextion_custom_sensor_protocol` for this. Add the :ref:`nextion_custom_sensor_protocol` to the
component or function you want to trigger the send. Typically this is in *Touch Press Event* but some components, like a slider, should have it
set in the *Touch Release Event* to capture all the changes. Since this is a custom protocol it can be sent from anywhere (timers/functions/components)
in the Nextion.

.. note::

    There is no need to check the *Send Component ID* for the *Touch Press Event* or *Touch Release Event*
    since this will be sending the real value to esphome.

Using the above yaml example:
  - "Current Humidity" will poll the Nextion for the ``humidity.val`` value and set the sensor accordingly.
  - "Current Temperature" will NOT poll the Nextion. Either the Nextion will need to use the :ref:`nextion_custom_sensor_protocol` or use a lambda:

    - :ref:`Lambda Calls <nextion_sensor_lambda_calls>`.

.. note::

    No updates will be sent to the Nextion if it is sleeping. Once it wakes, the components will be updated. If a component is invisible, :code:`visible(false)`, then it won't update until it is set to be visible.


.. _nextion_custom_sensor_protocol:

Nextion Custom Sensor Protocol
------------------------------
All lines are required

.. code-block:: c++

    printh 91
    prints "temperature",0
    printh 00
    prints temperature.val,0
    printh FF FF FF

*Explanation*

- ``printh 91`` Tells the library this is a sensor (int) data
- ``prints "temperature",0`` Sends the name that matches **component_name** or **variable_name**
- ``printh 00`` Sends a NULL
- ``prints temperature.val,0`` The actual value to send. For a variable use the Nextion variable name ``temperature`` with out ``.val``
- ``printh FF FF FF`` Nextion command ack


See Also
--------

- :doc:`/components/display/nextion`
- :doc:`index`
- :apiref:`nextion/sensor/nextion_sensor.h`
- :ghedit:`Edit`
