django-ripple-auth
==================

Install
-------

    pip install git+https://github.com/42cc/django-ripple-auth
or

    git clone https://github.com/42cc/django-ripple-auth.git
    python setup.py install

Usage
-----

1. Add **ripple_auth** to INSTALLED_APPS
2. Add to login template following scripts in <head>:


    <script src="{% static 'js/app/app.js' %}"></script>
    <script src="{% static 'js/app/login.js' %}"></script>
    <script src="{% static 'js/app/id.js' %}"></script>
    <script src="{% static 'js/app/oldblob.js' %}"></script>
    <script src="{% static 'js/app/tracker.js' %}"></script>
    <script src="{% static 'js/app/async.js' %}"></script>
    <script src="{% static 'js/app/challenge.js' %}"></script>
    <script src="{% static 'js/verify_challenge/challenge_sign_params.js' %}"></script>
    <script src="{% static 'js/verify_challenge/verify_challenge.js' %}"></script>
    <script src="{% static 'js/config.js' %}"></script>
    
    
3. Also you need to add following to template:
    1. AngularJS
    2. angular-route
    
    
3. Add sjcl library and it's dependencies to to login template:


    {% load sjcl_scripts %}
to <head>:

    {% sjcl_scripts %}

4. Declare in template new AngularJS app and controller:


    <div ng-app="loginApp" class="row">
        <form ng-controller="LoginCtrl" action="">
            ...
        </form>
    </div>

5. Add separate submit button for login via ripple:


    <a rp-spinner="" ng-disabled="ajax_loading"
       ng-hide="twoFactor" ng-click="submitOldForm()" href="" id="ripple-login"
        class="btn btn-success btn-default">
      Sign in via ripple
      {% verbatim %}
        <img width="20px" ng-src="{{ ajax_loading == true && 'https://app.p2pay.com/img/throbber5.gif' || '/static/images/ripple.png' }}">
      {% endverbatim %}
    </a>

6. Add to urls following patterns:


    from ripple_auth.views import get_challenge, return_challenge

    url(r'^get_challenge/$', get_challenge, name='get_challenge')
    url(r'^return_challenge/$', return_challenge, name='return_challenge')