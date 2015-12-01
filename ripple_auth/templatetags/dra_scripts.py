from django import template


register = template.Library()


@register.simple_tag()
def dra_scripts():
    scripts = """
    <script src='/static/js/libs/angular.min.js'></script>
    <script src='/static/js/libs/angular-route.min.js'></script>
    <script src='/static/js/libs/ui-bootstrap-tpls-0.13.0.min.js'></script>
    <script src='/static/js/libs/store.min.js'></script>
    <script src='/static/js/libs/sjcl.js'></script>
    <script src='/static/js/libs/sjcl-custom.js'></script>
    <script src='/static/js/libs/async.js'></script>
    <script src='/static/js/libs/snap.js'></script>
    <script src='/static/js/libs/spin.js'></script>
    <script src='/static/js/libs/moment.min.js'></script>
    <script src='https://cdnjs.cloudflare.com/ajax/libs/superagent/0.15.7/superagent.js'></script>
    <script src='https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js'></script>

    <!-- config -->
    <script src='/static/js/config.js'></script>

    <!-- app -->
    <script src='/static/js/ripple.js'></script>
    <script src='/static/js/desktop.js'></script>

    <!-- challenge -->
    <script src='/static/js/challenge.js'></script>
    """
    return scripts
