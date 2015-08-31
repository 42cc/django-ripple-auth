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
    * AngularJS
    * angular-route
    
    
