'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var GoogleMapsHelper =
/*#__PURE__*/
function () {
  function GoogleMapsHelper(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, GoogleMapsHelper);

    this.element = element;
    this.initialized = false;
    this.infoWindow = false;
    this.markers = [];
    this.options = {
      center: 'Mountain View, California',
      fallbackZoom: 6,
      google: {
        callback: 'initMap',
        key: null,
        language: 'en',
        region: 'US',
        url: 'https://maps.googleapis.com/maps/api/js'
      },
      infoWindow: false,
      iniDelay: 500,
      markers: false,
      maxZoom: 21,
      minZoom: 1,
      on: {
        initialized: null,
        markerCreated: null,
        markerSpawned: null
      },
      throttle: {
        apply: true,
        rate: 50
      }
    };
    this.queue = [];

    for (var opt in this.options) {
      if ('undefined' == typeof options[opt]) continue;

      if ('object' == _typeof(this.options[opt])) {
        for (var inopt in this.options[opt]) {
          if ('undefined' == typeof options[opt][inopt]) continue;
          this.options[opt][inopt] = options[opt][inopt];
        }
      } else {
        this.options[opt] = options[opt];
      }
    }

    var gjs = document.createElement('script');
    gjs.src = this._getUrl();
    document.body.appendChild(gjs);
  }

  _createClass(GoogleMapsHelper, [{
    key: "init",
    value: function init() {
      var self = this;
      setTimeout(function () {
        self._initialize();
      }, this.options.iniDelay);
      return this;
    }
  }, {
    key: "setCenterOn",
    value: function setCenterOn(address) {
      var _this = this;

      this._call('geoCode', address).then(function (resA) {
        _this._call('getCenter', resA.geometry).then(function (resB) {
          _this.map.setZoom(_this.options.fallbackZoom);

          _this.map.panTo(resB.center);

          _this.map.setZoom(_this._getZoom(resA.geometry.viewport));
        });
      });
    }
  }, {
    key: "_call",
    value: function _call(fname) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var self = this;
      return new Promise(function (res, rej) {
        return self['_' + fname](self, {
          resolve: res,
          reject: rej
        }, args);
      });
    }
  }, {
    key: "_initialize",
    value: function _initialize() {
      var _this2 = this;

      if ('object' != (typeof google === "undefined" ? "undefined" : _typeof(google))) {
        throw 'Google object not found! Try increasing "iniDelay" value.';
      }

      this.google = google.maps;
      var self = this;

      this._call('geoCode', this.options.center).then(function (resA) {
        _this2._call('getCenter', resA.geometry).then(function (resB) {
          _this2.map = new _this2.google.Map(_this2.element, resB);
          setTimeout(function () {
            self.map.setZoom(self._getZoom(resA.geometry.bounds || resA.geometry.viewport));
          }, _this2.options.iniDelay / 2);

          if (_this2.options.markers != false) {
            _this2._call('setMarkers', _this2.options.markers).then(function (res) {
              if (_this2.options.infoWindow != false) {
                _this2._call('setWindows', res, _this2.options.infoWindow);
              }
            });
          }
        });
      });

      if (null !== this.options.on.initialized) {
        return this.options.on.initialized();
      }

      return true;
    }
  }, {
    key: "_closeWindow",
    value: function _closeWindow(ctx, promise) {
      if (ctx.infoWindow !== false) {
        ctx.infoWindow.close();
        ctx.infoWindow = false;
      }

      return promise.resolve(true);
    }
  }, {
    key: "_setWindows",
    value: function _setWindows(ctx, promise, data) {
      var markers = data[0];
      var template = data[1];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var m = _step.value;
          ctx.google.event.addListener(m.marker, 'click', function () {
            ctx._call('closeWindow').then(function (res) {
              var w = new ctx.google.InfoWindow({
                content: ctx._parseTemplate(template, m.data)
              });
              w.open(ctx.map, m.marker);
              ctx.infoWindow = w;
            });
          });
        };

        for (var _iterator = markers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return promise.resolve(true);
    }
  }, {
    key: "_setMarkers",
    value: function _setMarkers(ctx, promise, data) {
      var fin = data[0].length;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        var _loop2 = function _loop2() {
          var i = _step2.value;

          if ('undefined' === typeof i.lat || 'undefined' === typeof i.lng || i.lat.length < 1 || i.lng.length < 1) {
            ctx._call('geoCode', i.geocode).then(function (res) {
              var m = {
                marker: new ctx.google.Marker({
                  map: ctx.map,
                  position: new ctx.google.LatLng(res.geometry.location.lat(), res.geometry.location.lng()),
                  title: i.title,
                  icon: i.icon || null
                }),
                data: i
              };
              ctx.markers.push(m);

              if (ctx.options.on.markerCreated !== null) {
                ctx.options.on.markerCreated(m);
              }

              if (ctx.options.on.markerSpawned !== null) {
                ctx.options.on.markerSpawned(m);
              }
            });
          } else {
            var m = {
              marker: new ctx.google.Marker({
                map: ctx.map,
                position: new ctx.google.LatLng(i.lat, i.lng),
                title: i.title,
                icon: i.icon || null
              }),
              data: i
            };
            ctx.markers.push(m);

            if (ctx.options.on.markerSpawned !== null) {
              ctx.options.on.markerSpawned(m);
            }
          }
        };

        for (var _iterator2 = data[0][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          _loop2();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      window.gIntv = setInterval(function () {
        if (ctx.markers.length == fin) {
          clearInterval(gIntv);
          promise.resolve(ctx.markers);
        }
      }, 200);
    }
  }, {
    key: "_getCenter",
    value: function _getCenter(ctx, promise, bounds) {
      var center = new ctx.google.LatLng(bounds[0].location.lat(), bounds[0].location.lng());
      return promise.resolve({
        center: center,
        zoom: ctx.options.fallbackZoom
      });
    }
  }, {
    key: "_geoCode",
    value: function _geoCode(ctx, promise, address) {
      this._throttle(function () {
        new ctx.google.Geocoder().geocode({
          'address': address[0]
        }, function (res, stat) {
          if (stat == 'OK') {
            return promise.resolve(res[0]);
          } else {
            return promise.reject(stat);
          }
        });
      });
    } // HELPERS

  }, {
    key: "_process",
    value: function _process() {
      var self = this;

      if (this.queue.length > 0 && typeof window.gQueueIntv == 'undefined') {
        window.gQueueIntv = setInterval(function () {
          if (self.queue.length > 0) {
            self.queue[0]();
            self.queue.shift();
          } else {
            clearInterval(gQueueIntv);
          }
        }, this.options.throttle.rate);
      }
    }
  }, {
    key: "_throttle",
    value: function _throttle(callback) {
      if (!this.options.throttle.apply) {
        return callback();
      }

      this.queue.push(callback);

      this._process();
    }
  }, {
    key: "_parseTemplate",
    value: function _parseTemplate(template, data) {
      var res = template;
      template.match(/{{\s*[\w\.]+\s*}}/g).map(function (x) {
        var rgxp = new RegExp(x, 'g');
        res = res.replace(rgxp, data[x.match(/[\w\.]+/)[0]]);
      });
      return res;
    }
  }, {
    key: "_getUrl",
    value: function _getUrl() {
      return this.options.google.url + '?key=' + this.options.google.key + '&callback=' + this.options.google.callback + '&language=' + this.options.google.language + '&region=' + this.options.google.region;
    }
  }, {
    key: "_getZoom",
    value: function _getZoom(bounds) {
      var maxZoom = this.map.mapTypes.get(this.map.getMapTypeId()).maxZoom || this.options.maxZoom;
      var minZoom = this.map.mapTypes.get(this.map.getMapTypeId()).minZoom || this.options.minZoom;
      var ne = this.map.getProjection().fromLatLngToPoint(bounds.getNorthEast());
      var sw = this.map.getProjection().fromLatLngToPoint(bounds.getSouthWest());
      var worldW = Math.abs(ne.x - sw.x);
      var worldH = Math.abs(ne.y - sw.y);
      var fitPad = 40;

      for (var zoom = maxZoom; zoom >= minZoom; --zoom) {
        if (worldW * (1 << zoom) + 2 * fitPad < this.map.getDiv().offsetWidth && worldH * (1 << zoom) + 2 * fitPad < this.map.getDiv().offsetHeight) return zoom;
      }

      return this.options.fallbackZoom;
    }
  }]);

  return GoogleMapsHelper;
}();
