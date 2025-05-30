Nextion TFT LCD Display
=======================

.. seo::
    :description: Instructions for setting up Nextion TFT LCD displays
    :image: nextion.jpg

The ``nextion`` display platform allows you to use Nextion LCD displays
(`datasheet <https://nextion.itead.cc/resources/datasheets/>`__, `iTead <https://www.itead.cc/display/nextion.html>`__)
with ESPHome.

.. figure:: images/nextion-full.jpg
    :align: center
    :width: 75.0%

    Nextion display

Communication with the Nextion display is done via a serial interface, so you'll need to have a :ref:`uart`
in your configuration with both ``rx_pin`` and ``tx_pin`` configured. These pins must then be connected to the
respective pins on the display.

Nextion displays use a baud rate of 9600 by default. You may configure the Nextion display to use a higher speed by
editing the ``program.s`` source file in the Nextion Editor. For example:

.. code-block:: c++

    baud=115200   // Sets the baud rate to 115200; for other supported rates, see https://nextion.tech/instruction-set/
    bkcmd=0       // Tells the Nextion to not send responses on commands. This is the current default but can be set just in case

This permits faster communication with the Nextion display and it is highly recommended when using
:ref:`uart-hardware_uarts`.

.. warning::

    **We highly recommend using only** :ref:`uart-hardware_uarts` **with Nextion displays.**

    *Use of software UARTs is known to result in unpredictable/inconsistent behavior.*

    If you **must** use a software UART, note that baud rates greater than 9600 are extremely likely to cause problems.

    In short, avoid using software UARTs with Nextion displays.

.. code-block:: yaml

    # Example configuration entry
    display:
      - platform: nextion
        id: nextion1
        lambda: |-
          it.set_component_value("gauge", 50);
          it.set_component_text("textview", "Hello World!");

Configuration variables:
------------------------

- **uart_id** (*Optional*, :ref:`config-id`): The ID of the :ref:`uart` you wish to use for this display. Specify this
  when you have multiple UART configurations.
- **brightness** (*Optional*, percentage): When specified, the display brightness will be set to this value at boot.
- **lambda** (*Optional*, :ref:`lambda <config-lambda>`): The lambda to use for rendering the content on the Nextion
  display. See :ref:`display-nextion_lambda` for more information. This is typically empty. The individual components
  for the Nextion will handle almost all functions needed for updating display elements.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to call the lambda to update the display.
  Defaults to ``5s``.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.
- **tft_url** (*Optional*, string): The URL from which to download the TFT file for display firmware updates (Nextion
  OTA). See :ref:`Nextion Upload <nextion_upload_tft>`.
- **touch_sleep_timeout** (*Optional*, int): Sets internal No-touch-then-sleep timer in seconds.
- **start_up_page** (*Optional*, int): Sets the page to display when ESPHome connects to the Nextion. (The Nextion will
  display page 0 upon start-up by default).
- **wake_up_page** (*Optional*, int): Sets the page to display after waking up.
- **auto_wake_on_touch** (*Optional*, boolean): If set to ``true``, the Nextion will be configured to wake from sleep
  when touched.
- **exit_reparse_on_start** (*Optional*, boolean): Request the Nextion exit Active Reparse Mode before setup of the
  display. Defaults to ``false``.
- **skip_connection_handshake** (*Optional*, boolean): Sets whether the initial display connection handshake process is
  skipped. When set to ``true``, the connection will be established without performing the handshake. This can be
  useful when using Nextion Simulator. Defaults to ``false``.
- **on_setup** (*Optional*, :ref:`Action <config-action>`): An action to be performed after ESPHome connects to the
  Nextion. See :ref:`Nextion Automation <nextion-on_setup>`.
- **on_sleep** (*Optional*, :ref:`Action <config-action>`): An action to be performed when the Nextion goes to sleep.
  See :ref:`Nextion Automation <nextion-on_sleep>`.
- **on_wake** (*Optional*, :ref:`Action <config-action>`): An action to be performed when the Nextion wakes up. See
  :ref:`Nextion Automation <nextion-on_sleep>`.
- **on_page** (*Optional*, :ref:`Action <config-action>`): An action to be performed after a page change. See
  :ref:`Nextion Automation <nextion-on_page>`.
