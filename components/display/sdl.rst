SDL2 Display on host platform
=============================

.. seo::
    :description: Instructions for setting up SDL2 display on host
    :image: sdl.png

.. _sdl:

Usage
-----

The ``sdl`` display platform allows you to use create an ESPHome display on a desktop system running Linux or MacOS.
This is particularly useful for designing display layouts, since compiling and running a host binary is much faster
than compiling for and flashing a microcontroller target system.

.. code-block:: yaml

    # Example configuration entry
    esphome:
      name: sdl

    host:

    display:
      - platform: sdl
        show_test_card: true
        dimensions:
          width: 450
          height: 600


Configuration variables:
************************

- **lambda** (*Optional*, :ref:`lambda <config-lambda>`): The lambda to use for rendering the content on the display.
  See :ref:`display-engine` for more information.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to re-draw the screen. Defaults to ``1s``.
- **sdl_options** (*Optional*, string): Build arguments if required to specify include or library paths. Should not be required if SDL2 is properly installed.
- **pages** (*Optional*, list): Show pages instead of a single lambda. See :ref:`display-pages`.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.


.. note::

    To build with this display you must have the
    `SDL2 <https://wiki.libsdl.org/SDL2/Installation>`__ package installed. The Sodium encryption library will
    also be required for any API calls. See below for installation hints.

MacOS SDL2 Installation
-----------------------

The easiest way to install SDL2 on MacOS is using ``homebrew``:

.. code-block:: sh

    brew install sdl2 libsodium

It may also be necessary to run the command:


.. code-block:: sh


    brew link sdl2 libsodium



To ensure that the files are symlinked correctly.
You can check installation with the command ``sdl2-config --libs --cflags``.

You will need the XCode command-line tools installed to build for the host platform.

Linux SDL2 Installation
-----------------------

On Debian/Ubuntu derived Linux systems you can install with ``apt``; also check that you have the necessary build
tools installed, and you must be using a desktop system with a graphic display.

.. code-block:: sh

    apt install libsdl2-dev libsodium-dev build-essential git

You can check installation with the command ``sdl2-config --libs --cflags``.


Microsoft Windows
-----------------

Although SDL2 is supported, natively running ESPHome on Windows isn't easy. However the *Windows Subsystem for Linux* (WSL) can be
used to install and use a Linux development environment on Windows, which will enable use of ESPHome and SDL2 as per the
Linux instructions above. See https://learn.microsoft.com/en-us/windows/wsl/install for more information on WSL.

Build and run
-------------

The ``esphome run yourfile.yaml`` command will compile and automatically run the build file on the ``host`` platform.

See Also
--------

- :ref:`SDL touchscreen <sdl_touchscreen>`
- :doc:`SDL binary sensor </components/binary_sensor/sdl>`
- :doc:`index`
- :apiref:`sdl/sdl_esphome.h`
- :ghedit:`Edit`
