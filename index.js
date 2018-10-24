'use strict';

class GoogleMapsHelper
{
    constructor(element, options = {})
    {
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
                url: 'https://maps.googleapis.com/maps/api/js',
            },
            infoWindow: false,
            iniDelay: 500,
            markers: false,
            maxZoom: 21,
            minZoom: 1,
            on: {
                initialized: null,
                markerCreated: null,
                markerSpawned: null,
            },
            throttle: {
                apply: true,
                rate: 50,
            },
        };
        this.queue = [];

        for (const opt in this.options) {
            if ('undefined' == typeof options[opt]) continue;

            if ('object' == typeof this.options[opt]) {
                for (const inopt in this.options[opt]) {
                    if ('undefined' == typeof options[opt][inopt]) continue;

                    this.options[opt][inopt] = options[opt][inopt];
                }
            } else {
                this.options[opt] = options[opt];
            }
        }

        const gjs = document.createElement('script');
        gjs.src = this._getUrl();

        document.body.appendChild(gjs);
    }

    init()
    {
        let self = this;

        setTimeout(() => {
            self._initialize();
        }, this.options.iniDelay);

        return this;
    }

    setCenterOn(address)
    {
        this._call('geoCode', address).then(resA => {
            this._call('getCenter', resA.geometry).then(resB => {
                this.map.setZoom(this.options.fallbackZoom);
                this.map.panTo(resB.center);
                this.map.setZoom(this._getZoom(resA.geometry.viewport));
            });
        });
    }

    _call(fname, ...args)
    {
        let self = this;

        return new Promise((res, rej) => {
            return self['_'+ fname](self, {
                resolve: res, 
                reject: rej
            }, args);
        });
    }

    _initialize()
    {
        if ('object' != typeof google) {
            throw 'Google object not found! Try increasing "iniDelay" value.';
        }

        this.google = google.maps;
        let self = this;

        this._call('geoCode', this.options.center).then(resA => {
            this._call('getCenter', resA.geometry).then(resB => {
                this.map = new this.google.Map(this.element, resB);

                setTimeout(() => {
                    self.map.setZoom(self._getZoom(resA.geometry.bounds || resA.geometry.viewport));
                }, this.options.iniDelay / 2);

                if (this.options.markers != false) {
                    this._call('setMarkers', this.options.markers).then(res => {
                        if (this.options.infoWindow != false) {
                            this._call('setWindows', res, this.options.infoWindow);
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

    _closeWindow(ctx, promise)
    {
        if (ctx.infoWindow !== false) {        
            ctx.infoWindow.close();
            ctx.infoWindow = false;
        }

        return promise.resolve(true);
    }

    _setWindows(ctx, promise, data) 
    {
        let markers = data[0];
        let template = data[1];
        
        for (const m of markers) {
            ctx.google.event.addListener(m.marker, 'click', () => {
                ctx._call('closeWindow')
                .then(res => {
                    let w = new ctx.google.InfoWindow({
                        content: ctx._parseTemplate(template, m.data),
                    });

                    w.open(ctx.map, m.marker);

                    ctx.infoWindow = w;
                });
            });
        }

        return promise.resolve(true);
    }

    _setMarkers(ctx, promise, data)
    {
        let fin = data[0].length;

        for (const i of data[0]) {    
            if (('undefined' === typeof i.lat || 'undefined' === typeof i.lng) || (i.lat.length < 1 || i.lng.length < 1)) {
                ctx._call('geoCode', i.geocode).then(res => {
                    let m = {
                        marker: new ctx.google.Marker({
                            map: ctx.map,
                            position: new ctx.google.LatLng(res.geometry.location.lat(), res.geometry.location.lng()),
                            title: i.title,
                            icon: i.icon || null,
                        }),
                        data: i,
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
                let m = {
                    marker: new ctx.google.Marker({
                        map: ctx.map,
                        position: new ctx.google.LatLng(i.lat, i.lng),
                        title: i.title,
                        icon: i.icon || null,
                    }),
                    data: i,
                };

                ctx.markers.push(m);

                if (ctx.options.on.markerSpawned !== null) {
                    ctx.options.on.markerSpawned(m);
                }
            }
        }

        window.gIntv = setInterval(() => {
            if (ctx.markers.length == fin) {
                clearInterval(gIntv);
                promise.resolve(ctx.markers);
            }
        }, 200);
    }

    _getCenter(ctx, promise, bounds)
    {   
        let center = new ctx.google.LatLng(bounds[0].location.lat(), bounds[0].location.lng());

        return promise.resolve({
            center: center,
            zoom: ctx.options.fallbackZoom,
        });
    }

    _geoCode(ctx, promise, address)
    {        
        this._throttle(() => {
            new ctx.google.Geocoder().geocode({'address': address[0]}, (res, stat) => {
                if (stat == 'OK') {
                    return promise.resolve(res[0]);
                } else {
                    return promise.reject(stat);
                }
            });
        });
    }

    // HELPERS
    _process()
    {
        let self = this;

        if (this.queue.length > 0 && typeof window.gQueueIntv == 'undefined') {
            window.gQueueIntv = setInterval(() => {
                if (self.queue.length > 0) {
                    self.queue[0]();
                    self.queue.shift();
                } else {
                    clearInterval(gQueueIntv);
                }
            }, this.options.throttle.rate);
        }
    }

    _throttle(callback)
    {
        if (!this.options.throttle.apply) {
            return callback();
        }

        this.queue.push(callback);

        this._process();
    }

    _parseTemplate(template, data)
    {
        let res = template;

        template
            .match(/{{\s*[\w\.]+\s*}}/g)
            .map(x => { 
                let rgxp = new RegExp(x, 'g');
                res = res.replace(rgxp, data[x.match(/[\w\.]+/)[0]]);
            });

        return res;
    }

    _getUrl()
    {
        return this.options.google.url +
                '?key='+ 
                this.options.google.key +
                '&callback=' +
                this.options.google.callback +
                '&language=' +
                this.options.google.language +
                '&region=' +
                this.options.google.region;
    }

    _getZoom(bounds)
    { 
        let maxZoom = this.map.mapTypes.get(this.map.getMapTypeId()).maxZoom || this.options.maxZoom;
        let minZoom = this.map.mapTypes.get(this.map.getMapTypeId()).minZoom || this.options.minZoom;

        let ne = this.map.getProjection().fromLatLngToPoint(bounds.getNorthEast());
        let sw = this.map.getProjection().fromLatLngToPoint(bounds.getSouthWest());
        
        let worldW = Math.abs(ne.x - sw.x);
        let worldH = Math.abs(ne.y - sw.y);

        let fitPad = 40;

        for (let zoom = maxZoom; zoom >= minZoom; --zoom) {
            if (worldW * (1 << zoom) + 2 * fitPad < this.map.getDiv().offsetWidth && worldH * (1 << zoom) + 2 * fitPad < this.map.getDiv().offsetHeight)
                return zoom;
        }

        return this.options.fallbackZoom;
    }
}