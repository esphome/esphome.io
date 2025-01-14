.. _display-image:

Images
======

.. seo::
    :description: Instructions to display static images on ESPHome
    :image: image-outline.svg

Use this component to store graphical images on the device, you can then draw the images on compatible displays.

For showing images downloaded at runtime, take a look at the :ref:`Online Image <online_image>` component.

.. code-block:: yaml

    image:
      - file: "image.png"
        id: my_image
        resize: 100x100

.. code-block:: yaml

    image:
      - file: mdi:alert-outline
        id: alert
        resize: 80x80

.. code-block:: yaml

    image:
      - file: https://esphome.io/_images/logo.png
        id: esphome_logo
        resize: 200x162

Configuration variables:
------------------------

- **file** (**Required**, string):

  - **Local files**: The path (relative to where the .yaml file is) of the image file.
  - **Material Design Icons**: Specify the `Material Design Icon <https://pictogrammers.com/library/mdi/>`_
    id in the format ``mdi:icon-name``, and that icon will automatically be downloaded and added to the configuration.
  - **Remote files**: The URL of the image file.

- **id** (**Required**, :ref:`config-id`): The ID with which you will be able to reference the image later
  in your display code.
- **resize** (*Optional*, string): If set, this will resize the image to fit inside the given dimensions ``WIDTHxHEIGHT``
  and preserve the aspect ratio.
- **type** (*Optional*): Specifies how to encode image internally. Defaults to ``BINARY`` for local and remote images and ``TRANSPARENT_BINARY`` for MDIs.

  - ``BINARY``: Two colors, suitable for 1 color displays or 2 color image in color displays. Uses 1 bit
    per pixel, 8 pixels per byte.
  - ``TRANSPARENT_BINARY``: One color, any pixel that is fully transparent will not be drawn, and any other pixel
    will be the on color. Uses 1 bit per pixel, 8 pixels per byte.
  - ``GRAYSCALE``: Full scale grey. Uses 8 bits per pixel, 1 pixel per byte.
  - ``RGB565``: Lossy RGB color stored. Uses 2 bytes per pixel.
  - ``RGB24``: Full RGB color stored. Uses 3 bytes per pixel.
  - ``RGBA``: Full RGB color stored. Uses 4 bytes per pixel. Any pixel with an alpha value < 127 will not be drawn.

- **use_transparency** (*Optional*): If set the alpha channel of the input image will be taken into account, and pixels with alpha < 127 will not be drawn. For image types without explicit alpha channel, the color (0, 0, 1) (very dark blue) will be mapped to black, to be able to store transparency information within the image. Explicitly transparent types (``TRANSPARENT_BINARY`` and ``RGBA``) default to ``True`` and cannot be set to ``False``; other types default to ``False``.

- **dither** (*Optional*): Specifies which dither method used to process the image, only used in GRAYSCALE and BINARY type image. Defaults to ``NONE``. You can read more about it `here <https://pillow.readthedocs.io/en/stable/reference/Image.html?highlight=Dither#PIL.Image.Image.convert>`__ and `here <https://en.wikipedia.org/wiki/Dither>`__.

  - ``NONE``: Every pixel convert to its nearest color.
  - ``FLOYDSTEINBERG``: Uses Floyd-Steinberg dither to approximate the original image luminosity levels.

.. note::

    To use images you will need to have the python ``pillow`` package installed.
    Additionally, if you want to use SVG images (including MDI images), you will
    additionally need to have the python ``cairosvg`` package installed.

    If you're running this as a Home Assistant add-on or with the official ESPHome docker image, it should already be installed.

    Use ``pip install "esphome[displays]"`` to install these optional dependencies with
    the versions that ESPHome requires.

And then later in code:

.. code-block:: yaml

    display:
      - platform: ...
        # ...
        lambda: |-
          // Draw the image my_image at position [x=0,y=0]
          it.image(0, 0, id(my_image));

By default, ESPHome will *align* the image at the top left. That means if you enter the coordinates
``[0,10]`` for your image, the top left of the image will be at ``[0,10]``. If you want to draw some
image at the right side of the display, it is however sometimes useful to choose a different **image alignment**.
When you enter ``[0,10]`` you're really telling ESPHome that it should position the **anchor point** of the image
at ``[0,10]``. When using a different alignment, like ``TOP_RIGHT``, the image will be positioned left of the anchor
pointed, so that, as the name implies, the anchor point is a the *top right* corner of the image.

.. code-block:: yaml

    display:
      - platform: ...
        # ...
        lambda: |-
          // Aligned on left by default
          it.image(0, 0, id(my_image));

          // Aligned on right edge
          it.image(it.get_width(), 0, id(my_image), ImageAlign::TOP_RIGHT);

For binary images the ``image`` method accepts two additional color parameters which can
be supplied to modify the color used to represent the on and off bits respectively. e.g.

.. code-block:: yaml

    display:
      - platform: ...
        # ...
        lambda: |-
          // Draw the image my_image at position [x=0,y=0]
          // with front color red and back color blue
          it.image(0, 0, id(my_image), id(red), id(blue));

          // Aligned on right edge
          it.image(it.get_width(), 0, id(my_image), ImageAlign::TOP_RIGHT, id(red), id(blue));

You can also use this to invert images in two color displays, use ``COLOR_OFF`` then ``COLOR_ON``
as the additional parameters.
