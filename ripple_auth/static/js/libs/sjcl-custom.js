/**
 *  Check that the point is valid based on the method described in
 *  SEC 1: Elliptic Curve Cryptography, section 3.2.2.1: 
 *  Elliptic Curve Public Key Validation Primitive
 *  http://www.secg.org/download/aid-780/sec1-v2.pdf
 *
 *  @returns {Boolean}
 */
sjcl.ecc.point.prototype.isValidPoint = function() {

  var self = this;

  var field_modulus = self.curve.field.modulus;

  if (self.isIdentity) {
    return false;
  }

  // Check that coordinatres are in bounds
  // Return false if x < 1 or x > (field_modulus - 1)
  if (((new sjcl.bn(1).greaterEquals(self.x)) &&
    !self.x.equals(1)) ||
    (self.x.greaterEquals(field_modulus.sub(1))) &&
    !self.x.equals(1)) {

    return false;
  }

  // Return false if y < 1 or y > (field_modulus - 1)
  if (((new sjcl.bn(1).greaterEquals(self.y)) &&
    !self.y.equals(1)) ||
    (self.y.greaterEquals(field_modulus.sub(1))) &&
    !self.y.equals(1)) {

    return false;
  }

  if (!self.isOnCurve()) {
    return false;
  }

  // TODO check to make sure point is a scalar multiple of base_point

  return true;

};

/**
 *  Check that the point is on the curve
 *
 *  @returns {Boolean}
 */
sjcl.ecc.point.prototype.isOnCurve = function() {

  var self = this;

  var field_order = self.curve.r;
  var component_a = self.curve.a;
  var component_b = self.curve.b;
  var field_modulus = self.curve.field.modulus;

  var left_hand_side = self.y.mul(self.y).mod(field_modulus);
  var right_hand_side = self.x.mul(self.x).mul(self.x).add(component_a.mul(self.x)).add(component_b).mod(field_modulus);

  return left_hand_side.equals(right_hand_side);

};


sjcl.ecc.point.prototype.toString = function() {
  return '(' + 
    this.x.toString() + ', ' +
    this.y.toString() +
    ')';
};

sjcl.ecc.pointJac.prototype.toString = function() {
  return '(' + 
    this.x.toString() + ', ' +
    this.y.toString() + ', ' +
    this.z.toString() +
    ')';
};

sjcl.ecc.ecdsa.secretKey.prototype.canonicalizeSignature = function(rs) {
  var w = sjcl.bitArray,
      R = this._curve.r,
      l = R.bitLength();

  var r = sjcl.bn.fromBits(w.bitSlice(rs,0,l)),
      s = sjcl.bn.fromBits(w.bitSlice(rs,l,2*l));

  // For a canonical signature we want the lower of two possible values for s
  // 0 < s <= n/2
  if (!R.copy().halveM().greaterEquals(s)) {
    s = R.sub(s);
  }

  return w.concat(r.toBits(l), s.toBits(l));
};

sjcl.ecc.ecdsa.secretKey.prototype.signDER = function(hash, paranoia) {
  return this.encodeDER(this.sign(hash, paranoia));
};

sjcl.ecc.ecdsa.secretKey.prototype.encodeDER = function(rs) {
  var w = sjcl.bitArray,
      R = this._curve.r,
      l = R.bitLength();

  var rb = sjcl.codec.bytes.fromBits(w.bitSlice(rs,0,l)),
      sb = sjcl.codec.bytes.fromBits(w.bitSlice(rs,l,2*l));

  // Drop empty leading bytes
  while (!rb[0] && rb.length) rb.shift();
  while (!sb[0] && sb.length) sb.shift();

  // If high bit is set, prepend an extra zero byte (DER signed integer)
  if (rb[0] & 0x80) rb.unshift(0);
  if (sb[0] & 0x80) sb.unshift(0);

  var buffer = [].concat(
    0x30,
    4 + rb.length + sb.length,
    0x02,
    rb.length,
    rb,
    0x02,
    sb.length,
    sb
  );

  return sjcl.codec.bytes.toBits(buffer);
};

/**
 *  This module uses the public key recovery method
 *  described in SEC 1: Elliptic Curve Cryptography,
 *  section 4.1.6, "Public Key Recovery Operation".
 *  http://www.secg.org/download/aid-780/sec1-v2.pdf
 *
 *  Implementation based on:
 *  https://github.com/bitcoinjs/bitcoinjs-lib/blob/89cf731ac7309b4f98994e3b4b67b7226020181f/src/ecdsa.js
 */

// Defined here so that this value only needs to be calculated once
var FIELD_MODULUS_PLUS_ONE_DIVIDED_BY_FOUR;

