ehmtx a matrix status display
=============================

.. seo::
    :description: A simple DIY status display, build with a flexible 8x32 RGB LED panel.
    :image: ehmtx.jpg
    :keywords: DIY matrix display RGB

Based on a cheap 8x32 RGB matrix you can build flexible status displays for all kind of informations. It is expandable with sensors etc.

.. figure:: images/ehmtx.jpg
    :align: center
    :width: 40%


Introduction
------------

Based a on a 8x32 RGB flexible matrix it displays a clock, the date and up to 16 other screens provided by home assistant. 
Each screen (value/text) can be associated with a 8x8 bit RGB icon or gif animation (see installation). 
The values/text can be updated or deleted from the display queue. Each screen has a lifetime, if not refreshed in its lifetime it will disapear.

ESPHome Configuration
---------------------
Documentation:

- `Source for the component on github <https://github.com/lubeda/EsphoMaTrix>`__
- `Discussion in the homeassistant community <https://community.home-assistant.io/t/esphomatrix-a-simple-clock-status-display/425325>`__
- `Second discussion in the homeassistant community <https://community.home-assistant.io/t/a-simple-diy-status-display-with-an-8x32-rgb-led/379051>`__
- `Optional notify component <https://github.com/lubeda/EHMTX_custom_component>`__

`YAML configuration example for ESP32 <https://github.com/lubeda/EsphoMaTrix/blob/main/UlanziTC001.yaml>`__.

Sample video:

.. raw:: html

    <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/ZyaFj7ArIdY" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


See Also
--------
- :ghedit:`Edit`
