# -*- coding: utf-8 -*-

# system
import os
import json
import binascii
import logging

# django
from django.views.generic.base import View
from django.contrib.auth import authenticate, login
from django.http import HttpResponseRedirect, HttpResponse, \
    HttpResponseForbidden

# third party
from nodejs.bindings import node_run


logger = logging.getLogger('ripple_auth')


SIGN_PARAMS = """
var challenge = '%s';
var signature = '%s';
var publicKey = '%s';

exports.challenge = challenge;
exports.signature = signature;
exports.publicKey = publicKey;
"""


def get_challenge(request):
    """
    :param request: request
    :return: generates and returns challenge
    """
    challenge = binascii.b2a_hex(os.urandom(15))
    return HttpResponse(challenge)


def return_challenge(request):
    """
    :param request: request
    :return: perform signed challenge check
    """
    # get request data

    data = json.loads(request.body)
    challenge = data.get('challenge', None)
    signature = data.get('signature', None)
    public_key = data.get('publicKey', None)
    ripple_address = data.get('ripple_address', None)
    username = data.get('username', None)

    challenge_sign_params = os.path.join(
        os.path.dirname(__file__),
        'static/js/verify_challenge/challenge_sign_params.js'
    )
    verify_challenge = os.path.join(
        os.path.dirname(__file__),
        'static/js/verify_challenge/verify_challenge.js'
    )

    # Write received sign params to js file
    logger.info('Writing sign params to js')
    f = open(challenge_sign_params, 'w+b')
    f.write(SIGN_PARAMS % (challenge, signature, public_key))
    f.close()

    stderr, stdout = node_run(verify_challenge)
    if stdout.strip() != 'true':
        logger.warning('Challenge not verified')
        return HttpResponseForbidden(stderr)

    if not stdout or stderr:
        logger.error(
            'An error occurred while verifying challenge: %s' % stderr
        )
        return HttpResponseForbidden(stderr)

    # clear js file
    f = open(challenge_sign_params, 'w+b')
    f.close()

    logger.info('Challenge successfully verified')

    # authenticate user
    user = authenticate(username=username, ripple_address=ripple_address)
    if user and user.is_active:
        login(request, user)
        return HttpResponseRedirect('/')
    else:
        return HttpResponseForbidden('User was not found')


class RippleProcessView(View):
    """
    GET:  generate random challenge and return it
    POST: verify signed challenge
    """
    def get(self, request):
        """
        :param request: request
        :return: random challenge
        """
        challenge = binascii.b2a_hex(os.urandom(15))
        return HttpResponse(challenge)

    def post(self, request):
        """
        :param request: request
        :return: perform signed challenge check
        """
        data = request.POST
        challenge = data.get('challenge', None)
        signature = data.get('signature', None)
        public_key = data.get('publicKey', None)
        ripple_address = data.get('ripple_address', None)
        username = data.get('username', None)

        challenge_sign_params = os.path.join(
            os.path.dirname(__file__),
            'static/js/ripple_auth/verify_challenge/challenge_sign_params.js'
        )
        verify_challenge = os.path.join(
            os.path.dirname(__file__),
            'static/js/ripple_auth/verify_challenge/verify_challenge.js'
        )

        # Write received sign params to js file
        logger.info('Writing sign params to js')
        f = open(challenge_sign_params, 'w+b')
        f.write(SIGN_PARAMS % (challenge, signature, public_key))
        f.close()

        stderr, stdout = node_run(verify_challenge)
        if stdout.strip() != 'true':
            logger.warning('Challenge not verified')
            return HttpResponseForbidden(stderr)

        if not stdout or stderr:
            logger.error(
                'An error occurred while verifying challenge: %s' % stderr
            )
            return HttpResponseForbidden(stderr)

        # clear js file
        f = open(challenge_sign_params, 'w+b')
        f.close()

        logger.info('Challenge successfully verified')

        # authenticate user
        user = authenticate(username=username, ripple_address=ripple_address)
        if user and user.is_active:
            login(request, user)
            return HttpResponse('OK')
        else:
            return HttpResponseForbidden('User was not found')
