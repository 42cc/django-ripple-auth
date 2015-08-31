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
2. Add to login template following scripts:
    {% static 'js/app/app.js' %}

    {% static 'js/app/login.js' %}

    {% static 'js/app/id.js' %}

    {% static 'js/app/oldblob.js' %}

    {% static 'js/app/tracker.js' %}

    {% static 'js/app/async.js' %}

    {% static 'js/app/challenge.js' %}

    {% static 'js/verify_challenge/challenge_sign_params.js' %}

    {% static 'js/verify_challenge/verify_challenge.js' %}

    {% static 'js/config.js' %}

3. Declare in template new AngularJS app and controller:
    <div ng-app="loginApp" class="row">
        <form ng-controller="LoginCtrl" action="">
        </form>
    </div>
