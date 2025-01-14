Web Server Component
====================

.. seo::
    :description: Instructions for setting up a web server in ESPHome.
    :image: http.svg
    :keywords: web server, http, REST API

The ``web_server`` component creates a simple web server on the node that can be accessed
through any browser and a simple :ref:`api-rest`. Please note that enabling this component
will take up *a lot* of memory and may decrease stability, especially on ESP8266.

.. figure:: /components/images/web_server.png
    :align: center
    :width: 86.0%

    Web server version 1

.. figure:: /components/images/web_server-v2.png
    :align: center
    :width: 86.0%

    Web server version 2


.. figure:: /components/images/web_server-v3.png
    :align: center
    :width: 86.0%

    Web server version 3

    
To navigate to the web server in your browser, either use the IP address of the node or
use ``<node_name>.local/`` (note the trailing forward slash) via mDNS.


.. code-block:: yaml

    # Example configuration entry
    web_server:
      port: 80


Configuration variables:
------------------------

- **port** (*Optional*, int): The port the web server should open its socket on.
- **css_url** (*Optional*, url): The URL that should be used for the CSS stylesheet. Defaults
  to https://esphome.io/_static/webserver-v1.min.css (updates will go to ``v2``, ``v3``, etc). Can be set to empty string.
- **css_include** (*Optional*, local file): Path to local file to be included in web server index page.
  Contents of this file will be served as ``/0.css`` and used as CSS stylesheet by internal webserver.
  Useful when building device without internet access, where you want to use built-in AP and webserver.
- **js_url** (*Optional*, url): The URL that should be used for the JS script. Defaults
  to https://esphome.io/_static/webserver-v1.min.js. Can be set to empty string.
- **js_include** (*Optional*, local file): Path to local file to be included in web server index page.
  Contents of this file will be served as ``/0.js`` and used as JS script by internal webserver.
  Useful when building device without internet access, where you want to use built-in AP and webserver.
- **auth** (*Optional*): Enables a simple *Digest* authentication with username and password.

  - **username** (**Required**, string): The username to use for authentication.
  - **password** (**Required**, string): The password to check for authentication.

- **include_internal** (*Optional*, boolean): Whether ``internal`` entities should be displayed on the
  web interface. Defaults to ``false``.
- **enable_private_network_access** (*Optional*, boolean): Enables support for
  `Private Network Access <https://wicg.github.io/private-network-access>`__ and the
  `Private Network Access Permission Prompt <https://wicg.github.io/private-network-access/#permission-prompt>`__.
  Defaults to ``true``.
- **log** (*Optional*, boolean): Turn on or off the log feature inside webserver. Defaults to ``true``.
- **ota** (*Optional*, boolean): Turn on or off the OTA feature inside webserver. Strongly not suggested without enabled authentication settings. Defaults to ``true``. Cannot be used with the ``esp-idf`` framework.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.
- **local** (*Optional*, boolean): Include supporting javascript locally allowing it to work without internet access. Defaults to ``false``.
- **version** (*Optional*, string): ``1``, ``2`` or ``3``. Version 1 displays as a table. Version 2 uses web components and has more functionality. Version 3 uses HA-Styling. Defaults to ``2``.
- **sorting_groups**  (*Optional*, list): Avaliable only on ``version: 3``. A list of group ID's and names to group the entities. See :ref:`Webserver Entity Grouping <config-webserver-grouping>`.
  
  - **id** (*Required*, :ref:`config-id`): Manually specify the ID used for the group.
  - **name** (*Required*, string): A string representing the group name which is displayed as the header of the group
  - **sorting_weight** (*Optional*, float) A float representing the weight of the group. A group with a smaler ``sorting_weight`` will be displayed first. Defaults to ``50``

To conserve flash size, the CSS and JS files used on the root page to show a simple user
interface are hosted by esphome.io. If you want to use your own service, use the
``css_url`` and ``js_url`` options in your configuration.

Example configurations:
-----------------------

Enabling HTTP authentication:

.. code-block:: yaml

    # Example configuration entry
    web_server:
      port: 80
      auth:
        username: !secret web_server_username
        password: !secret web_server_password