/**
 *  Sign the given hash such that the public key, prepending an extra byte
 *  so that the public key will be recoverable from the signature
 *
 *  @param {bitArray} hash
 *  @param {Number} paranoia
 *  @returns {bitArray} Signature formatted as bitArray
 */
sjcl.ecc.ecdsa.secretKey.prototype.signWithRecoverablePublicKey = function(hash, paranoia, k_for_testing) {

  var self = this;

  // Convert hash to bits and determine encoding for output
  var hash_bits;
  if (typeof hash === 'object' && hash.length > 0 && typeof hash[0] === 'number') {
    hash_bits = hash;
  } else {
    throw new sjcl.exception.invalid('hash. Must be a bitArray');
  }

  // Sign hash with standard, canonicalized method
  var standard_signature = self.sign(hash_bits, paranoia, k_for_testing);
  var canonical_signature = self.canonicalizeSignature(standard_signature);

  // Extract r and s signature components from canonical signature
  var r_and_s = getRandSFromSignature(self._curve, canonical_signature);

  // Rederive public key
  var public_key = self._curve.G.mult(sjcl.bn.fromBits(self.get()));

  // Determine recovery factor based on which possible value
  // returns the correct public key
  var recovery_factor = calculateRecoveryFactor(self._curve, r_and_s.r, r_and_s.s, hash_bits, public_key);

  // Prepend recovery_factor to signature and encode in DER
  // The value_to_prepend should be 4 bytes total
  var value_to_prepend = recovery_factor + 27;

  var final_signature_bits = sjcl.bitArray.concat([value_to_prepend], canonical_signature);

  // Return value in bits
  return final_signature_bits;

};


/**
 *  Recover the public key from a signature created with the
 *  signWithRecoverablePublicKey method in this module
 *
 *  @static
 *
 *  @param {bitArray} hash
 *  @param {bitArray} signature
 *  @param {sjcl.ecc.curve} [sjcl.ecc.curves['c256']] curve
 *  @returns {sjcl.ecc.ecdsa.publicKey} Public key
 */
sjcl.ecc.ecdsa.publicKey.recoverFromSignature = function(hash, signature, curve) {

  if (!signature || signature instanceof sjcl.ecc.curve) {
    throw new sjcl.exception.invalid('must supply hash and signature to recover public key');
  }

  if (!curve) {
    curve = sjcl.ecc.curves['c256'];
  }

  // Convert hash to bits and determine encoding for output
  var hash_bits;
  if (typeof hash === 'object' && hash.length > 0 && typeof hash[0] === 'number') {
    hash_bits = hash;
  } else {
    throw new sjcl.exception.invalid('hash. Must be a bitArray');
  }

  var signature_bits;
  if (typeof signature === 'object' && signature.length > 0 && typeof signature[0] === 'number') {
    signature_bits = signature;
  } else {
    throw new sjcl.exception.invalid('signature. Must be a bitArray');
  }

  // Extract recovery_factor from first 4 bytes
  var recovery_factor = signature_bits[0] - 27;

  if (recovery_factor < 0 || recovery_factor > 3) {
    throw new sjcl.exception.invalid('signature. Signature must be generated with algorithm ' +
      'that prepends the recovery factor in order to recover the public key');
  }

  // Separate r and s values
  var r_and_s = getRandSFromSignature(curve, signature_bits.slice(1));
  var signature_r = r_and_s.r;
  var signature_s = r_and_s.s;

  // Recover public key using recovery_factor
  var recovered_public_key_point = recoverPublicKeyPointFromSignature(curve, signature_r, signature_s, hash_bits, recovery_factor);
  var recovered_public_key = new sjcl.ecc.ecdsa.publicKey(curve, recovered_public_key_point);

  return recovered_public_key;

};


/**
 *  Retrieve the r and s components of a signature
 *
 *  @param {sjcl.ecc.curve} curve
 *  @param {bitArray} signature
 *  @returns {Object} Object with 'r' and 's' fields each as an sjcl.bn
 */
function getRandSFromSignature(curve, signature) {

  var r_length = curve.r.bitLength();

  return {
    r: sjcl.bn.fromBits(sjcl.bitArray.bitSlice(signature, 0, r_length)),
    s: sjcl.bn.fromBits(sjcl.bitArray.bitSlice(signature, r_length, sjcl.bitArray.bitLength(signature)))
  };
};


/**
 *  Determine the recovery factor by trying all four
 *  possibilities and figuring out which results in the
 *  correct public key
 *
 *  @param {sjcl.ecc.curve} curve
 *  @param {sjcl.bn} r
 *  @param {sjcl.bn} s
 *  @param {bitArray} hash_bits
 *  @param {sjcl.ecc.point} original_public_key_point
 *  @returns {Number, 0-3} Recovery factor
 */
