django-ripple-auth
==================

Installation
-------

1. Install

        pip install git+https://github.com/42cc/django-ripple-auth
or

        git clone https://github.com/42cc/django-ripple-auth.git
        python setup.py install

2. Add **ripple_auth** to INSTALLED_APPS
3. Add 'ripple_auth.backend.RippleAuthBackend' to AUTHENTICATION_BACKENDS

Usage
-----

#### Login via ripple

1. Add required dependencies to login page template using template tag:

        {% load dra_scripts %}

    and to <head></head> (jquery be defined before):

        {% dra_scripts %}

2. Declare in login page template new Angular app and following controllers.
   On login form you should add following attributes to <input> fields:

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

3. Add separate submit button for login via ripple:

        <a rp-spinner="" ng-disabled="ajax_loading"
           ng-hide="twoFactor" ng-click="submitForm()" href="" id="ripple-login"
            class="btn btn-success btn-default">
          Sign in via ripple
          {% verbatim %}
            <img width="20px" ng-src="{{ ajax_loading == true && '/static/img/ripple-throbber.gif' || '/static/img/ripple.png' }}">
          {% endverbatim %}
        </a>

4. Add to urls following patterns:

        from ripple_auth.views import get_challenge, return_challenge

        url(r'^get_challenge/$', get_challenge, name='get_challenge')
        url(r'^return_challenge/$', return_challenge, name='return_challenge')

5. If you want to add login status and login errors if any on the page place this in the template:

        {% verbatim %}
          {{ status }}
          {{ error }}
        {% endverbatim %}

6. Also you can define these js variables:

`redirectAfterLogin` (true/false) - if you want redirect to some url after login

`loginRedirectUrl` - if redirectAfterLogin is enabled - redirect on specified url

#### Send ripple payments

1. Add required dependencies to send page template using template tag:

    `{% load dra_scripts %}`
    
    and to `<head></head>`:
    
    `{% dra_scripts %}`

2. Declare in send page template following controllers.

    `<body ng-controller="SendCtrl"></body>`

3. Payment link should look like:

    `<a href="" ng-click="send_one_step(recipient='rpkj1xuwkjSNFbUzZinzQH9f118YP6FQNw', currency='USD', amount=0.01, dt='')">Pay</a>`
   
4. You should place calculated paths and pay buttons (like in client). Add to the page:

        {% verbatim %}
          <div ng-show="send.alternatives.length"
               ng-hide="tx_result==&quot;clear&quot;"
               class="alternatives">
            <div ng-repeat="alt in send.alternatives">
              {{alt.amount | rpamount:{rel_precision: 4, rel_min_precision: 2} }}
              <span class="currency">{{alt.amount | rpcurrency }}</span>
              (<span class="rate">{{alt.rate | rpamount:{rel_precision: 4, rel_min_precision: 2} }}</span>
               <span class="pair">{{send.currency_code}}/{{alt.amount | rpcurrency}}</span>)
            </div>
        
            <button type="submit" ng-disabled="sendForm.$invalid"
                    ng-click="send_payment(alt)" l10n="l10n">
              Send {{ alt.amount | rpcurrency }}
            </button>
          </div>
        {% endverbatim %}

