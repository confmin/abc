let protobuf = null;
(function (undefined) {
	"use strict";
	(function prelude(modules, cache, entries) {
		function $require(name) {
			var $module = cache[name];
			if (!$module)
				modules[name][0].call(
					($module = cache[name] = { exports: {} }),
					$require,
					$module,
					$module.exports
				);
			return $module.exports;
		}
		protobuf = $require(entries[0]);
		protobuf.util.global.protobuf = protobuf;
		if (typeof define === "function" && define.amd)
			define(["long"], function (Long) {
				if (Long && Long.isLong) {
					protobuf.util.Long = Long;
					protobuf.configure();
				}
				return protobuf;
			});
		if (typeof module === "object" && module && module.exports)
			module.exports = protobuf;
	})(
		{
			1: [
				function (require, module, exports) {
					"use strict";
					module.exports = asPromise;
					function asPromise(fn, ctx) {
						var params = new Array(arguments.length - 1),
							offset = 0,
							index = 2,
							pending = true;
						while (index < arguments.length)
							params[offset++] = arguments[index++];
						return new Promise(function executor(resolve, reject) {
							params[offset] = function callback(err) {
								if (pending) {
									pending = false;
									if (err) reject(err);
									else {
										var params = new Array(
												arguments.length - 1
											),
											offset = 0;
										while (offset < params.length)
											params[offset++] =
												arguments[offset];
										resolve.apply(null, params);
									}
								}
							};
							try {
								fn.apply(ctx || null, params);
							} catch (err) {
								if (pending) {
									pending = false;
									reject(err);
								}
							}
						});
					}
				},
				{},
			],
			2: [
				function (require, module, exports) {
					"use strict";
					var base64 = exports;
					base64.length = function length(string) {
						var p = string.length;
						if (!p) return 0;
						var n = 0;
						while (--p % 4 > 1 && string.charAt(p) === "=") ++n;
						return Math.ceil(string.length * 3) / 4 - n;
					};
					var b64 = new Array(64);
					var s64 = new Array(123);
					for (var i = 0; i < 64; )
						s64[
							(b64[i] =
								i < 26
									? i + 65
									: i < 52
									? i + 71
									: i < 62
									? i - 4
									: (i - 59) | 43)
						] = i++;
					base64.encode = function encode(buffer, start, end) {
						var parts = null,
							chunk = [];
						var i = 0,
							j = 0,
							t;
						while (start < end) {
							var b = buffer[start++];
							switch (j) {
								case 0:
									chunk[i++] = b64[b >> 2];
									t = (b & 3) << 4;
									j = 1;
									break;
								case 1:
									chunk[i++] = b64[t | (b >> 4)];
									t = (b & 15) << 2;
									j = 2;
									break;
								case 2:
									chunk[i++] = b64[t | (b >> 6)];
									chunk[i++] = b64[b & 63];
									j = 0;
									break;
							}
							if (i > 8191) {
								(parts || (parts = [])).push(
									String.fromCharCode.apply(String, chunk)
								);
								i = 0;
							}
						}
						if (j) {
							chunk[i++] = b64[t];
							chunk[i++] = 61;
							if (j === 1) chunk[i++] = 61;
						}
						if (parts) {
							if (i)
								parts.push(
									String.fromCharCode.apply(
										String,
										chunk.slice(0, i)
									)
								);
							return parts.join("");
						}
						return String.fromCharCode.apply(
							String,
							chunk.slice(0, i)
						);
					};
					var invalidEncoding = "invalid encoding";
					base64.decode = function decode(string, buffer, offset) {
						var start = offset;
						var j = 0,
							t;
						for (var i = 0; i < string.length; ) {
							var c = string.charCodeAt(i++);
							if (c === 61 && j > 1) break;
							if ((c = s64[c]) === undefined)
								throw Error(invalidEncoding);
							switch (j) {
								case 0:
									t = c;
									j = 1;
									break;
								case 1:
									buffer[offset++] =
										(t << 2) | ((c & 48) >> 4);
									t = c;
									j = 2;
									break;
								case 2:
									buffer[offset++] =
										((t & 15) << 4) | ((c & 60) >> 2);
									t = c;
									j = 3;
									break;
								case 3:
									buffer[offset++] = ((t & 3) << 6) | c;
									j = 0;
									break;
							}
						}
						if (j === 1) throw Error(invalidEncoding);
						return offset - start;
					};
					base64.test = function test(string) {
						return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
							string
						);
					};
				},
				{},
			],
			3: [
				function (require, module, exports) {
					"use strict";
					module.exports = codegen;
					function codegen(functionParams, functionName) {
						if (typeof functionParams === "string") {
							functionName = functionParams;
							functionParams = undefined;
						}
						var body = [];
						function Codegen(formatStringOrScope) {
							if (typeof formatStringOrScope !== "string") {
								var source = toString();
								if (codegen.verbose)
									console.log("codegen: " + source);
								source = "return " + source;
								if (formatStringOrScope) {
									var scopeKeys =
											Object.keys(formatStringOrScope),
										scopeParams = new Array(
											scopeKeys.length + 1
										),
										scopeValues = new Array(
											scopeKeys.length
										),
										scopeOffset = 0;
									while (scopeOffset < scopeKeys.length) {
										scopeParams[scopeOffset] =
											scopeKeys[scopeOffset];
										scopeValues[scopeOffset] =
											formatStringOrScope[
												scopeKeys[scopeOffset++]
											];
									}
									scopeParams[scopeOffset] = source;
									return Function.apply(
										null,
										scopeParams
									).apply(null, scopeValues);
								}
								return Function(source)();
							}
							var formatParams = new Array(arguments.length - 1),
								formatOffset = 0;
							while (formatOffset < formatParams.length)
								formatParams[formatOffset] =
									arguments[++formatOffset];
							formatOffset = 0;
							formatStringOrScope = formatStringOrScope.replace(
								/%([%dfijs])/g,
								function replace($0, $1) {
									var value = formatParams[formatOffset++];
									switch ($1) {
										case "d":
										case "f":
											return String(Number(value));
										case "i":
											return String(Math.floor(value));
										case "j":
											return JSON.stringify(value);
										case "s":
											return String(value);
									}
									return "%";
								}
							);
							if (formatOffset !== formatParams.length)
								throw Error("parameter count mismatch");
							body.push(formatStringOrScope);
							return Codegen;
						}
						function toString(functionNameOverride) {
							return (
								"function " +
								(functionNameOverride || functionName || "") +
								"(" +
								((functionParams && functionParams.join(",")) ||
									"") +
								"){\n  " +
								body.join("\n  ") +
								"\n}"
							);
						}
						Codegen.toString = toString;
						return Codegen;
					}
					codegen.verbose = false;
				},
				{},
			],
			4: [
				function (require, module, exports) {
					"use strict";
					module.exports = EventEmitter;
					function EventEmitter() {
						this._listeners = {};
					}
					EventEmitter.prototype.on = function on(evt, fn, ctx) {
						(
							this._listeners[evt] || (this._listeners[evt] = [])
						).push({ fn: fn, ctx: ctx || this });
						return this;
					};
					EventEmitter.prototype.off = function off(evt, fn) {
						if (evt === undefined) this._listeners = {};
						else {
							if (fn === undefined) this._listeners[evt] = [];
							else {
								var listeners = this._listeners[evt];
								for (var i = 0; i < listeners.length; )
									if (listeners[i].fn === fn)
										listeners.splice(i, 1);
									else ++i;
							}
						}
						return this;
					};
					EventEmitter.prototype.emit = function emit(evt) {
						var listeners = this._listeners[evt];
						if (listeners) {
							var args = [],
								i = 1;
							for (; i < arguments.length; )
								args.push(arguments[i++]);
							for (i = 0; i < listeners.length; )
								listeners[i].fn.apply(listeners[i++].ctx, args);
						}
						return this;
					};
				},
				{},
			],
			5: [
				function (require, module, exports) {
					"use strict";
					module.exports = fetch;
					var asPromise = require(1),
						inquire = require(7);
					var fs = inquire("fs");
					function fetch(filename, options, callback) {
						if (typeof options === "function") {
							callback = options;
							options = {};
						} else if (!options) options = {};
						if (!callback)
							return asPromise(fetch, this, filename, options);
						if (!options.xhr && fs && fs.readFile)
							return fs.readFile(
								filename,
								function fetchReadFileCallback(err, contents) {
									return err &&
										typeof XMLHttpRequest !== "undefined"
										? fetch.xhr(filename, options, callback)
										: err
										? callback(err)
										: callback(
												null,
												options.binary
													? contents
													: contents.toString("utf8")
										  );
								}
							);
						return fetch.xhr(filename, options, callback);
					}
					fetch.xhr = function fetch_xhr(
						filename,
						options,
						callback
					) {
						var xhr = new XMLHttpRequest();
						xhr.onreadystatechange =
							function fetchOnReadyStateChange() {
								if (xhr.readyState !== 4) return undefined;
								if (xhr.status !== 0 && xhr.status !== 200)
									return callback(
										Error("status " + xhr.status)
									);
								if (options.binary) {
									var buffer = xhr.response;
									if (!buffer) {
										buffer = [];
										for (
											var i = 0;
											i < xhr.responseText.length;
											++i
										)
											buffer.push(
												xhr.responseText.charCodeAt(i) &
													255
											);
									}
									return callback(
										null,
										typeof Uint8Array !== "undefined"
											? new Uint8Array(buffer)
											: buffer
									);
								}
								return callback(null, xhr.responseText);
							};
						if (options.binary) {
							if ("overrideMimeType" in xhr)
								xhr.overrideMimeType(
									"text/plain; charset=x-user-defined"
								);
							xhr.responseType = "arraybuffer";
						}
						xhr.open("GET", filename);
						xhr.send();
					};
				},
				{ 1: 1, 7: 7 },
			],
			6: [
				function (require, module, exports) {
					"use strict";
					module.exports = factory(factory);
					function factory(exports) {
						if (typeof Float32Array !== "undefined")
							(function () {
								var f32 = new Float32Array([-0]),
									f8b = new Uint8Array(f32.buffer),
									le = f8b[3] === 128;
								function writeFloat_f32_cpy(val, buf, pos) {
									f32[0] = val;
									buf[pos] = f8b[0];
									buf[pos + 1] = f8b[1];
									buf[pos + 2] = f8b[2];
									buf[pos + 3] = f8b[3];
								}
								function writeFloat_f32_rev(val, buf, pos) {
									f32[0] = val;
									buf[pos] = f8b[3];
									buf[pos + 1] = f8b[2];
									buf[pos + 2] = f8b[1];
									buf[pos + 3] = f8b[0];
								}
								exports.writeFloatLE = le
									? writeFloat_f32_cpy
									: writeFloat_f32_rev;
								exports.writeFloatBE = le
									? writeFloat_f32_rev
									: writeFloat_f32_cpy;
								function readFloat_f32_cpy(buf, pos) {
									f8b[0] = buf[pos];
									f8b[1] = buf[pos + 1];
									f8b[2] = buf[pos + 2];
									f8b[3] = buf[pos + 3];
									return f32[0];
								}
								function readFloat_f32_rev(buf, pos) {
									f8b[3] = buf[pos];
									f8b[2] = buf[pos + 1];
									f8b[1] = buf[pos + 2];
									f8b[0] = buf[pos + 3];
									return f32[0];
								}
								exports.readFloatLE = le
									? readFloat_f32_cpy
									: readFloat_f32_rev;
								exports.readFloatBE = le
									? readFloat_f32_rev
									: readFloat_f32_cpy;
							})();
						else
							(function () {
								function writeFloat_ieee754(
									writeUint,
									val,
									buf,
									pos
								) {
									var sign = val < 0 ? 1 : 0;
									if (sign) val = -val;
									if (val === 0)
										writeUint(
											1 / val > 0 ? 0 : 2147483648,
											buf,
											pos
										);
									else if (isNaN(val))
										writeUint(2143289344, buf, pos);
									else if (val > 3.4028234663852886e38)
										writeUint(
											((sign << 31) | 2139095040) >>> 0,
											buf,
											pos
										);
									else if (val < 1.1754943508222875e-38)
										writeUint(
											((sign << 31) |
												Math.round(
													val / 1.401298464324817e-45
												)) >>>
												0,
											buf,
											pos
										);
									else {
										var exponent = Math.floor(
												Math.log(val) / Math.LN2
											),
											mantissa =
												Math.round(
													val *
														Math.pow(2, -exponent) *
														8388608
												) & 8388607;
										writeUint(
											((sign << 31) |
												((exponent + 127) << 23) |
												mantissa) >>>
												0,
											buf,
											pos
										);
									}
								}
								exports.writeFloatLE = writeFloat_ieee754.bind(
									null,
									writeUintLE
								);
								exports.writeFloatBE = writeFloat_ieee754.bind(
									null,
									writeUintBE
								);
								function readFloat_ieee754(readUint, buf, pos) {
									var uint = readUint(buf, pos),
										sign = (uint >> 31) * 2 + 1,
										exponent = (uint >>> 23) & 255,
										mantissa = uint & 8388607;
									return exponent === 255
										? mantissa
											? NaN
											: sign * Infinity
										: exponent === 0
										? sign *
										  1.401298464324817e-45 *
										  mantissa
										: sign *
										  Math.pow(2, exponent - 150) *
										  (mantissa + 8388608);
								}
								exports.readFloatLE = readFloat_ieee754.bind(
									null,
									readUintLE
								);
								exports.readFloatBE = readFloat_ieee754.bind(
									null,
									readUintBE
								);
							})();
						if (typeof Float64Array !== "undefined")
							(function () {
								var f64 = new Float64Array([-0]),
									f8b = new Uint8Array(f64.buffer),
									le = f8b[7] === 128;
								function writeDouble_f64_cpy(val, buf, pos) {
									f64[0] = val;
									buf[pos] = f8b[0];
									buf[pos + 1] = f8b[1];
									buf[pos + 2] = f8b[2];
									buf[pos + 3] = f8b[3];
									buf[pos + 4] = f8b[4];
									buf[pos + 5] = f8b[5];
									buf[pos + 6] = f8b[6];
									buf[pos + 7] = f8b[7];
								}
								function writeDouble_f64_rev(val, buf, pos) {
									f64[0] = val;
									buf[pos] = f8b[7];
									buf[pos + 1] = f8b[6];
									buf[pos + 2] = f8b[5];
									buf[pos + 3] = f8b[4];
									buf[pos + 4] = f8b[3];
									buf[pos + 5] = f8b[2];
									buf[pos + 6] = f8b[1];
									buf[pos + 7] = f8b[0];
								}
								exports.writeDoubleLE = le
									? writeDouble_f64_cpy
									: writeDouble_f64_rev;
								exports.writeDoubleBE = le
									? writeDouble_f64_rev
									: writeDouble_f64_cpy;
								function readDouble_f64_cpy(buf, pos) {
									f8b[0] = buf[pos];
									f8b[1] = buf[pos + 1];
									f8b[2] = buf[pos + 2];
									f8b[3] = buf[pos + 3];
									f8b[4] = buf[pos + 4];
									f8b[5] = buf[pos + 5];
									f8b[6] = buf[pos + 6];
									f8b[7] = buf[pos + 7];
									return f64[0];
								}
								function readDouble_f64_rev(buf, pos) {
									f8b[7] = buf[pos];
									f8b[6] = buf[pos + 1];
									f8b[5] = buf[pos + 2];
									f8b[4] = buf[pos + 3];
									f8b[3] = buf[pos + 4];
									f8b[2] = buf[pos + 5];
									f8b[1] = buf[pos + 6];
									f8b[0] = buf[pos + 7];
									return f64[0];
								}
								exports.readDoubleLE = le
									? readDouble_f64_cpy
									: readDouble_f64_rev;
								exports.readDoubleBE = le
									? readDouble_f64_rev
									: readDouble_f64_cpy;
							})();
						else
							(function () {
								function writeDouble_ieee754(
									writeUint,
									off0,
									off1,
									val,
									buf,
									pos
								) {
									var sign = val < 0 ? 1 : 0;
									if (sign) val = -val;
									if (val === 0) {
										writeUint(0, buf, pos + off0);
										writeUint(
											1 / val > 0 ? 0 : 2147483648,
											buf,
											pos + off1
										);
									} else if (isNaN(val)) {
										writeUint(0, buf, pos + off0);
										writeUint(2146959360, buf, pos + off1);
									} else if (val > 1.7976931348623157e308) {
										writeUint(0, buf, pos + off0);
										writeUint(
											((sign << 31) | 2146435072) >>> 0,
											buf,
											pos + off1
										);
									} else {
										var mantissa;
										if (val < 2.2250738585072014e-308) {
											mantissa = val / 5e-324;
											writeUint(
												mantissa >>> 0,
												buf,
												pos + off0
											);
											writeUint(
												((sign << 31) |
													(mantissa / 4294967296)) >>>
													0,
												buf,
												pos + off1
											);
										} else {
											var exponent = Math.floor(
												Math.log(val) / Math.LN2
											);
											if (exponent === 1024)
												exponent = 1023;
											mantissa =
												val * Math.pow(2, -exponent);
											writeUint(
												(mantissa *
													4503599627370496) >>>
													0,
												buf,
												pos + off0
											);
											writeUint(
												((sign << 31) |
													((exponent + 1023) << 20) |
													((mantissa * 1048576) &
														1048575)) >>>
													0,
												buf,
												pos + off1
											);
										}
									}
								}
								exports.writeDoubleLE =
									writeDouble_ieee754.bind(
										null,
										writeUintLE,
										0,
										4
									);
								exports.writeDoubleBE =
									writeDouble_ieee754.bind(
										null,
										writeUintBE,
										4,
										0
									);
								function readDouble_ieee754(
									readUint,
									off0,
									off1,
									buf,
									pos
								) {
									var lo = readUint(buf, pos + off0),
										hi = readUint(buf, pos + off1);
									var sign = (hi >> 31) * 2 + 1,
										exponent = (hi >>> 20) & 2047,
										mantissa =
											4294967296 * (hi & 1048575) + lo;
									return exponent === 2047
										? mantissa
											? NaN
											: sign * Infinity
										: exponent === 0
										? sign * 5e-324 * mantissa
										: sign *
										  Math.pow(2, exponent - 1075) *
										  (mantissa + 4503599627370496);
								}
								exports.readDoubleLE = readDouble_ieee754.bind(
									null,
									readUintLE,
									0,
									4
								);
								exports.readDoubleBE = readDouble_ieee754.bind(
									null,
									readUintBE,
									4,
									0
								);
							})();
						return exports;
					}
					function writeUintLE(val, buf, pos) {
						buf[pos] = val & 255;
						buf[pos + 1] = (val >>> 8) & 255;
						buf[pos + 2] = (val >>> 16) & 255;
						buf[pos + 3] = val >>> 24;
					}
					function writeUintBE(val, buf, pos) {
						buf[pos] = val >>> 24;
						buf[pos + 1] = (val >>> 16) & 255;
						buf[pos + 2] = (val >>> 8) & 255;
						buf[pos + 3] = val & 255;
					}
					function readUintLE(buf, pos) {
						return (
							(buf[pos] |
								(buf[pos + 1] << 8) |
								(buf[pos + 2] << 16) |
								(buf[pos + 3] << 24)) >>>
							0
						);
					}
					function readUintBE(buf, pos) {
						return (
							((buf[pos] << 24) |
								(buf[pos + 1] << 16) |
								(buf[pos + 2] << 8) |
								buf[pos + 3]) >>>
							0
						);
					}
				},
				{},
			],
			7: [
				function (require, module, exports) {
					"use strict";
					module.exports = inquire;
					function inquire(moduleName) {
						try {
							var mod = eval("quire".replace(/^/, "re"))(
								moduleName
							);
							if (mod && (mod.length || Object.keys(mod).length))
								return mod;
						} catch (e) {}
						return null;
					}
				},
				{},
			],
			8: [
				function (require, module, exports) {
					"use strict";
					var path = exports;
					var isAbsolute = (path.isAbsolute = function isAbsolute(
						path
					) {
						return /^(?:\/|\w+:)/.test(path);
					});
					var normalize = (path.normalize = function normalize(path) {
						path = path.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
						var parts = path.split("/"),
							absolute = isAbsolute(path),
							prefix = "";
						if (absolute) prefix = parts.shift() + "/";
						for (var i = 0; i < parts.length; ) {
							if (parts[i] === "..") {
								if (i > 0 && parts[i - 1] !== "..")
									parts.splice(--i, 2);
								else if (absolute) parts.splice(i, 1);
								else ++i;
							} else if (parts[i] === ".") parts.splice(i, 1);
							else ++i;
						}
						return prefix + parts.join("/");
					});
					path.resolve = function resolve(
						originPath,
						includePath,
						alreadyNormalized
					) {
						if (!alreadyNormalized)
							includePath = normalize(includePath);
						if (isAbsolute(includePath)) return includePath;
						if (!alreadyNormalized)
							originPath = normalize(originPath);
						return (originPath = originPath.replace(
							/(?:\/|^)[^/]+$/,
							""
						)).length
							? normalize(originPath + "/" + includePath)
							: includePath;
					};
				},
				{},
			],
			9: [
				function (require, module, exports) {
					"use strict";
					module.exports = pool;
					function pool(alloc, slice, size) {
						var SIZE = size || 8192;
						var MAX = SIZE >>> 1;
						var slab = null;
						var offset = SIZE;
						return function pool_alloc(size) {
							if (size < 1 || size > MAX) return alloc(size);
							if (offset + size > SIZE) {
								slab = alloc(SIZE);
								offset = 0;
							}
							var buf = slice.call(
								slab,
								offset,
								(offset += size)
							);
							if (offset & 7) offset = (offset | 7) + 1;
							return buf;
						};
					}
				},
				{},
			],
			10: [
				function (require, module, exports) {
					"use strict";
					var utf8 = exports;
					utf8.length = function utf8_length(string) {
						var len = 0,
							c = 0;
						for (var i = 0; i < string.length; ++i) {
							c = string.charCodeAt(i);
							if (c < 128) len += 1;
							else if (c < 2048) len += 2;
							else if (
								(c & 0xfc00) === 0xd800 &&
								(string.charCodeAt(i + 1) & 0xfc00) === 0xdc00
							) {
								++i;
								len += 4;
							} else len += 3;
						}
						return len;
					};
					utf8.read = function utf8_read(buffer, start, end) {
						var len = end - start;
						if (len < 1) return "";
						var parts = null,
							chunk = [],
							i = 0,
							t;
						while (start < end) {
							t = buffer[start++];
							if (t < 128) chunk[i++] = t;
							else if (t > 191 && t < 224)
								chunk[i++] =
									((t & 31) << 6) | (buffer[start++] & 63);
							else if (t > 239 && t < 365) {
								t =
									(((t & 7) << 18) |
										((buffer[start++] & 63) << 12) |
										((buffer[start++] & 63) << 6) |
										(buffer[start++] & 63)) -
									0x10000;
								chunk[i++] = 0xd800 + (t >> 10);
								chunk[i++] = 0xdc00 + (t & 1023);
							} else
								chunk[i++] =
									((t & 15) << 12) |
									((buffer[start++] & 63) << 6) |
									(buffer[start++] & 63);
							if (i > 8191) {
								(parts || (parts = [])).push(
									String.fromCharCode.apply(String, chunk)
								);
								i = 0;
							}
						}
						if (parts) {
							if (i)
								parts.push(
									String.fromCharCode.apply(
										String,
										chunk.slice(0, i)
									)
								);
							return parts.join("");
						}
						return String.fromCharCode.apply(
							String,
							chunk.slice(0, i)
						);
					};
					utf8.write = function utf8_write(string, buffer, offset) {
						var start = offset,
							c1,
							c2;
						for (var i = 0; i < string.length; ++i) {
							c1 = string.charCodeAt(i);
							if (c1 < 128) {
								buffer[offset++] = c1;
							} else if (c1 < 2048) {
								buffer[offset++] = (c1 >> 6) | 192;
								buffer[offset++] = (c1 & 63) | 128;
							} else if (
								(c1 & 0xfc00) === 0xd800 &&
								((c2 = string.charCodeAt(i + 1)) & 0xfc00) ===
									0xdc00
							) {
								c1 =
									0x10000 +
									((c1 & 0x03ff) << 10) +
									(c2 & 0x03ff);
								++i;
								buffer[offset++] = (c1 >> 18) | 240;
								buffer[offset++] = ((c1 >> 12) & 63) | 128;
								buffer[offset++] = ((c1 >> 6) & 63) | 128;
								buffer[offset++] = (c1 & 63) | 128;
							} else {
								buffer[offset++] = (c1 >> 12) | 224;
								buffer[offset++] = ((c1 >> 6) & 63) | 128;
								buffer[offset++] = (c1 & 63) | 128;
							}
						}
						return offset - start;
					};
				},
				{},
			],
			11: [
				function (require, module, exports) {
					"use strict";
					var converter = exports;
					var Enum = require(14),
						util = require(33);
					function genValuePartial_fromObject(
						gen,
						field,
						fieldIndex,
						prop
					) {
						if (field.resolvedType) {
							if (field.resolvedType instanceof Enum) {
								gen("switch(d%s){", prop);
								for (
									var values = field.resolvedType.values,
										keys = Object.keys(values),
										i = 0;
									i < keys.length;
									++i
								) {
									if (
										field.repeated &&
										values[keys[i]] === field.typeDefault
									)
										gen("default:");
									gen("case%j:", keys[i])(
										"case %i:",
										values[keys[i]]
									)(
										"m%s=%j",
										prop,
										values[keys[i]]
									)("break");
								}
								gen("}");
							} else
								gen('if(typeof d%s!=="object")', prop)(
									"throw TypeError(%j)",
									field.fullName + ": object expected"
								)(
									"m%s=types[%i].fromObject(d%s)",
									prop,
									fieldIndex,
									prop
								);
						} else {
							var isUnsigned = false;
							switch (field.type) {
								case "double":
								case "float":
									gen("m%s=Number(d%s)", prop, prop);
									break;
								case "uint32":
								case "fixed32":
									gen("m%s=d%s>>>0", prop, prop);
									break;
								case "int32":
								case "sint32":
								case "sfixed32":
									gen("m%s=d%s|0", prop, prop);
									break;
								case "uint64":
									isUnsigned = true;
								case "int64":
								case "sint64":
								case "fixed64":
								case "sfixed64":
									gen("if(util.Long)")(
										"(m%s=util.Long.fromValue(d%s)).unsigned=%j",
										prop,
										prop,
										isUnsigned
									)('else if(typeof d%s==="string")', prop)(
										"m%s=parseInt(d%s,10)",
										prop,
										prop
									)('else if(typeof d%s==="number")', prop)(
										"m%s=d%s",
										prop,
										prop
									)('else if(typeof d%s==="object")', prop)(
										"m%s=new util.LongBits(d%s.low>>>0,d%s.high>>>0).toNumber(%s)",
										prop,
										prop,
										prop,
										isUnsigned ? "true" : ""
									);
									break;
								case "bytes":
									gen('if(typeof d%s==="string")', prop)(
										"util.base64.decode(d%s,m%s=util.newBuffer(util.base64.length(d%s)),0)",
										prop,
										prop,
										prop
									)("else if(d%s.length)", prop)(
										"m%s=d%s",
										prop,
										prop
									);
									break;
								case "string":
									gen("m%s=String(d%s)", prop, prop);
									break;
								case "bool":
									gen("m%s=Boolean(d%s)", prop, prop);
									break;
							}
						}
						return gen;
					}
					converter.fromObject = function fromObject(mtype) {
						var fields = mtype.fieldsArray;
						var gen = util.codegen(
							["d"],
							mtype.name + "$fromObject"
						)("if(d instanceof this.ctor)")("return d");
						if (!fields.length) return gen("return new this.ctor");
						gen("var m=new this.ctor");
						for (var i = 0; i < fields.length; ++i) {
							var field = fields[i].resolve(),
								prop = util.safeProp(field.name);
							if (field.map) {
								gen("if(d%s){", prop)(
									'if(typeof d%s!=="object")',
									prop
								)(
									"throw TypeError(%j)",
									field.fullName + ": object expected"
								)("m%s={}", prop)(
									"for(var ks=Object.keys(d%s),i=0;i<ks.length;++i){",
									prop
								);
								genValuePartial_fromObject(
									gen,
									field,
									i,
									prop + "[ks[i]]"
								)("}")("}");
							} else if (field.repeated) {
								gen("if(d%s){", prop)(
									"if(!Array.isArray(d%s))",
									prop
								)(
									"throw TypeError(%j)",
									field.fullName + ": array expected"
								)("m%s=[]", prop)(
									"for(var i=0;i<d%s.length;++i){",
									prop
								);
								genValuePartial_fromObject(
									gen,
									field,
									i,
									prop + "[i]"
								)("}")("}");
							} else {
								if (!(field.resolvedType instanceof Enum))
									gen("if(d%s!=null){", prop);
								genValuePartial_fromObject(gen, field, i, prop);
								if (!(field.resolvedType instanceof Enum))
									gen("}");
							}
						}
						return gen("return m");
					};
					function genValuePartial_toObject(
						gen,
						field,
						fieldIndex,
						prop
					) {
						if (field.resolvedType) {
							if (field.resolvedType instanceof Enum)
								gen(
									"d%s=o.enums===String?types[%i].values[m%s]:m%s",
									prop,
									fieldIndex,
									prop,
									prop
								);
							else
								gen(
									"d%s=types[%i].toObject(m%s,o)",
									prop,
									fieldIndex,
									prop
								);
						} else {
							var isUnsigned = false;
							switch (field.type) {
								case "double":
								case "float":
									gen(
										"d%s=o.json&&!isFinite(m%s)?String(m%s):m%s",
										prop,
										prop,
										prop,
										prop
									);
									break;
								case "uint64":
									isUnsigned = true;
								case "int64":
								case "sint64":
								case "fixed64":
								case "sfixed64":
									gen('if(typeof m%s==="number")', prop)(
										"d%s=o.longs===String?String(m%s):m%s",
										prop,
										prop,
										prop
									)("else")(
										"d%s=o.longs===String?util.Long.prototype.toString.call(m%s):o.longs===Number?new util.LongBits(m%s.low>>>0,m%s.high>>>0).toNumber(%s):m%s",
										prop,
										prop,
										prop,
										prop,
										isUnsigned ? "true" : "",
										prop
									);
									break;
								case "bytes":
									gen(
										"d%s=o.bytes===String?util.base64.encode(m%s,0,m%s.length):o.bytes===Array?Array.prototype.slice.call(m%s):m%s",
										prop,
										prop,
										prop,
										prop,
										prop
									);
									break;
								default:
									gen("d%s=m%s", prop, prop);
									break;
							}
						}
						return gen;
					}
					converter.toObject = function toObject(mtype) {
						var fields = mtype.fieldsArray
							.slice()
							.sort(util.compareFieldsById);
						if (!fields.length) return util.codegen()("return {}");
						var gen = util.codegen(
							["m", "o"],
							mtype.name + "$toObject"
						)("if(!o)")("o={}")("var d={}");
						var repeatedFields = [],
							mapFields = [],
							normalFields = [],
							i = 0;
						for (; i < fields.length; ++i)
							if (!fields[i].partOf)
								(fields[i].resolve().repeated
									? repeatedFields
									: fields[i].map
									? mapFields
									: normalFields
								).push(fields[i]);
						if (repeatedFields.length) {
							gen("if(o.arrays||o.defaults){");
							for (i = 0; i < repeatedFields.length; ++i)
								gen(
									"d%s=[]",
									util.safeProp(repeatedFields[i].name)
								);
							gen("}");
						}
						if (mapFields.length) {
							gen("if(o.objects||o.defaults){");
							for (i = 0; i < mapFields.length; ++i)
								gen("d%s={}", util.safeProp(mapFields[i].name));
							gen("}");
						}
						if (normalFields.length) {
							gen("if(o.defaults){");
							for (i = 0; i < normalFields.length; ++i) {
								var field = normalFields[i],
									prop = util.safeProp(field.name);
								if (field.resolvedType instanceof Enum)
									gen(
										"d%s=o.enums===String?%j:%j",
										prop,
										field.resolvedType.valuesById[
											field.typeDefault
										],
										field.typeDefault
									);
								else if (field.long)
									gen("if(util.Long){")(
										"var n=new util.Long(%i,%i,%j)",
										field.typeDefault.low,
										field.typeDefault.high,
										field.typeDefault.unsigned
									)(
										"d%s=o.longs===String?n.toString():o.longs===Number?n.toNumber():n",
										prop
									)("}else")(
										"d%s=o.longs===String?%j:%i",
										prop,
										field.typeDefault.toString(),
										field.typeDefault.toNumber()
									);
								else if (field.bytes) {
									var arrayDefault =
										"[" +
										Array.prototype.slice
											.call(field.typeDefault)
											.join(",") +
										"]";
									gen(
										"if(o.bytes===String)d%s=%j",
										prop,
										String.fromCharCode.apply(
											String,
											field.typeDefault
										)
									)("else{")("d%s=%s", prop, arrayDefault)(
										"if(o.bytes!==Array)d%s=util.newBuffer(d%s)",
										prop,
										prop
									)("}");
								} else gen("d%s=%j", prop, field.typeDefault);
							}
							gen("}");
						}
						var hasKs2 = false;
						for (i = 0; i < fields.length; ++i) {
							var field = fields[i],
								index = mtype._fieldsArray.indexOf(field),
								prop = util.safeProp(field.name);
							if (field.map) {
								if (!hasKs2) {
									hasKs2 = true;
									gen("var ks2");
								}
								gen(
									"if(m%s&&(ks2=Object.keys(m%s)).length){",
									prop,
									prop
								)(
									"d%s={}",
									prop
								)("for(var j=0;j<ks2.length;++j){");
								genValuePartial_toObject(
									gen,
									field,
									index,
									prop + "[ks2[j]]"
								)("}");
							} else if (field.repeated) {
								gen(
									"if(m%s&&m%s.length){",
									prop,
									prop
								)("d%s=[]", prop)(
									"for(var j=0;j<m%s.length;++j){",
									prop
								);
								genValuePartial_toObject(
									gen,
									field,
									index,
									prop + "[j]"
								)("}");
							} else {
								gen(
									"if(m%s!=null&&m.hasOwnProperty(%j)){",
									prop,
									field.name
								);
								genValuePartial_toObject(
									gen,
									field,
									index,
									prop
								);
								if (field.partOf)
									gen("if(o.oneofs)")(
										"d%s=%j",
										util.safeProp(field.partOf.name),
										field.name
									);
							}
							gen("}");
						}
						return gen("return d");
					};
				},
				{ 14: 14, 33: 33 },
			],
			12: [
				function (require, module, exports) {
					"use strict";
					module.exports = decoder;
					var Enum = require(14),
						types = require(32),
						util = require(33);
					function missing(field) {
						return "missing required '" + field.name + "'";
					}
					function decoder(mtype) {
						var gen = util.codegen(
							["r", "l"],
							mtype.name + "$decode"
						)("if(!(r instanceof Reader))")("r=Reader.create(r)")(
							"var c=l===undefined?r.len:r.pos+l,m=new this.ctor" +
								(mtype.fieldsArray.filter(function (field) {
									return field.map;
								}).length
									? ",k,value"
									: "")
						)("while(r.pos<c){")("var t=r.uint32()");
						if (mtype.group) gen("if((t&7)===4)")("break");
						gen("switch(t>>>3){");
						var i = 0;
						for (; i < mtype.fieldsArray.length; ++i) {
							var field = mtype._fieldsArray[i].resolve(),
								type =
									field.resolvedType instanceof Enum
										? "int32"
										: field.type,
								ref = "m" + util.safeProp(field.name);
							gen("case %i:", field.id);
							if (field.map) {
								gen("if(%s===util.emptyObject)", ref)(
									"%s={}",
									ref
								)("var c2 = r.uint32()+r.pos");
								if (types.defaults[field.keyType] !== undefined)
									gen("k=%j", types.defaults[field.keyType]);
								else gen("k=null");
								if (types.defaults[type] !== undefined)
									gen("value=%j", types.defaults[type]);
								else gen("value=null");
								gen("while(r.pos<c2){")("var tag2=r.uint32()")(
									"switch(tag2>>>3){"
								)(
									"case 1: k=r.%s(); break",
									field.keyType
								)("case 2:");
								if (types.basic[type] === undefined)
									gen(
										"value=types[%i].decode(r,r.uint32())",
										i
									);
								else gen("value=r.%s()", type);
								gen("break")("default:")("r.skipType(tag2&7)")(
									"break"
								)("}")("}");
								if (types.long[field.keyType] !== undefined)
									gen(
										'%s[typeof k==="object"?util.longToHash(k):k]=value',
										ref
									);
								else gen("%s[k]=value", ref);
							} else if (field.repeated) {
								gen(
									"if(!(%s&&%s.length))",
									ref,
									ref
								)("%s=[]", ref);
								if (types.packed[type] !== undefined)
									gen("if((t&7)===2){")(
										"var c2=r.uint32()+r.pos"
									)("while(r.pos<c2)")(
										"%s.push(r.%s())",
										ref,
										type
									)("}else");
								if (types.basic[type] === undefined)
									gen(
										field.resolvedType.group
											? "%s.push(types[%i].decode(r))"
											: "%s.push(types[%i].decode(r,r.uint32()))",
										ref,
										i
									);
								else gen("%s.push(r.%s())", ref, type);
							} else if (types.basic[type] === undefined)
								gen(
									field.resolvedType.group
										? "%s=types[%i].decode(r)"
										: "%s=types[%i].decode(r,r.uint32())",
									ref,
									i
								);
							else gen("%s=r.%s()", ref, type);
							gen("break");
						}
						gen("default:")("r.skipType(t&7)")("break")("}")("}");
						for (i = 0; i < mtype._fieldsArray.length; ++i) {
							var rfield = mtype._fieldsArray[i];
							if (rfield.required)
								gen("if(!m.hasOwnProperty(%j))", rfield.name)(
									"throw util.ProtocolError(%j,{instance:m})",
									missing(rfield)
								);
						}
						return gen("return m");
					}
				},
				{ 14: 14, 32: 32, 33: 33 },
			],
			13: [
				function (require, module, exports) {
					"use strict";
					module.exports = encoder;
					var Enum = require(14),
						types = require(32),
						util = require(33);
					function genTypePartial(gen, field, fieldIndex, ref) {
						return field.resolvedType.group
							? gen(
									"types[%i].encode(%s,w.uint32(%i)).uint32(%i)",
									fieldIndex,
									ref,
									((field.id << 3) | 3) >>> 0,
									((field.id << 3) | 4) >>> 0
							  )
							: gen(
									"types[%i].encode(%s,w.uint32(%i).fork()).ldelim()",
									fieldIndex,
									ref,
									((field.id << 3) | 2) >>> 0
							  );
					}
					function encoder(mtype) {
						var gen = util.codegen(
							["m", "w"],
							mtype.name + "$encode"
						)("if(!w)")("w=Writer.create()");
						var i, ref;
						var fields = mtype.fieldsArray
							.slice()
							.sort(util.compareFieldsById);
						for (var i = 0; i < fields.length; ++i) {
							var field = fields[i].resolve(),
								index = mtype._fieldsArray.indexOf(field),
								type =
									field.resolvedType instanceof Enum
										? "int32"
										: field.type,
								wireType = types.basic[type];
							ref = "m" + util.safeProp(field.name);
							if (field.map) {
								gen(
									"if(%s!=null&&Object.hasOwnProperty.call(m,%j)){",
									ref,
									field.name
								)(
									"for(var ks=Object.keys(%s),i=0;i<ks.length;++i){",
									ref
								)(
									"w.uint32(%i).fork().uint32(%i).%s(ks[i])",
									((field.id << 3) | 2) >>> 0,
									8 | types.mapKey[field.keyType],
									field.keyType
								);
								if (wireType === undefined)
									gen(
										"types[%i].encode(%s[ks[i]],w.uint32(18).fork()).ldelim().ldelim()",
										index,
										ref
									);
								else
									gen(
										".uint32(%i).%s(%s[ks[i]]).ldelim()",
										16 | wireType,
										type,
										ref
									);
								gen("}")("}");
							} else if (field.repeated) {
								gen("if(%s!=null&&%s.length){", ref, ref);
								if (
									field.packed &&
									types.packed[type] !== undefined
								) {
									gen(
										"w.uint32(%i).fork()",
										((field.id << 3) | 2) >>> 0
									)("for(var i=0;i<%s.length;++i)", ref)(
										"w.%s(%s[i])",
										type,
										ref
									)("w.ldelim()");
								} else {
									gen("for(var i=0;i<%s.length;++i)", ref);
									if (wireType === undefined)
										genTypePartial(
											gen,
											field,
											index,
											ref + "[i]"
										);
									else
										gen(
											"w.uint32(%i).%s(%s[i])",
											((field.id << 3) | wireType) >>> 0,
											type,
											ref
										);
								}
								gen("}");
							} else {
								if (field.optional)
									gen(
										"if(%s!=null&&Object.hasOwnProperty.call(m,%j))",
										ref,
										field.name
									);
								if (wireType === undefined)
									genTypePartial(gen, field, index, ref);
								else
									gen(
										"w.uint32(%i).%s(%s)",
										((field.id << 3) | wireType) >>> 0,
										type,
										ref
									);
							}
						}
						return gen("return w");
					}
				},
				{ 14: 14, 32: 32, 33: 33 },
			],
			14: [
				function (require, module, exports) {
					"use strict";
					module.exports = Enum;
					var ReflectionObject = require(22);
					((Enum.prototype = Object.create(
						ReflectionObject.prototype
					)).constructor = Enum).className = "Enum";
					var Namespace = require(21),
						util = require(33);
					function Enum(name, values, options, comment, comments) {
						ReflectionObject.call(this, name, options);
						if (values && typeof values !== "object")
							throw TypeError("values must be an object");
						this.valuesById = {};
						this.values = Object.create(this.valuesById);
						this.comment = comment;
						this.comments = comments || {};
						this.reserved = undefined;
						if (values)
							for (
								var keys = Object.keys(values), i = 0;
								i < keys.length;
								++i
							)
								if (typeof values[keys[i]] === "number")
									this.valuesById[
										(this.values[keys[i]] = values[keys[i]])
									] = keys[i];
					}
					Enum.fromJSON = function fromJSON(name, json) {
						var enm = new Enum(
							name,
							json.values,
							json.options,
							json.comment,
							json.comments
						);
						enm.reserved = json.reserved;
						return enm;
					};
					Enum.prototype.toJSON = function toJSON(toJSONOptions) {
						var keepComments = toJSONOptions
							? Boolean(toJSONOptions.keepComments)
							: false;
						return util.toObject([
							"options",
							this.options,
							"values",
							this.values,
							"reserved",
							this.reserved && this.reserved.length
								? this.reserved
								: undefined,
							"comment",
							keepComments ? this.comment : undefined,
							"comments",
							keepComments ? this.comments : undefined,
						]);
					};
					Enum.prototype.add = function add(name, id, comment) {
						if (!util.isString(name))
							throw TypeError("name must be a string");
						if (!util.isInteger(id))
							throw TypeError("id must be an integer");
						if (this.values[name] !== undefined)
							throw Error(
								"duplicate name '" + name + "' in " + this
							);
						if (this.isReservedId(id))
							throw Error("id " + id + " is reserved in " + this);
						if (this.isReservedName(name))
							throw Error(
								"name '" + name + "' is reserved in " + this
							);
						if (this.valuesById[id] !== undefined) {
							if (!(this.options && this.options.allow_alias))
								throw Error(
									"duplicate id " + id + " in " + this
								);
							this.values[name] = id;
						} else this.valuesById[(this.values[name] = id)] = name;
						this.comments[name] = comment || null;
						return this;
					};
					Enum.prototype.remove = function remove(name) {
						if (!util.isString(name))
							throw TypeError("name must be a string");
						var val = this.values[name];
						if (val == null)
							throw Error(
								"name '" + name + "' does not exist in " + this
							);
						delete this.valuesById[val];
						delete this.values[name];
						delete this.comments[name];
						return this;
					};
					Enum.prototype.isReservedId = function isReservedId(id) {
						return Namespace.isReservedId(this.reserved, id);
					};
					Enum.prototype.isReservedName = function isReservedName(
						name
					) {
						return Namespace.isReservedName(this.reserved, name);
					};
				},
				{ 21: 21, 22: 22, 33: 33 },
			],
			15: [
				function (require, module, exports) {
					"use strict";
					module.exports = Field;
					var ReflectionObject = require(22);
					((Field.prototype = Object.create(
						ReflectionObject.prototype
					)).constructor = Field).className = "Field";
					var Enum = require(14),
						types = require(32),
						util = require(33);
					var Type;
					var ruleRe = /^required|optional|repeated$/;
					Field.fromJSON = function fromJSON(name, json) {
						return new Field(
							name,
							json.id,
							json.type,
							json.rule,
							json.extend,
							json.options,
							json.comment
						);
					};
					function Field(
						name,
						id,
						type,
						rule,
						extend,
						options,
						comment
					) {
						if (util.isObject(rule)) {
							comment = extend;
							options = rule;
							rule = extend = undefined;
						} else if (util.isObject(extend)) {
							comment = options;
							options = extend;
							extend = undefined;
						}
						ReflectionObject.call(this, name, options);
						if (!util.isInteger(id) || id < 0)
							throw TypeError(
								"id must be a non-negative integer"
							);
						if (!util.isString(type))
							throw TypeError("type must be a string");
						if (
							rule !== undefined &&
							!ruleRe.test((rule = rule.toString().toLowerCase()))
						)
							throw TypeError("rule must be a string rule");
						if (extend !== undefined && !util.isString(extend))
							throw TypeError("extend must be a string");
						if (rule === "proto3_optional") {
							rule = "optional";
						}
						this.rule =
							rule && rule !== "optional" ? rule : undefined;
						this.type = type;
						this.id = id;
						this.extend = extend || undefined;
						this.required = rule === "required";
						this.optional = !this.required;
						this.repeated = rule === "repeated";
						this.map = false;
						this.message = null;
						this.partOf = null;
						this.typeDefault = null;
						this.defaultValue = null;
						this.long = util.Long
							? types.long[type] !== undefined
							: false;
						this.bytes = type === "bytes";
						this.resolvedType = null;
						this.extensionField = null;
						this.declaringField = null;
						this._packed = null;
						this.comment = comment;
					}
					Object.defineProperty(Field.prototype, "packed", {
						get: function () {
							if (this._packed === null)
								this._packed =
									this.getOption("packed") !== false;
							return this._packed;
						},
					});
					Field.prototype.setOption = function setOption(
						name,
						value,
						ifNotSet
					) {
						if (name === "packed") this._packed = null;
						return ReflectionObject.prototype.setOption.call(
							this,
							name,
							value,
							ifNotSet
						);
					};
					Field.prototype.toJSON = function toJSON(toJSONOptions) {
						var keepComments = toJSONOptions
							? Boolean(toJSONOptions.keepComments)
							: false;
						return util.toObject([
							"rule",
							(this.rule !== "optional" && this.rule) ||
								undefined,
							"type",
							this.type,
							"id",
							this.id,
							"extend",
							this.extend,
							"options",
							this.options,
							"comment",
							keepComments ? this.comment : undefined,
						]);
					};
					Field.prototype.resolve = function resolve() {
						if (this.resolved) return this;
						if (
							(this.typeDefault = types.defaults[this.type]) ===
							undefined
						) {
							this.resolvedType = (
								this.declaringField
									? this.declaringField.parent
									: this.parent
							).lookupTypeOrEnum(this.type);
							if (this.resolvedType instanceof Type)
								this.typeDefault = null;
							else
								this.typeDefault =
									this.resolvedType.values[
										Object.keys(this.resolvedType.values)[0]
									];
						}
						if (this.options && this.options["default"] != null) {
							this.typeDefault = this.options["default"];
							if (
								this.resolvedType instanceof Enum &&
								typeof this.typeDefault === "string"
							)
								this.typeDefault =
									this.resolvedType.values[this.typeDefault];
						}
						if (this.options) {
							if (
								this.options.packed === true ||
								(this.options.packed !== undefined &&
									this.resolvedType &&
									!(this.resolvedType instanceof Enum))
							)
								delete this.options.packed;
							if (!Object.keys(this.options).length)
								this.options = undefined;
						}
						if (this.long) {
							this.typeDefault = util.Long.fromNumber(
								this.typeDefault,
								this.type.charAt(0) === "u"
							);
							if (Object.freeze) Object.freeze(this.typeDefault);
						} else if (
							this.bytes &&
							typeof this.typeDefault === "string"
						) {
							var buf;
							if (util.base64.test(this.typeDefault))
								util.base64.decode(
									this.typeDefault,
									(buf = util.newBuffer(
										util.base64.length(this.typeDefault)
									)),
									0
								);
							else
								util.utf8.write(
									this.typeDefault,
									(buf = util.newBuffer(
										util.utf8.length(this.typeDefault)
									)),
									0
								);
							this.typeDefault = buf;
						}
						if (this.map) this.defaultValue = util.emptyObject;
						else if (this.repeated)
							this.defaultValue = util.emptyArray;
						else this.defaultValue = this.typeDefault;
						if (this.parent instanceof Type)
							this.parent.ctor.prototype[this.name] =
								this.defaultValue;
						return ReflectionObject.prototype.resolve.call(this);
					};
					Field.d = function decorateField(
						fieldId,
						fieldType,
						fieldRule,
						defaultValue
					) {
						if (typeof fieldType === "function")
							fieldType = util.decorateType(fieldType).name;
						else if (fieldType && typeof fieldType === "object")
							fieldType = util.decorateEnum(fieldType).name;
						return function fieldDecorator(prototype, fieldName) {
							util.decorateType(prototype.constructor).add(
								new Field(
									fieldName,
									fieldId,
									fieldType,
									fieldRule,
									{ default: defaultValue }
								)
							);
						};
					};
					Field._configure = function configure(Type_) {
						Type = Type_;
					};
				},
				{ 14: 14, 22: 22, 32: 32, 33: 33 },
			],
			16: [
				function (require, module, exports) {
					"use strict";
					protobuf = module.exports = require(17);
					protobuf.build = "light";
					function load(filename, root, callback) {
						if (typeof root === "function") {
							callback = root;
							root = new protobuf.Root();
						} else if (!root) root = new protobuf.Root();
						return root.load(filename, callback);
					}
					protobuf.load = load;
					function loadSync(filename, root) {
						if (!root) root = new protobuf.Root();
						return root.loadSync(filename);
					}
					protobuf.loadSync = loadSync;
					protobuf.encoder = require(13);
					protobuf.decoder = require(12);
					protobuf.verifier = require(36);
					protobuf.converter = require(11);
					protobuf.ReflectionObject = require(22);
					protobuf.Namespace = require(21);
					protobuf.Root = require(26);
					protobuf.Enum = require(14);
					protobuf.Type = require(31);
					protobuf.Field = require(15);
					protobuf.OneOf = require(23);
					protobuf.MapField = require(18);
					protobuf.Service = require(30);
					protobuf.Method = require(20);
					protobuf.Message = require(19);
					protobuf.wrappers = require(37);
					protobuf.types = require(32);
					protobuf.util = require(33);
					protobuf.ReflectionObject._configure(protobuf.Root);
					protobuf.Namespace._configure(
						protobuf.Type,
						protobuf.Service,
						protobuf.Enum
					);
					protobuf.Root._configure(protobuf.Type);
					protobuf.Field._configure(protobuf.Type);
				},
				{
					11: 11,
					12: 12,
					13: 13,
					14: 14,
					15: 15,
					17: 17,
					18: 18,
					19: 19,
					20: 20,
					21: 21,
					22: 22,
					23: 23,
					26: 26,
					30: 30,
					31: 31,
					32: 32,
					33: 33,
					36: 36,
					37: 37,
				},
			],
			17: [
				function (require, module, exports) {
					"use strict";
					protobuf = exports;
					protobuf.build = "minimal";
					protobuf.Writer = require(38);
					protobuf.BufferWriter = require(39);
					protobuf.Reader = require(24);
					protobuf.BufferReader = require(25);
					protobuf.util = require(35);
					protobuf.rpc = require(28);
					protobuf.roots = require(27);
					protobuf.configure = configure;
					function configure() {
						protobuf.util._configure();
						protobuf.Writer._configure(protobuf.BufferWriter);
						protobuf.Reader._configure(protobuf.BufferReader);
					}
					configure();
				},
				{ 24: 24, 25: 25, 27: 27, 28: 28, 35: 35, 38: 38, 39: 39 },
			],
			18: [
				function (require, module, exports) {
					"use strict";
					module.exports = MapField;
					var Field = require(15);
					((MapField.prototype = Object.create(
						Field.prototype
					)).constructor = MapField).className = "MapField";
					var types = require(32),
						util = require(33);
					function MapField(
						name,
						id,
						keyType,
						type,
						options,
						comment
					) {
						Field.call(
							this,
							name,
							id,
							type,
							undefined,
							undefined,
							options,
							comment
						);
						if (!util.isString(keyType))
							throw TypeError("keyType must be a string");
						this.keyType = keyType;
						this.resolvedKeyType = null;
						this.map = true;
					}
					MapField.fromJSON = function fromJSON(name, json) {
						return new MapField(
							name,
							json.id,
							json.keyType,
							json.type,
							json.options,
							json.comment
						);
					};
					MapField.prototype.toJSON = function toJSON(toJSONOptions) {
						var keepComments = toJSONOptions
							? Boolean(toJSONOptions.keepComments)
							: false;
						return util.toObject([
							"keyType",
							this.keyType,
							"type",
							this.type,
							"id",
							this.id,
							"extend",
							this.extend,
							"options",
							this.options,
							"comment",
							keepComments ? this.comment : undefined,
						]);
					};
					MapField.prototype.resolve = function resolve() {
						if (this.resolved) return this;
						if (types.mapKey[this.keyType] === undefined)
							throw Error("invalid key type: " + this.keyType);
						return Field.prototype.resolve.call(this);
					};
					MapField.d = function decorateMapField(
						fieldId,
						fieldKeyType,
						fieldValueType
					) {
						if (typeof fieldValueType === "function")
							fieldValueType =
								util.decorateType(fieldValueType).name;
						else if (
							fieldValueType &&
							typeof fieldValueType === "object"
						)
							fieldValueType =
								util.decorateEnum(fieldValueType).name;
						return function mapFieldDecorator(
							prototype,
							fieldName
						) {
							util.decorateType(prototype.constructor).add(
								new MapField(
									fieldName,
									fieldId,
									fieldKeyType,
									fieldValueType
								)
							);
						};
					};
				},
				{ 15: 15, 32: 32, 33: 33 },
			],
			19: [
				function (require, module, exports) {
					"use strict";
					module.exports = Message;
					var util = require(35);
					function Message(properties) {
						if (properties)
							for (
								var keys = Object.keys(properties), i = 0;
								i < keys.length;
								++i
							)
								this[keys[i]] = properties[keys[i]];
					}
					Message.create = function create(properties) {
						return this.$type.create(properties);
					};
					Message.encode = function encode(message, writer) {
						return this.$type.encode(message, writer);
					};
					Message.encodeDelimited = function encodeDelimited(
						message,
						writer
					) {
						return this.$type.encodeDelimited(message, writer);
					};
					Message.decode = function decode(reader) {
						return this.$type.decode(reader);
					};
					Message.decodeDelimited = function decodeDelimited(reader) {
						return this.$type.decodeDelimited(reader);
					};
					Message.verify = function verify(message) {
						return this.$type.verify(message);
					};
					Message.fromObject = function fromObject(object) {
						return this.$type.fromObject(object);
					};
					Message.toObject = function toObject(message, options) {
						return this.$type.toObject(message, options);
					};
					Message.prototype.toJSON = function toJSON() {
						return this.$type.toObject(this, util.toJSONOptions);
					};
				},
				{ 35: 35 },
			],
			20: [
				function (require, module, exports) {
					"use strict";
					module.exports = Method;
					var ReflectionObject = require(22);
					((Method.prototype = Object.create(
						ReflectionObject.prototype
					)).constructor = Method).className = "Method";
					var util = require(33);
					function Method(
						name,
						type,
						requestType,
						responseType,
						requestStream,
						responseStream,
						options,
						comment,
						parsedOptions
					) {
						if (util.isObject(requestStream)) {
							options = requestStream;
							requestStream = responseStream = undefined;
						} else if (util.isObject(responseStream)) {
							options = responseStream;
							responseStream = undefined;
						}
						if (!(type === undefined || util.isString(type)))
							throw TypeError("type must be a string");
						if (!util.isString(requestType))
							throw TypeError("requestType must be a string");
						if (!util.isString(responseType))
							throw TypeError("responseType must be a string");
						ReflectionObject.call(this, name, options);
						this.type = type || "rpc";
						this.requestType = requestType;
						this.requestStream = requestStream ? true : undefined;
						this.responseType = responseType;
						this.responseStream = responseStream ? true : undefined;
						this.resolvedRequestType = null;
						this.resolvedResponseType = null;
						this.comment = comment;
						this.parsedOptions = parsedOptions;
					}
					Method.fromJSON = function fromJSON(name, json) {
						return new Method(
							name,
							json.type,
							json.requestType,
							json.responseType,
							json.requestStream,
							json.responseStream,
							json.options,
							json.comment,
							json.parsedOptions
						);
					};
					Method.prototype.toJSON = function toJSON(toJSONOptions) {
						var keepComments = toJSONOptions
							? Boolean(toJSONOptions.keepComments)
							: false;
						return util.toObject([
							"type",
							(this.type !== "rpc" && this.type) || undefined,
							"requestType",
							this.requestType,
							"requestStream",
							this.requestStream,
							"responseType",
							this.responseType,
							"responseStream",
							this.responseStream,
							"options",
							this.options,
							"comment",
							keepComments ? this.comment : undefined,
							"parsedOptions",
							this.parsedOptions,
						]);
					};
					Method.prototype.resolve = function resolve() {
						if (this.resolved) return this;
						this.resolvedRequestType = this.parent.lookupType(
							this.requestType
						);
						this.resolvedResponseType = this.parent.lookupType(
							this.responseType
						);
						return ReflectionObject.prototype.resolve.call(this);
					};
				},
				{ 22: 22, 33: 33 },
			],
			21: [
				function (require, module, exports) {
					"use strict";
					module.exports = Namespace;
					var ReflectionObject = require(22);
					((Namespace.prototype = Object.create(
						ReflectionObject.prototype
					)).constructor = Namespace).className = "Namespace";
					var Field = require(15),
						util = require(33);
					var Type, Service, Enum;
					Namespace.fromJSON = function fromJSON(name, json) {
						return new Namespace(name, json.options).addJSON(
							json.nested
						);
					};
					function arrayToJSON(array, toJSONOptions) {
						if (!(array && array.length)) return undefined;
						var obj = {};
						for (var i = 0; i < array.length; ++i)
							obj[array[i].name] = array[i].toJSON(toJSONOptions);
						return obj;
					}
					Namespace.arrayToJSON = arrayToJSON;
					Namespace.isReservedId = function isReservedId(
						reserved,
						id
					) {
						if (reserved)
							for (var i = 0; i < reserved.length; ++i)
								if (
									typeof reserved[i] !== "string" &&
									reserved[i][0] <= id &&
									reserved[i][1] > id
								)
									return true;
						return false;
					};
					Namespace.isReservedName = function isReservedName(
						reserved,
						name
					) {
						if (reserved)
							for (var i = 0; i < reserved.length; ++i)
								if (reserved[i] === name) return true;
						return false;
					};
					function Namespace(name, options) {
						ReflectionObject.call(this, name, options);
						this.nested = undefined;
						this._nestedArray = null;
					}
					function clearCache(namespace) {
						namespace._nestedArray = null;
						return namespace;
					}
					Object.defineProperty(Namespace.prototype, "nestedArray", {
						get: function () {
							return (
								this._nestedArray ||
								(this._nestedArray = util.toArray(this.nested))
							);
						},
					});
					Namespace.prototype.toJSON = function toJSON(
						toJSONOptions
					) {
						return util.toObject([
							"options",
							this.options,
							"nested",
							arrayToJSON(this.nestedArray, toJSONOptions),
						]);
					};
					Namespace.prototype.addJSON = function addJSON(nestedJson) {
						var ns = this;
						if (nestedJson) {
							for (
								var names = Object.keys(nestedJson),
									i = 0,
									nested;
								i < names.length;
								++i
							) {
								nested = nestedJson[names[i]];
								ns.add(
									(nested.fields !== undefined
										? Type.fromJSON
										: nested.values !== undefined
										? Enum.fromJSON
										: nested.methods !== undefined
										? Service.fromJSON
										: nested.id !== undefined
										? Field.fromJSON
										: Namespace.fromJSON)(names[i], nested)
								);
							}
						}
						return this;
					};
					Namespace.prototype.get = function get(name) {
						return (this.nested && this.nested[name]) || null;
					};
					Namespace.prototype.getEnum = function getEnum(name) {
						if (this.nested && this.nested[name] instanceof Enum)
							return this.nested[name].values;
						throw Error("no such enum: " + name);
					};
					Namespace.prototype.add = function add(object) {
						if (
							!(
								(object instanceof Field &&
									object.extend !== undefined) ||
								object instanceof Type ||
								object instanceof Enum ||
								object instanceof Service ||
								object instanceof Namespace
							)
						)
							throw TypeError(
								"object must be a valid nested object"
							);
						if (!this.nested) this.nested = {};
						else {
							var prev = this.get(object.name);
							if (prev) {
								if (
									prev instanceof Namespace &&
									object instanceof Namespace &&
									!(
										prev instanceof Type ||
										prev instanceof Service
									)
								) {
									var nested = prev.nestedArray;
									for (var i = 0; i < nested.length; ++i)
										object.add(nested[i]);
									this.remove(prev);
									if (!this.nested) this.nested = {};
									object.setOptions(prev.options, true);
								} else
									throw Error(
										"duplicate name '" +
											object.name +
											"' in " +
											this
									);
							}
						}
						this.nested[object.name] = object;
						object.onAdd(this);
						return clearCache(this);
					};
					Namespace.prototype.remove = function remove(object) {
						if (!(object instanceof ReflectionObject))
							throw TypeError(
								"object must be a ReflectionObject"
							);
						if (object.parent !== this)
							throw Error(object + " is not a member of " + this);
						delete this.nested[object.name];
						if (!Object.keys(this.nested).length)
							this.nested = undefined;
						object.onRemove(this);
						return clearCache(this);
					};
					Namespace.prototype.define = function define(path, json) {
						if (util.isString(path)) path = path.split(".");
						else if (!Array.isArray(path))
							throw TypeError("illegal path");
						if (path && path.length && path[0] === "")
							throw Error("path must be relative");
						var ptr = this;
						while (path.length > 0) {
							var part = path.shift();
							if (ptr.nested && ptr.nested[part]) {
								ptr = ptr.nested[part];
								if (!(ptr instanceof Namespace))
									throw Error(
										"path conflicts with non-namespace objects"
									);
							} else ptr.add((ptr = new Namespace(part)));
						}
						if (json) ptr.addJSON(json);
						return ptr;
					};
					Namespace.prototype.resolveAll = function resolveAll() {
						var nested = this.nestedArray,
							i = 0;
						while (i < nested.length)
							if (nested[i] instanceof Namespace)
								nested[i++].resolveAll();
							else nested[i++].resolve();
						return this.resolve();
					};
					Namespace.prototype.lookup = function lookup(
						path,
						filterTypes,
						parentAlreadyChecked
					) {
						if (typeof filterTypes === "boolean") {
							parentAlreadyChecked = filterTypes;
							filterTypes = undefined;
						} else if (filterTypes && !Array.isArray(filterTypes))
							filterTypes = [filterTypes];
						if (util.isString(path) && path.length) {
							if (path === ".") return this.root;
							path = path.split(".");
						} else if (!path.length) return this;
						if (path[0] === "")
							return this.root.lookup(path.slice(1), filterTypes);
						var found = this.get(path[0]);
						if (found) {
							if (path.length === 1) {
								if (
									!filterTypes ||
									filterTypes.indexOf(found.constructor) > -1
								)
									return found;
							} else if (
								found instanceof Namespace &&
								(found = found.lookup(
									path.slice(1),
									filterTypes,
									true
								))
							)
								return found;
						} else
							for (var i = 0; i < this.nestedArray.length; ++i)
								if (
									this._nestedArray[i] instanceof Namespace &&
									(found = this._nestedArray[i].lookup(
										path,
										filterTypes,
										true
									))
								)
									return found;
						if (this.parent === null || parentAlreadyChecked)
							return null;
						return this.parent.lookup(path, filterTypes);
					};
					Namespace.prototype.lookupType = function lookupType(path) {
						var found = this.lookup(path, [Type]);
						if (!found) throw Error("no such type: " + path);
						return found;
					};
					Namespace.prototype.lookupEnum = function lookupEnum(path) {
						var found = this.lookup(path, [Enum]);
						if (!found)
							throw Error(
								"no such Enum '" + path + "' in " + this
							);
						return found;
					};
					Namespace.prototype.lookupTypeOrEnum =
						function lookupTypeOrEnum(path) {
							var found = this.lookup(path, [Type, Enum]);
							if (!found)
								throw Error(
									"no such Type or Enum '" +
										path +
										"' in " +
										this
								);
							return found;
						};
					Namespace.prototype.lookupService = function lookupService(
						path
					) {
						var found = this.lookup(path, [Service]);
						if (!found)
							throw Error(
								"no such Service '" + path + "' in " + this
							);
						return found;
					};
					Namespace._configure = function (Type_, Service_, Enum_) {
						Type = Type_;
						Service = Service_;
						Enum = Enum_;
					};
				},
				{ 15: 15, 22: 22, 33: 33 },
			],
			22: [
				function (require, module, exports) {
					"use strict";
					module.exports = ReflectionObject;
					ReflectionObject.className = "ReflectionObject";
					var util = require(33);
					var Root;
					function ReflectionObject(name, options) {
						if (!util.isString(name))
							throw TypeError("name must be a string");
						if (options && !util.isObject(options))
							throw TypeError("options must be an object");
						this.options = options;
						this.parsedOptions = null;
						this.name = name;
						this.parent = null;
						this.resolved = false;
						this.comment = null;
						this.filename = null;
					}
					Object.defineProperties(ReflectionObject.prototype, {
						root: {
							get: function () {
								var ptr = this;
								while (ptr.parent !== null) ptr = ptr.parent;
								return ptr;
							},
						},
						fullName: {
							get: function () {
								var path = [this.name],
									ptr = this.parent;
								while (ptr) {
									path.unshift(ptr.name);
									ptr = ptr.parent;
								}
								return path.join(".");
							},
						},
					});
					ReflectionObject.prototype.toJSON = function toJSON() {
						throw Error();
					};
					ReflectionObject.prototype.onAdd = function onAdd(parent) {
						if (this.parent && this.parent !== parent)
							this.parent.remove(this);
						this.parent = parent;
						this.resolved = false;
						var root = parent.root;
						if (root instanceof Root) root._handleAdd(this);
					};
					ReflectionObject.prototype.onRemove = function onRemove(
						parent
					) {
						var root = parent.root;
						if (root instanceof Root) root._handleRemove(this);
						this.parent = null;
						this.resolved = false;
					};
					ReflectionObject.prototype.resolve = function resolve() {
						if (this.resolved) return this;
						if (this.root instanceof Root) this.resolved = true;
						return this;
					};
					ReflectionObject.prototype.getOption = function getOption(
						name
					) {
						if (this.options) return this.options[name];
						return undefined;
					};
					ReflectionObject.prototype.setOption = function setOption(
						name,
						value,
						ifNotSet
					) {
						if (
							!ifNotSet ||
							!this.options ||
							this.options[name] === undefined
						)
							(this.options || (this.options = {}))[name] = value;
						return this;
					};
					ReflectionObject.prototype.setParsedOption =
						function setParsedOption(name, value, propName) {
							if (!this.parsedOptions) {
								this.parsedOptions = [];
							}
							var parsedOptions = this.parsedOptions;
							if (propName) {
								var opt = parsedOptions.find(function (opt) {
									return Object.prototype.hasOwnProperty.call(
										opt,
										name
									);
								});
								if (opt) {
									var newValue = opt[name];
									util.setProperty(newValue, propName, value);
								} else {
									opt = {};
									opt[name] = util.setProperty(
										{},
										propName,
										value
									);
									parsedOptions.push(opt);
								}
							} else {
								var newOpt = {};
								newOpt[name] = value;
								parsedOptions.push(newOpt);
							}
							return this;
						};
					ReflectionObject.prototype.setOptions = function setOptions(
						options,
						ifNotSet
					) {
						if (options)
							for (
								var keys = Object.keys(options), i = 0;
								i < keys.length;
								++i
							)
								this.setOption(
									keys[i],
									options[keys[i]],
									ifNotSet
								);
						return this;
					};
					ReflectionObject.prototype.toString = function toString() {
						var className = this.constructor.className,
							fullName = this.fullName;
						if (fullName.length) return className + " " + fullName;
						return className;
					};
					ReflectionObject._configure = function (Root_) {
						Root = Root_;
					};
				},
				{ 33: 33 },
			],
			23: [
				function (require, module, exports) {
					"use strict";
					module.exports = OneOf;
					var ReflectionObject = require(22);
					((OneOf.prototype = Object.create(
						ReflectionObject.prototype
					)).constructor = OneOf).className = "OneOf";
					var Field = require(15),
						util = require(33);
					function OneOf(name, fieldNames, options, comment) {
						if (!Array.isArray(fieldNames)) {
							options = fieldNames;
							fieldNames = undefined;
						}
						ReflectionObject.call(this, name, options);
						if (
							!(
								fieldNames === undefined ||
								Array.isArray(fieldNames)
							)
						)
							throw TypeError("fieldNames must be an Array");
						this.oneof = fieldNames || [];
						this.fieldsArray = [];
						this.comment = comment;
					}
					OneOf.fromJSON = function fromJSON(name, json) {
						return new OneOf(
							name,
							json.oneof,
							json.options,
							json.comment
						);
					};
					OneOf.prototype.toJSON = function toJSON(toJSONOptions) {
						var keepComments = toJSONOptions
							? Boolean(toJSONOptions.keepComments)
							: false;
						return util.toObject([
							"options",
							this.options,
							"oneof",
							this.oneof,
							"comment",
							keepComments ? this.comment : undefined,
						]);
					};
					function addFieldsToParent(oneof) {
						if (oneof.parent)
							for (var i = 0; i < oneof.fieldsArray.length; ++i)
								if (!oneof.fieldsArray[i].parent)
									oneof.parent.add(oneof.fieldsArray[i]);
					}
					OneOf.prototype.add = function add(field) {
						if (!(field instanceof Field))
							throw TypeError("field must be a Field");
						if (field.parent && field.parent !== this.parent)
							field.parent.remove(field);
						this.oneof.push(field.name);
						this.fieldsArray.push(field);
						field.partOf = this;
						addFieldsToParent(this);
						return this;
					};
					OneOf.prototype.remove = function remove(field) {
						if (!(field instanceof Field))
							throw TypeError("field must be a Field");
						var index = this.fieldsArray.indexOf(field);
						if (index < 0)
							throw Error(field + " is not a member of " + this);
						this.fieldsArray.splice(index, 1);
						index = this.oneof.indexOf(field.name);
						if (index > -1) this.oneof.splice(index, 1);
						field.partOf = null;
						return this;
					};
					OneOf.prototype.onAdd = function onAdd(parent) {
						ReflectionObject.prototype.onAdd.call(this, parent);
						var self = this;
						for (var i = 0; i < this.oneof.length; ++i) {
							var field = parent.get(this.oneof[i]);
							if (field && !field.partOf) {
								field.partOf = self;
								self.fieldsArray.push(field);
							}
						}
						addFieldsToParent(this);
					};
					OneOf.prototype.onRemove = function onRemove(parent) {
						for (var i = 0, field; i < this.fieldsArray.length; ++i)
							if ((field = this.fieldsArray[i]).parent)
								field.parent.remove(field);
						ReflectionObject.prototype.onRemove.call(this, parent);
					};
					OneOf.d = function decorateOneOf() {
						var fieldNames = new Array(arguments.length),
							index = 0;
						while (index < arguments.length)
							fieldNames[index] = arguments[index++];
						return function oneOfDecorator(prototype, oneofName) {
							util.decorateType(prototype.constructor).add(
								new OneOf(oneofName, fieldNames)
							);
							Object.defineProperty(prototype, oneofName, {
								get: util.oneOfGetter(fieldNames),
								set: util.oneOfSetter(fieldNames),
							});
						};
					};
				},
				{ 15: 15, 22: 22, 33: 33 },
			],
			24: [
				function (require, module, exports) {
					"use strict";
					module.exports = Reader;
					var util = require(35);
					var BufferReader;
					var LongBits = util.LongBits,
						utf8 = util.utf8;
					function indexOutOfRange(reader, writeLength) {
						return RangeError(
							"index out of range: " +
								reader.pos +
								" + " +
								(writeLength || 1) +
								" > " +
								reader.len
						);
					}
					function Reader(buffer) {
						this.buf = buffer;
						this.pos = 0;
						this.len = buffer.length;
					}
					var create_array =
						typeof Uint8Array !== "undefined"
							? function create_typed_array(buffer) {
									if (
										buffer instanceof Uint8Array ||
										Array.isArray(buffer)
									)
										return new Reader(buffer);
									throw Error("illegal buffer");
							  }
							: function create_array(buffer) {
									if (Array.isArray(buffer))
										return new Reader(buffer);
									throw Error("illegal buffer");
							  };
					var create = function create() {
						return util.Buffer
							? function create_buffer_setup(buffer) {
									return (Reader.create =
										function create_buffer(buffer) {
											return util.Buffer.isBuffer(buffer)
												? new BufferReader(buffer)
												: create_array(buffer);
										})(buffer);
							  }
							: create_array;
					};
					Reader.create = create();
					Reader.prototype._slice =
						util.Array.prototype.subarray ||
						util.Array.prototype.slice;
					Reader.prototype.uint32 = (function read_uint32_setup() {
						var value = 4294967295;
						return function read_uint32() {
							value = (this.buf[this.pos] & 127) >>> 0;
							if (this.buf[this.pos++] < 128) return value;
							value =
								(value | ((this.buf[this.pos] & 127) << 7)) >>>
								0;
							if (this.buf[this.pos++] < 128) return value;
							value =
								(value | ((this.buf[this.pos] & 127) << 14)) >>>
								0;
							if (this.buf[this.pos++] < 128) return value;
							value =
								(value | ((this.buf[this.pos] & 127) << 21)) >>>
								0;
							if (this.buf[this.pos++] < 128) return value;
							value =
								(value | ((this.buf[this.pos] & 15) << 28)) >>>
								0;
							if (this.buf[this.pos++] < 128) return value;
							if ((this.pos += 5) > this.len) {
								this.pos = this.len;
								throw indexOutOfRange(this, 10);
							}
							return value;
						};
					})();
					Reader.prototype.int32 = function read_int32() {
						return this.uint32() | 0;
					};
					Reader.prototype.sint32 = function read_sint32() {
						var value = this.uint32();
						return ((value >>> 1) ^ -(value & 1)) | 0;
					};
					function readLongVarint() {
						var bits = new LongBits(0, 0);
						var i = 0;
						if (this.len - this.pos > 4) {
							for (; i < 4; ++i) {
								bits.lo =
									(bits.lo |
										((this.buf[this.pos] & 127) <<
											(i * 7))) >>>
									0;
								if (this.buf[this.pos++] < 128) return bits;
							}
							bits.lo =
								(bits.lo |
									((this.buf[this.pos] & 127) << 28)) >>>
								0;
							bits.hi =
								(bits.hi |
									((this.buf[this.pos] & 127) >> 4)) >>>
								0;
							if (this.buf[this.pos++] < 128) return bits;
							i = 0;
						} else {
							for (; i < 3; ++i) {
								if (this.pos >= this.len)
									throw indexOutOfRange(this);
								bits.lo =
									(bits.lo |
										((this.buf[this.pos] & 127) <<
											(i * 7))) >>>
									0;
								if (this.buf[this.pos++] < 128) return bits;
							}
							bits.lo =
								(bits.lo |
									((this.buf[this.pos++] & 127) <<
										(i * 7))) >>>
								0;
							return bits;
						}
						if (this.len - this.pos > 4) {
							for (; i < 5; ++i) {
								bits.hi =
									(bits.hi |
										((this.buf[this.pos] & 127) <<
											(i * 7 + 3))) >>>
									0;
								if (this.buf[this.pos++] < 128) return bits;
							}
						} else {
							for (; i < 5; ++i) {
								if (this.pos >= this.len)
									throw indexOutOfRange(this);
								bits.hi =
									(bits.hi |
										((this.buf[this.pos] & 127) <<
											(i * 7 + 3))) >>>
									0;
								if (this.buf[this.pos++] < 128) return bits;
							}
						}
						throw Error("invalid varint encoding");
					}
					Reader.prototype.bool = function read_bool() {
						return this.uint32() !== 0;
					};
					function readFixed32_end(buf, end) {
						return (
							(buf[end - 4] |
								(buf[end - 3] << 8) |
								(buf[end - 2] << 16) |
								(buf[end - 1] << 24)) >>>
							0
						);
					}
					Reader.prototype.fixed32 = function read_fixed32() {
						if (this.pos + 4 > this.len)
							throw indexOutOfRange(this, 4);
						return readFixed32_end(this.buf, (this.pos += 4));
					};
					Reader.prototype.sfixed32 = function read_sfixed32() {
						if (this.pos + 4 > this.len)
							throw indexOutOfRange(this, 4);
						return readFixed32_end(this.buf, (this.pos += 4)) | 0;
					};
					function readFixed64() {
						if (this.pos + 8 > this.len)
							throw indexOutOfRange(this, 8);
						return new LongBits(
							readFixed32_end(this.buf, (this.pos += 4)),
							readFixed32_end(this.buf, (this.pos += 4))
						);
					}
					Reader.prototype.float = function read_float() {
						if (this.pos + 4 > this.len)
							throw indexOutOfRange(this, 4);
						var value = util.float.readFloatLE(this.buf, this.pos);
						this.pos += 4;
						return value;
					};
					Reader.prototype.double = function read_double() {
						if (this.pos + 8 > this.len)
							throw indexOutOfRange(this, 4);
						var value = util.float.readDoubleLE(this.buf, this.pos);
						this.pos += 8;
						return value;
					};
					Reader.prototype.bytes = function read_bytes() {
						var length = this.uint32(),
							start = this.pos,
							end = this.pos + length;
						if (end > this.len) throw indexOutOfRange(this, length);
						this.pos += length;
						if (Array.isArray(this.buf))
							return this.buf.slice(start, end);
						return start === end
							? new this.buf.constructor(0)
							: this._slice.call(this.buf, start, end);
					};
					Reader.prototype.string = function read_string() {
						var bytes = this.bytes();
						return utf8.read(bytes, 0, bytes.length);
					};
					Reader.prototype.skip = function skip(length) {
						if (typeof length === "number") {
							if (this.pos + length > this.len)
								throw indexOutOfRange(this, length);
							this.pos += length;
						} else {
							do {
								if (this.pos >= this.len)
									throw indexOutOfRange(this);
							} while (this.buf[this.pos++] & 128);
						}
						return this;
					};
					Reader.prototype.skipType = function (wireType) {
						switch (wireType) {
							case 0:
								this.skip();
								break;
							case 1:
								this.skip(8);
								break;
							case 2:
								this.skip(this.uint32());
								break;
							case 3:
								while ((wireType = this.uint32() & 7) !== 4) {
									this.skipType(wireType);
								}
								break;
							case 5:
								this.skip(4);
								break;
							default:
								throw Error(
									"invalid wire type " +
										wireType +
										" at offset " +
										this.pos
								);
						}
						return this;
					};
					Reader._configure = function (BufferReader_) {
						BufferReader = BufferReader_;
						Reader.create = create();
						BufferReader._configure();
						var fn = util.Long ? "toLong" : "toNumber";
						util.merge(Reader.prototype, {
							int64: function read_int64() {
								return readLongVarint.call(this)[fn](false);
							},
							uint64: function read_uint64() {
								return readLongVarint.call(this)[fn](true);
							},
							sint64: function read_sint64() {
								return readLongVarint
									.call(this)
									.zzDecode()
									[fn](false);
							},
							fixed64: function read_fixed64() {
								return readFixed64.call(this)[fn](true);
							},
							sfixed64: function read_sfixed64() {
								return readFixed64.call(this)[fn](false);
							},
						});
					};
				},
				{ 35: 35 },
			],
			25: [
				function (require, module, exports) {
					"use strict";
					module.exports = BufferReader;
					var Reader = require(24);
					(BufferReader.prototype = Object.create(
						Reader.prototype
					)).constructor = BufferReader;
					var util = require(35);
					function BufferReader(buffer) {
						Reader.call(this, buffer);
					}
					BufferReader._configure = function () {
						if (util.Buffer)
							BufferReader.prototype._slice =
								util.Buffer.prototype.slice;
					};
					BufferReader.prototype.string =
						function read_string_buffer() {
							var len = this.uint32();
							return this.buf.utf8Slice
								? this.buf.utf8Slice(
										this.pos,
										(this.pos = Math.min(
											this.pos + len,
											this.len
										))
								  )
								: this.buf.toString(
										"utf-8",
										this.pos,
										(this.pos = Math.min(
											this.pos + len,
											this.len
										))
								  );
						};
					BufferReader._configure();
				},
				{ 24: 24, 35: 35 },
			],
			26: [
				function (require, module, exports) {
					"use strict";
					module.exports = Root;
					var Namespace = require(21);
					((Root.prototype = Object.create(
						Namespace.prototype
					)).constructor = Root).className = "Root";
					var Field = require(15),
						Enum = require(14),
						OneOf = require(23),
						util = require(33);
					var Type, parse, common;
					function Root(options) {
						Namespace.call(this, "", options);
						this.deferred = [];
						this.files = [];
					}
					Root.fromJSON = function fromJSON(json, root) {
						if (!root) root = new Root();
						if (json.options) root.setOptions(json.options);
						return root.addJSON(json.nested);
					};
					Root.prototype.resolvePath = util.path.resolve;
					Root.prototype.fetch = util.fetch;
					function SYNC() {}
					Root.prototype.load = function load(
						filename,
						options,
						callback
					) {
						if (typeof options === "function") {
							callback = options;
							options = undefined;
						}
						var self = this;
						if (!callback)
							return util.asPromise(
								load,
								self,
								filename,
								options
							);
						var sync = callback === SYNC;
						function finish(err, root) {
							if (!callback) return;
							var cb = callback;
							callback = null;
							if (sync) throw err;
							cb(err, root);
						}
						function getBundledFileName(filename) {
							var idx = filename.lastIndexOf("google/protobuf/");
							if (idx > -1) {
								var altname = filename.substring(idx);
								if (altname in common) return altname;
							}
							return null;
						}
						function process(filename, source) {
							try {
								if (
									util.isString(source) &&
									source.charAt(0) === "{"
								)
									source = JSON.parse(source);
								if (!util.isString(source))
									self.setOptions(source.options).addJSON(
										source.nested
									);
								else {
									parse.filename = filename;
									var parsed = parse(source, self, options),
										resolved,
										i = 0;
									if (parsed.imports)
										for (; i < parsed.imports.length; ++i)
											if (
												(resolved =
													getBundledFileName(
														parsed.imports[i]
													) ||
													self.resolvePath(
														filename,
														parsed.imports[i]
													))
											)
												fetch(resolved);
									if (parsed.weakImports)
										for (
											i = 0;
											i < parsed.weakImports.length;
											++i
										)
											if (
												(resolved =
													getBundledFileName(
														parsed.weakImports[i]
													) ||
													self.resolvePath(
														filename,
														parsed.weakImports[i]
													))
											)
												fetch(resolved, true);
								}
							} catch (err) {
								finish(err);
							}
							if (!sync && !queued) finish(null, self);
						}
						function fetch(filename, weak) {
							if (self.files.indexOf(filename) > -1) return;
							self.files.push(filename);
							if (filename in common) {
								if (sync) process(filename, common[filename]);
								else {
									++queued;
									setTimeout(function () {
										--queued;
										process(filename, common[filename]);
									});
								}
								return;
							}
							if (sync) {
								var source;
								try {
									source = util.fs
										.readFileSync(filename)
										.toString("utf8");
								} catch (err) {
									if (!weak) finish(err);
									return;
								}
								process(filename, source);
							} else {
								++queued;
								self.fetch(filename, function (err, source) {
									--queued;
									if (!callback) return;
									if (err) {
										if (!weak) finish(err);
										else if (!queued) finish(null, self);
										return;
									}
									process(filename, source);
								});
							}
						}
						var queued = 0;
						if (util.isString(filename)) filename = [filename];
						for (var i = 0, resolved; i < filename.length; ++i)
							if ((resolved = self.resolvePath("", filename[i])))
								fetch(resolved);
						if (sync) return self;
						if (!queued) finish(null, self);
						return undefined;
					};
					Root.prototype.loadSync = function loadSync(
						filename,
						options
					) {
						if (!util.isNode) throw Error("not supported");
						return this.load(filename, options, SYNC);
					};
					Root.prototype.resolveAll = function resolveAll() {
						if (this.deferred.length)
							throw Error(
								"unresolvable extensions: " +
									this.deferred
										.map(function (field) {
											return (
												"'extend " +
												field.extend +
												"' in " +
												field.parent.fullName
											);
										})
										.join(", ")
							);
						return Namespace.prototype.resolveAll.call(this);
					};
					var exposeRe = /^[A-Z]/;
					function tryHandleExtension(root, field) {
						var extendedType = field.parent.lookup(field.extend);
						if (extendedType) {
							var sisterField = new Field(
								field.fullName,
								field.id,
								field.type,
								field.rule,
								undefined,
								field.options
							);
							sisterField.declaringField = field;
							field.extensionField = sisterField;
							extendedType.add(sisterField);
							return true;
						}
						return false;
					}
					Root.prototype._handleAdd = function _handleAdd(object) {
						if (object instanceof Field) {
							if (
								object.extend !== undefined &&
								!object.extensionField
							)
								if (!tryHandleExtension(this, object))
									this.deferred.push(object);
						} else if (object instanceof Enum) {
							if (exposeRe.test(object.name))
								object.parent[object.name] = object.values;
						} else if (!(object instanceof OneOf)) {
							if (object instanceof Type)
								for (var i = 0; i < this.deferred.length; )
									if (
										tryHandleExtension(
											this,
											this.deferred[i]
										)
									)
										this.deferred.splice(i, 1);
									else ++i;
							for (var j = 0; j < object.nestedArray.length; ++j)
								this._handleAdd(object._nestedArray[j]);
							if (exposeRe.test(object.name))
								object.parent[object.name] = object;
						}
					};
					Root.prototype._handleRemove = function _handleRemove(
						object
					) {
						if (object instanceof Field) {
							if (object.extend !== undefined) {
								if (object.extensionField) {
									object.extensionField.parent.remove(
										object.extensionField
									);
									object.extensionField = null;
								} else {
									var index = this.deferred.indexOf(object);
									if (index > -1)
										this.deferred.splice(index, 1);
								}
							}
						} else if (object instanceof Enum) {
							if (exposeRe.test(object.name))
								delete object.parent[object.name];
						} else if (object instanceof Namespace) {
							for (var i = 0; i < object.nestedArray.length; ++i)
								this._handleRemove(object._nestedArray[i]);
							if (exposeRe.test(object.name))
								delete object.parent[object.name];
						}
					};
					Root._configure = function (Type_, parse_, common_) {
						Type = Type_;
						parse = parse_;
						common = common_;
					};
				},
				{ 14: 14, 15: 15, 21: 21, 23: 23, 33: 33 },
			],
			27: [
				function (require, module, exports) {
					"use strict";
					module.exports = {};
				},
				{},
			],
			28: [
				function (require, module, exports) {
					"use strict";
					var rpc = exports;
					rpc.Service = require(29);
				},
				{ 29: 29 },
			],
			29: [
				function (require, module, exports) {
					"use strict";
					module.exports = Service;
					var util = require(35);
					(Service.prototype = Object.create(
						util.EventEmitter.prototype
					)).constructor = Service;
					function Service(
						rpcImpl,
						requestDelimited,
						responseDelimited
					) {
						if (typeof rpcImpl !== "function")
							throw TypeError("rpcImpl must be a function");
						util.EventEmitter.call(this);
						this.rpcImpl = rpcImpl;
						this.requestDelimited = Boolean(requestDelimited);
						this.responseDelimited = Boolean(responseDelimited);
					}
					Service.prototype.rpcCall = function rpcCall(
						method,
						requestCtor,
						responseCtor,
						request,
						callback
					) {
						if (!request)
							throw TypeError("request must be specified");
						var self = this;
						if (!callback)
							return util.asPromise(
								rpcCall,
								self,
								method,
								requestCtor,
								responseCtor,
								request
							);
						if (!self.rpcImpl) {
							setTimeout(function () {
								callback(Error("already ended"));
							}, 0);
							return undefined;
						}
						try {
							return self.rpcImpl(
								method,
								requestCtor[
									self.requestDelimited
										? "encodeDelimited"
										: "encode"
								](request).finish(),
								function rpcCallback(err, response) {
									if (err) {
										self.emit("error", err, method);
										return callback(err);
									}
									if (response === null) {
										self.end(true);
										return undefined;
									}
									if (!(response instanceof responseCtor)) {
										try {
											response =
												responseCtor[
													self.responseDelimited
														? "decodeDelimited"
														: "decode"
												](response);
										} catch (err) {
											self.emit("error", err, method);
											return callback(err);
										}
									}
									self.emit("data", response, method);
									return callback(null, response);
								}
							);
						} catch (err) {
							self.emit("error", err, method);
							setTimeout(function () {
								callback(err);
							}, 0);
							return undefined;
						}
					};
					Service.prototype.end = function end(endedByRPC) {
						if (this.rpcImpl) {
							if (!endedByRPC) this.rpcImpl(null, null, null);
							this.rpcImpl = null;
							this.emit("end").off();
						}
						return this;
					};
				},
				{ 35: 35 },
			],
			30: [
				function (require, module, exports) {
					"use strict";
					module.exports = Service;
					var Namespace = require(21);
					((Service.prototype = Object.create(
						Namespace.prototype
					)).constructor = Service).className = "Service";
					var Method = require(20),
						util = require(33),
						rpc = require(28);
					function Service(name, options) {
						Namespace.call(this, name, options);
						this.methods = {};
						this._methodsArray = null;
					}
					Service.fromJSON = function fromJSON(name, json) {
						var service = new Service(name, json.options);
						if (json.methods)
							for (
								var names = Object.keys(json.methods), i = 0;
								i < names.length;
								++i
							)
								service.add(
									Method.fromJSON(
										names[i],
										json.methods[names[i]]
									)
								);
						if (json.nested) service.addJSON(json.nested);
						service.comment = json.comment;
						return service;
					};
					Service.prototype.toJSON = function toJSON(toJSONOptions) {
						var inherited = Namespace.prototype.toJSON.call(
							this,
							toJSONOptions
						);
						var keepComments = toJSONOptions
							? Boolean(toJSONOptions.keepComments)
							: false;
						return util.toObject([
							"options",
							(inherited && inherited.options) || undefined,
							"methods",
							Namespace.arrayToJSON(
								this.methodsArray,
								toJSONOptions
							) || {},
							"nested",
							(inherited && inherited.nested) || undefined,
							"comment",
							keepComments ? this.comment : undefined,
						]);
					};
					Object.defineProperty(Service.prototype, "methodsArray", {
						get: function () {
							return (
								this._methodsArray ||
								(this._methodsArray = util.toArray(
									this.methods
								))
							);
						},
					});
					function clearCache(service) {
						service._methodsArray = null;
						return service;
					}
					Service.prototype.get = function get(name) {
						return (
							this.methods[name] ||
							Namespace.prototype.get.call(this, name)
						);
					};
					Service.prototype.resolveAll = function resolveAll() {
						var methods = this.methodsArray;
						for (var i = 0; i < methods.length; ++i)
							methods[i].resolve();
						return Namespace.prototype.resolve.call(this);
					};
					Service.prototype.add = function add(object) {
						if (this.get(object.name))
							throw Error(
								"duplicate name '" +
									object.name +
									"' in " +
									this
							);
						if (object instanceof Method) {
							this.methods[object.name] = object;
							object.parent = this;
							return clearCache(this);
						}
						return Namespace.prototype.add.call(this, object);
					};
					Service.prototype.remove = function remove(object) {
						if (object instanceof Method) {
							if (this.methods[object.name] !== object)
								throw Error(
									object + " is not a member of " + this
								);
							delete this.methods[object.name];
							object.parent = null;
							return clearCache(this);
						}
						return Namespace.prototype.remove.call(this, object);
					};
					Service.prototype.create = function create(
						rpcImpl,
						requestDelimited,
						responseDelimited
					) {
						var rpcService = new rpc.Service(
							rpcImpl,
							requestDelimited,
							responseDelimited
						);
						for (
							var i = 0, method;
							i < this.methodsArray.length;
							++i
						) {
							var methodName = util
								.lcFirst(
									(method = this._methodsArray[i]).resolve()
										.name
								)
								.replace(/[^$\w_]/g, "");
							rpcService[methodName] = util.codegen(
								["r", "c"],
								util.isReserved(methodName)
									? methodName + "_"
									: methodName
							)("return this.rpcCall(m,q,s,r,c)")({
								m: method,
								q: method.resolvedRequestType.ctor,
								s: method.resolvedResponseType.ctor,
							});
						}
						return rpcService;
					};
				},
				{ 20: 20, 21: 21, 28: 28, 33: 33 },
			],
			31: [
				function (require, module, exports) {
					"use strict";
					module.exports = Type;
					var Namespace = require(21);
					((Type.prototype = Object.create(
						Namespace.prototype
					)).constructor = Type).className = "Type";
					var Enum = require(14),
						OneOf = require(23),
						Field = require(15),
						MapField = require(18),
						Service = require(30),
						Message = require(19),
						Reader = require(24),
						Writer = require(38),
						util = require(33),
						encoder = require(13),
						decoder = require(12),
						verifier = require(36),
						converter = require(11),
						wrappers = require(37);
					function Type(name, options) {
						Namespace.call(this, name, options);
						this.fields = {};
						this.oneofs = undefined;
						this.extensions = undefined;
						this.reserved = undefined;
						this.group = undefined;
						this._fieldsById = null;
						this._fieldsArray = null;
						this._oneofsArray = null;
						this._ctor = null;
					}
					Object.defineProperties(Type.prototype, {
						fieldsById: {
							get: function () {
								if (this._fieldsById) return this._fieldsById;
								this._fieldsById = {};
								for (
									var names = Object.keys(this.fields), i = 0;
									i < names.length;
									++i
								) {
									var field = this.fields[names[i]],
										id = field.id;
									if (this._fieldsById[id])
										throw Error(
											"duplicate id " + id + " in " + this
										);
									this._fieldsById[id] = field;
								}
								return this._fieldsById;
							},
						},
						fieldsArray: {
							get: function () {
								return (
									this._fieldsArray ||
									(this._fieldsArray = util.toArray(
										this.fields
									))
								);
							},
						},
						oneofsArray: {
							get: function () {
								return (
									this._oneofsArray ||
									(this._oneofsArray = util.toArray(
										this.oneofs
									))
								);
							},
						},
						ctor: {
							get: function () {
								return (
									this._ctor ||
									(this.ctor =
										Type.generateConstructor(this)())
								);
							},
							set: function (ctor) {
								var prototype = ctor.prototype;
								if (!(prototype instanceof Message)) {
									(ctor.prototype =
										new Message()).constructor = ctor;
									util.merge(ctor.prototype, prototype);
								}
								ctor.$type = ctor.prototype.$type = this;
								util.merge(ctor, Message, true);
								this._ctor = ctor;
								var i = 0;
								for (; i < this.fieldsArray.length; ++i)
									this._fieldsArray[i].resolve();
								var ctorProperties = {};
								for (i = 0; i < this.oneofsArray.length; ++i)
									ctorProperties[
										this._oneofsArray[i].resolve().name
									] = {
										get: util.oneOfGetter(
											this._oneofsArray[i].oneof
										),
										set: util.oneOfSetter(
											this._oneofsArray[i].oneof
										),
									};
								if (i)
									Object.defineProperties(
										ctor.prototype,
										ctorProperties
									);
							},
						},
					});
					Type.generateConstructor = function generateConstructor(
						mtype
					) {
						var gen = util.codegen(["p"], mtype.name);
						for (
							var i = 0, field;
							i < mtype.fieldsArray.length;
							++i
						)
							if ((field = mtype._fieldsArray[i]).map)
								gen("this%s={}", util.safeProp(field.name));
							else if (field.repeated)
								gen("this%s=[]", util.safeProp(field.name));
						return gen(
							"if(p)for(var ks=Object.keys(p),i=0;i<ks.length;++i)if(p[ks[i]]!=null)"
						)("this[ks[i]]=p[ks[i]]");
					};
					function clearCache(type) {
						type._fieldsById =
							type._fieldsArray =
							type._oneofsArray =
								null;
						delete type.encode;
						delete type.decode;
						delete type.verify;
						return type;
					}
					Type.fromJSON = function fromJSON(name, json) {
						var type = new Type(name, json.options);
						type.extensions = json.extensions;
						type.reserved = json.reserved;
						var names = Object.keys(json.fields),
							i = 0;
						for (; i < names.length; ++i)
							type.add(
								(typeof json.fields[names[i]].keyType !==
									"undefined"
									? MapField.fromJSON
									: Field.fromJSON)(
									names[i],
									json.fields[names[i]]
								)
							);
						if (json.oneofs)
							for (
								names = Object.keys(json.oneofs), i = 0;
								i < names.length;
								++i
							)
								type.add(
									OneOf.fromJSON(
										names[i],
										json.oneofs[names[i]]
									)
								);
						if (json.nested)
							for (
								names = Object.keys(json.nested), i = 0;
								i < names.length;
								++i
							) {
								var nested = json.nested[names[i]];
								type.add(
									(nested.id !== undefined
										? Field.fromJSON
										: nested.fields !== undefined
										? Type.fromJSON
										: nested.values !== undefined
										? Enum.fromJSON
										: nested.methods !== undefined
										? Service.fromJSON
										: Namespace.fromJSON)(names[i], nested)
								);
							}
						if (json.extensions && json.extensions.length)
							type.extensions = json.extensions;
						if (json.reserved && json.reserved.length)
							type.reserved = json.reserved;
						if (json.group) type.group = true;
						if (json.comment) type.comment = json.comment;
						return type;
					};
					Type.prototype.toJSON = function toJSON(toJSONOptions) {
						var inherited = Namespace.prototype.toJSON.call(
							this,
							toJSONOptions
						);
						var keepComments = toJSONOptions
							? Boolean(toJSONOptions.keepComments)
							: false;
						return util.toObject([
							"options",
							(inherited && inherited.options) || undefined,
							"oneofs",
							Namespace.arrayToJSON(
								this.oneofsArray,
								toJSONOptions
							),
							"fields",
							Namespace.arrayToJSON(
								this.fieldsArray.filter(function (obj) {
									return !obj.declaringField;
								}),
								toJSONOptions
							) || {},
							"extensions",
							this.extensions && this.extensions.length
								? this.extensions
								: undefined,
							"reserved",
							this.reserved && this.reserved.length
								? this.reserved
								: undefined,
							"group",
							this.group || undefined,
							"nested",
							(inherited && inherited.nested) || undefined,
							"comment",
							keepComments ? this.comment : undefined,
						]);
					};
					Type.prototype.resolveAll = function resolveAll() {
						var fields = this.fieldsArray,
							i = 0;
						while (i < fields.length) fields[i++].resolve();
						var oneofs = this.oneofsArray;
						i = 0;
						while (i < oneofs.length) oneofs[i++].resolve();
						return Namespace.prototype.resolveAll.call(this);
					};
					Type.prototype.get = function get(name) {
						return (
							this.fields[name] ||
							(this.oneofs && this.oneofs[name]) ||
							(this.nested && this.nested[name]) ||
							null
						);
					};
					Type.prototype.add = function add(object) {
						if (this.get(object.name))
							throw Error(
								"duplicate name '" +
									object.name +
									"' in " +
									this
							);
						if (
							object instanceof Field &&
							object.extend === undefined
						) {
							if (
								this._fieldsById
									? this._fieldsById[object.id]
									: this.fieldsById[object.id]
							)
								throw Error(
									"duplicate id " + object.id + " in " + this
								);
							if (this.isReservedId(object.id))
								throw Error(
									"id " +
										object.id +
										" is reserved in " +
										this
								);
							if (this.isReservedName(object.name))
								throw Error(
									"name '" +
										object.name +
										"' is reserved in " +
										this
								);
							if (object.parent) object.parent.remove(object);
							this.fields[object.name] = object;
							object.message = this;
							object.onAdd(this);
							return clearCache(this);
						}
						if (object instanceof OneOf) {
							if (!this.oneofs) this.oneofs = {};
							this.oneofs[object.name] = object;
							object.onAdd(this);
							return clearCache(this);
						}
						return Namespace.prototype.add.call(this, object);
					};
					Type.prototype.remove = function remove(object) {
						if (
							object instanceof Field &&
							object.extend === undefined
						) {
							if (
								!this.fields ||
								this.fields[object.name] !== object
							)
								throw Error(
									object + " is not a member of " + this
								);
							delete this.fields[object.name];
							object.parent = null;
							object.onRemove(this);
							return clearCache(this);
						}
						if (object instanceof OneOf) {
							if (
								!this.oneofs ||
								this.oneofs[object.name] !== object
							)
								throw Error(
									object + " is not a member of " + this
								);
							delete this.oneofs[object.name];
							object.parent = null;
							object.onRemove(this);
							return clearCache(this);
						}
						return Namespace.prototype.remove.call(this, object);
					};
					Type.prototype.isReservedId = function isReservedId(id) {
						return Namespace.isReservedId(this.reserved, id);
					};
					Type.prototype.isReservedName = function isReservedName(
						name
					) {
						return Namespace.isReservedName(this.reserved, name);
					};
					Type.prototype.create = function create(properties) {
						return new this.ctor(properties);
					};
					Type.prototype.setup = function setup() {
						var fullName = this.fullName,
							types = [];
						for (var i = 0; i < this.fieldsArray.length; ++i)
							types.push(
								this._fieldsArray[i].resolve().resolvedType
							);
						this.encode = encoder(this)({
							Writer: Writer,
							types: types,
							util: util,
						});
						this.decode = decoder(this)({
							Reader: Reader,
							types: types,
							util: util,
						});
						this.verify = verifier(this)({
							types: types,
							util: util,
						});
						this.fromObject = converter.fromObject(this)({
							types: types,
							util: util,
						});
						this.toObject = converter.toObject(this)({
							types: types,
							util: util,
						});
						var wrapper = wrappers[fullName];
						if (wrapper) {
							var originalThis = Object.create(this);
							originalThis.fromObject = this.fromObject;
							this.fromObject =
								wrapper.fromObject.bind(originalThis);
							originalThis.toObject = this.toObject;
							this.toObject = wrapper.toObject.bind(originalThis);
						}
						return this;
					};
					Type.prototype.encode = function encode_setup(
						message,
						writer
					) {
						return this.setup().encode(message, writer);
					};
					Type.prototype.encodeDelimited = function encodeDelimited(
						message,
						writer
					) {
						return this.encode(
							message,
							writer && writer.len ? writer.fork() : writer
						).ldelim();
					};
					Type.prototype.decode = function decode_setup(
						reader,
						length
					) {
						return this.setup().decode(reader, length);
					};
					Type.prototype.decodeDelimited = function decodeDelimited(
						reader
					) {
						if (!(reader instanceof Reader))
							reader = Reader.create(reader);
						return this.decode(reader, reader.uint32());
					};
					Type.prototype.verify = function verify_setup(message) {
						return this.setup().verify(message);
					};
					Type.prototype.fromObject = function fromObject(object) {
						return this.setup().fromObject(object);
					};
					Type.prototype.toObject = function toObject(
						message,
						options
					) {
						return this.setup().toObject(message, options);
					};
					Type.d = function decorateType(typeName) {
						return function typeDecorator(target) {
							util.decorateType(target, typeName);
						};
					};
				},
				{
					11: 11,
					12: 12,
					13: 13,
					14: 14,
					15: 15,
					18: 18,
					19: 19,
					21: 21,
					23: 23,
					24: 24,
					30: 30,
					33: 33,
					36: 36,
					37: 37,
					38: 38,
				},
			],
			32: [
				function (require, module, exports) {
					"use strict";
					var types = exports;
					var util = require(33);
					var s = [
						"double",
						"float",
						"int32",
						"uint32",
						"sint32",
						"fixed32",
						"sfixed32",
						"int64",
						"uint64",
						"sint64",
						"fixed64",
						"sfixed64",
						"bool",
						"string",
						"bytes",
					];
					function bake(values, offset) {
						var i = 0,
							o = {};
						offset |= 0;
						while (i < values.length)
							o[s[i + offset]] = values[i++];
						return o;
					}
					types.basic = bake([
						1, 5, 0, 0, 0, 5, 5, 0, 0, 0, 1, 1, 0, 2, 2,
					]);
					types.defaults = bake([
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						false,
						"",
						util.emptyArray,
						null,
					]);
					types.long = bake([0, 0, 0, 1, 1], 7);
					types.mapKey = bake(
						[0, 0, 0, 5, 5, 0, 0, 0, 1, 1, 0, 2],
						2
					);
					types.packed = bake([
						1, 5, 0, 0, 0, 5, 5, 0, 0, 0, 1, 1, 0,
					]);
				},
				{ 33: 33 },
			],
			33: [
				function (require, module, exports) {
					"use strict";
					var util = (module.exports = require(35));
					var roots = require(27);
					var Type, Enum;
					util.codegen = require(3);
					util.fetch = require(5);
					util.path = require(8);
					util.fs = util.inquire("fs");
					util.toArray = function toArray(object) {
						if (object) {
							var keys = Object.keys(object),
								array = new Array(keys.length),
								index = 0;
							while (index < keys.length)
								array[index] = object[keys[index++]];
							return array;
						}
						return [];
					};
					util.toObject = function toObject(array) {
						var object = {},
							index = 0;
						while (index < array.length) {
							var key = array[index++],
								val = array[index++];
							if (val !== undefined) object[key] = val;
						}
						return object;
					};
					var safePropBackslashRe = /\\/g,
						safePropQuoteRe = /"/g;
					util.isReserved = function isReserved(name) {
						return /^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/.test(
							name
						);
					};
					util.safeProp = function safeProp(prop) {
						if (!/^[$\w_]+$/.test(prop) || util.isReserved(prop))
							return (
								'["' +
								prop
									.replace(safePropBackslashRe, "\\\\")
									.replace(safePropQuoteRe, '\\"') +
								'"]'
							);
						return "." + prop;
					};
					util.ucFirst = function ucFirst(str) {
						return str.charAt(0).toUpperCase() + str.substring(1);
					};
					var camelCaseRe = /_([a-z])/g;
					util.camelCase = function camelCase(str) {
						return (
							str.substring(0, 1) +
							str
								.substring(1)
								.replace(camelCaseRe, function ($0, $1) {
									return $1.toUpperCase();
								})
						);
					};
					util.compareFieldsById = function compareFieldsById(a, b) {
						return a.id - b.id;
					};
					util.decorateType = function decorateType(ctor, typeName) {
						if (ctor.$type) {
							if (typeName && ctor.$type.name !== typeName) {
								util.decorateRoot.remove(ctor.$type);
								ctor.$type.name = typeName;
								util.decorateRoot.add(ctor.$type);
							}
							return ctor.$type;
						}
						if (!Type) Type = require(31);
						var type = new Type(typeName || ctor.name);
						util.decorateRoot.add(type);
						type.ctor = ctor;
						Object.defineProperty(ctor, "$type", {
							value: type,
							enumerable: false,
						});
						Object.defineProperty(ctor.prototype, "$type", {
							value: type,
							enumerable: false,
						});
						return type;
					};
					var decorateEnumIndex = 0;
					util.decorateEnum = function decorateEnum(object) {
						if (object.$type) return object.$type;
						if (!Enum) Enum = require(14);
						var enm = new Enum(
							"Enum" + decorateEnumIndex++,
							object
						);
						util.decorateRoot.add(enm);
						Object.defineProperty(object, "$type", {
							value: enm,
							enumerable: false,
						});
						return enm;
					};
					util.setProperty = function setProperty(dst, path, value) {
						function setProp(dst, path, value) {
							var part = path.shift();
							if (path.length > 0) {
								dst[part] = setProp(
									dst[part] || {},
									path,
									value
								);
							} else {
								var prevValue = dst[part];
								if (prevValue)
									value = [].concat(prevValue).concat(value);
								dst[part] = value;
							}
							return dst;
						}
						if (typeof dst !== "object")
							throw TypeError("dst must be an object");
						if (!path) throw TypeError("path must be specified");
						path = path.split(".");
						return setProp(dst, path, value);
					};
					Object.defineProperty(util, "decorateRoot", {
						get: function () {
							return (
								roots["decorated"] ||
								(roots["decorated"] = new (require(26))())
							);
						},
					});
				},
				{ 14: 14, 26: 26, 27: 27, 3: 3, 31: 31, 35: 35, 5: 5, 8: 8 },
			],
			34: [
				function (require, module, exports) {
					"use strict";
					module.exports = LongBits;
					var util = require(35);
					function LongBits(lo, hi) {
						this.lo = lo >>> 0;
						this.hi = hi >>> 0;
					}
					var zero = (LongBits.zero = new LongBits(0, 0));
					zero.toNumber = function () {
						return 0;
					};
					zero.zzEncode = zero.zzDecode = function () {
						return this;
					};
					zero.length = function () {
						return 1;
					};
					var zeroHash = (LongBits.zeroHash = "\0\0\0\0\0\0\0\0");
					LongBits.fromNumber = function fromNumber(value) {
						if (value === 0) return zero;
						var sign = value < 0;
						if (sign) value = -value;
						var lo = value >>> 0,
							hi = ((value - lo) / 4294967296) >>> 0;
						if (sign) {
							hi = ~hi >>> 0;
							lo = ~lo >>> 0;
							if (++lo > 4294967295) {
								lo = 0;
								if (++hi > 4294967295) hi = 0;
							}
						}
						return new LongBits(lo, hi);
					};
					LongBits.from = function from(value) {
						if (typeof value === "number")
							return LongBits.fromNumber(value);
						if (util.isString(value)) {
							if (util.Long) value = util.Long.fromString(value);
							else
								return LongBits.fromNumber(parseInt(value, 10));
						}
						return value.low || value.high
							? new LongBits(value.low >>> 0, value.high >>> 0)
							: zero;
					};
					LongBits.prototype.toNumber = function toNumber(unsigned) {
						if (!unsigned && this.hi >>> 31) {
							var lo = (~this.lo + 1) >>> 0,
								hi = ~this.hi >>> 0;
							if (!lo) hi = (hi + 1) >>> 0;
							return -(lo + hi * 4294967296);
						}
						return this.lo + this.hi * 4294967296;
					};
					LongBits.prototype.toLong = function toLong(unsigned) {
						return util.Long
							? new util.Long(
									this.lo | 0,
									this.hi | 0,
									Boolean(unsigned)
							  )
							: {
									low: this.lo | 0,
									high: this.hi | 0,
									unsigned: Boolean(unsigned),
							  };
					};
					var charCodeAt = String.prototype.charCodeAt;
					LongBits.fromHash = function fromHash(hash) {
						if (hash === zeroHash) return zero;
						return new LongBits(
							(charCodeAt.call(hash, 0) |
								(charCodeAt.call(hash, 1) << 8) |
								(charCodeAt.call(hash, 2) << 16) |
								(charCodeAt.call(hash, 3) << 24)) >>>
								0,
							(charCodeAt.call(hash, 4) |
								(charCodeAt.call(hash, 5) << 8) |
								(charCodeAt.call(hash, 6) << 16) |
								(charCodeAt.call(hash, 7) << 24)) >>>
								0
						);
					};
					LongBits.prototype.toHash = function toHash() {
						return String.fromCharCode(
							this.lo & 255,
							(this.lo >>> 8) & 255,
							(this.lo >>> 16) & 255,
							this.lo >>> 24,
							this.hi & 255,
							(this.hi >>> 8) & 255,
							(this.hi >>> 16) & 255,
							this.hi >>> 24
						);
					};
					LongBits.prototype.zzEncode = function zzEncode() {
						var mask = this.hi >> 31;
						this.hi =
							(((this.hi << 1) | (this.lo >>> 31)) ^ mask) >>> 0;
						this.lo = ((this.lo << 1) ^ mask) >>> 0;
						return this;
					};
					LongBits.prototype.zzDecode = function zzDecode() {
						var mask = -(this.lo & 1);
						this.lo =
							(((this.lo >>> 1) | (this.hi << 31)) ^ mask) >>> 0;
						this.hi = ((this.hi >>> 1) ^ mask) >>> 0;
						return this;
					};
					LongBits.prototype.length = function length() {
						var part0 = this.lo,
							part1 = ((this.lo >>> 28) | (this.hi << 4)) >>> 0,
							part2 = this.hi >>> 24;
						return part2 === 0
							? part1 === 0
								? part0 < 16384
									? part0 < 128
										? 1
										: 2
									: part0 < 2097152
									? 3
									: 4
								: part1 < 16384
								? part1 < 128
									? 5
									: 6
								: part1 < 2097152
								? 7
								: 8
							: part2 < 128
							? 9
							: 10;
					};
				},
				{ 35: 35 },
			],
			35: [
				function (require, module, exports) {
					"use strict";
					var util = exports;
					util.asPromise = require(1);
					util.base64 = require(2);
					util.EventEmitter = require(4);
					util.float = require(6);
					util.inquire = require(7);
					util.utf8 = require(10);
					util.pool = require(9);
					util.LongBits = require(34);
					util.isNode = Boolean(
						typeof global !== "undefined" &&
							global &&
							global.process &&
							global.process.versions &&
							global.process.versions.node
					);
					util.global =
						(util.isNode && global) ||
						(typeof window !== "undefined" && window) ||
						(typeof self !== "undefined" && self) ||
						this;
					util.emptyArray = Object.freeze ? Object.freeze([]) : [];
					util.emptyObject = Object.freeze ? Object.freeze({}) : {};
					util.isInteger =
						Number.isInteger ||
						function isInteger(value) {
							return (
								typeof value === "number" &&
								isFinite(value) &&
								Math.floor(value) === value
							);
						};
					util.isString = function isString(value) {
						return (
							typeof value === "string" || value instanceof String
						);
					};
					util.isObject = function isObject(value) {
						return value && typeof value === "object";
					};
					util.isset = util.isSet = function isSet(obj, prop) {
						var value = obj[prop];
						if (value != null && obj.hasOwnProperty(prop))
							return (
								typeof value !== "object" ||
								(Array.isArray(value)
									? value.length
									: Object.keys(value).length) > 0
							);
						return false;
					};
					util.Buffer = (function () {
						try {
							var Buffer = util.inquire("buffer").Buffer;
							return Buffer.prototype.utf8Write ? Buffer : null;
						} catch (e) {
							return null;
						}
					})();
					util._Buffer_from = null;
					util._Buffer_allocUnsafe = null;
					util.newBuffer = function newBuffer(sizeOrArray) {
						return typeof sizeOrArray === "number"
							? util.Buffer
								? util._Buffer_allocUnsafe(sizeOrArray)
								: new util.Array(sizeOrArray)
							: util.Buffer
							? util._Buffer_from(sizeOrArray)
							: typeof Uint8Array === "undefined"
							? sizeOrArray
							: new Uint8Array(sizeOrArray);
					};
					util.Array =
						typeof Uint8Array !== "undefined" ? Uint8Array : Array;
					util.Long =
						(util.global.dcodeIO && util.global.dcodeIO.Long) ||
						util.global.Long ||
						util.inquire("long");
					util.key2Re = /^true|false|0|1$/;
					util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
					util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
					util.longToHash = function longToHash(value) {
						return value
							? util.LongBits.from(value).toHash()
							: util.LongBits.zeroHash;
					};
					util.longFromHash = function longFromHash(hash, unsigned) {
						var bits = util.LongBits.fromHash(hash);
						if (util.Long)
							return util.Long.fromBits(
								bits.lo,
								bits.hi,
								unsigned
							);
						return bits.toNumber(Boolean(unsigned));
					};
					function merge(dst, src, ifNotSet) {
						for (
							var keys = Object.keys(src), i = 0;
							i < keys.length;
							++i
						)
							if (dst[keys[i]] === undefined || !ifNotSet)
								dst[keys[i]] = src[keys[i]];
						return dst;
					}
					util.merge = merge;
					util.lcFirst = function lcFirst(str) {
						return str.charAt(0).toLowerCase() + str.substring(1);
					};
					function newError(name) {
						function CustomError(message, properties) {
							if (!(this instanceof CustomError))
								return new CustomError(message, properties);
							Object.defineProperty(this, "message", {
								get: function () {
									return message;
								},
							});
							if (Error.captureStackTrace)
								Error.captureStackTrace(this, CustomError);
							else
								Object.defineProperty(this, "stack", {
									value: new Error().stack || "",
								});
							if (properties) merge(this, properties);
						}
						(CustomError.prototype = Object.create(
							Error.prototype
						)).constructor = CustomError;
						Object.defineProperty(CustomError.prototype, "name", {
							get: function () {
								return name;
							},
						});
						CustomError.prototype.toString = function toString() {
							return this.name + ": " + this.message;
						};
						return CustomError;
					}
					util.newError = newError;
					util.ProtocolError = newError("ProtocolError");
					util.oneOfGetter = function getOneOf(fieldNames) {
						var fieldMap = {};
						for (var i = 0; i < fieldNames.length; ++i)
							fieldMap[fieldNames[i]] = 1;
						return function () {
							for (
								var keys = Object.keys(this),
									i = keys.length - 1;
								i > -1;
								--i
							)
								if (
									fieldMap[keys[i]] === 1 &&
									this[keys[i]] !== undefined &&
									this[keys[i]] !== null
								)
									return keys[i];
						};
					};
					util.oneOfSetter = function setOneOf(fieldNames) {
						return function (name) {
							for (var i = 0; i < fieldNames.length; ++i)
								if (fieldNames[i] !== name)
									delete this[fieldNames[i]];
						};
					};
					util.toJSONOptions = {
						longs: String,
						enums: String,
						bytes: String,
						json: true,
					};
					util._configure = function () {
						var Buffer = util.Buffer;
						if (!Buffer) {
							util._Buffer_from = util._Buffer_allocUnsafe = null;
							return;
						}
						util._Buffer_from =
							(Buffer.from !== Uint8Array.from && Buffer.from) ||
							function Buffer_from(value, encoding) {
								return new Buffer(value, encoding);
							};
						util._Buffer_allocUnsafe =
							Buffer.allocUnsafe ||
							function Buffer_allocUnsafe(size) {
								return new Buffer(size);
							};
					};
				},
				{ 1: 1, 10: 10, 2: 2, 34: 34, 4: 4, 6: 6, 7: 7, 9: 9 },
			],
			36: [
				function (require, module, exports) {
					"use strict";
					module.exports = verifier;
					var Enum = require(14),
						util = require(33);
					function invalid(field, expected) {
						return (
							field.name +
							": " +
							expected +
							(field.repeated && expected !== "array"
								? "[]"
								: field.map && expected !== "object"
								? "{k:" + field.keyType + "}"
								: "") +
							" expected"
						);
					}
					function genVerifyValue(gen, field, fieldIndex, ref) {
						if (field.resolvedType) {
							if (field.resolvedType instanceof Enum) {
								gen("switch(%s){", ref)("default:")(
									"return%j",
									invalid(field, "enum value")
								);
								for (
									var keys = Object.keys(
											field.resolvedType.values
										),
										j = 0;
									j < keys.length;
									++j
								)
									gen(
										"case %i:",
										field.resolvedType.values[keys[j]]
									);
								gen("break")("}");
							} else {
								gen("{")(
									"var e=types[%i].verify(%s);",
									fieldIndex,
									ref
								)("if(e)")(
									"return%j+e",
									field.name + "."
								)("}");
							}
						} else {
							switch (field.type) {
								case "int32":
								case "uint32":
								case "sint32":
								case "fixed32":
								case "sfixed32":
									gen("if(!util.isInteger(%s))", ref)(
										"return%j",
										invalid(field, "integer")
									);
									break;
								case "int64":
								case "uint64":
								case "sint64":
								case "fixed64":
								case "sfixed64":
									gen(
										"if(!util.isInteger(%s)&&!(%s&&util.isInteger(%s.low)&&util.isInteger(%s.high)))",
										ref,
										ref,
										ref,
										ref
									)(
										"return%j",
										invalid(field, "integer|Long")
									);
									break;
								case "float":
								case "double":
									gen('if(typeof %s!=="number")', ref)(
										"return%j",
										invalid(field, "number")
									);
									break;
								case "bool":
									gen('if(typeof %s!=="boolean")', ref)(
										"return%j",
										invalid(field, "boolean")
									);
									break;
								case "string":
									gen("if(!util.isString(%s))", ref)(
										"return%j",
										invalid(field, "string")
									);
									break;
								case "bytes":
									gen(
										'if(!(%s&&typeof %s.length==="number"||util.isString(%s)))',
										ref,
										ref,
										ref
									)("return%j", invalid(field, "buffer"));
									break;
							}
						}
						return gen;
					}
					function genVerifyKey(gen, field, ref) {
						switch (field.keyType) {
							case "int32":
							case "uint32":
							case "sint32":
							case "fixed32":
							case "sfixed32":
								gen("if(!util.key32Re.test(%s))", ref)(
									"return%j",
									invalid(field, "integer key")
								);
								break;
							case "int64":
							case "uint64":
							case "sint64":
							case "fixed64":
							case "sfixed64":
								gen("if(!util.key64Re.test(%s))", ref)(
									"return%j",
									invalid(field, "integer|Long key")
								);
								break;
							case "bool":
								gen("if(!util.key2Re.test(%s))", ref)(
									"return%j",
									invalid(field, "boolean key")
								);
								break;
						}
						return gen;
					}
					function verifier(mtype) {
						var gen = util.codegen(
							["m"],
							mtype.name + "$verify"
						)('if(typeof m!=="object"||m===null)')(
							"return%j",
							"object expected"
						);
						var oneofs = mtype.oneofsArray,
							seenFirstField = {};
						if (oneofs.length) gen("var p={}");
						for (var i = 0; i < mtype.fieldsArray.length; ++i) {
							var field = mtype._fieldsArray[i].resolve(),
								ref = "m" + util.safeProp(field.name);
							if (field.optional)
								gen(
									"if(%s!=null&&m.hasOwnProperty(%j)){",
									ref,
									field.name
								);
							if (field.map) {
								gen("if(!util.isObject(%s))", ref)(
									"return%j",
									invalid(field, "object")
								)(
									"var k=Object.keys(%s)",
									ref
								)("for(var i=0;i<k.length;++i){");
								genVerifyKey(gen, field, "k[i]");
								genVerifyValue(
									gen,
									field,
									i,
									ref + "[k[i]]"
								)("}");
							} else if (field.repeated) {
								gen("if(!Array.isArray(%s))", ref)(
									"return%j",
									invalid(field, "array")
								)("for(var i=0;i<%s.length;++i){", ref);
								genVerifyValue(gen, field, i, ref + "[i]")("}");
							} else {
								if (field.partOf) {
									var oneofProp = util.safeProp(
										field.partOf.name
									);
									if (seenFirstField[field.partOf.name] === 1)
										gen("if(p%s===1)", oneofProp)(
											"return%j",
											field.partOf.name +
												": multiple values"
										);
									seenFirstField[field.partOf.name] = 1;
									gen("p%s=1", oneofProp);
								}
								genVerifyValue(gen, field, i, ref);
							}
							if (field.optional) gen("}");
						}
						return gen("return null");
					}
				},
				{ 14: 14, 33: 33 },
			],
			37: [
				function (require, module, exports) {
					"use strict";
					var wrappers = exports;
					var Message = require(19);
					wrappers[".google.protobuf.Any"] = {
						fromObject: function (object) {
							if (object && object["@type"]) {
								var name = object["@type"].substring(
									object["@type"].lastIndexOf("/") + 1
								);
								var type = this.lookup(name);
								if (type) {
									var type_url =
										object["@type"].charAt(0) === "."
											? object["@type"].substr(1)
											: object["@type"];
									if (type_url.indexOf("/") === -1) {
										type_url = "/" + type_url;
									}
									return this.create({
										type_url: type_url,
										value: type
											.encode(type.fromObject(object))
											.finish(),
									});
								}
							}
							return this.fromObject(object);
						},
						toObject: function (message, options) {
							var googleApi = "type.googleapis.com/";
							var prefix = "";
							var name = "";
							if (
								options &&
								options.json &&
								message.type_url &&
								message.value
							) {
								name = message.type_url.substring(
									message.type_url.lastIndexOf("/") + 1
								);
								prefix = message.type_url.substring(
									0,
									message.type_url.lastIndexOf("/") + 1
								);
								var type = this.lookup(name);
								if (type) message = type.decode(message.value);
							}
							if (
								!(message instanceof this.ctor) &&
								message instanceof Message
							) {
								var object = message.$type.toObject(
									message,
									options
								);
								var messageName =
									message.$type.fullName[0] === "."
										? message.$type.fullName.substr(1)
										: message.$type.fullName;
								if (prefix === "") {
									prefix = googleApi;
								}
								name = prefix + messageName;
								object["@type"] = name;
								return object;
							}
							return this.toObject(message, options);
						},
					};
				},
				{ 19: 19 },
			],
			38: [
				function (require, module, exports) {
					"use strict";
					module.exports = Writer;
					var util = require(35);
					var BufferWriter;
					var LongBits = util.LongBits,
						base64 = util.base64,
						utf8 = util.utf8;
					function Op(fn, len, val) {
						this.fn = fn;
						this.len = len;
						this.next = undefined;
						this.val = val;
					}
					function noop() {}
					function State(writer) {
						this.head = writer.head;
						this.tail = writer.tail;
						this.len = writer.len;
						this.next = writer.states;
					}
					function Writer() {
						this.len = 0;
						this.head = new Op(noop, 0, 0);
						this.tail = this.head;
						this.states = null;
					}
					var create = function create() {
						return util.Buffer
							? function create_buffer_setup() {
									return (Writer.create =
										function create_buffer() {
											return new BufferWriter();
										})();
							  }
							: function create_array() {
									return new Writer();
							  };
					};
					Writer.create = create();
					Writer.alloc = function alloc(size) {
						return new util.Array(size);
					};
					if (util.Array !== Array)
						Writer.alloc = util.pool(
							Writer.alloc,
							util.Array.prototype.subarray
						);
					Writer.prototype._push = function push(fn, len, val) {
						this.tail = this.tail.next = new Op(fn, len, val);
						this.len += len;
						return this;
					};
					function writeByte(val, buf, pos) {
						buf[pos] = val & 255;
					}
					function writeVarint32(val, buf, pos) {
						while (val > 127) {
							buf[pos++] = (val & 127) | 128;
							val >>>= 7;
						}
						buf[pos] = val;
					}
					function VarintOp(len, val) {
						this.len = len;
						this.next = undefined;
						this.val = val;
					}
					VarintOp.prototype = Object.create(Op.prototype);
					VarintOp.prototype.fn = writeVarint32;
					Writer.prototype.uint32 = function write_uint32(value) {
						this.len += (this.tail = this.tail.next =
							new VarintOp(
								(value = value >>> 0) < 128
									? 1
									: value < 16384
									? 2
									: value < 2097152
									? 3
									: value < 268435456
									? 4
									: 5,
								value
							)).len;
						return this;
					};
					Writer.prototype.int32 = function write_int32(value) {
						return value < 0
							? this._push(
									writeVarint64,
									10,
									LongBits.fromNumber(value)
							  )
							: this.uint32(value);
					};
					Writer.prototype.sint32 = function write_sint32(value) {
						return this.uint32(
							((value << 1) ^ (value >> 31)) >>> 0
						);
					};
					function writeVarint64(val, buf, pos) {
						while (val.hi) {
							buf[pos++] = (val.lo & 127) | 128;
							val.lo = ((val.lo >>> 7) | (val.hi << 25)) >>> 0;
							val.hi >>>= 7;
						}
						while (val.lo > 127) {
							buf[pos++] = (val.lo & 127) | 128;
							val.lo = val.lo >>> 7;
						}
						buf[pos++] = val.lo;
					}
					Writer.prototype.uint64 = function write_uint64(value) {
						var bits = LongBits.from(value);
						return this._push(writeVarint64, bits.length(), bits);
					};
					Writer.prototype.int64 = Writer.prototype.uint64;
					Writer.prototype.sint64 = function write_sint64(value) {
						var bits = LongBits.from(value).zzEncode();
						return this._push(writeVarint64, bits.length(), bits);
					};
					Writer.prototype.bool = function write_bool(value) {
						return this._push(writeByte, 1, value ? 1 : 0);
					};
					function writeFixed32(val, buf, pos) {
						buf[pos] = val & 255;
						buf[pos + 1] = (val >>> 8) & 255;
						buf[pos + 2] = (val >>> 16) & 255;
						buf[pos + 3] = val >>> 24;
					}
					Writer.prototype.fixed32 = function write_fixed32(value) {
						return this._push(writeFixed32, 4, value >>> 0);
					};
					Writer.prototype.sfixed32 = Writer.prototype.fixed32;
					Writer.prototype.fixed64 = function write_fixed64(value) {
						var bits = LongBits.from(value);
						return this._push(writeFixed32, 4, bits.lo)._push(
							writeFixed32,
							4,
							bits.hi
						);
					};
					Writer.prototype.sfixed64 = Writer.prototype.fixed64;
					Writer.prototype.float = function write_float(value) {
						return this._push(util.float.writeFloatLE, 4, value);
					};
					Writer.prototype.double = function write_double(value) {
						return this._push(util.float.writeDoubleLE, 8, value);
					};
					var writeBytes = util.Array.prototype.set
						? function writeBytes_set(val, buf, pos) {
								buf.set(val, pos);
						  }
						: function writeBytes_for(val, buf, pos) {
								for (var i = 0; i < val.length; ++i)
									buf[pos + i] = val[i];
						  };
					Writer.prototype.bytes = function write_bytes(value) {
						var len = value.length >>> 0;
						if (!len) return this._push(writeByte, 1, 0);
						if (util.isString(value)) {
							var buf = Writer.alloc(
								(len = base64.length(value))
							);
							base64.decode(value, buf, 0);
							value = buf;
						}
						return this.uint32(len)._push(writeBytes, len, value);
					};
					Writer.prototype.string = function write_string(value) {
						var len = utf8.length(value);
						return len
							? this.uint32(len)._push(utf8.write, len, value)
							: this._push(writeByte, 1, 0);
					};
					Writer.prototype.fork = function fork() {
						this.states = new State(this);
						this.head = this.tail = new Op(noop, 0, 0);
						this.len = 0;
						return this;
					};
					Writer.prototype.reset = function reset() {
						if (this.states) {
							this.head = this.states.head;
							this.tail = this.states.tail;
							this.len = this.states.len;
							this.states = this.states.next;
						} else {
							this.head = this.tail = new Op(noop, 0, 0);
							this.len = 0;
						}
						return this;
					};
					Writer.prototype.ldelim = function ldelim() {
						var head = this.head,
							tail = this.tail,
							len = this.len;
						this.reset().uint32(len);
						if (len) {
							this.tail.next = head.next;
							this.tail = tail;
							this.len += len;
						}
						return this;
					};
					Writer.prototype.finish = function finish() {
						var head = this.head.next,
							buf = this.constructor.alloc(this.len),
							pos = 0;
						while (head) {
							head.fn(head.val, buf, pos);
							pos += head.len;
							head = head.next;
						}
						return buf;
					};
					Writer._configure = function (BufferWriter_) {
						BufferWriter = BufferWriter_;
						Writer.create = create();
						BufferWriter._configure();
					};
				},
				{ 35: 35 },
			],
			39: [
				function (require, module, exports) {
					"use strict";
					module.exports = BufferWriter;
					var Writer = require(38);
					(BufferWriter.prototype = Object.create(
						Writer.prototype
					)).constructor = BufferWriter;
					var util = require(35);
					function BufferWriter() {
						Writer.call(this);
					}
					BufferWriter._configure = function () {
						BufferWriter.alloc = util._Buffer_allocUnsafe;
						BufferWriter.writeBytesBuffer =
							util.Buffer &&
							util.Buffer.prototype instanceof Uint8Array &&
							util.Buffer.prototype.set.name === "set"
								? function writeBytesBuffer_set(val, buf, pos) {
										buf.set(val, pos);
								  }
								: function writeBytesBuffer_copy(
										val,
										buf,
										pos
								  ) {
										if (val.copy)
											val.copy(buf, pos, 0, val.length);
										else
											for (var i = 0; i < val.length; )
												buf[pos++] = val[i++];
								  };
					};
					BufferWriter.prototype.bytes = function write_bytes_buffer(
						value
					) {
						if (util.isString(value))
							value = util._Buffer_from(value, "base64");
						var len = value.length >>> 0;
						this.uint32(len);
						if (len)
							this._push(
								BufferWriter.writeBytesBuffer,
								len,
								value
							);
						return this;
					};
					function writeStringBuffer(val, buf, pos) {
						if (val.length < 40) util.utf8.write(val, buf, pos);
						else if (buf.utf8Write) buf.utf8Write(val, pos);
						else buf.write(val, pos);
					}
					BufferWriter.prototype.string =
						function write_string_buffer(value) {
							var len = util.Buffer.byteLength(value);
							this.uint32(len);
							if (len) this._push(writeStringBuffer, len, value);
							return this;
						};
					BufferWriter._configure();
				},
				{ 35: 35, 38: 38 },
			],
		},
		{},
		[16]
	);
})();
const spotifyJson = {
	nested: {
		BootstrapResponse: {
			fields: {
				ucsResponseV0: { type: "UcsResponseWrapperV0", id: 2 },
				trialsFacadeResponseV1: {
					type: "TrialsFacadeResponseWrapperV1",
					id: 3,
				},
			},
		},
		UcsResponseWrapperV0: {
			fields: {
				success: { type: "UcsResponseWrapperSuccess", id: 1 },
				error: { type: "UcsResponseWrapperError", id: 2 },
			},
		},
		UcsResponseWrapperSuccess: {
			fields: { customization: { type: "UcsResponseWrapper", id: 1 } },
		},
		UcsResponseWrapperError: {
			fields: {
				errorCode: { type: "int32", id: 1 },
				message: { type: "string", id: 2 },
				logId: { type: "string", id: 3 },
			},
		},
		TrialsFacadeResponseWrapperV1: {
			fields: {
				success: { type: "TrialsFacadeResponseWrapperSuccess", id: 1 },
				error: { type: "TrialsFacadeResponseWrapperError", id: 2 },
			},
		},
		TrialsFacadeResponseWrapperError: {
			fields: {
				errorCode: { type: "int32", id: 1 },
				message: { type: "string", id: 2 },
				logId: { type: "string", id: 3 },
			},
		},
		TrialsFacadeResponseWrapperSuccess: {
			fields: { field1: { type: "int32", id: 1 } },
		},
		UcsResponseWrapper: {
			fields: {
				success: { type: "UcsResponse", id: 1 },
				error: { type: "Error", id: 2 },
			},
		},
		UcsResponse: {
			fields: {
				resolveSuccess: { type: "ResolveResponse", id: 1 },
				resolveError: { type: "Error", id: 2 },
				accountAttributesSuccess: {
					type: "AccountAttributesResponse",
					id: 3,
				},
				accountAttributesError: { type: "Error", id: 4 },
				fetchTimeMillis: { type: "int64", id: 5 },
			},
		},
		ResolveResponse: {
			fields: { configuration: { type: "Configuration", id: 1 } },
		},
		Configuration: {
			fields: {
				configurationAssignmentId: { type: "string", id: 1 },
				fetchTimeMillis: { type: "int64", id: 2 },
				assignedValues: {
					rule: "repeated",
					type: "AssignedValue",
					id: 3,
				},
			},
		},
		AssignedValue: {
			fields: {
				propertyId: { type: "Identifier", id: 1 },
				metadata: { type: "Metadata", id: 2 },
				boolValue: { type: "BoolValue", id: 3 },
				intValue: { type: "IntValue", id: 4 },
				enumValue: { type: "EnumValue", id: 5 },
			},
		},
		Identifier: {
			fields: {
				scope: { type: "string", id: 1 },
				name: { type: "string", id: 2 },
			},
		},
		Metadata: {
			fields: {
				policyId: { type: "int64", id: 1 },
				externalRealm: { type: "string", id: 2 },
				externalRealmId: { type: "int64", id: 3 },
			},
		},
		BoolValue: { fields: { value: { type: "bool", id: 1 } } },
		EnumValue: { fields: { value: { type: "string", id: 1 } } },
		IntValue: { fields: { value: { type: "int32", id: 1 } } },
		AccountAttributesResponse: {
			fields: {
				accountAttributes: {
					keyType: "string",
					type: "AccountAttribute",
					id: 1,
				},
			},
		},
		AccountAttribute: {
			fields: {
				boolValue: { type: "bool", id: 2 },
				longValue: { type: "int64", id: 3 },
				stringValue: { type: "string", id: 4 },
			},
		},
		Error: {
			fields: {
				errorCode: { type: "int32", id: 1 },
				errorMessage: { type: "string", id: 2 },
			},
		},
	},
};
let accountAttributesMap;

