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
        type: binary
        id: my_image
        resize: 100x100

.. code-block:: yaml

    image:
      - file: mdi:alert-outline
        id: alert
        type: grayscale
        transparency: alpha_channel
        resize: 80x80

.. code-block:: yaml

    image:
      - file: https://esphome.io/_images/logo.png
        type: rgb565
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
- **type** (**Required**): Specifies how to encode image internally.

  - ``BINARY``: Two colors, suitable for 1 color displays or 2 color image in color displays. Uses 1 bit
    per pixel, 8 pixels per byte. Only ``chroma_key`` transparency is available.
  - ``GRAYSCALE``: Full scale grey. Uses 8 bits per pixel, 1 pixel per byte.
  - ``RGB565``: Lossy RGB color stored. Uses 2 bytes per pixel, 3 with an alpha channel.
  - ``RGB``: Full RGB color stored. Uses 3 bytes per pixel, 4 with an alpha channel.

- **transparency** (*Optional*): If set the alpha channel of the input image will be taken into account. The possible values are ``opaque`` (default), ``chroma_key`` and ``alpha_channel``. See discussion on transparency below.

- **dither** (*Optional*): Specifies which dither method used to process the image, only used in GRAYSCALE and BINARY type image. Defaults to ``NONE``. You can read more about it `here <https://pillow.readthedocs.io/en/stable/reference/Image.html?highlight=Dither#PIL.Image.Image.convert>`__ and `here <https://en.wikipedia.org/wiki/Dither>`__.

  - ``NONE``: Every pixel converts to its nearest color.
  - ``FLOYDSTEINBERG``: Uses Floyd-Steinberg dither to approximate the original image luminosity levels.

.. note::

    To use images you will need to have the python ``pillow`` package installed.
    Additionally, if you want to use SVG images (including MDI images), you will
    additionally need to have the python ``cairosvg`` package installed. These are automatically installed when
    setting up ESPHome via the usual methods.

Grouping images by type
-----------------------

You can group images by type to make it easier to manage them. This is useful when you have a lot of images to be encoded in the same way, and avoids having to repeat the same type for each image. The type name is used as the key for the group. For example:

.. code-block:: yaml

    image:
      grayscale:
        - file: "image1.png"
          id: image1
        - file: "image2.png"
          id: image2
        - file: "image3.png"
          id: image3

      rgb565:
        - file: "image4.png"
          id: image4
        - file: "image5.png"
          id: image5

In addition, the default transparency type can be set within a type group by using the transparency type as a key.

.. code-block:: yaml

    image:
      rgb565:
        alpha_channel:
        - file: "image1.png"
          id: image1
        - file: "image2.png"
          id: image2
        opaque:
        - file: "image2.png"

Displaying Images
-----------------

Images may be used in LVGL configurations wherever an image is required. See the :doc:`LVGL </components/lvgl/index>` documentation for more information.

To display an image directly on an ESPHome display, you can use the ``image`` method in the display lambda.

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

Transparency options
--------------------

By default transparency is not used. If ``transparency: chroma_key`` is set then a specific colour (0, 1, 0) will be used to replace any transparent or partially transparent portions of the image. This will not be drawn when rendering the image, allowing the background to be visible.

If ``transparency: alpha_channel`` is set, then each pixel of the image will be assigned an additional byte with a transparency value. This is useful mainly when using :doc:`LVGL </components/lvgl/index>` as the ``alpha_channel`` transparency will enable smooth blending of transparent images with the background.
When using the display lambda image drawing functions these will draw or not draw the pixel, no blending with the background will be done.
The ``BINARY`` format only permits ``chroma_key`` transparency, which effectively turns the image into an alpha mask with one bit per pixel. GRAYSCALE images with transparency store the alpha channel only, and remain 1 byte per pixel.