5. Then add status and error messages to the page:

        {% verbatim %}
          <div ng-show="tx_result!='clear'">
            <group ng-hide="connected" class="disconnected">
              <p l10n="err-you-must-be-online-to-see-this-screen" class="literal">
                You have to be online to see this screen
              </p>
            </group>
        
            <div ng-hide="account.Balance || !connected" class="unfunded">
              <p l10n="err-you-must-be-funded-before-you-can-send-money" class="literal">
                You have to be funded before you can send money
              </p>
            </div>
        
            <div class="row form-group">
              <div class="col-xs-12 col-sm-6 col-md-5">
                <div class="errorGroup">
                  <div rp-error-valid="rp-error-valid"
                       ng-show="send.recipient != send.recipient_address"
                       class="success">
                    {{send.recipient_address}}
                  </div>
                  <div rp-error-on="required" l10n="l10n" class="error">Please enter a recipient.</div>
                  <div rp-error-on="rpDest" l10n="l10n" class="error">
                    Recipient should be either a name from your contact list or Ripple/Bitcoin address.
                  </div>
                  <div rp-error-on="federation" l10n="l10n" class="error">This email address is not Ripple-enabled.</div>
                </div>
              </div>
            </div>
            <div ng-show="send.show_dt_field" class="row form-group">
              <div class="col-xs-12 col-sm-6 col-md-5">
                <div class="errorGroup">
                  <div rp-error-on="rpStdt" l10n="l10n" class="error">Invalid destination tag</div>
                  <div rp-error-on="required" l10n="l10n" class="error">Destination cannot be blank.</div>
                </div>
                <div ng-show="send.recipient_info.dest_tag_required" l10n="l10n">
                  Recipient requires a destination tag to be specified for the transaction. If you don't know the
                   destination tag, please contact them before doing a transaction.
                </div>
              </div>
            </div>
            <div ng-show="$routeParams.st || send.st" class="row form-group">
              <div class="col-xs-12 col-sm-6 col-md-5">
                <div class="errorGroup">
                  <div rp-error-on="rpStdt" l10n="l10n" class="error">Invalid source tag</div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <div class="errorGroup">
                <div rp-error-on="rpRestrictCurrencies" l10n="l10n" class="error">{{send.recipient | rpcontactname}} can't receive this currency.</div>
              </div>
              <div class="errorGroup">
                <div rp-error-on="required" l10n="l10n" class="error">Please enter an amount.</div>
                <div rp-error-on="rpAmount" l10n="l10n" class="error">Not a valid amount.</div>
                <div rp-error-on="rpAmountPositive" l10n="l10n" class="error">Amount must be greater than zero.</div>
                <div rp-error-on="rpMaxAmount" l10n="l10n" class="error">
                  This transaction exceeds your balance, you can send
                   a max. of {{account.max_spend | rpamount:{rel_precision: 0} }} XRP
                </div>
                <div ng-show="send.recipient_info.disallow_xrp &amp;&amp; send.currency_code=='XRP'" l10n="l10n" class="error">
                  Recipient does not allow XRP payments. Are you sure you want to send XRP anyway?
                </div>
                <div ng-show="send.trust_limit" l10n="l10n" class="notice">
                  {{send.recipient | rpcontactname}}
                  trusts you for {{send.trust_limit | rpamount}} {{send.trust_limit | rpcurrency}}.
                </div>
              </div>
            </div>
            <div class="remote">
              <p ng-show="send.fund_status == 'insufficient-xrp'" l10n="l10n" class="literal">
                Destination account is unfunded; send at least
                 {{send.xrp_deficiency | rpamount}} XRP to fund it.
                <a href="https://ripple.com/wiki/Reserves" target="_blank" l10n="l10n">More information</a>
              </p>
              <p ng-show="send.path_status == 'checking'" rp-spinner="4" l10n="l10n" class="literal">Checking</p>
              <p ng-show="send.path_status == 'fed-check'" rp-spinner="4" l10n="l10n" class="literal">Analyzing address</p>
              <p ng-show="send.path_status == 'bridge-quote'" rp-spinner="4" l10n="l10n" class="literal">Requesting quote</p>
              <p ng-show="send.path_status == 'pending' &amp;&amp; send.currency_code != 'XRP'" rp-spinner="4" l10n="l10n" class="literal">
                Calculating paths
              </p>
              <p ng-show="send.path_status == 'pending' &amp;&amp; send.currency_code == 'XRP'" rp-spinner="4" l10n="l10n" class="literal">
                Calculating alternatives
              </p>
              <p ng-show="send.path_status == 'no-path' &amp;&amp; send.currency_code != 'XRP'" l10n="l10n" class="literal">
                Sorry! Cannot send {{send.amount}} {{send.currency}} to
                 {{send.recipient}}. Please make sure your account has enough funds,
                 and the recipient has enough trust to the currency issuer. If it still
                 doesn't work, try again later.
              </p>
              <p ng-show="send.path_status == 'error-quote'" l10n="l10n" class="literal">Error while retrieving quote for outbound payment.<span ng-show="send.quote_error"> The outbound bridge reported: "{{send.quote_error | rpheavynormalize}}"</span></p>
              <p ng-show="send.path_status == 'error'" l10n="l10n" class="literal">Error while calculating path</p>
            </div>
        
            <group ng-show="mode==&quot;wait_path&quot; &amp;&amp; account.Balance" class="mode-wait-path">
              <p rp-spinner="4" l10n="l10n" class="literal">Ripple is calculating a path for your payment.</p>
            </group>
            <group ng-show="mode==&quot;confirm&quot; &amp;&amp; account.Balance" class="mode-confirm">
              <p l10n="l10n" class="literal">You are sending {{ (send.alt.amount || send.currency) | rpcurrency}} to</p>
              <div class="dest_feedback">
                <div ng-show="send.recipient_name" class="recipient">{{send.recipient_name}}</div>
                <div ng-hide="send.recipient_name" class="recipient">{{send.recipient_address}}</div>
                <div href="" ng-show="send.recipient != send.recipient_address || send.recipient_name" class="extra"> {{send.recipient_address}}</div>
                <div ng-show="send.dt" l10n="l10n" class="dt">Destination tag: {{send.dt}}</div>
              </div>
              <p l10n="l10n" class="literal">They will receive</p>
              <p class="amount_feedback"><span class="value">{{send.amount_feedback | rpamount}}&#32;</span><span class="currency">{{send.amount_feedback | rpcurrency}}</span></p>
              <group ng-show="send.indirect">
                <p l10n="l10n" class="literal">You will pay at most</p>
                <p class="sendmax_feedback"><span class="value">{{send.alt.amount | rpamount}}&#32;</span><span class="currency">{{send.alt.amount | rpcurrency}} &#32;</span><span>&plusmn; 1%</span></p>
              </group>
            </group>
            <group ng-show="mode==&quot;sending&quot; &amp;&amp; account.Balance" class="mode-sending">
              <p rp-spinner="4" l10n="l10n" class="literal">Sending transaction to Ripple network</p>
            </group>
            <group ng-show="mode==&quot;error&quot; &amp;&amp; account.Balance" class="mode-error">
              <group ng-switch="ng-switch" on="error_type">
                <group ng-switch-when="noDest" class="result-error">
                  <p l10n="l10n" class="tx-status">Destination does not exist</p>
                  <p l10n="l10n">The wallet you&#39;re trying to send to does not exist.</p>
                </group>
                <group ng-switch-when="noPath" class="result-error">
                  <p l10n="l10n" class="tx-status">No Path</p>
                  <p l10n="l10n">Ripple was unable to find a path between you and the destination account.</p>
                </group>
                <group ng-switch-when="invalidTransaction" class="result-error">
                  <p l10n="l10n" class="tx-status">Invalid transaction</p>
                  <p l10n="l10n">The transaction was rejected by the server due to a client issue.</p>
                </group>
                <group ng-switch-default="ng-switch-default">
                  <p l10n="l10n" class="literal">
                    Sorry, an error occurred while submitting your transaction.
                    Make sure you are connected to the Internet and try again later.
                  </p>
                  <p l10n="l10n" class="literal">Please ensure you don't send your payment more than once.</p>
                </group>
              </group>
            </group>
            <group ng-show="mode==&quot;status&quot; &amp;&amp; account.Balance" class="mode-status">
              <group ng-show="tx_result==&quot;pending&quot;" class="pending">
                <p l10n="l10n" class="tx-status">Your transaction has been submitted.</p>
                <p l10n="l10n">Your account balance will update once the payment has cleared.</p>
              </group>
              <group ng-show="tx_result==&quot;cleared&quot;" class="result-success">
                <p l10n="l10n" class="tx-status">Transaction cleared!</p>
              </group>
              <group ng-show="tx_result==&quot;partial&quot;" class="result-partial">
                <p l10n="l10n" class="tx-status">Transaction partially valid!</p>
                <p l10n="l10n">Your transaction could only be partially applied.</p>
              </group>
              <group ng-show="tx_result==&quot;error&quot;" class="result-error">
                <p l10n="l10n" class="tx-status">Transaction could not be submitted!</p>
                <p l10n="l10n">
                  We were unable to submit the transaction to the server.
                  Please try again later.
                </p>
              </group>
              <group ng-show="tx_result==&quot;malformed&quot;" class="result-malformed">
                <p l10n="l10n" class="tx-status">Transaction malformed!</p>
                <p ng-switch="ng-switch" on="engine_result">
                  <span ng-switch-default="ng-switch-default" l10n="l10n">
                    Your transaction is invalid, reason: {{engine_result}} - {{engine_result_message}}
                  </span>
                </p>
              </group>
              <group ng-show="tx_result==&quot;failure&quot;" class="result-malformed">
                <p l10n="l10n" class="tx-status">Transaction malformed!</p>
                <p ng-switch="ng-switch" on="engine_result">
                  <span ng-switch-when="tefDST_TAG_NEEDED" l10n="l10n">
                    Destination account requires destination tag to be specified when making payments.
                  </span>
                </p>
              </group>
              <group ng-show="tx_result==&quot;local&quot;" class="result-failed">
                <p l10n="l10n" class="tx-status">Transaction failed!</p>
                <p ng-switch="ng-switch" on="engine_result"><span ng-switch-when="telINSUF_FEE_P" l10n="l10n">
                    The particular server you sent the transaction to was too busy to forward or process
                     your transaction at the fee you included in it.</span></p>
              </group>
              <group ng-show="tx_result==&quot;claim&quot;" class="result-malformed">
                <p l10n="l10n" class="tx-status">Transaction failed!</p>
                <p ng-switch="ng-switch" on="engine_result">
                  <span ng-switch-when="tecNO_DST" l10n="l10n">
                    The destination account does not exist.
                  </span>
                  <span ng-switch-when="tecNO_DST_INSUF_XRP" l10n="l10n">
                    The destination account does not exist. Too little XRP sent to create it.
                  </span>
                  <span ng-switch-default="ng-switch-default" l10n="l10n">
                    Error: {{engine_result_message}}
                  </span>
                </p>
              </group>
              <group ng-show="tx_result==&quot;failed&quot;" class="result-failed">
                <p l10n="l10n" class="tx-status">Transaction failed!</p>
                <p ng-switch="ng-switch" on="engine_result">
                  <span ng-switch-when="terNO_LINE" l10n="l10n">
                    You have no trust line in this currency.
                  </span>
                  <span ng-switch-default="ng-switch-default" l10n="l10n">
                    Your transaction failed to clear, reason: {{engine_result_message}}
                  </span>
                </p>
              </group>
            </group>
          </div>
        {% endverbatim %}

6. Also you can define these js variables:

`redirectAfterSend (true/false)` - if you want redirect to some url after send payment

`sendRedirectUrl` - if redirectAfterSend is enabled - redirect on specified url