const url = $request.url;
const method = $request.method;
const postMethod = "POST";
const isQuanX = typeof $task != "undefined";
const binaryBody = isQuanX
	? new Uint8Array($response.bodyBytes)
	: $response.body;
let body;
if (url.indexOf("bootstrap/v1/bootstrap") !== -1 && method === postMethod) {
	let bootstrapResponseType =
		protobuf.Root.fromJSON(spotifyJson).lookupType("BootstrapResponse");
	let bootstrapResponseMessage = bootstrapResponseType.decode(binaryBody);
	accountAttributesMap =
		bootstrapResponseMessage.ucsResponseV0.success.customization.success
			.accountAttributesSuccess.accountAttributes;
	processMap(accountAttributesMap);
	body = bootstrapResponseType.encode(bootstrapResponseMessage).finish();
	console.log("bootstrap");
} else if (
	url.indexOf("user-customization-service/v1/customize") !== -1 &&
	method === postMethod
) {
	let ucsResponseWrapperType =
		protobuf.Root.fromJSON(spotifyJson).lookupType("UcsResponseWrapper");
	let ucsResponseWrapperMessage = ucsResponseWrapperType.decode(binaryBody);
	accountAttributesMap =
		ucsResponseWrapperMessage.success.accountAttributesSuccess
			.accountAttributes;
	processMap(accountAttributesMap);
	body = ucsResponseWrapperType.encode(ucsResponseWrapperMessage).finish();
	console.log("customize");
} else {
	$notification.post(
		"spotify解锁premium",
		"路径/请求方法匹配错误:",
		method + "," + url
	);
}
console.log(`${body.byteLength}---${body.buffer.byteLength}`);
if (isQuanX) {
	$done({
		bodyBytes: body.buffer.slice(
			body.byteOffset,
			body.byteLength + body.byteOffset
		),
	});
} else {
	$done({ body });
}

