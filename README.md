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
2. Add 'ripple_auth.backend.RippleAuthBackend' to AUTHENTICATION_BACKENDS
3. Add all dependencies to login template using templatetag:


        {% load dra_scripts %}
    
    and to <head>:

        {% dra_scripts %}

4. Declare in login page template new Angular app and following controllers.
   In login form you should add following attributes to <input> fields:

        {% load dra_scripts %}
        <html ng-app="rp" ng-controller="AppCtrl" ng-class="[$route.current.tabClass, $route.current.pageMode]">
          <head>
            ...
          </head>
          <body>
            <form ng-controller="LoginCtrl" action="">
                ...
                <label for="username">Username</label>
                <input id="username" ng-model="username"
                       class="form-control ng-pristine ng-invalid ng-invalid-required"
                       required="required" rp-focus-on-empty="rp-focus-on-empty"
                       rp-autofill="$routeParams.username"
                       type="text" name="username" value="" size="50" />

                <label for="password">Password</label>
                <input id="password" rp-focus="rp-focus" ng-model="password"
                       class="form-control ng-pristine ng-invalid ng-invalid-required"
                       type="password" name="password" required="required" value=""
                       size="50" />
                ...
            </form>
          </body>
        </html>

5. Add separate submit button for login via ripple:


        <a rp-spinner="" ng-disabled="ajax_loading"
           ng-hide="twoFactor" ng-click="submitForm()" href="" id="ripple-login"
            class="btn btn-success btn-default">
          Sign in via ripple
          {% verbatim %}
            <img width="20px" ng-src="{{ ajax_loading == true && '/static/img/ripple-throbber.gif' || '/static/img/ripple.png' }}">
          {% endverbatim %}
        </a>

6. Add to urls following patterns:


        from ripple_auth.views import get_challenge, return_challenge

        url(r'^get_challenge/$', get_challenge, name='get_challenge')
        url(r'^return_challenge/$', return_challenge, name='return_challenge')
