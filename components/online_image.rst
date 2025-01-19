.. _online_image:

Online Image Component
======================

.. seo::
    :description: Instructions for displaying images downloaded at runtime in ESPHome.
    :image: image-sync-outline.svg

With this component you can define images that will be downloaded, decoded and drawn at runtime.

.. note::

    Currently only images in PNG format are supported.

.. warning::

    This component requires a fair amount of RAM; both for downloading the image, and for storing the decoded image. It might work on devices without PSRAM, but there is no guarantee.

This component has a dependency to :doc:`/components/http_request`; the configuration options you set to the ``http_request`` component will also apply here.

.. code-block:: yaml

    online_image:
      - url: "https://example.com/example.png"
        format: png
        id: my_online_image

Configuration variables
-----------------------

- **url** (**Required**, url): The URL where the image will be downloaded from.
- **id** (**Required**, :ref:`config-id`): The ID with which you will be able to reference the image later
  in your display code.
- **format** (**Required**): The format that the image is encoded with.

  - ``PNG``: The image on the server is encoded in PNG format.
- **resize** (*Optional*, string): If set, this will resize the image to fit inside the given dimensions ``WIDTHxHEIGHT``
  and preserve the aspect ratio.
- **placeholder** (**Optional**, :ref:`config-id`): ID of an :doc:`Image </components/image>` to display while the downloaded image is not yet ready.
  This placeholder image will **not** be resized; regardless of the ``resize`` option value for the ``online_image``.
- **type** (*Required*): Specifies how to encode image internally.

  - ``BINARY``: Two colors, suitable for 1 color displays or 2 color image in color displays. Uses 1 bit
    per pixel, 8 pixels per byte. Only ``chroma_key`` transparency is available.
  - ``GRAYSCALE``: Full scale grey. Uses 8 bits per pixel, 1 pixel per byte.
  - ``RGB565``: Lossy RGB color stored. Uses 2 bytes per pixel, 3 with an alpha channel
  - ``RGB``: Full RGB color stored. Uses 3 bytes per pixel, 4 with an alpha channel.
- **transparency** (*Optional*): If set the alpha channel of the input image will be taken into account. The possible values are ``opaque`` (default), ``chroma_key`` and ``alpha_channel``. See the discussion on transparency in the  :ref:`image component <display-image>`.
- **update_interval** (*Optional*, int): Redownload the image when the specified time has elapsed. Defaults to ``never`` (i.e. the update component action needs to be called manually).

Automations
-----------

- **on_download_finished** (*Optional*, :ref:`Automation <automation>`): An automation to perform when the image has been successfully downloaded.

A good example for that is to update the display component after the download succeeded.

- **on_error** (*Optional*, :ref:`Automation <automation>`): An automation to perform when an error happened during download or decode.

Actions
-------

**online_image.set_url**: Change the URL where the image is downloaded from. The image needs to be manually updated afterwards.

Configuration variables:

- **id** (**Required**, :ref:`config-id`): The image to update the URL for.
- **url** (**Required**, url): The new URL to download the image from.

.. code-block:: yaml

    on_...:
      - online_image.set_url:
          id: my_online_image
          url: "https://www.example.com/new_image.png"
      - component.update: my_online_image

**online_image.release**: Release the memory currently used by an image. Can be used if different display pages need different images, to avoid wasting memory on an image that is currently not being displayed.

Configuration variables:

- **id** (**Required**, :ref:`config-id`): The image to update the URL for.

.. code-block:: yaml

    on_...:
      - online_image.release: my_online_image

Examples
--------

.. code-block:: yaml

    online_image:
      - url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png"
        format: png
        id: my_online_image
        on_download_finished:
          component.update: my_display

And then later in code:

.. code-block:: yaml

    display:
      - platform: ...
        id: my_display
        # ...
        lambda: |-
          // Draw the image my_online_image at position [x=0,y=0]
          it.image(0, 0, id(my_online_image));

For monochrome displays the ``image`` method accepts two additional color parameters which can
be supplied to specify the color used to draw bright and dark pixels respectively.
In this case the image will be internally converted to a grayscale image and then to monochrome
based on an internally defined threshold.

.. code-block:: yaml

    display:
      - platform: ...
        id: my_display
        # ...
        lambda: |-
          // Draw the image my_image at position [x=0,y=0]
          // with front color "OFF" and back color "ON"
          it.image(0, 0, id(my_online_image), COLOR_OFF, COLOR_ON);

By default ``online_image`` is configured to not automatically update/download the image; in order to do the initial download, you can either:
 - Add a ``component.update <image_id>`` in the ``on_connect:`` action on the :doc:`/components/wifi` component.
 - Explicitly set an ``update_interval``.
 - Call ``component.update <image_id>`` in an :doc:`/components/interval` block.
 - Call ``component.update <image_id>`` where you need the image to be downloaded/updated.

.. code-block:: yaml

    wifi:
      on_connect:
        - component.update: my_online_image

See Also
--------

- :apiref:`online_image/online_image.h`
- :doc:`Image Component <image>`
- :doc:`Animation Component <animation>`
- :ghedit:`Edit`
