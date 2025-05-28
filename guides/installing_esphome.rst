Installing ESPHome Manually
===========================

Windows
-------

Download Python from `the official site <https://www.python.org/downloads/>`_.

.. figure:: images/python-win-installer.png
    :align: center
    :width: 75.0%
    :alt: Python installer window with arrows pointing to "Add Python to PATH" and "Install Now"

Make sure you check "Add Python to PATH", and go all the way through the
installer.

Log out and back in, or restart your computer. Whichever is easiest.

Open the start menu and type ``cmd``. Press the enter key.

In the terminal that comes up, check that Python is installed:

.. code-block:: console

    > python --version
    Python 3.10.1

.. note::

    Don't copy the ``>``. That's used to show that this is a command that goes
    in the console, and to let you see what the expected results are (shown on
    the next line without a ``>``)

Looks good? You can go ahead and install ESPHome:

.. code-block:: console

    > pip3 install wheel
    > pip3 install esphome

And you should be good to go! You can test that things are properly installed
with the following:

.. code-block:: console

    > esphome version
    Version: 2021.12.3

Mac
---

ESPHome supports macOS. There are several ways to install ESPHome on macOS:

- Homebrew
- pip
- Cloning the repository


**Homebrew**

An easy way for installation is via `Homebrew <https://brew.sh/>`_:

.. code-block:: console

    $ brew install esphome

Verify the installation:

.. code-block:: console

    $ esphome version
    Version: 2024.12.0 

If you encounter any issues with Homebrew installation, please check the
`ESPHome Homebrew Formula <https://formulae.brew.sh/formula/esphome>`_ page
for additional information.

.. note::

    Homebrew may not always provide the latest version immediately. Updating Homebrew will 
    automatically update ESPHome. If this is ok for you, Homebrew is the easiest way to 
    install ESPHome.

**pip**

For the latest version, use the pip installation. This may be more difficult to set up
and may need additional dependencies and path settings. Setting up a virtual environment is 
highly recommended. If you are not familiar with Python virtual environments, Homebrew
may be easier.

You will require Python 3.9 or newer. While your Mac may have a version of Python installed it may not be up-to-date.
Python can be installed from the `official site <https://www.python.org/downloads>`_
or with Homebrew. Once Python is installed, create and activate a virtual environment and install ESPHome with pip:

.. code-block:: console

    $ python3 -m venv venv      # The last argument is the folder in which to install the virtual environment
    $ source venv/bin/activate  # For bash or compatible shells. If using a different shell, use activate.csh or activate.fish
    (venv) $ pip install esphome       # Installs ESPHome in the virtual environment
    (venv) $ esphome version

Any time you want to use ESPHome, you will need to have activated the virtual environment as shown above. When activated you will see ``(venv)`` at the beginning of your prompt.

**Cloning the repository**

For development purposes, we recommend cloning the repository. See our
`developer site <https://developers.esphome.io>`__ for more information on setting up a development environment.

Linux
-----

Your distribution probably already has Python installed. Confirm that it is at
least version 3.9:

.. code-block:: console

    $ python3 --version
    Python 3.9.15

Looks good? Now create a virtual environment to contain ESPHome and it's dependencies.

.. code-block:: console

    $ python3 -m venv venv
    $ source venv/bin/activate

You may or may not see ``(venv)`` at the beginning of your prompt depending on your shell configuration. This indicates that you are in the virtual environment.

You can go ahead and install ESPHome:

.. code-block:: bash

    pip3 install esphome

.. caution::

    Don't use ``sudo`` with pip. If you do, you'll run into trouble updating
    your OS down the road.

    For details, see `DontBreakDebian
    <https://wiki.debian.org/DontBreakDebian#A.27make_install.27_can_conflict_with_packages>`_.
    ``pip install`` is equivalent to ``make install`` in this context. The
    advice in the article applies to all Linux distributions, not just Debian.

    Some people install ESPHome without the virtual environment, which can lead to issues with PATHs etc.
    Non virtual environment installations are considered not "supported" as people end up having to know your exact system setup.

At this point, you should be able confirm that ESPHome has been successfully installed:

.. code-block:: console

    $ esphome version
    Version: 2022.11.4

If you get an error like "Command not found", you need to add the binary to
your ``PATH`` using ``export PATH=$PATH:$HOME/.local/bin``.

To set this permanently, you can run ``echo 'export
PATH=$PATH:$HOME/.local/bin' >> $HOME/.bashrc``, then log out and back in.

See Also
--------

- :doc:`ESPHome index </index>`
- :doc:`getting_started_command_line`
- `Developer site <https://developers.esphome.io>`__
- :ghedit:`Edit`