function calculateRecoveryFactor(curve, r, s, hash_bits, original_public_key_point) {

  var original_public_key_point_bits = original_public_key_point.toBits();

  // TODO: verify that it is possible for the recovery_factor to be 2 or 3,
  // we may only need 1 bit because the canonical signature might remove the
  // possibility of us needing to "use the second candidate key"
  for (var possible_factor = 0; possible_factor < 4; possible_factor++) {

    var resulting_public_key_point;
    try {
      resulting_public_key_point = recoverPublicKeyPointFromSignature(curve, r, s, hash_bits, possible_factor);
    } catch (err) {
      // console.log(err, err.stack);
      continue;
    }

    if (sjcl.bitArray.equal(resulting_public_key_point.toBits(), original_public_key_point_bits)) {
      return possible_factor;
    }

  }

  throw new sjcl.exception.bug('unable to calculate recovery factor from signature');

};


/**
 *  Recover the public key from the signature.
 *
 *  @param {sjcl.ecc.curve} curve
 *  @param {sjcl.bn} r
 *  @param {sjcl.bn} s
 *  @param {bitArray} hash_bits
 *  @param {Number, 0-3} recovery_factor
 *  @returns {sjcl.point} Public key corresponding to signature
 */
function recoverPublicKeyPointFromSignature(curve, signature_r, signature_s, hash_bits, recovery_factor) {

  var field_order = curve.r;
  var field_modulus = curve.field.modulus;

  // Reduce the recovery_factor to the two bits used
  recovery_factor = recovery_factor & 3;

  // The less significant bit specifies whether the y coordinate
  // of the compressed point is even or not.
  var compressed_point_y_coord_is_even = recovery_factor & 1;

  // The more significant bit specifies whether we should use the
  // first or second candidate key.
  var use_second_candidate_key = recovery_factor >> 1;

  // Calculate (field_order + 1) / 4
  if (!FIELD_MODULUS_PLUS_ONE_DIVIDED_BY_FOUR) {
    FIELD_MODULUS_PLUS_ONE_DIVIDED_BY_FOUR = field_modulus.add(1).div(4);
  }

  // In the paper they write "1. For j from 0 to h do the following..."
  // That is not necessary here because we are given the recovery_factor
  // step 1.1 Let x = r + jn
  // Here "j" is either 0 or 1
  var x;
  if (use_second_candidate_key) {
    x = signature_r.add(field_order);
  } else {
    x = signature_r;
  }

  // step 1.2 and 1.3  convert x to an elliptic curve point
  // Following formula in section 2.3.4 Octet-String-to-Elliptic-Curve-Point Conversion
  var alpha = x.mul(x).mul(x).add(curve.a.mul(x)).add(curve.b).mod(field_modulus);
  var beta = alpha.powermodMontgomery(FIELD_MODULUS_PLUS_ONE_DIVIDED_BY_FOUR, field_modulus);

  // If beta is even but y isn't or
  // if beta is odd and y is even
  // then subtract beta from the field_modulus
  var y;
  var beta_is_even = beta.mod(2).equals(0);
  if (beta_is_even && !compressed_point_y_coord_is_even ||
    !beta_is_even && compressed_point_y_coord_is_even) {
    y = beta;
  } else {
    y = field_modulus.sub(beta);
  }

  // generated_point_R is the point generated from x and y
  var generated_point_R = new sjcl.ecc.point(curve, x, y);

  // step 1.4  check that R is valid and R x field_order !== infinity
  // TODO: add check for R x field_order === infinity
  if (!generated_point_R.isValidPoint()) {
    throw new sjcl.exception.corrupt('point R. Not a valid point on the curve. Cannot recover public key');
  }

  // step 1.5  Compute e from M
  var message_e = sjcl.bn.fromBits(hash_bits);
  var message_e_neg = new sjcl.bn(0).sub(message_e).mod(field_order);

  // step 1.6  Compute Q = r^-1 (sR - eG)
  // console.log('r: ', signature_r);
  var signature_r_inv = signature_r.inverseMod(field_order);
  var public_key_point = generated_point_R.mult2(signature_s, message_e_neg, curve.G).mult(signature_r_inv);

  // Validate public key point
  if (!public_key_point.isValidPoint()) {
    throw new sjcl.exception.corrupt('public_key_point. Not a valid point on the curve. Cannot recover public key');
  }

  // Verify that this public key matches the signature
  if (!verify_raw(curve, message_e, signature_r, signature_s, public_key_point)) {
    throw new sjcl.exception.corrupt('cannot recover public key');
  }

  return public_key_point;

};