- **on_touch** (*Optional*, :ref:`Action <config-action>`): An action to be performed after a touch event (press or
  release). See :ref:`Nextion Automation <nextion-on_touch>`.
- **on_buffer_overflow** (*Optional*, :ref:`Action <config-action>`): An action to be performed when the Nextion
  reports a buffer overflow. See :ref:`Nextion Automation <nextion-on_buffer_overflow>`.
- **command_spacing** (*Optional*, :ref:`config-time`): Sets the minimum time between commands sent to the Nextion display.
  A higher value can help prevent buffer overflows but will result in slower interface updates.
  Range is ``0-255ms``. Defaults to ``0ms`` (disabled).

.. _display-nextion_lambda:

Rendering Lambda
----------------

Nextion displays have a dedicated processor built directly into the display to perform all rendering. ESPHome simply
sends *instructions* to the display to tell it *how* to render something and/or *what* to render.

First, you need to use the `Nextion Editor <https://nextion.tech/nextion-editor/>`__ to create a "TFT" display file and
"install" it onto the display, typically via an SD card onto which you'll copy the "TFT" file and then insert into the
display for installation/updating. Then, in the rendering ``lambda``, you can use the various API calls to populate the
display with data:

.. code-block:: yaml

    display:
      - platform: nextion
        # ...
        lambda: |-
          // set the "value" of a component - value is always an integer
          // for example gauges represent their status using integers from 0 to 100
          it.set_component_value("gauge", 50);

          // set the text of a component
          it.set_component_text("textview", "Hello World!");

          // set the text of a component with formatting
          it.set_component_text_printf("textview", "The uptime is: %.1f", id(uptime_sensor).state);

.. note::

    Although you can use the rendering lambda, most, if not all, updates to the Nextion can be handled by the
    individual Nextion components/platforms. **See Below**

See :ref:`display-printf` for a quick introduction to the ``printf`` formatting rules and :ref:`display-strftime` for
an introduction to ``strftime`` time formatting.

Using Lambdas
*************

Several methods are available for use within :ref:`lambdas <config-lambda>`; these permit advanced functionality beyond
simple display updates. There are too many to cover here; please see the :apiref:`nextion/nextion.h` for more detail.
The list below calls out a few commonly-used methods:

.. _nextion_upload_tft:

- ``upload_tft``: Start the process to upload a new TFT file to the Nextion; see :ref:`nextion_upload_tft_file` below.

.. _nextion_update_all_components:

- ``update_all_components()``: All the components will publish their states.

  .. code-block:: c++

      id(nextion1).update_all_components();

.. _update_components_by_prefix:

- ``update_components_by_prefix(std::string page)``: This will send the current state of any **component_name**
  matching the prefix. Some settings like background color need to be resent on page change; this is a good hook to use
  for that.

  .. code-block:: c++

      id(nextion1).update_components_by_prefix("page0.");

.. _set_nextion_sensor_state:

- Set various sensor states (See :ref:`Queue Types <nextion_queue_types>` below):

  - ``set_nextion_sensor_state(NextionQueueType queue_type, std::string name, float state);``
  - ``set_nextion_sensor_state(int queue_type, std::string name, float state);``
  - ``set_nextion_text_state(std::string name, std::string state);``

.. note::

    The example below demonstrates how to define a user-API so Home Assistant can send updates to the Nextion by code.

    .. code-block:: yaml

        # Enable Home Assistant API
        api:
          actions:
            - action: set_nextion_sensor
              variables:
                nextion_type: int
                name: string
                state: float
              then:
                - lambda: |-
                    id(nextion1).set_nextion_sensor_state(nextion_type,name,state);
            - action: set_nextion_text
              variables:
                name: string
                state: string
              then:
                - lambda: |-
                    id(nextion1).set_nextion_text_state(name,state);

.. _nextion_queue_types:

**Queue Types**

.. list-table::
    :header-rows: 1
    :width: 60%

    * - Type
      - Value
    * - ``SENSOR``
      - ``0``
    * - ``BINARY_SENSOR``
      - ``1``
    * - ``SWITCH``
      - ``2``
    * - ``TEXT_SENSOR``
      - ``3``
    * - ``WAVEFORM_SENSOR``
      - ``4``
    * - ``NO_RESULT``
      - ``5``

