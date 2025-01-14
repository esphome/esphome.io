Nextion TFT LCD Display
=======================

.. seo::
    :description: Instructions for setting up Nextion TFT LCD displays
    :image: nextion.jpg

The ``nextion`` display platform allows you to use Nextion LCD displays (`datasheet <https://nextion.itead.cc/resources/datasheets/>`__,
`iTead <https://www.itead.cc/display/nextion.html>`__)
with ESPHome.

.. figure:: images/nextion-full.jpg
    :align: center
    :width: 75.0%

    Nextion LCD Display.

As the communication with the Nextion LCD display is done using UART, you need to have an :ref:`UART bus <uart>`
in your configuration with ``rx_pin`` both the ``tx_pin`` set to the respective pins on the display.
The Nextion uses a baud rate of 9600 by default. It may be configured to use a faster speed by adding (for
example)

.. code-block:: c++

    baud=115200   // Sets the baud rate to 115200
    bkcmd=0       // Tells the Nextion to not send responses on commands. This is the current default but can be set just in case



to the ``program.s`` source file (in the Nextion Editor) before the ``page`` line.
This permits faster communication with the Nextion display and it is highly recommended when using :ref:`uart-hardware_uarts`. Without a hardware uart make sure to set the baud rate to 9600.


The below example configures a UART for the Nextion display to use

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

- **uart_id** (*Optional*, :ref:`config-id`): The ID of the :ref:`UART bus <uart>` you wish to use for this display.
  Use this if you want to use multiple UART buses at once.
- **brightness** (*Optional*, percentage): Set display brightness in %. Defaults to ``100%``
- **lambda** (*Optional*, :ref:`lambda <config-lambda>`): The lambda to use for rendering the content on the nextion display.
  See :ref:`display-nextion_lambda` for more information. This is typically empty. The individual components for the Nextion will handle almost all features needed for updating
- **update_interval** (*Optional*, :ref:`config-time`): The interval to call the lambda to update the display.
  Defaults to ``5s``.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.
- **tft_url** (*Optional*, string): The URL to download the TFT file from for updates. See :ref:`Nextion Upload <nextion_upload_tft>`.
- **touch_sleep_timeout** (*Optional*, int): Sets internal No-touch-then-sleep timer in seconds.
- **start_up_page** (*Optional*, int): Sets the page to display when ESPHome connects to the Nextion. (Nextion shows page 0 on start-up by default).
- **wake_up_page** (*Optional*, int): Sets the page to display after waking up
- **auto_wake_on_touch** (*Optional*, boolean): Sets if Nextion should auto-wake from sleep when touch press occurs.
- **exit_reparse_on_start** (*Optional*, boolean): Request the Nextion exit Active Reparse Mode before setup of the display. Defaults to ``false``.
- **skip_connection_handshake** (*Optional*, boolean): Sets whether the initial display connection handshake process is skipped.
  When set to ``true``, the connection will be established without performing the handshake. This can be useful when using Nextion Simulator.
  Defaults to ``false``.
- **on_setup** (*Optional*, :ref:`Action <config-action>`): An action to be performed after ESPHome connects to the Nextion. See :ref:`Nextion Automation <nextion-on_setup>`.
- **on_sleep** (*Optional*, :ref:`Action <config-action>`): An action to be performed when the Nextion goes to sleep. See :ref:`Nextion Automation <nextion-on_sleep>`.
- **on_wake** (*Optional*, :ref:`Action <config-action>`): An action to be performed when the Nextion wakes up. See :ref:`Nextion Automation <nextion-on_sleep>`.
- **on_page** (*Optional*, :ref:`Action <config-action>`): An action to be performed after a page change. See :ref:`Nextion Automation <nextion-on_page>`.
- **on_touch** (*Optional*, :ref:`Action <config-action>`): An action to be performed after a touch event (press or release). See :ref:`Nextion Automation <nextion-on_touch>`.
- **on_buffer_overflow** (*Optional*, :ref:`Action <config-action>`): An action to be performed when the Nextion reports a buffer overflow. See :ref:`Nextion Automation <nextion-on_buffer_overflow>`.

.. _display-nextion_lambda:

Rendering Lambda
----------------

With Nextion displays, a dedicated chip on the display itself does the whole rendering. ESPHome can only
send *instructions* to the display to tell it *how* to render something and *what* to render.