/**
 *  Verify a signature given the raw components
 *  using method defined in section 4.1.5:
 *  "Alternative Verifying Operation"
 *
 *  @param {sjcl.ecc.curve} curve
 *  @param {sjcl.bn} e
 *  @param {sjcl.bn} r
 *  @param {sjcl.bn} s
 *  @param {sjcl.ecc.point} public_key_point
 *  @returns {Boolean}
 */
function verify_raw(curve, e, r, s, public_key_point) {

  var field_order = curve.r;

  // Return false if r is out of bounds
  if ((new sjcl.bn(1)).greaterEquals(r) || r.greaterEquals(new sjcl.bn(field_order))) {
    return false;
  }

  // Return false if s is out of bounds
  if ((new sjcl.bn(1)).greaterEquals(s) || s.greaterEquals(new sjcl.bn(field_order))) {
    return false;
  }

  // Check that r = (u1 + u2)G
  // u1 = e x s^-1 (mod field_order)
  // u2 = r x s^-1 (mod field_order)
  var s_mod_inverse_field_order = s.inverseMod(field_order);
  var u1 = e.mul(s_mod_inverse_field_order).mod(field_order);
  var u2 = r.mul(s_mod_inverse_field_order).mod(field_order);

  var point_computed = curve.G.mult2(u1, u2, public_key_point);

  return r.equals(point_computed.x.mod(field_order));

};

sjcl.bn.ZERO = new sjcl.bn(0);

/** [ this / that , this % that ] */
sjcl.bn.prototype.divRem = function (that) {
  if (typeof(that) !== "object") { that = new this._class(that); }
  var thisa = this.abs(), thata = that.abs(), quot = new this._class(0),
      ci = 0;
  if (!thisa.greaterEquals(thata)) {
    return [new sjcl.bn(0), this.copy()];
  } else if (thisa.equals(thata)) {
    return [new sjcl.bn(1), new sjcl.bn(0)];
  }

  for (; thisa.greaterEquals(thata); ci++) {
    thata.doubleM();
  }
  for (; ci > 0; ci--) {
    quot.doubleM();
    thata.halveM();
    if (thisa.greaterEquals(thata)) {
      quot.addM(1);
      thisa.subM(that).normalize();
    }
  }
  return [quot, thisa];
};

/** this /= that (rounded to nearest int) */
sjcl.bn.prototype.divRound = function (that) {
  var dr = this.divRem(that), quot = dr[0], rem = dr[1];

  if (rem.doubleM().greaterEquals(that)) {
    quot.addM(1);
  }

  return quot;
};

/** this /= that (rounded down) */
sjcl.bn.prototype.div = function (that) {
  var dr = this.divRem(that);
  return dr[0];
};

sjcl.bn.prototype.sign = function () {
  return this.greaterEquals(sjcl.bn.ZERO) ? 1 : -1;
};

/** -this */
sjcl.bn.prototype.neg = function () {
  return sjcl.bn.ZERO.sub(this);
};

/** |this| */
sjcl.bn.prototype.abs = function () {
  if (this.sign() === -1) {
    return this.neg();
  } else return this;
};

/** this >> that */
sjcl.bn.prototype.shiftRight = function (that) {
  if ("number" !== typeof that) {
    throw new Error("shiftRight expects a number");
  }

  that = +that;

  if (that < 0) {
    return this.shiftLeft(that);
  }

  var a = new sjcl.bn(this);

  while (that >= this.radix) {
    a.limbs.shift();
    that -= this.radix;
  }

  while (that--) {
    a.halveM();
  }

  return a;
};

/** this >> that */
sjcl.bn.prototype.shiftLeft = function (that) {
  if ("number" !== typeof that) {
    throw new Error("shiftLeft expects a number");
  }

  that = +that;

  if (that < 0) {
    return this.shiftRight(that);
  }

  var a = new sjcl.bn(this);

  while (that >= this.radix) {
    a.limbs.unshift(0);
    that -= this.radix;
  }

  while (that--) {
    a.doubleM();
  }

  return a;
};

/** (int)this */
// NOTE Truncates to 32-bit integer
sjcl.bn.prototype.toNumber = function () {
  return this.limbs[0] | 0;
};

/** find n-th bit, 0 = LSB */
sjcl.bn.prototype.testBit = function (bitIndex) {
  var limbIndex = Math.floor(bitIndex / this.radix);
  var bitIndexInLimb = bitIndex % this.radix;

  if (limbIndex >= this.limbs.length) return 0;

  return (this.limbs[limbIndex] >>> bitIndexInLimb) & 1;
};

/** set n-th bit, 0 = LSB */
sjcl.bn.prototype.setBitM = function (bitIndex) {
  var limbIndex = Math.floor(bitIndex / this.radix);
  var bitIndexInLimb = bitIndex % this.radix;

  while (limbIndex >= this.limbs.length) this.limbs.push(0);

  this.limbs[limbIndex] |= 1 << bitIndexInLimb;

  this.cnormalize();

  return this;
};