function processMap(accountAttributesMap) {
	accountAttributesMap["type"]["stringValue"] = "premium";
	accountAttributesMap["pause-after"]["longValue"] = 0;
	accountAttributesMap["license-acceptance-grace-days"]["longValue"] = 30;
	accountAttributesMap["audio-quality"]["stringValue"] = "1";
	accountAttributesMap["name"]["stringValue"] = "Spotify Premium";
	accountAttributesMap["catalogue"]["stringValue"] = "premium";
	accountAttributesMap["player-license"]["stringValue"] = "premium";
	accountAttributesMap["shuffle"]["boolValue"] = false;
	accountAttributesMap["ads"]["boolValue"] = false;
	accountAttributesMap["on-demand"]["boolValue"] = true; // 新增

	accountAttributesMap["unrestricted"] = deepCopy(
		accountAttributesMap["shuffle"]
	);
	accountAttributesMap["unrestricted"]["boolValue"] = true;
	accountAttributesMap["unrestricted"]["longValue"] = 0;

	accountAttributesMap["shuffle-eligible"] = deepCopy(
		accountAttributesMap["unrestricted"]
	);

	accountAttributesMap["com.spotify.madprops.use.ucs.product.state"][
		"boolValue"
	] = true;

	// accountAttributesMap['payments-initial-campaign'] = deepCopy(accountAttributesMap['unrestricted']);
	// accountAttributesMap['payments-initial-campaign']['boolValue'] = false;
	// accountAttributesMap['payments-initial-campaign']['longValue'] = 0;
	// accountAttributesMap['payments-initial-campaign']['stringValue'] = 'default';
	//
	accountAttributesMap["loudness-levels"] = deepCopy(
		accountAttributesMap["unrestricted"]
	);
	accountAttributesMap["loudness-levels"]["boolValue"] = false;
	accountAttributesMap["loudness-levels"]["longValue"] = 0;
	accountAttributesMap["loudness-levels"]["stringValue"] =
		"1:-9.0,0.0,3.0:-2.0";

	accountAttributesMap["mobile-login"]["boolValue"] = true;
	accountAttributesMap["mobile"]["boolValue"] = true;

	accountAttributesMap["nft-disabled"]["stringValue"] = "1";

	accountAttributesMap["streaming-rules"]["stringValue"] = "";

	delete accountAttributesMap["ad-catalogues"];
	delete accountAttributesMap["ad-use-adlogic"];
	// delete accountAttributesMap['filter-explicit-content'];

	accountAttributesMap["high-bitrate"]["boolValue"] = true; // 新增
	accountAttributesMap["libspotify"]["boolValue"] = true; // 新增
	accountAttributesMap["can_use_superbird"]["boolValue"] = true; // 新增
	accountAttributesMap["offline"]["boolValue"] = true; // 新增
}

function deepCopy(data, hash = new WeakMap()) {
	if (typeof data !== "object" || data === null) {
		throw new TypeError("传入参数不是对象");
	}
	// 判断传入的待拷贝对象的引用是否存在于hash中
	if (hash.has(data)) {
		return hash.get(data);
	}
	let newData = {};
	const dataKeys = Object.keys(data);
	dataKeys.forEach((value) => {
		const currentDataValue = data[value];
		// 基本数据类型的值和函数直接赋值拷贝
		if (typeof currentDataValue !== "object" || currentDataValue === null) {
			newData[value] = currentDataValue;
		} else if (Array.isArray(currentDataValue)) {
			// 实现数组的深拷贝
			newData[value] = [...currentDataValue];
		} else if (currentDataValue instanceof Set) {
			// 实现set数据的深拷贝
			newData[value] = new Set([...currentDataValue]);
		} else if (currentDataValue instanceof Map) {
			// 实现map数据的深拷贝
			newData[value] = new Map([...currentDataValue]);
		} else {
			// 将这个待拷贝对象的引用存于hash中
			hash.set(data, data);
			// 普通对象则递归赋值
			newData[value] = deepCopy(currentDataValue, hash);
		}
	});
	return newData;
}
