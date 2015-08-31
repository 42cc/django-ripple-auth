# -*- coding: utf-8 -*-

# system
import os
import json
import binascii

# django
from django.contrib.auth import authenticate, login
from django.core.urlresolvers import reverse
from django.http.response import HttpResponseRedirect, HttpResponse, \
    HttpResponseForbidden

# third party
from nodejs.bindings import node_run


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

    # Write received sign params to js file
    logger.info('Writing sign params to js')
    f = open('assets/js/verify_challenge/challenge_sign_params.js', 'w+b')
    f.write(SIGN_PARAMS % (challenge, signature, public_key))
    f.close()

    stderr, stdout = node_run('assets/js/verify_challenge/verify_challenge.js')
    if stdout.strip() != 'true':
        logger.warning('Challenge not verified')
        return HttpResponseForbidden()

    if not stdout or stderr:
        logger.error(
            'An error occurred while verifying challenge: %s' % stderr
        )
        return HttpResponseForbidden()

    # clear js file
    f = open('assets/js/verify_challenge/challenge_sign_params.js', 'w+b')
    f.close()

    logger.info('Challenge successfully verified')

    # authenticate user
    user = authenticate(username=username, ripple_address=ripple_address)
    if user and user.is_active:
        login(request, user)
        return HttpResponseRedirect(reverse('projects:project_list'))
    else:
        return HttpResponseForbidden()