.. _display-nextion_automation:

Nextion Automations
-------------------

Triggers
********

Several :ref:`actions-trigger` are available for use with your Nextion display.

.. _nextion-on_setup:

``on_setup``
^^^^^^^^^^^^

This automation will be triggered when a connection is established with the Nextion display. This happens after boot
and it may take some time (hundreds of milliseconds). It could be used to change some display element once start-up is
complete. For example:

.. code-block:: yaml

    wifi:
      ap:  # Spawn an AP with the device name and MAC address with no password

    captive_portal:

    display:
      - platform: nextion
        id: disp
        on_setup:
          then:
            - lambda: |-
                // Check if WiFi hot-spot is configured
                if (wifi::global_wifi_component->has_sta()) {
                  // Show the main page
                  id(disp).goto_page("main_page");
                } else {
                  // Show WiFi Access Point QR code for captive portal, see https://qifi.org/
                  id(disp).goto_page("wifi_qr_page");
                }

.. _nextion-on_sleep:

``on_sleep``/``on_wake``
^^^^^^^^^^^^^^^^^^^^^^^^

These automations will be triggered upon sleep or upon wake (respectively). The Nextion does not accept commands or
updates while in sleep mode; these triggers may be used to cope with this. For example, you could use them to
:ref:`force an update <nextion_update_all_components>`, refreshing the display's content upon wake-up.

.. _nextion-on_page:

``on_page``
^^^^^^^^^^^

This automation is triggered when the page is changed on display. This includes both ESPHome-initiated and
Nextion-initiated page changes. ESPHome initiates a page change by calling either the ``goto_page("page_name")`` or
``goto_page(page_id)`` functions. The Nextion itself can also change pages as a reaction to user activity (touching
some display UI element) or by using a timer. In either case, this automation can be useful to update on-screen
controls for the newly displayed page.

If you fully own your Nextion HMI design and follow the best practice of setting ``vscope`` to "global" for UI
components you've defined in the Nextion Editor, you'll probably never need this trigger. However, if this is not the
case and some/all of your UI components have their ``vscope`` set to "local", ``on_page`` will be your remedy -- it
enables you to initiate updates of the relevant components.

Before updating components, you need to know which page the Nextion is displaying. The ``x`` argument will contain an
integer which indicates the current page ID number.

Given the page ID, the appropriate components can be updated. Two strategies are be possible:

- Use :ref:`Nextion Sensors <nextion_sensor>` for every UI field and use one of the
  :ref:`update functions <nextion_update_all_components>`.
- Manually set component text or value for each field:

  .. code-block:: yaml

      on_page:
        then:
          - lambda: |-
              switch (x) {
                case 0x02: // wifi_qr_page
                  // Manually trigger update for controls on page 0x02 here
                  id(disp).set_component_text_printf("qr_wifi", "WIFI:T:nopass;S:%s;P:;;", wifi::global_wifi_component->get_ap().get_ssid().c_str());
                  break;
              }

.. _nextion-on_touch:

``on_touch``
^^^^^^^^^^^^

This automation is triggered when a component is pressed or released on the Nextion display.

The following arguments will be available:

  - ``page_id``: Contains the ID (integer) of the page where the touch happened.
  - ``component_id``: Contains the ID (integer) of the component touched. **You must have "Send Component ID" enabled
    for "Touch Press Event" and/or "Touch Release Event" for the UI element in your HMI configuration in the**
    `Nextion Editor <https://nextion.tech/nextion-editor/>`__.
  - ``touch_event``: It will be ``true`` for a "press" event, or ``false`` for a "release" event.

.. code-block:: yaml

    on_touch:
      then:
        - lambda: |-
            ESP_LOGD("nextion.on_touch", "Nextion touch event detected!");
            ESP_LOGD("nextion.on_touch", "Page ID: %i", page_id);
            ESP_LOGD("nextion.on_touch", "Component ID: %i", component_id);
            ESP_LOGD("nextion.on_touch", "Event type: %s", touch_event ? "Press" : "Release");

.. _nextion-on_buffer_overflow:

``on_buffer_overflow``
^^^^^^^^^^^^^^^^^^^^^^

This automation is triggered when the Nextion display reports a serial buffer overflow. When this happens, the
Nextion's buffer will continue to receive the new instructions, but all previous instructions are lost and the Nextion
queue may get out of sync.

This automation will allow you to gracefully handle this situation; for example, you could repeat some command/update
to the Nextion or restart the system.

.. code-block:: yaml

    on_buffer_overflow:
      then:
        - lambda: |-
            ESP_LOGW("nextion.on_buffer_overflow", "Nextion reported a buffer overflow event!");

Actions
*******

.. _nextion-set_brightness:

``display.nextion.set_brightness``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can use this :ref:`action<actions-action>` to set the brightness of the Nextion's backlight.

.. code-block:: yaml

    on_...:
      then:
        - display.nextion.set_brightness: 50%

Or, if you happen to have multiple Nextion displays connected, you may need to use the long form:

.. code-block:: yaml

    on_...:
      then:
        - display.nextion.set_brightness:
            id: nextion1
            brightness: 50%

.. _nextion_upload_tft_file:

Uploading A TFT File
--------------------

This will use the file specified for ``tft_url`` to update ("OTA") the Nextion.

Once completed, both ESPHome and the Nextion will reboot. ESPHome will be unresponsive during the upload process and no
logging or other :doc:`automations</automations/index>` will occur. This process uses the same protocol as the
`Nextion Editor <https://nextion.tech/nextion-editor/>`__ and only transfers required portions of the TFT file.

.. warning::

    *Use of software UARTs is known to result in unpredictable/inconsistent behavior and will likely result in the
    update process failing.*

    If you experience problems with the update process and are using a software UART (for example, on the ESP8266), you
    should switch to an ESP32 or supported variant which has more available :ref:`uart-hardware_uarts`.

You can use Home Assistant itself or any other web server to host the TFT file. When using HTTPS (generally
recommended), you may notice reduced upload speeds as the encryption consumes more resources on the microcontroller.

We suggest using a :doc:`/components/button/template` to trigger this process. For example:

.. code-block:: yaml

    button:
      - platform: template
        id: update_nextion_button
        name: Update Nextion
        entity_category: diagnostic
        on_press:
          then:
            - lambda: 'id(nextion1)->upload_tft();'

Home Assistant
**************

To host the TFT file from Home Assistant, create a ``www`` directory (if it doesn't already exist) in your ``config``
directory. If you wish, you may also create a subdirectory for your TFT files.

For example, if the file is located in your configuration directory ``www/tft/default.tft``, the URL to access it will
be ``http(s)://your_home_assistant_url:port/local/tft/default.tft``

Components
----------

This library supports a few different components allowing communication between Home Assistant, ESPHome and Nextion.

.. note::

    If the Nextion is sleeping or if the component was set to be hidden, it will not update its components even if
    updates are sent. To work around this, after the Nextion wakes up, all components will send their states to the
    Nextion.

With the exception of the :doc:`../binary_sensor/nextion` that has the ``page_id``/``component_id`` options configured,
the example below illustrates:

 - Polling the Nextion for updates
 - Dynamic updates sent from the Nextion to ESPHome

 .. code-block:: yaml

     sensor:
       - platform: nextion
         nextion_id: nextion1
         name: "n0"
         component_name: n0
       - platform: nextion
         id: current_page
         name: "current_page"
         variable_name: dp
         update_interval: 1s


Note that the first one requires a custom protocol to be included in the Nextion display's HMI code/configuration. See
the individual components (linked below) for more detail.

See Also
--------

- :doc:`index`
- :doc:`../binary_sensor/nextion`
- :doc:`../sensor/nextion`
- :doc:`../switch/nextion`
- :doc:`../text_sensor/nextion`
- :doc:`../uart`
- :apiref:`nextion/nextion.h`
- `Simple Nextion Library <https://github.com/bborncr/nextion>`__ by `Bentley Born <https://github.com/bborncr>`__
- `Official Nextion Library <https://github.com/itead/ITEADLIB_Arduino_Nextion>`__ by `iTead <https://www.itead.cc/>`__
- :ghedit:`Edit`
