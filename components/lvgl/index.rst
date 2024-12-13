LVGL Graphics
=============

.. seo::
    :description: LVGL - ESPHome Displays showing contents created with Light and Versatile Graphics Library
    :image: /images/lvgl.png

`LVGL <https://lvgl.io/>`__ (Light and Versatile Graphics Library) is a free and open-source
embedded graphics library to create beautiful UIs for any MCU, MPU and display type. ESPHome supports `LVGL version 8 <https://docs.lvgl.io/8.4/>`__.

.. figure:: /components/lvgl/images/lvgl_main_screenshot.png

To use LVGL with a :ref:`display <display-hw>` in ESPHome, you'll need an ESP32 or RP2040. PSRAM is not a strict requirement but it is generally recommended, especially for large color displays.

The graphic display should be configured with ``auto_clear_enabled: false`` and ``update_interval: never``, and should not have any ``lambda`` set.

For interactivity, a :doc:`Touchscreen </components/touchscreen/index>` (capacitive highly preferred), a :doc:`/components/sensor/rotary_encoder` or a custom keypad made up from discrete :doc:`Binary Sensors </components/binary_sensor/index>` can be used.

Check out the detailed examples in :ref:`the Cookbook <lvgl-cookbook>` which demonstrate a number of ways you can integrate your environment with LVGL and ESPHome.

To get started, it is sufficient to add a display and an empty LVGL configuration. If neither ``pages`` nor ``widgets`` is specified, then a default "hello world" page will be shown.

.. code-block:: yaml

    # Example minimal configuration entry
    lvgl:

Basics
------

In LVGL, graphical elements like buttons, labels, sliders, etc. are called widgets or objects. See :doc:`/components/lvgl/widgets` for a complete list of widgets supported within ESPHome. Not all LVGL widgets are implemented, just those commonly used to support home automation needs/tasks.

Every widget has a parent object where it is created. For example, if a label is created on a button, the button is the parent of the label. Complex widgets internally consist of several smaller/simpler widgets; these are known as parts, each of which can have separate properties from the main widget.

Pages in ESPHome are implemented as LVGL screens, which are special objects which have no parent. There is always one active page on a display.

Widgets can be assigned with an :ref:`config-id` so that they can be referenced in :ref:`automations <automation>`.

Some widgets integrate also as native ESPHome components:

.. list-table::
    :header-rows: 1
    :widths: 1 1

    * - LVGL Widget
      - ESPHome component

    * - ``button``
      - :doc:`Switch </components/switch/lvgl>`, :doc:`Binary Sensor </components/binary_sensor/lvgl>`

    * - ``switch``, ``checkbox``
      - :doc:`Switch </components/switch/lvgl>`

    * - ``slider``, ``arc``, ``spinbox``
      - :doc:`Number </components/number/lvgl>`, :doc:`Sensor </components/sensor/lvgl>`

    * - ``dropdown``,  ``roller``
      - :doc:`Select </components/select/lvgl>`

    * - ``label``, ``textarea``
      - :doc:`Text </components/text/lvgl>`, :doc:`Text Sensor </components/text_sensor/lvgl>`

    * - ``led``
      - :doc:`Light </components/light/lvgl>`

These are useful with `Home Assistant automations <https://www.home-assistant.io/docs/automation/>`__ interacting directly with the widgets.

Main Configuration
------------------

Although LVGL is a complex matrix of objects-parts-states-styles, ESPHome simplifies this into a hierarchy.

At the highest level of the LVGL object hierarchy is the display (represented by the hardware driver). A display can have one or more pages associated with it. Each page contains a hierarchy of objects for graphical widgets representing a layout to be presented on the display.

The following configuration variables apply to the main ``lvgl`` component, in order to establish the principal operating conditions. Some :ref:`styling options <lvgl-theme>` can be set at this level too, but only for inheritance purposes.

**Configuration variables:**

- **displays** (*Optional*, list, :ref:`config-id`): A list of display IDs where LVGL should perform rendering based on its configuration. This may be omitted if there is a single display configured, which will be used automatically.
- **touchscreens** (*Optional*, list): A list of touchscreens interacting with the LVGL widgets on the display. If you configure a single touchscreen it will be used automatically, and this config entry will not be required.
    - **touchscreen_id** (**Required**, :ref:`config-id`): ID of a touchscreen configuration related to a display.
    - **long_press_time** (*Optional*, :ref:`Time <config-time>`): For the touchscreen, delay after which the ``on_long_pressed`` :ref:`interaction trigger <lvgl-automation-triggers>` will be called. Defaults to ``400ms``.
    - **long_press_repeat_time** (*Optional*, :ref:`Time <config-time>`): For the touchscreen, repeated interval after ``long_press_time``, when ``on_long_pressed_repeat`` :ref:`interaction trigger <lvgl-automation-triggers>` will be called. Defaults to ``100ms``.