sjcl.bn.prototype.modInt = function (n) {
  return this.toNumber() % n;
};

sjcl.bn.prototype.jacobi = function (that) {
  var a = this;
  that = new sjcl.bn(that);

  if (that.sign() === -1) return;

  // 1. If a = 0 then return(0).
  if (a.equals(0)) { return 0; }

  // 2. If a = 1 then return(1).
  if (a.equals(1)) { return 1; }

  var s = 0;

  // 3. Write a = 2^e * a1, where a1 is odd.
  var e = 0;
  while (!a.testBit(e)) e++;
  var a1 = a.shiftRight(e);

  // 4. If e is even then set s ← 1.
  if ((e & 1) === 0) {
    s = 1;
  } else {
    var residue = that.modInt(8);

    if (residue === 1 || residue === 7) {
      // Otherwise set s ← 1 if n ≡ 1 or 7 (mod 8)
      s = 1;
    } else if (residue === 3 || residue === 5) {
      // Or set s ← −1 if n ≡ 3 or 5 (mod 8).
      s = -1;
    }
  }

  // 5. If n ≡ 3 (mod 4) and a1 ≡ 3 (mod 4) then set s ← −s.
  if (that.modInt(4) === 3 && a1.modInt(4) === 3) {
    s = -s;
  }

  if (a1.equals(1)) {
    return s;
  } else {
    return s * that.mod(a1).jacobi(a1);
  }
};

sjcl.bn.prototype.invDigit = function ()
{
  var radixMod = 1 + this.radixMask;

  if (this.limbs.length < 1) return 0;
  var x = this.limbs[0];
  if ((x&1) == 0) return 0;
  var y = x&3;		// y == 1/x mod 2^2
  y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
  y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < radixMod <= 32 and assumes ability to handle 48-bit ints
  y = (y*(2-x*y%radixMod))%radixMod;		// y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y>0)?radixMod-y:-y;
};

// returns bit length of the integer x
function nbits(x) {
  var r = 1, t;
  if((t=x>>>16) != 0) { x = t; r += 16; }
  if((t=x>>8) != 0) { x = t; r += 8; }
  if((t=x>>4) != 0) { x = t; r += 4; }
  if((t=x>>2) != 0) { x = t; r += 2; }
  if((t=x>>1) != 0) { x = t; r += 1; }
  return r;
}

// JSBN-style add and multiply for SJCL w/ 24 bit radix
sjcl.bn.prototype.am = function (i,x,w,j,c,n) {
  var xl = x&0xfff, xh = x>>12;
  while (--n >= 0) {
    var l = this.limbs[i]&0xfff;
    var h = this.limbs[i++]>>12;
    var m = xh*l+h*xl;
    l = xl*l+((m&0xfff)<<12)+w.limbs[j]+c;
    c = (l>>24)+(m>>12)+xh*h;
    w.limbs[j++] = l&0xffffff;
  }
  return c;
}

var Montgomery = function (m)
{
  this.m = m;
  this.mt = m.limbs.length;
  this.mt2 = this.mt * 2;
  this.mp = m.invDigit();
  this.mpl = this.mp&0x7fff;
  this.mph = this.mp>>15;
  this.um = (1<<(m.radix-15))-1;
};

Montgomery.prototype.reduce = function (x)
{
  var radixMod = x.radixMask + 1;
  while (x.limbs.length <= this.mt2)	// pad x so am has enough room later
    x.limbs[x.limbs.length] = 0;
  for (var i = 0; i < this.mt; ++i) {
    // faster way of calculating u0 = x[i]*mp mod 2^radix
    var j = x.limbs[i]&0x7fff;
    var u0 = (j*this.mpl+(((j*this.mph+(x.limbs[i]>>15)*this.mpl)&this.um)<<15))&x.radixMask;
    // use am to combine the multiply-shift-add into one call
    j = i+this.mt;
    x.limbs[j] += this.m.am(0,u0,x,i,0,this.mt);
    // propagate carry
    while (x.limbs[j] >= radixMod) { x.limbs[j] -= radixMod; x.limbs[++j]++; }
  }
  x.trim();
  x = x.shiftRight(this.mt * this.m.radix);
  if (x.greaterEquals(this.m)) x = x.sub(this.m);
  return x.trim().normalize().reduce();
};

Montgomery.prototype.square = function (x)
{
  return this.reduce(x.square());
};

Montgomery.prototype.multiply = function (x, y)
{
  return this.reduce(x.mul(y));
};