First, you need to use the `Nextion Editor <https://nextion.tech/nextion-editor/>`__ to
create a display file and insert it using the SD card slot. Then, in the rendering ``lambda``, you can use the various API calls
to populate data on the display:

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

    Although you can use the rendering lambda most, if not all, updates to the Nextion can be handled by the individual Nextion components. **See Below**

Please see :ref:`display-printf` for a quick introduction into the ``printf`` formatting rules and
:ref:`display-strftime` for an introduction into the ``strftime`` time formatting.

Lambda Calls
************

Several methods are available for use within :ref:`lambdas <config-lambda>`; these permit advanced functionality beyond simple
display updates. See the full :apiref:`nextion/nextion.h` for more info.

.. _nextion_upload_tft:

- ``upload_tft``: Start the upload process. See :ref:`nextion_upload_tft_file`

The developer tools in Home Assistant can be used to trigger the update. The below code block is an example on how to set this up.
  .. code-block:: yaml

      api:
        actions:
          - action: update_nextion
            then:
              - lambda: 'id(nextion1)->upload_tft();'

.. _nextion_update_all_components:

- ``update_all_components()``: All the components will publish their states.

  .. code-block:: c++

      id(nextion1).update_all_components();

.. _update_components_by_prefix:

- ``update_components_by_prefix(std::string page)``: This will send the current state of any **component_name** matching the prefix. Some settings like background color need to be resent on page change. This is a good hook for that.

  .. code-block:: c++

      id(nextion1).update_components_by_prefix("page0.");

.. _set_nextion_sensor_state:

- ``set_nextion_sensor_state(NextionQueueType queue_type, std::string name, float state);`` : Sets the sensor state. See :ref:`Queue Types <nextion_queue_types>`
- ``set_nextion_sensor_state(int queue_type, std::string name, float state);`` : Sets the sensor state. See :ref:`Queue Types <nextion_queue_types>`

- ``set_nextion_text_state(std::string name, std::string state);`` : Sets the text sensor state

.. note::

    Below is a method for HASS to send updates to the Nextion by code.

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

 Queue Types:
  - SENSOR            0
  - BINARY_SENSOR     1
  - SWITCH            2
  - TEXT_SENSOR       3
  - WAVEFORM_SENSOR   4
  - NO_RESULT         5

.. _display-nextion_automation:

Nextion Automation
------------------

With Nextion displays, it's possible to define several automation actions. Depending on your setup, you may or may not need to use some of them.

.. _nextion-on_setup:

``on_setup``
************

This automation will be triggered once ESP establishes a connection with Nextion. This happens after a boot up and may take some
noticeable time (e.g. hundreds of milliseconds) to establish a connection over UART. Typical use scenario for this automation is choosing of the initial
page to display depending on some runtime conditions or simply showing a page with a non-zero index (Nextion shows page 0 by default and ESPHome will
use ``start_up_page`` on connection, if set).

.. code-block:: yaml

    wifi:
      ap: {} # This spawns an AP with the device name and mac address with no password.

    captive_portal:

    display:
      - platform: nextion
        id: disp
        on_setup:
          then:
            lambda: |-
              // Check if WiFi hot-spot is configured
              if (wifi::global_wifi_component->has_sta()) {
                // Show the main page
                id(disp).goto_page("main_page");
              } else {
                // Show WiFi Access Point QR code for captive portal, see https://qifi.org/
                id(disp).goto_page("wifi_qr_page");
              }

.. _nextion-on_sleep:

``on_sleep / on_wake``
**********************

The action is called before and after Nextion goes to sleep mode. Nextion is not responsive while in sleep mode. Use these triggers to prepare your code
for that and :ref:`force-update <nextion_update_all_components>` the on-screen content once it's back.

.. _nextion-on_page:

``on_page``
***********

This automation is triggered when a page is changed on the Nextion display. This includes both ESP and Nextion initiated page changes.
ESP initiates a page change by calling ``goto_page("page_name")`` or ``goto_page(page_id)`` function. Nextion can change pages as a reaction to user's activity (e.g. clicks) or using a timer.
In either case, this automation can be helpful to update on-screen controls for the newly displayed page.

If you fully own your Nextoin HMI design and follow the best practice of setting the components' vscope to global in the Nextion Editor, you'll probably never need this trigger.
However, if this is not the case and all / some of your UI components have local visibility scope, ``on_page`` will be your remedy. Here you can initiate updates of the relevant components.