- **encoders** (*Optional*, list): A list of rotary encoders interacting with the LVGL widgets on the display.
    - **group** (*Optional*, string): A name for a group of widgets which will interact with the the input device. See the :doc:`common properties </components/lvgl/widgets>` of the widgets for more information on groups.
    - **initial_focus** (*Optional*, :ref:`config-id`): An optional ID for a widget to be given focus on startup (especially useful if there is only one focusable widget.)
    - **enter_button** (**Required**, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``ENTER`` key.
    - **sensor** (*Optional*, :ref:`config-id`): The ID of a :doc:`/components/sensor/rotary_encoder`; or a list with buttons for left/right interaction with the widgets:
        - **left_button** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``LEFT`` key.
        - **right_button** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``RIGHT`` key.
    - **long_press_time** (*Optional*, :ref:`Time <config-time>`): For the rotary encoder, delay after which the ``on_long_pressed`` :ref:`interaction trigger <lvgl-automation-triggers>` will be called. Defaults to ``400ms``. Can be disabled with ``never``.
    - **long_press_repeat_time** (*Optional*, :ref:`Time <config-time>`): For the rotary encoder, repeated interval after ``long_press_time``, when ``on_long_pressed_repeat`` :ref:`interaction trigger <lvgl-automation-triggers>` will be called. Defaults to ``100ms``. Can be disabled with ``never``.
- **keypads** (*Optional*, list): A list of keypads interacting with the LVGL widgets on the display.
    - **group** (*Optional*, string): A name for a group of widgets which will interact with the the input device. See the :doc:`common properties </components/lvgl/widgets>` of the widgets for more information on groups.
    - **up** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``UP`` key.
    - **down** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``DOWN`` key.
    - **right** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``RIGHT`` key.
    - **left** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``LEFT`` key.
    - **esc** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``ESC`` key.
    - **del** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``DEL`` key.
    - **backspace** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``BACKSPACE`` key.
    - **enter** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``ENTER`` key.
    - **next** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``NEXT`` key.
    - **prev** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``PREV`` key.
    - **home** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``HOME`` key.
    - **end** (*Optional*, :ref:`config-id`): The ID of a :doc:`Binary Sensor </components/binary_sensor/index>`, to be used as ``END`` key.
    - **long_press_time** (*Optional*, :ref:`Time <config-time>`): For the keypad, delay after which the ``on_long_pressed`` :ref:`interaction trigger <lvgl-automation-triggers>` will be called. Defaults to ``400ms``. Can be disabled with ``never``.
    - **long_press_repeat_time** (*Optional*, :ref:`Time <config-time>`): For the keypad, repeated interval after ``long_press_time``, when ``on_long_pressed_repeat`` :ref:`interaction trigger <lvgl-automation-triggers>` will be called. Defaults to ``100ms``. Can be disabled with ``never``.

    .. tip::

        When using binary sensors (from physical keys) to interact with LVGL, if there are only three keys available, they are best used when configured as a rotary encoder, where ``LEFT`` and ``RIGHT`` act like the rotary wheel, and ``ENTER`` generates an ``on_press`` :ref:`trigger <lvgl-automation-triggers>`. With four or more keys, a keypad configuration is generally more appropriate. For example, a keypad consisting of five keys might use ``PREV``, ``NEXT``, ``UP``, ``DOWN`` and ``ENTER``; ``PREV``/``NEXT`` are used to select a widget within the group, ``UP``/``DOWN`` changes the selected value and ``ENTER`` generates an ``on_press`` :ref:`trigger <lvgl-automation-triggers>`.

        The ``long_press_time`` and ``long_press_repeat_time`` can be fine-tuned also by setting them to ``never`` and using the ``autorepeat`` filter on each binary sensor separately.

    .. tip::

        When using an encoder input device the navigation works as follows:

        - By turning the encoder you can focus on the next/previous object.
        - When you press the encoder on a simple object (like a button), it will be clicked.
        - If you press the encoder on a complex object (like a list, message box, etc.) the object will go to edit mode whereby you can adjust the value of the object by turning the encoder.
        - To leave edit mode, long press the button.



- **resume_on_input** (*Optional*, boolean): If LVGL is paused and the user interacts with the screen, resume the activity of LVGL. Defaults to ``true``. "Interacts" means to release a touch or button, or rotate an encoder.
- **color_depth** (*Optional*, string): The color depth at which the contents are generated. Currently only ``16`` is supported (RGB565, 2 bytes/pixel), which is the default value.
- **buffer_size** (*Optional*, percentage): The percentage of screen size to allocate buffer memory. Default is ``100%`` (or ``1.0``). For devices without PSRAM, the recommended value is ``25%``.
- **draw_rounding** (*Optional*, int): An optional value to use for rounding draw areas to a specified boundary. Defaults to 2. Useful for displays that require draw windows to be on specified boundaries (usually powers of 2.)
- **log_level** (*Optional*, string): Set the logger level specifically for the messages of the LVGL library: ``TRACE``, ``INFO``, ``WARN``, ``ERROR``, ``USER``, ``NONE``. Defaults to ``WARN``.
- **byte_order** (*Optional*, int16): The byte order of the data LVGL outputs; either ``big_endian`` or ``little_endian``. Defaults to ``big_endian``.
- **disp_bg_color** (*Optional*, :ref:`color <lvgl-color>`): Solid color used to fill the background. Can be changed at runtime with the ``lvgl.update`` action.
- **disp_bg_image** (*Optional*, :ref:`image <display-image>`):  The ID of an existing image configuration, to be used as background wallpaper. To change the image at runtime use the ``lvgl.update`` action. Also see :ref:`lvgl-widget-image` for a note regarding supported image formats.
- **default_font** (*Optional*, ID): The ID of the :ref:`font <lvgl-fonts>` used by default to render the text or symbols. Defaults to LVGL's internal ``montserrat_14`` if not specified.
- **style_definitions** (*Optional*, list): A batch of style definitions to use in LVGL widget's ``styles`` configuration. See :ref:`below <lvgl-theme>` for more details.
- **gradients** (*Optional*, list): A list of gradient definitions to use in *bg_grad* styles. See :ref:`below <lvgl-gradients>` for more details.
- **theme** (*Optional*, list): A list of styles to be applied to all widgets. See :ref:`below <lvgl-theme>` for more details.
- **widgets** (*Optional*, list): A list of :doc:`/components/lvgl/widgets` to be drawn on the root display. May not be used if ``pages`` (below) is configured.
- **pages** (*Optional*, list): A list of page IDs. Each page acts as a parent for widgets placed on it. May not be used with ``widgets`` (above). Options for each page:
    - **skip** (*Optional*, boolean): Option to skip this page when navigating between them with :ref:`lvgl-page-next-previous-action`.
    - **layout** (*Optional*): See :ref:`lvgl-layouts` for details. Defaults to ``NONE``.
    - **widgets** (*Optional*, list): A list of :doc:`/components/lvgl/widgets` to be drawn on the page.
    - All other options from :ref:`lvgl-styling` to be applied to this page.
- **page_wrap** (*Optional*, boolean): Wrap from the last to the first page when navigating between them with :ref:`lvgl-page-next-previous-action`. Defaults to ``true``.
- **top_layer** (*Optional*, list): A special kind of *Always on Top* page, which acts as a parent for widgets placed on it. It's shown above all the pages, which may be useful for widgets which always need to be visible.
    - **layout** (*Optional*): See :ref:`lvgl-layouts` for details. Defaults to ``NONE``.
    - **widgets** (*Optional*, list): A list of :doc:`/components/lvgl/widgets` to be drawn on the page.
    - All other options from :ref:`lvgl-styling` to be applied to this page.
- **layout** (*Optional*): See :ref:`lvgl-layouts` for details. Defaults to ``NONE``.
- All other options from :ref:`lvgl-styling` to be applied to all widgets directly.

**Example:**

.. code-block:: yaml

    # Example configuration entry
    lvgl:
      displays:
        - my_display
      pages:
        - id: main_page
          widgets:
            - label:
                align: CENTER
                text: 'Hello World!'

See :ref:`lvgl-cookbook-navigator` in the Cookbook for an example which demonstrates how to implement a page navigation bar at the bottom of the screen.

.. _lgvgl-multi-conf:


Multiple LVGL configurations
****************************

If you have multiple displays configured, and wish to have different content displayed on each display, you can configure multiple LVGL configurations. For example:

.. code-block:: yaml

    lvgl:
      - id: lvgl_1
          displays: display_1
          widgets:
            - label:
                text: 'Hello World #1!'
      - id: lvgl_2
          displays: display_2
          widgets:
            - label:
                text: 'Hello World #2!'
.. _lvgl-color:

Colors
******

Colors can be specified anywhere in the LVGL configuration either by referencing a preconfigured :ref:`ESPHome color <config-color>` ID or by representing the color in the common hexadecimal notation. For example, ``0xFF0000`` would be red.

You may also use any of the `standard CSS color names <https://developer.mozilla.org/en-US/docs/Web/CSS/named-color>`__, e.g. ``springgreen``.

.. _lvgl-opacity:

Opacity
*******

Various parts of the widgets (like background, borders etc.) support opacity. It can be overridden with a string: ``TRANSP`` for fully transparent, ``COVER`` for fully opaque, or percentage between ``0%`` and ``100%``. Actual default values depend on widget specifics.

.. _lvgl-fonts:

Fonts
*****

Two font choices are available:

**ESPHome fonts**

You can use :ref:`fonts configured normally<display-fonts>`, the glyphs will be rendered while building the binary. This has the advantage that you can define custom sets of glyphs of any size, with icons or diacritic characters of your choice, for any language, from any TrueType/OpenType font, allowing a more optimal flash space usage because you don't need to include all glyphs for all sizes you wish to use.

.. tip::

    For best results, set ``bpp: 4`` to get the glyphs rendered with proper anti-aliasing.

Check out :ref:`lvgl-cookbook-icontext`, :ref:`lvgl-cookbook-iconstat` and :ref:`lvgl-cookbook-iconbatt` in the Cookbook for examples which demonstrate how to use icons and text with TrueType/OpenType fonts.

**Library fonts**

The LVGL library offers by default prerendered sets with ASCII characters (``0x20-0x7F``), the degree symbol (``0xB0``), the bullet symbol (``0x2022``) from `Montserrat Medium <https://fonts.google.com/specimen/Montserrat>`__, and 60 symbols from `FontAwesome <https://fontawesome.com/>`__ (see below). You can use the IDs below when specifying the ``text_font`` parameter:

- ``montserrat_8``: 8px font
- ``montserrat_10``: 10px font
- ``montserrat_12``: 12px font
- ``montserrat_14``: 14px font (**default**, included if ``default_font`` option is missing)
- ``montserrat_16``: 16px font
- ``montserrat_18``: 18px font
- ``montserrat_20``: 20px font
- ``montserrat_22``: 22px font
- ``montserrat_24``: 24px font
- ``montserrat_26``: 26px font
- ``montserrat_28``: 28px font
- ``montserrat_30``: 30px font
- ``montserrat_32``: 32px font
- ``montserrat_34``: 34px font
- ``montserrat_36``: 36px font
- ``montserrat_38``: 38px font
- ``montserrat_40``: 40px font
- ``montserrat_42``: 42px font
- ``montserrat_44``: 44px font
- ``montserrat_46``: 46px font
- ``montserrat_48``: 48px font

The binary will only include any of the above if used in the configuration.

You can display the embedded symbols among the text by their codepoint address preceded by ``\u``. For example: ``\uF00C``:

.. figure:: /components/lvgl/images/lvgl_symbols.png
    :align: center

.. note::

    The ``text_font`` parameter affects the size of symbols, since all the built-in font arrays based on Montserrat include these symbols at the respective sizes. If you set ``text_font`` on a widget to a custom ESPHome font, these symbols will likely not display, unless you include them manually from a FontAwesome OpenType file.

    For escape sequences to work, you have to put them in strings enclosed in double quotes.

In addition to the above, the following special fonts are available from LVGL as built-in:

- ``unscii_8``: 8 px pixel perfect font with only ASCII characters.
- ``unscii_16``: 16 px pixel perfect font with only ASCII characters.
- ``simsun_16_cjk``: 16 px font with normal range + 1000 most common `CJK Radicals <https://en.wikipedia.org/wiki/CJK_Radicals_Supplement>`__.
- ``dejavu_16_persian_hebrew``: 16 px font with normal range + Hebrew, Arabic, Persian letters and all their forms.

.. _lvgl-styling:

Style properties
****************

LVGL follows CSS's `border-box model <https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing>`__. A widget's *box* is built from the following parts:

.. figure:: /components/lvgl/images/lvgl_boxmodel.png
    :align: center

- *bounding box*: the box defined with ``width`` and ``height`` of the widgets (pixels or parent content area percentage; not drawn, just for calculations).
- *border*: the border line, drawn on the inner side of the bounding box (pixels).
- *outline*: the outline, drawn on the outer side of the bounding box (pixels).
- *padding*: space to keep between the border of the widget and its content or children (*I don't want my children too close to my sides, so keep this space*).
- *content*: the content area which is the size of the bounding box reduced by the border width and padding (it's what's referenced as the ``SIZE_CONTENT`` option of certain widgets).

You can adjust the appearance of widgets by changing their foreground, background, border color and/or font. Some widgets allow for more complex styling, effectively changing all or part of their appearance.

**Styling variables:**

- **bg_color** (*Optional*, :ref:`color <lvgl-color>`): Color for the background of the widget. Defaults to ``0xFFFFFF`` (white).
- **bg_grad** (*Optional*, :ref:`gradient <lvgl-gradients>`): A gradient to apply to the background.
- **bg_grad_color** (*Optional*, :ref:`color <lvgl-color>`): Color to make the background gradually fade to. Defaults to ``0`` (black).
- **bg_dither_mode** (*Optional*, dict): Set dithering of the background gradient. One of ``NONE``, ``ORDERED``, ``ERR_DIFF``. Defaults to ``NONE``.
- **bg_grad_dir** (*Optional*, dict): Choose the direction of the background gradient: ``NONE``, ``HOR``, ``VER``. Defaults to ``NONE``.
- **bg_main_stop** (*Optional*, 0-255): Specify where the gradient should start: ``0`` = upper left, ``128`` = in the center, ``255`` = lower right. Defaults to ``0``.
- **bg_grad_stop** (*Optional*, 0-255): Specify where the gradient should stop: ``0`` = upper left, ``128`` = in the center, ``255`` = lower right. Defaults to ``255``.
- **opa** (*Optional*, :ref:`opacity <lvgl-opacity>`): Opacity of the entire widget. Inherited from parent. Defaults to ``COVER``.
- **bg_opa** (*Optional*, :ref:`opacity <lvgl-opacity>`): Opacity of the widget background.
- **opa_layered** (*Optional*, :ref:`opacity <lvgl-opacity>`): Opacity of the entire layer the widget is on. Inherited from parent. Defaults to ``COVER``.
- **bg_image_src** (*Optional*, :ref:`image <display-image>`):  The ID of an existing image configuration, to show as the background of the widget.
- **bg_image_opa** (*Optional*, :ref:`opacity <lvgl-opacity>`): Opacity of the background image of the widget.
- **bg_image_recolor** (*Optional*, :ref:`color <lvgl-color>`): Color to mix with every pixel of the background image of the widget.
- **bg_image_recolor_opa** (*Optional*, :ref:`opacity <lvgl-opacity>`): Opacity of the recoloring of the background image of the widget.
- **border_width** (*Optional*, int16): Set the width of the border in pixels. Defaults to ``0``.
- **border_color** (*Optional*, :ref:`color <lvgl-color>`): Color to draw borders of the widget. Defaults to ``0`` (black).
- **border_opa** (*Optional*, :ref:`opacity <lvgl-opacity>`): Opacity of the borders of the widget.  Defaults to ``COVER``.
- **border_post** (*Optional*, boolean): If ``true`` the border will be drawn after all children of the widget have been drawn. Defaults to ``false``.
- **border_side** (*Optional*, list): Select which borders of the widgets to show (multiple can be specified as a YAML list, defaults to ``NONE``):
    - ``NONE``
    - ``TOP``
    - ``BOTTOM``
    - ``LEFT``
    - ``RIGHT``
    - ``INTERNAL``
- **clip_corner** (*Optional*, boolean): If set to ``true``, overflowing content will be clipped off by the widget's rounded corners (``radius`` > ``0``).
- **color_filter_opa** (*Optional*, :ref:`opacity <lvgl-opacity>`): Opacity of the color filter. Currently color filters are applied only by the default LVGL theme, this option allows the effect of those to be disabled by setting to ``TRANSP``.
- **outline_width** (*Optional*, int16): Set the width of the outline in pixels. Defaults to ``0``.
- **outline_color** (*Optional*, :ref:`color <lvgl-color>`): Color used to draw an outline around the widget. Defaults to ``0`` (black).
- **outline_opa** (*Optional*, :ref:`opacity <lvgl-opacity>`): Opacity of the outline of the widget. Defaults to ``COVER``.
- **outline_pad** (*Optional*, int16): Distance between the outline and the widget itself. Defaults to ``0``.
- **pad_all** (*Optional*, int16): Set the padding in all directions, in pixels.
- **pad_top** (*Optional*, int16): Set the padding on the top, in pixels.
- **pad_bottom** (*Optional*, int16): Set the padding on the bottom, in pixels.
- **pad_left** (*Optional*, int16): Set the padding on the left, in pixels.
- **pad_right** (*Optional*, int16): Set the padding on the right, in pixels.
- **pad_row** (*Optional*, int16): Set the padding between the rows of the children elements, in pixels.
- **pad_column** (*Optional*, int16): Set the padding between the columns of the children elements, in pixels.
- **radius** (*Optional*, uint16): The radius to be used to form the widget's rounded corners. 0 = no radius (square corners); 65535 = pill shaped widget (true circle if it has same width and height).
- **shadow_color** (*Optional*, :ref:`color <lvgl-color>`): Color used to create a drop shadow under the widget. Defaults to ``0`` (black).
- **shadow_ofs_x** (*Optional*, int16): Horizontal offset of the shadow, in pixels. Defaults to ``0``.
- **shadow_ofs_y** (*Optional*, int16): Vertical offset of the shadow, in pixels. Defaults to ``0``.
- **shadow_opa** (*Optional*, :ref:`opacity <lvgl-opacity>`): Opacity of the shadow. Defaults to ``COVER``.
- **shadow_spread** (*Optional*, int16): Spread of the shadow, in pixels. Defaults to ``0``.
- **shadow_width** (*Optional*, int16): Width of the shadow, in pixels. Defaults to ``0``.
- **transform_angle** (*Optional*, 0-360): Transformation angle of the widget (eg. rotation)
- **transform_height** (*Optional*, int16 or percentage): Transformation height of the widget (eg. stretching)
- **transform_pivot_x** (*Optional*, int16): Horizontal anchor point of the transformation. Relative to the widget's top left corner.
- **transform_pivot_y** (*Optional*, int16): Vertical anchor point of the transformation. Relative to the widget's top left corner.
- **transform_zoom** (*Optional*, 0.1-10):  Transformation zoom of the widget (eg. resizing)
- **translate_x** (*Optional*, int16 or percentage): Movement of the widget with this value in horizontal direction.
- **translate_y** (*Optional*, int16 or percentage): Movement of the widget with this value in vertical direction.

.. _lvgl-theme:

Themes
******

The widgets support lots of :ref:`lvgl-styling` to customize their appearance and behavior.

You can configure a global theme for all widgets at the top level with the ``theme`` configuration variable. In the example below, all the ``arc``, ``slider`` and ``button`` widgets will, by default, use the styles and properties defined here. A combination of styles and :ref:`states <lvgl-widgetproperty-state>` can be chosen for every widget.

.. code-block:: yaml

    lvgl:
      theme:
        arc:
          scroll_on_focus: true
          group: general
        slider:
          scroll_on_focus: true
          group: general
        button:
          scroll_on_focus: true
          group: general
          border_width: 2
          outline_pad: 6
          pressed:
            border_color: 0xFF0000
          checked:
            border_color: 0xFFFF00
          focused:
            border_color: 0x00FF00

Naturally, you can override these at the individual configuration level of each widget. This can be done in batches, using the ``style_definitions`` configuration variable of the main component.
In the example below, you defined ``date_style``:

.. code-block:: yaml

    lvgl:
      style_definitions:
        - id: date_style      # choose an ID for your definition
          text_font: unscii_8
          align: center
          text_color: 0x000000
          bg_opa: cover
          radius: 4
          pad_all: 2

And then you apply these selected styles to two labels, and only change very specific style ``y`` locally:

.. code-block:: yaml

    widgets:
      - label:
          id: day_label
          styles: date_style # apply the definition here by the ID chosen above
          y: -20
      - label:
          id: date_label
          styles: date_style
          y: +20

Additionally, you can change the styles based on the :ref:`state <lvgl-widgetproperty-state>` property of the widgets or their parts. If you want to set a property for all states (e.g. red background color) just set it for the default state at the root of the widget. If the widget can't find a property for its current state it will fall back to this.

In the example below, you have an ``arc`` with some styles set here. Note how you change the ``arc_color`` of the ``indicator`` part, based on state changes:

.. code-block:: yaml

    - arc:
        id: my_arc
        value: 75
        min_value: 1
        max_value: 100
        indicator:
          arc_color: 0xF000FF
          pressed:
            arc_color: 0xFFFF00
          focused:
            arc_color: 0x808080

So the precedence happens like this: state based styles override the locally specified styles, which override the style definitions, which override the theme, which overrides the top level styles. The value precedence of states is quite intuitive and it's something the user would expect naturally. For example, if a widget is focused the user will still want to see if it's pressed, therefore the pressed state has a higher precedence. (If the focused state had a higher precedence it would override the *pressed* color, defeating its purpose.)

Feel free to experiment to discover inheritance and precedence of the styles based on states between the nested widgets.

:ref:`lvgl-cookbook-theme` The Cookbook contains an example which demonstrates how to implement a gradient style for your widgets.

.. _lvgl-layouts:

Layouts
*******

Layouts aim to position widgets automatically, eliminating the need to specify ``x`` and ``y`` coordinates to position each widget. This is a great way to simplify your configuration as it allows you to omit alignment options.

The layout configuration options are applied to any parent widget or page, influencing the appearance of the children. The position and size calculated by the layout overwrites the *normal* ``x``, ``y``, ``width``, and ``height`` settings of the children.

Check out :ref:`lvgl-cookbook-flex`, :ref:`lvgl-cookbook-grid` and :ref:`lvgl-cookbook-weather` in the Cookbook for examples which demonstrate how to automate widget positioning, potentially reducing the size of your device's YAML configuration, and saving you from lots of manual calculations.

The ``hidden``, ``ignore_layout`` and ``floating`` :ref:`flags <lvgl-widget-flags>` can be used on widgets to ignore them in layout calculations.

**Configuration variables:**

- **layout** (*Optional*, dict): A dictionary describing the layout configuration:
    - **type** (*Optional*, string): ``FLEX``, ``GRID`` or ``NONE``. Defaults to ``NONE``.
    - Further options from below depending on the chosen type.

**Flex**

The Flex layout in LVGL is a subset implementation of `CSS Flexbox <https://css-tricks.com/snippets/css/a-guide-to-flexbox/>`__.

It can arrange items into rows or columns (tracks), handle wrapping, adjust spacing between items and tracks and even handle growing the layout to make the item(s) fill the remaining space with respect to minimum/maximum width and height.

**Terms used:**

- *track*: the rows or columns *main* direction flow: row or column in the direction in which the items are placed one after the other.
- *cross direction*: perpendicular to the main direction.
- *wrap*: if there is no more space in the track a new track is started.
- *gap*: the space between the rows and columns or the items on a track.
- *grow*: if set on an item it will grow to fill the remaining space on the track. The available space will be distributed among items respective to their grow value (larger value means more space). It dictates what amount of the available space the widget should take up. For example if all items on the track have a ``grow`` set to ``1``, the space in the track will be distributed equally to all of them. If one of the items has a value of 2, that one would take up twice as much of the space as either one of the others.

**Configuration variables:**

    - **flex_flow** (*Optional*, string): Select the arrangement of the children widgets:
        - ``ROW``: place the children in a row without wrapping.
        - ``COLUMN``: place the children in a column without wrapping.
        - ``ROW_WRAP``: place the children in a row with wrapping (default).
        - ``COLUMN_WRAP``: place the children in a column with wrapping.
        - ``ROW_REVERSE``: place the children in a row without wrapping but in reversed order.
        - ``COLUMN_REVERSE``: place the children in a column without wrapping but in reversed order.
        - ``ROW_WRAP_REVERSE``: place the children in a row with wrapping but in reversed order.
        - ``COLUMN_WRAP_REVERSE``: place the children in a column with wrapping but in reversed order.

    - **flex_align_main** (*Optional*, string): Determines how to distribute the items in their track on the *main* axis. For example, flush the items to the right on with ``flex_flow: ROW_WRAP`` (known as *justify-content* in CSS). Possible options below.
    - **flex_align_cross** (*Optional*, string): Determines how to distribute the items in their track on the *cross* axis. For example, if the items have different height place them to the bottom of the track (known as *align-items* in CSS). Possible options below.
    - **flex_align_track** (*Optional*, string): Determines how to distribute the tracks (known as *align-content* in CSS). Possible options below.

    Values for use with  ``flex_align_main``, ``flex_align_cross``, ``flex_align_track``:

        - ``START``: means left horizontally and top vertically (default).
        - ``END``: means right horizontally and bottom vertically.
        - ``CENTER``: simply center.
        - ``SPACE_EVENLY``: items are distributed so that the spacing between any two items (and the space to the edges) is equal. Does not apply to ``flex_align_track``.
        - ``SPACE_AROUND``: items are evenly distributed in the track with equal space around them. Note that visually the spaces aren’t equal, since all the items have equal space on both sides. The first item will have one unit of space against the container edge, but two units of space between the next item because that next item has its own spacing that applies. Does not apply to ``flex_align_track``.
        - ``SPACE_BETWEEN``: items are evenly distributed in the track: first item is on the start line, last item on the end line. Does not apply to ``flex_align_track``.

    - **pad_row** (*Optional*, int16): Set the padding between the rows, in pixels.
    - **pad_column** (*Optional*, int16): Set the padding between the columns, in pixels.
    - **flex_grow** (*Optional*, int16): Can be used to make one or more children fill the available space on the track. When one or more children have ``flex_grow`` set, the available space will be distributed proportionally to the grow values. Defaults to ``0``, which disables growing.

.. code-block:: yaml

    # Example flex layout

    - obj:
        layout:
          type: flex
          pad_row: 4
          pad_column: 4px
          flex_align_main: center
          flex_align_cross: start
          flex_align_track: end
        widgets:
          - animimg:
              flex_grow: 1

**Grid**

The Grid layout in LVGL is a subset implementation of `CSS Grid <https://css-tricks.com/snippets/css/complete-guide-grid//>`__.

It can arrange items into a 2D "table" that has rows or columns (tracks). The item(s) can span through multiple columns or rows. The track's size can be set in pixels, to the largest item of the track (``CONTENT``) or in "free units" to distribute the free space proportionally.

**Terms used:**

- *tracks*: the rows or the columns.
- *gap*: the space between the rows and columns or the items on a track.
- *free unit (FR)*: a proportional distribution unit for the space available on the track. It accepts a unitless integer value that serves as a proportion. It dictates what amount of the available space the widget should take up. For example if all items on the track have a ``FR`` set to ``1``, the space in the track will be distributed equally to all of them. If one of the items has a value of 2, that one would take up twice as much of the space as either one of the others.

**Configuration variables:**

    - **grid_rows** (**Required**): The number of rows in the grid, expressed a list of values in pixels, ``CONTENT`` or ``FR(n)`` (free units, where ``n`` is a proportional integer value).
    - **grid_columns** (**Required**): The number of columns in the grid, expressed a list of values in pixels, ``CONTENT`` or ``FR(n)`` (free units, where ``n`` is a proportional integer value).
    - **grid_row_align** (*Optional*, string): How to align the row. Works only when ``grid_rows`` is given in pixels. Possible options below.
    - **grid_column_align** (*Optional*, string): How to align the column. Works only when ``grid_columns`` is given in pixels. Possible options below.
    - **pad_row** (*Optional*, int16): Set the padding between the rows, in pixels.
    - **pad_column** (*Optional*, int16): Set the padding between the columns, in pixels.

In a grid layout, *all the widgets placed on the grid* will get some additional configuration variables to help with placement:

    - **grid_cell_row_pos** (**Required**, int16): Position of the widget, in which row to appear (0 based count).
    - **grid_cell_column_pos** (**Required**, int16): Position of the widget, in which column to appear (0 based count).
    - **grid_cell_x_align** (*Optional*, string): How to align the widget horizontally within the cell. Can also be applied through :ref:`lvgl-styling`. Possible options below.
    - **grid_cell_y_align** (*Optional*, string): How to align the widget vertically within the cell. Can also be applied through :ref:`lvgl-styling`. Possible options below.
    - **grid_cell_row_span**  (*Optional*, int16): How many rows to span across the widget. Defaults to ``1``.
    - **grid_cell_column_span** (*Optional*, int16): How many columns to span across the widget. . Defaults to ``1``.

    .. note::

        These ``grid_cell_`` variables apply to widget configuations!

Values for use with ``grid_column_align``, ``grid_row_align``, ``grid_cell_x_align``, ``grid_cell_y_align``:

        - ``START``: means left horizontally and top vertically (default).
        - ``END``: means right horizontally and bottom vertically.
        - ``CENTER``: simply center.
        - ``STRETCH``: stretch the widget to the cell in the respective direction. Does not apply to ``grid_column_align``, ``grid_row_align``.
        - ``SPACE_EVENLY``: items are distributed so that the spacing between any two items (and the space to the edges) is equal.
        - ``SPACE_AROUND``: items are evenly distributed in the track with equal space around them. Note that visually the spaces aren’t equal, since all the items have equal space on both sides. The first item will have one unit of space against the container edge, but two units of space between the next item because that next item has its own spacing that applies.
        - ``SPACE_BETWEEN``: items are evenly distributed in the track: first item is on the start line, last item on the end line.

.. code-block:: yaml

    # Example grid layout

    - obj:
        layout:
          type: grid
          grid_row_align: end
          grid_rows: [25px, fr(1), content]
          grid_columns: [40, fr(1), fr(1)]
          pad_row: 6px
          pad_column: 0
        widgets:
          - image:
              grid_cell_row_pos: 0
              grid_cell_column_pos: 0

.. tip::

    To visualize real, calculated sizes of transparent widgets you can temporarily set ``outline_width: 1`` on them.

.. _lvgl-gradients:

Gradients
*********

A gradient is a sequence of colors which can be applied to an object using the ``bg_grad`` style option. Gradients are defined in the *gradients* section of the LVGL configuration by providing two or more color stop points.
 Each entry has the following options:

- **id** (**Required**, :ref:`config-id`): The ID with which you will be able to reference the gradient later.
- **direction** (*Optional*, string): The direction of the gradient. Possible options are ``none`` (the default) ``hor`` or ``ver``.
- **dither** (*Optional*, string): A dithering selection. Possible options are ``none`` (the default) ``err_diff`` or ``ordered``.
- **stops** (**Required**, list): A list of at least 2 color stop points. Each stop point has the following options:
    - **color** (**Required**, :ref:`Color <lvgl-color>`): The color of the stop point.
    - **position** (**Required**, float): The position of the stop point. Must be a float between 0.0 and 1.0, a percentage between 0% and 100%, or an integer between 0 and 255.

.. code-block:: yaml

    # Example gradient showing full hue range.

      gradients:
        - id: color_bar
          direction: hor
          dither: none
          stops:
            - color: 0xFF0000
              position: 0
            - color: 0xFFFF00
              position: 42
            - color: 0x00FF00
              position: 84
            - color: 0x00FFFF
              position: 127
            - color: 0x0000FF
              position: 169
            - color: 0xFF00FF
              position: 212
            - color: 0xFF0000
              position: 255


Widgets
-------

LVGL supports a list of :doc:`/components/lvgl/widgets` which can be used to draw interactive objects on the screen.

Actions
-------

Widgets support :ref:`general or specific <lvgl-automation-actions>` actions - see the :doc:`/components/lvgl/widgets` section for more information.

Several actions are available for the LVGL component itself, these are outlined below. Note that if multiple LVGL instances are configured, an **lvgl_id** config entry will be required to specify which instance the action relates to. This is not required if there is only a single LVGL instance configured.


.. _lvgl-redraw-action:

``lvgl.widget.redraw``
**********************

This :ref:`action <actions-action>` redraws the entire screen, or optionally only a widget on it.

- **id** (*Optional*): The ID of a widget configured in LVGL which you want to redraw; if omitted, the entire screen will be redrawn.
- **lvgl_id** (*Optional*): The ID of the LVGL instance to redraw.

.. code-block:: yaml

    on_...:
      then:
        - lvgl.widget.redraw:
            lvgl_id: lvgl1  # optional when only one LVGL instance is configured

.. _lvgl-pause-action:

``lvgl.pause``
**************

This :ref:`action <actions-action>` pauses the activity of LVGL, including rendering.

- **show_snow** (*Optional*, boolean): When paused, display random colored pixels across the entire screen in order to minimize screen burn-in, to relief the tension put on each individual pixel. See :ref:`lvgl-cookbook-antiburn` for an example which demonstrates how to use this.
- **lvgl_id** (*Optional*): The ID of the LVGL instance to pause.

.. code-block:: yaml

    on_...:
      then:
        - lvgl.pause:
            show_snow: true

.. _lvgl-resume-action:

``lvgl.resume``
***************

This :ref:`action <actions-action>` resumes the activity of LVGL, including rendering.

- **lvgl_id** (*Optional*): The ID of the LVGL instance to resume.

.. code-block:: yaml

    on_...:
      then:
        - lvgl.resume:


``lvgl.update``
***************

This :ref:`action <actions-action>` allows changing/updating the ``disp_bg_color`` or ``disp_bg_image`` configuration variables of the main component, making it possible to change the background color or wallpaper at any time.

.. code-block:: yaml

    # Examples:
    on_...:
      then:
        - lvgl.update:
            disp_bg_color: 0x0000FF
        - lvgl.update:
            disp_bg_image: cat_image

.. _lvgl-page-next-previous-action:

``lvgl.page.next``, ``lvgl.page.previous``
******************************************

This :ref:`action <actions-action>` changes the page to the next/previous based on the configuration (pages with their ``skip`` option enabled are...skipped). Page changes will wrap around at the end.

- **animation** (*Optional*): Animate page changes as specified. One of: ``NONE``, ``OVER_LEFT``, ``OVER_RIGHT``, ``OVER_TOP``, ``OVER_BOTTOM``, ``MOVE_LEFT``, ``MOVE_RIGHT``, ``MOVE_TOP``, ``MOVE_BOTTOM``, ``FADE_IN``, ``FADE_OUT``, ``OUT_LEFT``, ``OUT_RIGHT``, ``OUT_TOP``, ``OUT_BOTTOM``. Defaults to ``NONE``.
- **time** (*Optional*, :ref:`Time <config-time>`): Duration of the page change animation. Defaults to ``50ms``.

.. code-block:: yaml

    on_...:
      then:
        - lvgl.page.next:
            animation: OUT_LEFT
            time: 300ms

    on_...:
      then:
        - lvgl.page.previous:
            animation: OUT_RIGHT
            time: 300ms

.. _lvgl-page-show-action:

``lvgl.page.show``
******************

This :ref:`action <actions-action>` shows a specific page (including pages with their ``skip`` option enabled).

- **id** (**Required**): The ID of the page to be shown.
- **animation** (*Optional*): Animate page changes as specified. One of: ``NONE``, ``OVER_LEFT``, ``OVER_RIGHT``, ``OVER_TOP``, ``OVER_BOTTOM``, ``MOVE_LEFT``, ``MOVE_RIGHT``, ``MOVE_TOP``, ``MOVE_BOTTOM``, ``FADE_IN``, ``FADE_OUT``, ``OUT_LEFT``, ``OUT_RIGHT``, ``OUT_TOP``, ``OUT_BOTTOM``. Defaults to ``NONE``.
- **time** (*Optional*, :ref:`Time <config-time>`): Duration of the page change animation. Defaults to ``50ms``.

.. code-block:: yaml

    on_...:
      then:
        - lvgl.page.show:
            id: secret_page

    on_...:
      then:
        - lvgl.page.show: secret_page  # shorthand version

.. _lvgl-widget-focus-action:

``lvgl.widget.focus``
*********************

This :ref:`action <actions-action>` moves the input focus to the nominated widget. Used mainly with encoder inputs
to select a specific widget to receive input events. It may also allow the focus to be frozen on that widget,
or can be used to move the focus to the next or previous widget in the focus group.

The required config options take one of several forms:

- **id** (**Required**): The ID of the widget to be given focus.
- **freeze** (*Optional*, boolean): If true will lock the focus to this widget.
- **editing** (*Optional*, boolean): Sets the editing mode of the widget, i.e. encoder rotation will change the value
  of the widget, not move the focus. Defaults to false.

or

- **action** (**Required**): Should be one of ``next``, ``previous``, ``mark`` or ``restore``.
- **group** (*Optional*): The ID of the group within which to move the focus. The default group will be used if not specified
- **freeze** (*Optional*, boolean): If true will lock the focus to the now selected widget.


The ``next`` and ``previous`` actions will move the focus to the next or previous widget within the group.
The ``mark`` action will save the currently focused widget within the group, and restore it when the ``restore`` action is triggered.

.. code-block:: yaml

    on_...:
      then:
        - lvgl.widget.focus:
            id: my_button
            freeze: true

    on_...:
      then:
        - lvgl.widget.focus: my_button

    on_...:
      then:
        - lvgl.widget.focus:
            group: encoder_group
            direction: next
            freeze: true

    on_...:
      then:
        - lvgl.widget.focus: previous


.. _lvgl-conditions:

Conditions
----------

.. _lvgl-is-idle-condition:

``lvgl.is_idle``
****************

This :ref:`condition <common_conditions>` checks if the amount of time specified has passed since the last touch event.

- **timeout** (**Required**, :ref:`templatable <config-templatable>`, int): Amount of :ref:`time <config-time>` expected since the last touch event.
- **lvgl_id** (*Optional*): The ID of the LVGL instance to monitor.

.. code-block:: yaml

    # In some trigger:
    on_...:
      then:
        - if:
            condition:
              lvgl.is_idle:
                timeout: 5s
            then:
              - light.turn_off:
                  id: display_backlight
                  transition_length: 3s

.. _lvgl-is-paused-condition:

``lvgl.is_paused``
******************

This :ref:`condition <common_conditions>` checks if LVGL is in the paused state or not.

- **lvgl_id** (*Optional*): The ID of the LVGL instance to monitor.

.. code-block:: yaml

    # In some trigger:
    on_...:
      then:
        - if:
            condition: lvgl.is_paused
            then:
              - lvgl.resume:

Triggers
--------

Widget level :ref:`interaction triggers <lvgl-automation-triggers>` are available, plus a few for the LVGL component itself:

.. _lvgl-on-idle-trigger:

``on_idle``
***********

LVGL has a notion of screen inactivity -- i.e. the time since the last user interaction with the screen is tracked. This can, for example, be used to dim the display backlight or turn it off after a moment of inactivity (like a screen saver). Every use of an input device (touchscreen, rotary encoder) counts as an activity and resets the inactivity counter.

The ``on_idle`` :ref:`triggers <automation>` are activated when inactivity time becomes longer than the specified ``timeout``. You can configure any desired number of timeouts with different actions.

- **timeout** (**Required**, :ref:`templatable <config-templatable>`, int): :ref:`Time <config-time>` that has elapsed since the last touch event, after which the trigger will be invoked.

.. code-block:: yaml

    lvgl:
      ...
      on_idle:
        - timeout: 30s
          then:
            - lvgl.page.show: main_page
        - timeout: 60s
          then:
            - light.turn_off: display_backlight
            - lvgl.pause:

See :ref:`lvgl-cookbook-idlescreen` for an example which demonstrates how to implement screen saving with idle settings.

.. _lvgl_on_pause_trigger:

``on_pause``
************

This :ref:`trigger <lvgl-automation-triggers>` is triggered when LVGL is paused. This can be used to perform any desired actions when the screen is locked, such as turning off the display backlight.

.. _lvgl_on_resume_trigger:

``on_resume``
*************

This :ref:`trigger <lvgl-automation-triggers>` is triggered when LVGL is resumed. This can be used to perform any desired actions when the screen is unlocked, such as turning on the display backlight.


See Also
--------

.. toctree::
    :maxdepth: 1
    :glob:

    *

- :doc:`LVGL Examples in the Cookbook </cookbook/lvgl>`
- :doc:`/components/display/index`
- :doc:`/components/touchscreen/index`
- :doc:`/components/sensor/rotary_encoder`
- `LVGL docs <https://docs.lvgl.io/>`__
- :ghedit:`Edit`