Montgomery.prototype.convert = function (x)
{
  return x.abs().shiftLeft(this.mt * this.m.radix).mod(this.m);
};

Montgomery.prototype.revert = function (x)
{
  return this.reduce(x.copy());
};

sjcl.bn.prototype.powermodMontgomery = function (e, m)
{
  var i = e.bitLength(), k, r = new this._class(1);

  if (i <= 0) return r;
  else if (i < 18) k = 1;
  else if (i < 48) k = 3;
  else if (i < 144) k = 4;
  else if (i < 768) k = 5;
  else k = 6;

  if (i < 8 || !m.testBit(0)) {
    // For small exponents and even moduli, use a simple square-and-multiply
    // algorithm.
    return this.powermod(e, m);
  }

  var z = new Montgomery(m);

  e.trim().normalize();

  // precomputation
  var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
  g[1] = z.convert(this);
  if (k > 1) {
    var g2 = z.square(g[1]);

    while (n <= km) {
      g[n] = z.multiply(g2, g[n-2]);
      n += 2;
    }
  }

  var j = e.limbs.length-1, w, is1 = true, r2 = new this._class(), t;
  i = nbits(e.limbs[j])-1;
  while (j >= 0) {
    if (i >= k1) w = (e.limbs[j]>>(i-k1))&km;
    else {
      w = (e.limbs[j]&((1<<(i+1))-1))<<(k1-i);
      if (j > 0) w |= e.limbs[j-1]>>(this.radix+i-k1);
    }

    n = k;
    while ((w&1) == 0) { w >>= 1; --n; }
    if ((i -= n) < 0) { i += this.radix; --j; }
    if (is1) {	// ret == 1, don't bother squaring or multiplying it
      r = g[w].copy();
      is1 = false;
    } else {
      while (n > 1) { r2 = z.square(r); r = z.square(r2); n -= 2; }
      if (n > 0) r2 = z.square(r); else { t = r; r = r2; r2 = t; }
      r = z.multiply(r2,g[w]);
    }

    while (j >= 0 && (e.limbs[j]&(1<<i)) == 0) {
      r2 = z.square(r); t = r; r = r2; r2 = t;
      if (--i < 0) { i = this.radix-1; --j; }
    }
  }
  return z.revert(r);
}

/** @fileOverview Javascript RIPEMD-160 implementation.
 *
 * @author Artem S Vybornov <vybornov@gmail.com>
 */

/**
 * Context for a RIPEMD-160 operation in progress.
 * @constructor
 * @class RIPEMD, 160 bits.
 */
sjcl.hash.ripemd160 = function (hash) {
    if (hash) {
        this._h = hash._h.slice(0);
        this._buffer = hash._buffer.slice(0);
        this._length = hash._length;
    } else {
        this.reset();
    }
};

/**
 * Hash a string or an array of words.
 * @static
 * @param {bitArray|String} data the data to hash.
 * @return {bitArray} The hash value, an array of 5 big-endian words.
 */
sjcl.hash.ripemd160.hash = function (data) {
  return (new sjcl.hash.ripemd160()).update(data).finalize();
};

sjcl.hash.ripemd160.prototype = {
    /**
     * Reset the hash state.
     * @return this
     */
    reset: function () {
        this._h = _h0.slice(0);
        this._buffer = [];
        this._length = 0;
        return this;
    },

    /**
     * Reset the hash state.
     * @param {bitArray|String} data the data to hash.
     * @return this
     */
    update: function (data) {
        if ( typeof data === "string" )
            data = sjcl.codec.utf8String.toBits(data);

        var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data),
            ol = this._length,
            nl = this._length = ol + sjcl.bitArray.bitLength(data);
        for (i = 512+ol & -512; i <= nl; i+= 512) {
            var words = b.splice(0,16);
            for ( var w = 0; w < 16; ++w )
                words[w] = _cvt(words[w]);

            _block.call( this, words );
        }

        return this;
    },

    /**
     * Complete hashing and output the hash value.
     * @return {bitArray} The hash value, an array of 5 big-endian words.
     */
    finalize: function () {
        var b = sjcl.bitArray.concat( this._buffer, [ sjcl.bitArray.partial(1,1) ] ),
            l = ( this._length + 1 ) % 512,
            z = ( l > 448 ? 512 : 448 ) - l % 448,
            zp = z % 32;

        if ( zp > 0 )
            b = sjcl.bitArray.concat( b, [ sjcl.bitArray.partial(zp,0) ] )
        for ( ; z >= 32; z -= 32 )
            b.push(0);

        b.push( _cvt( this._length | 0 ) );
        b.push( _cvt( Math.floor(this._length / 0x100000000) ) );

        while ( b.length ) {
            var words = b.splice(0,16);
            for ( var w = 0; w < 16; ++w )
                words[w] = _cvt(words[w]);

            _block.call( this, words );
        }

        var h = this._h;
        this.reset();

        for ( var w = 0; w < 5; ++w )
            h[w] = _cvt(h[w]);

        return h;
    }
};