Before actually updating components, you need to understand which page Nextion was switched to. ``x`` argument will contain a page id integer.
Once you know the page id, it's time to update the components. Two strategies would be possible. The first one is to use :ref:`Nextion Sensors <nextion_sensor>` for every UI field and use one of the
:ref:`update functions <nextion_update_all_components>`. The second is to manually set component text or value for each field:

.. code-block:: yaml

    on_page:
      then:
        lambda: |-
          switch (x) {
            case 0x02: // wifi_qr_page
              // Manually trigger update for controls on page 0x02 here
              id(disp).set_component_text_printf("qr_wifi", "WIFI:T:nopass;S:%s;P:;;", wifi::global_wifi_component->get_ap().get_ssid().c_str());
              break;
          }

.. _nextion-on_touch:

``on_touch``
************

This automation is triggered when a component is pressed or released on the Nextion display.

The following arguments will be available:

  - ``page_id``: Contains the id (integer) of the page where the touch happened.

  - ``component_id``: Contains the id (integer) of the component touched. It's required that the component have "Send Component ID" enabled either for "Touch Press Event" and/or "Touch Release Event".

  - ``touch_event``: It will be ``true`` for a "press" event, or ``false`` for a "release" event.

.. code-block:: yaml

    on_touch:
      then:
        lambda: |-
          ESP_LOGD("nextion.on_touch", "Nextion touch event detected!");
          ESP_LOGD("nextion.on_touch", "Page Id: %i", page_id);
          ESP_LOGD("nextion.on_touch", "Component Id: %i", component_id);
          ESP_LOGD("nextion.on_touch", "Event type: %s", touch_event ? "Press" : "Release");

.. _nextion-on_buffer_overflow:

``on_buffer_overflow``
**********************

This automation is triggered when the Nextion display reports a serial buffer overflow.
When this happens, the Nextion's buffer will continue to receive the new instructions, but all previous instructions are lost and the Nextion queue may get out of sync.
This automation will allow you handle this situation nicelly, like repeating some command to Nextion or restarting the system.

.. code-block:: yaml

    on_buffer_overflow:
      then:
        lambda: |-
          ESP_LOGW("nextion.on_buffer_overflow", "Nextion reported a buffer overflow event!");

.. _nextion_upload_tft_file:

Uploading A TFT File
--------------------
This will download the file from the tft_url and will transfer it over the UART to the Nextion.
Once completed both the ESP and Nextion will reboot. During the upload process esphome will be
unresponsive and no logging will take place. This uses the same protocol as the Nextion editor and
only updates the changes of the TFT file. If HTTPS/SSL is enabled it will be about 1kB/sec.

.. warning::

    If :ref:`uart-hardware_uarts` are not available then inconsistent results WILL occur. Lowering the speed to 9600 baud may help.


To host the TFT file you can use Home Assistant itself or any other web server. HTTPS, while always recommended on any network, will greatly reduce the upload speed.

Home Assistant
**************
To host the TFT file from Home Assistant, create a www directory if it doesn't exist in your config
directory. You can create a subdirectory for those files as well.

For example if the file is located
under your configuration directory ``www/tft/default.tft`` the URL to access it will be
``http(s)://your_home_assistant_url:port/local/tft/default.tft``

NGINX
*****

`NGINX <https://www.nginx.com/>`__

The below NGINX example configuration will serve files out of the /var/www/nextion directory.

.. code-block:: nginx

    server {
      listen 80;
      access_log  /var/log/nginx/nextion_access.log;
      error_log  /var/log/nginx/nextion_error.log;
      root /var/www/nextion;
    }



Components
----------
This library supports a few different components allowing communication back and forth from HA <-> MCU <-> Nextion.

.. note::

    If the Nextion is sleeping or if the component was set to be hidden, it will not update its components even if updates are sent.
    After the Nextion wakes up, all components will send their states to the Nextion to get around this.

With the exception of the :doc:`../binary_sensor/nextion` that has the ``page_id``/``component_id`` options configured, the example below illustrates:
 - Polling the Nextion for updates
 - Dynamic updates sent from the Nextion to the ESP device

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


Note that the first one requires a custom protocol to be included in the Nextion display's code/configuration. See the individual components for more detail.

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
