from django import template


register = template.Library()


@register.simple_tag()
def sjcl_scripts():
    scripts = """
    <script src="static/js/sjcl/sjcl.js"></script>
    <script src="static/js/sjcl/core/sjcl.js"></script>
    <script src="static/js/sjcl/core/sha1.js"></script>
    <script src="static/js/sjcl/core/sha256.js"></script>
    <script src="static/js/sjcl/core/sha512.js"></script>
    <script src="static/js/sjcl/core/random.js"></script>
    <script src="static/js/sjcl/core/aes.js"></script>
    <script src="static/js/sjcl/core/bitArray.js"></script>
    <script src="static/js/sjcl/core/bn.js"></script>
    <script src="static/js/sjcl/core/cbc.js"></script>
    <script src="static/js/sjcl/core/ccm.js"></script>
    <script src="static/js/sjcl/core/codecBase64.js"></script>
    <script src="static/js/sjcl/core/codecBytes.js"></script>
    <script src="static/js/sjcl/core/codecHex.js"></script>
    <script src="static/js/sjcl/core/codecString.js"></script>
    <script src="static/js/sjcl/core/convenience.js"></script>
    <script src="static/js/sjcl/core/ecc.js"></script>
    <script src="static/js/sjcl/core/gcm.js"></script>
    <script src="static/js/sjcl/core/hmac.js"></script>
    <script src="static/js/sjcl/core/ocb2.js"></script>
    <script src="static/js/sjcl/core/pbkdf2.js"></script>
    <script src="static/js/sjcl/core/srp.js"></script>

    <script src="static/js/sjcl-custom/sjcl-ecc-pointextras.js"></script>
    <script src="static/js/sjcl-custom/sjcl-ecdsa-canonical.js"></script>
    <script src="static/js/sjcl-custom/sjcl-ecdsa-der.js"></script>
    <script src="static/js/sjcl-custom/sjcl-ecdsa-recoverablepublickey.js"></script>
    <script src="static/js/sjcl-custom/sjcl-extramath.js"></script>
    <script src="static/js/sjcl-custom/sjcl-jacobi.js"></script>
    <script src="static/js/sjcl-custom/sjcl-montgomery.js"></script>
    <script src="static/js/sjcl-custom/sjcl-ripemd160.js"></script>
    <script src="static/js/sjcl-custom/sjcl-secp256k1.js"></script>
    <script src="static/js/sjcl-custom/sjcl-validecc.js"></script>
    """
    return scripts