var _h0 = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ];

var _k1 = [ 0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e ];
var _k2 = [ 0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000 ];
for ( var i = 4; i >= 0; --i ) {
    for ( var j = 1; j < 16; ++j ) {
        _k1.splice(i,0,_k1[i]);
        _k2.splice(i,0,_k2[i]);
    }
}

var _r1 = [  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
             7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
             3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
             1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
             4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13 ];
var _r2 = [  5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
             6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
            15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
             8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
            12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11 ];

var _s1 = [ 11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
             7,  6,  8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
            11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
            11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
             9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ];
var _s2 = [  8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
             9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
             9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
            15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
             8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ];

function _f0(x,y,z) {
    return x ^ y ^ z;
};

function _f1(x,y,z) {
    return (x & y) | (~x & z);
};

function _f2(x,y,z) {
    return (x | ~y) ^ z;
};

function _f3(x,y,z) {
    return (x & z) | (y & ~z);
};

function _f4(x,y,z) {
    return x ^ (y | ~z);
};

function _rol(n,l) {
    return (n << l) | (n >>> (32-l));
}

function _cvt(n) {
    return ( (n & 0xff <<  0) <<  24 )
         | ( (n & 0xff <<  8) <<   8 )
         | ( (n & 0xff << 16) >>>  8 )
         | ( (n & 0xff << 24) >>> 24 );
}

function _block(X) {
    var A1 = this._h[0], B1 = this._h[1], C1 = this._h[2], D1 = this._h[3], E1 = this._h[4],
        A2 = this._h[0], B2 = this._h[1], C2 = this._h[2], D2 = this._h[3], E2 = this._h[4];

    var j = 0, T;

    for ( ; j < 16; ++j ) {
        T = _rol( A1 + _f0(B1,C1,D1) + X[_r1[j]] + _k1[j], _s1[j] ) + E1;
        A1 = E1; E1 = D1; D1 = _rol(C1,10); C1 = B1; B1 = T;
        T = _rol( A2 + _f4(B2,C2,D2) + X[_r2[j]] + _k2[j], _s2[j] ) + E2;
        A2 = E2; E2 = D2; D2 = _rol(C2,10); C2 = B2; B2 = T; }
    for ( ; j < 32; ++j ) {
        T = _rol( A1 + _f1(B1,C1,D1) + X[_r1[j]] + _k1[j], _s1[j] ) + E1;
        A1 = E1; E1 = D1; D1 = _rol(C1,10); C1 = B1; B1 = T;
        T = _rol( A2 + _f3(B2,C2,D2) + X[_r2[j]] + _k2[j], _s2[j] ) + E2;
        A2 = E2; E2 = D2; D2 = _rol(C2,10); C2 = B2; B2 = T; }
    for ( ; j < 48; ++j ) {
        T = _rol( A1 + _f2(B1,C1,D1) + X[_r1[j]] + _k1[j], _s1[j] ) + E1;
        A1 = E1; E1 = D1; D1 = _rol(C1,10); C1 = B1; B1 = T;
        T = _rol( A2 + _f2(B2,C2,D2) + X[_r2[j]] + _k2[j], _s2[j] ) + E2;
        A2 = E2; E2 = D2; D2 = _rol(C2,10); C2 = B2; B2 = T; }
    for ( ; j < 64; ++j ) {
        T = _rol( A1 + _f3(B1,C1,D1) + X[_r1[j]] + _k1[j], _s1[j] ) + E1;
        A1 = E1; E1 = D1; D1 = _rol(C1,10); C1 = B1; B1 = T;
        T = _rol( A2 + _f1(B2,C2,D2) + X[_r2[j]] + _k2[j], _s2[j] ) + E2;
        A2 = E2; E2 = D2; D2 = _rol(C2,10); C2 = B2; B2 = T; }
    for ( ; j < 80; ++j ) {
        T = _rol( A1 + _f4(B1,C1,D1) + X[_r1[j]] + _k1[j], _s1[j] ) + E1;
        A1 = E1; E1 = D1; D1 = _rol(C1,10); C1 = B1; B1 = T;
        T = _rol( A2 + _f0(B2,C2,D2) + X[_r2[j]] + _k2[j], _s2[j] ) + E2;
        A2 = E2; E2 = D2; D2 = _rol(C2,10); C2 = B2; B2 = T; }

    T = this._h[1] + C1 + D2;
    this._h[1] = this._h[2] + D1 + E2;
    this._h[2] = this._h[3] + E1 + A2;
    this._h[3] = this._h[4] + A1 + B2;
    this._h[4] = this._h[0] + B1 + C2;
    this._h[0] = T;
}

