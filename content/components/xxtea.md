XXTEA Component
===============

.. seo::
    :description: Lightweight encryption algorithm for ESPHome
    :keywords: xxtea

This component cannot be used directly in YAML, but can be used in lambdas to encrypt and decrypt data.

The encryption used is `XXTEA <https://en.wikipedia.org/wiki/XXTEA>`_ which is fast and compact. XXTEA is known
to be susceptible to a chosen-plaintext attack, so it should not be used where plain-text injection is possible.

The algorithm has been modified from the original to use a 256 bit key instead of the original 128 bit key.

See the API docs for more information on how to use this component.

See Also
--------

- :doc:`index`
- :apiref:`xxtea/xxtea.h`
- :ghedit:`Edit`