Use version 1 user interface:

.. code-block:: yaml

    # Example configuration entry
    web_server:
      port: 80
      version: 1

No internet/intranet required on the clients (all assets are inlined, compressed and served from flash):

.. code-block:: yaml

    # Example configuration entry
    web_server:
      local: true


Advanced usage
--------------

The following assume copies of the files with local paths - which are config dependant.

Example ``web_server`` version 1 configuration with CSS and JS included from esphome-docs.
CSS and JS URL's are set to empty value, so no internet access is needed for this device to show it's web interface.
Force to turn off OTA function because the missing authentication.

.. code-block:: yaml

    web_server:
      port: 80
      version: 1
      ota: false
      css_include: "../../../esphome-docs/_static/webserver-v1.min.css"
      css_url: ""
      js_include: "../../../esphome-docs/_static/webserver-v1.min.js"
      js_url: ""

Example ``web_server`` version 2 configuration with JS included from a local file.
CSS and JS URL's are set to empty value, so no internet access is needed for this device to show it's web interface.
V2 embeds the css within the js file so is not required, however you could include your own CSS.

.. code-block:: yaml

    # Example configuration entry v2
    web_server:
      js_include: "./v2/www.js"
      js_url: ""
      version: 2


Copy https://oi.esphome.io/v2/www.js to a V2 folder in your yaml folder.


.. _config-webserver-version-3-options:

Version 3 features
---------------------------


.. _config-webserver-sorting:

Entity sorting
**************

Version `3` supports the sorting of the entities.
You can set a ``sorting_weight`` on each entity.
Smaller numbers will be displayed first, defaults to 50.
``My Sensor 2`` is displayed before ``My Sensor 1``

Example configuration:

.. code-block:: yaml

    sensor:
      - platform: template
        name: "My Sensor 1"
        web_server:
          sorting_weight: 10
      - platform: template
        name: "My Sensor 2"
        web_server:
          sorting_weight: -1


.. _config-webserver-grouping:

Entity grouping
***************

Version `3` of the ``web_server`` allows for grouping of entities in custom groups.
Groups can be sorted by providing a ``sorting_weight``. Groups with a smaller ``sorting_weight`` will be displayed first.
If you don't provide a ``web_server_sorting_group`` on the component, the ``entity_category`` will be used as the group.

Example configuration:

.. code-block:: yaml

    web_server:
      version: 3
      sorting_groups:
        - id: sorting_group_time_settings
          name: "Time Settings"
          sorting_weight: 10
        - id: sorting_group_number_settings
          name: "Number settings"
          sorting_weight: 20
          
    datetime:
      - platform: template
        ...
        web_server:
          sorting_group_id: sorting_group_time_settings

    number:
      - platform: template
      ...
        web_server:
          sorting_group_id: sorting_group_number_settings


Number in slider mode
*********************
.. figure:: /components/images/web_server/number-slider-popup.png
    :align: left
    :width: 100.0%


You can change the value by moving the slider.
If you wish to enter a precise number you can click and hold the current value. A popup input field will appear where you can enter a number and confirm your input by pressing the enter key.

.. figure:: /components/images/web_server/number-slider-popup-input-field.png
    :align: left
    :width: 100.0%


Expand Controls and Logs
************************
.. figure:: /components/images/web_server/tab-header-expand-cloapsed.png
    :align: left
    :width: 100.0%


By double-clicking on any group header you can expand the controls to fill up the whole screen.
You can do the same for the logs.

.. figure:: /components/images/web_server/tab-header-expand-controls-expanded.png
    :align: center
    :width: 100.0%

    Expanded Controls


.. figure:: /components/images/web_server/tab-header-expand-logs-expanded.png
    :align: center
    :width: 100.0%

    Expanded Logs


Sensor value graph
******************
.. figure:: /components/images/web_server/sensor-history-graph.png
    :align: left
    :width: 100.0%

By clicking on any sensor it will expand a graph with the historical values for that sensor.

See Also
--------

- :ref:`api-event-source`
- :ref:`api-rest`
- :apiref:`web_server/web_server.h`
- :doc:`prometheus`
- :ghedit:`Edit`