// ----- for secp256k1 ------

// Overwrite NIST-P256 with secp256k1
sjcl.ecc.curves.c256 = new sjcl.ecc.curve(
    sjcl.bn.pseudoMersennePrime(256, [[0,-1],[4,-1],[6,-1],[7,-1],[8,-1],[9,-1],[32,-1]]),
    "0x14551231950b75fc4402da1722fc9baee",
    0,
    7,
    "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
    "0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
);

// Replace point addition and doubling algorithms
// NIST-P256 is a=-3, we need algorithms for a=0
sjcl.ecc.pointJac.prototype.add = function(T) {
  var S = this;
  if (S.curve !== T.curve) {
    throw("sjcl.ecc.add(): Points must be on the same curve to add them!");
  }

  if (S.isIdentity) {
    return T.toJac();
  } else if (T.isIdentity) {
    return S;
  }

  var z1z1 = S.z.square();
  var h = T.x.mul(z1z1).subM(S.x);
  var s2 = T.y.mul(S.z).mul(z1z1);

  if (h.equals(0)) {
    if (S.y.equals(T.y.mul(z1z1.mul(S.z)))) {
      // same point
      return S.doubl();
    } else {
      // inverses
      return new sjcl.ecc.pointJac(S.curve);
    }
  }

  var hh = h.square();
  var i = hh.copy().doubleM().doubleM();
  var j = h.mul(i);
  var r = s2.sub(S.y).doubleM();
  var v = S.x.mul(i);

  var x = r.square().subM(j).subM(v.copy().doubleM());
  var y = r.mul(v.sub(x)).subM(S.y.mul(j).doubleM());
  var z = S.z.add(h).square().subM(z1z1).subM(hh);

  return new sjcl.ecc.pointJac(this.curve,x,y,z);
};

sjcl.ecc.pointJac.prototype.doubl = function () {
  if (this.isIdentity) { return this; }

  var a = this.x.square();
  var b = this.y.square();
  var c = b.square();
  var d = this.x.add(b).square().subM(a).subM(c).doubleM();
  var e = a.mul(3);
  var f = e.square();
  var x = f.sub(d.copy().doubleM());
  var y = e.mul(d.sub(x)).subM(c.doubleM().doubleM().doubleM());
  var z = this.z.mul(this.y).doubleM();
  return new sjcl.ecc.pointJac(this.curve, x, y, z);
};

sjcl.ecc.point.prototype.toBytesCompressed = function () {
  var header = this.y.mod(2).toString() == "0x0" ? 0x02 : 0x03;
  return [header].concat(sjcl.codec.bytes.fromBits(this.x.toBits()))
};

sjcl.ecc.ecdsa.secretKey.prototype.sign = function(hash, paranoia, k_for_testing) {
  var R = this._curve.r,
      l = R.bitLength();

  // k_for_testing should ONLY BE SPECIFIED FOR TESTING
  // specifying it will make the signature INSECURE
  var k;
  if (typeof k_for_testing === 'object' && k_for_testing.length > 0 && typeof k_for_testing[0] === 'number') {
    k = k_for_testing;
  } else if (typeof k_for_testing === 'string' && /^[0-9a-fA-F]+$/.test(k_for_testing)) {
    k = sjcl.bn.fromBits(sjcl.codec.hex.toBits(k_for_testing));
  } else {
    // This is the only option that should be used in production
    k = sjcl.bn.random(R.sub(1), paranoia).add(1);
  }

  var r = this._curve.G.mult(k).x.mod(R);
  var s = sjcl.bn.fromBits(hash).add(r.mul(this._exponent)).mul(k.inverseMod(R)).mod(R);

  return sjcl.bitArray.concat(r.toBits(l), s.toBits(l));
};

sjcl.ecc.ecdsa.publicKey.prototype.verify = function(hash, rs) {
  var w = sjcl.bitArray,
      R = this._curve.r,
      l = R.bitLength(),
      r = sjcl.bn.fromBits(w.bitSlice(rs,0,l)),
      s = sjcl.bn.fromBits(w.bitSlice(rs,l,2*l)),
      sInv = s.inverseMod(R),
      hG = sjcl.bn.fromBits(hash).mul(sInv).mod(R),
      hA = r.mul(sInv).mod(R),
      r2 = this._curve.G.mult2(hG, hA, this._point).x;

  if (r.equals(0) || s.equals(0) || r.greaterEquals(R) || s.greaterEquals(R) || !r2.equals(r)) {
    throw (new sjcl.exception.corrupt("signature didn't check out"));
  }
  return true;
};
