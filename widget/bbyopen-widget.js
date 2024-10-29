(function() {
  (function($) {
    var _a, bby, callBBYOpen, displayError, displayLoading, displayMessage, displayProducts, displayReviews, displayStores, geolocate, ie6, loadReviewsStr, ratingStars, scriptLoc, scripts, storeSearch, widgetBaseUrl;
    if ((typeof (_a = window.bby) !== "undefined" && _a !== null)) {
      return null;
    }
    window.bby = {};
    bby = window.bby;
    ie6 = /msie|MSIE 6/.test(navigator.userAgent);
    scripts = document.getElementsByTagName('script');
    scriptLoc = scripts[scripts.length - 1].src;
    /^\./.exec(scriptLoc) ? (scriptLoc = /(.*\/)[^\/]*/.exec(document.location)[1] + scriptLoc) : null;
    widgetBaseUrl = /(.*\/widget)\//.exec(scriptLoc)[1];
    bby.popupHtml = function(id) {
      return "<div class='bby-popup-container' id='" + (id) + "'> \
<div class='bby-popup'> \
<div class='bby-popup-header'></div> \
<div class='bby-popup-body'></div> \
<div class='bby-popup-footer'></div> \
</div> \
</div>";
    };
    bby.showPopup = function(elem) {
      var popupState;
      if (bby.curPopup) {
        bby.curPopup.hide();
      }
      bby.curPopup = elem;
      elem.show();
      popupState = elem[0].popupState = elem[0].popupState || {};
      popupState.suppressDismiss = true;
      if (!(popupState.listenerBound)) {
        popupState.listenerBound = true;
        elem.click(function(event) {
          return (popupState.suppressDismiss = true);
        });
        return $(document).click(function(event) {
          if (!(popupState.suppressDismiss)) {
            elem.fadeOut(200);
            $(this).unbind(event);
            popupState.listenerBound = false;
          }
          return (popupState.suppressDismiss = false);
        });
      }
    };
    bby.updatePopupContent = function(container, opts) {
      var _b, _c, _d, elem, newHeight, prevHeight;
      elem = container.find('.bby-popup');
      prevHeight = elem.height();
      if ((typeof (_b = typeof opts === "undefined" || opts == undefined ? undefined : opts.body) !== "undefined" && _b !== null)) {
        elem.find('.bby-popup-body').html(opts.body);
      }
      if ((typeof (_c = typeof opts === "undefined" || opts == undefined ? undefined : opts.header) !== "undefined" && _c !== null)) {
        elem.find('.bby-popup-header').html(opts.header);
      }
      if ((typeof (_d = typeof opts === "undefined" || opts == undefined ? undefined : opts.footer) !== "undefined" && _d !== null)) {
        elem.find('.bby-popup-footer').html(opts.footer);
      }
      elem.css('height', '');
      if (typeof opts === "undefined" || opts == undefined ? undefined : opts.instant) {
        return elem.height(newHeight);
      } else {
        newHeight = elem.height();
        elem.height(prevHeight);
        return elem.animate({
          height: newHeight
        }, {
          duration: 300
        });
      }
    };
    displayMessage = function(elem, html) {
      return elem.hasClass('bby-popup-container') ? bby.updatePopupContent(elem, {
        body: html
      }) : elem.html(html);
    };
    displayLoading = function(elem, message) {
      message = message || "Loading";
      return displayMessage(elem, ("<div class='bby-loading'><img src='" + (widgetBaseUrl) + "/images/loading.gif' width='16' height='16'>" + (message) + "...</div>"));
    };
    displayError = function(elem, message) {
      return displayMessage(elem, ("<div class='bby-error'>" + (message) + "</div>"));
    };
    callBBYOpen = function(p) {
      var apiParams, url;
      if (!(p.apiKey)) {
        return displayError(p.elem, "Missing bbyApiKey parameter. (<a href='https://remix.mashery.com/member/register'>Get an API key</a>)");
      } else {
        displayLoading(p.elem);
        url = "http://api.remix.bestbuy.com/v1";
        url += ("/" + (p.queryPath));
        if (p.query) {
          url += ("(" + p.query + ")");
        }
        apiParams = {
          apiKey: p.apiKey,
          format: 'json',
          sort: p.sort,
          show: 'all'
        };
        if (p.pid) {
          apiParams.PID = p.pid;
        }
        return $.ajax({
          url: url,
          data: apiParams,
          dataType: 'jsonp',
          success: function(results) {
            return results.error ? displayError(p.elem, results.error.message) : p.callback(results);
          },
          error: function(req, message) {
            return displayError(p.elem, "Could not load widget. Check your network connection, and make sure your API Key is valid.");
          },
          jsonpCallback: 'jsonp' + Math.floor(Math.random() * 100000000),
          cache: true
        });
      }
    };
    ratingStars = function(rating, onclick) {
      var width;
      width = Math.floor(rating * 20);
      return "<div class='bby-stars' onclick='" + (onclick) + "'><div class='bby-stars-fill' style='width: " + (width) + "%'></div></div>";
    };
    loadReviewsStr = function(apiKey, sku, elemId, sort) {
      sort = sort || 'submissionTime.desc';
      return "window.bby.loadReviews(\"" + (apiKey) + "\", \"" + (sku) + "\", \"" + (elemId) + "\", \"" + (sort) + "\")";
    };
    displayProducts = function(apiKey, elem, results, count) {
      var _b, _c, _d, _e, categories, divider, lessElem, lessId, moreElem, moreId, prod, prodElems, prodId, rating, storesPopupId;
      categories = function() {
        var _b, _c, _d, _e, cat;
        _b = []; _d = prod.categoryPath.slice(1);
        for (_c = 0, _e = _d.length; _c < _e; _c++) {
          cat = _d[_c];
          _b.push(("<div class='bby-category'>" + (cat.name) + "</div>"));
        }
        return _b;
      };
      rating = function() {
        var rating, reviewCount, reviewsCallback, reviewsDivId;
        rating = parseFloat(prod.customerReviewAverage);
        reviewCount = parseInt(prod.customerReviewCount);
        reviewsDivId = ("bby-reviews-" + (prod.sku));
        reviewsCallback = loadReviewsStr(apiKey, prod.sku, reviewsDivId);
        return (typeof rating !== "undefined" && rating !== null) && (typeof reviewCount !== "undefined" && reviewCount !== null) && reviewCount > 0 ? ("" + (ratingStars(rating, reviewsCallback)) + " \
<a href='#' onclick='" + (reviewsCallback) + "'>" + (reviewCount) + "&nbsp;review" + ((reviewCount > 1) ? 's' : '') + "</a> \
" + (bby.popupHtml(reviewsDivId))) : '';
      };
      bby.prodId = 0;
      prodElems = (function() {
        _b = []; _d = results.products.slice(0, count - 1 + 1);
        for (_c = 0, _e = _d.length; _c < _e; _c++) {
          prod = _d[_c];
          _b.push((function() {
            prodId = 'prod' + new Date().getTime() + '-' + bby.prodId++;
            lessId = ("bby-less-" + (prodId));
            moreId = ("bby-more-" + (prodId));
            lessElem = 'bbyJQuery("#' + lessId + '")';
            moreElem = 'bbyJQuery("#' + moreId + '")';
            storesPopupId = ("bby-stores-" + (prod.sku));
            return "<div class='bby-product'> \
<a href='" + (prod.cjAffiliateUrl || prod.url) + "' class='bby-thumbnail'><img src='" + (prod.thumbnailImage) + "'/></a> \
<div class='bby-header'> \
<div class='bby-buy-box'> \
<div class='bby-price'>$" + (prod.salePrice) + "</div> \
<a href='" + (prod.cjAffiliateAddToCartUrl || prod.addToCartUrl) + "' class='bby-add-to-cart'> \
<img src='" + (widgetBaseUrl) + "/images/btn_add_to_cart.gif'> \
</a> \
</div> \
<a href='" + (prod.cjAffiliateUrl || prod.url) + "' class='bby-title'>" + (prod.name) + "</a> \
<div class='bby-rating'> \
" + (rating()) + " \
</div> \
<div class='bby-availability-item'> \
<a href='#' onclick='window.bby.showStoreSearch(\"" + (apiKey) + "\", \"" + (prod.sku) + "\", \"" + (storesPopupId) + "\")'>Availability in nearby stores</a> \
</div> \
" + (bby.popupHtml(storesPopupId)) + " \
</div> \
<div class='bby-details'> \
<div class='bby-more-detail' id='" + (moreId) + "'> \
<div class='bby-categories'> \
" + (categories().join('&gt;')) + " \
</div> \
<div class='bby-description'> \
" + (prod.longDescriptionHtml || '') + " \
</div> \
<div class='bby-availability'> \
<div class='bby-availability-item'>" + (prod.onlineAvailabilityText) + "</div> \
<div class='bby-availability-item'>" + (prod.inStoreAvailabilityText) + "</div> \
</div> \
<div class='bby-disclosure-button bby-less' onclick='window.bby.slide(" + (lessElem) + ", true); window.bby.slide(" + (moreElem) + ", false)'></div> \
</div> \
<div class='bby-less-detail' id='" + (lessId) + "'> \
<div class='bby-disclosure-button bby-more' onclick='window.bby.slide(" + (lessElem) + ", false); window.bby.slide(" + (moreElem) + ", true)'></div> \
<div class='bby-description'> \
" + (prod.shortDescriptionHtml || '') + " \
</div> \
</div> \
</div> \
</div>";
          })());
        }
        return _b;
      })();
      if (prodElems.length) {
        divider = ie6 ? "<hr>" : "<div class='bby-product-divider'></div>";
        elem.html(prodElems.join(divider) + "<div style='clear:both'></div>");
        if (prodElems.length === 1) {
          elem.find('.bby-more-detail').show();
          return elem.find('.bby-less-detail').hide();
        }
      } else {
        return elem.html("<div class='bby-product'><div class='bby-title'>No products found.</div></div>");
      }
    };
    bby.populateWidgets = function() {
      var _b, _c, _d, _e, api, cssVersion, widgets;
      cssVersion = new Date().getTime();
      !(/^file:/.exec(widgetBaseUrl)) ? cssVersion /= 10 * 60 * 1000 : null;
      $("head").prepend(("<link rel='stylesheet' type='text/css' href='" + (widgetBaseUrl) + "/widget.css?" + (cssVersion) + "'></link>"));
      api = 'products';
      widgets = $('.bby-remixwidget');
      _b = []; _d = widgets;
      for (_c = 0, _e = _d.length; _c < _e; _c++) {
        (function() {
          var apiKey, count;
          var widget = _d[_c];
          return _b.push((function() {
            count = parseInt(widget.getAttribute('bbyCount')) || 3;
            apiKey = widget.getAttribute('bbyApiKey');
            return callBBYOpen({
              elem: $(widget),
              apiKey: apiKey,
              queryPath: 'products',
              query: widget.getAttribute('bbyQuery'),
              sort: widget.getAttribute('bbySort') || 'salesRankMediumTerm.asc',
              pid: widget.getAttribute('bbyPID'),
              callback: function(results) {
                return displayProducts(apiKey, $(widget), results, count);
              }
            });
          })());
        })();
      }
      return _b;
    };
    displayReviews = function(elem, results, sort, reviewsCallback) {
      var _b, _c, _d, _e, _f, _g, _h, _i, desc, key, review, reviews, sortLinks, sortOrder, sortOrders;
      reviews = (function() {
        _b = []; _d = results.reviews;
        for (_c = 0, _e = _d.length; _c < _e; _c++) {
          review = _d[_c];
          _b.push(("<div class='bby-review'> \
" + (ratingStars(review.rating)) + " \
<div class='bby-author'> \
" + (review.reviewer[0].name) + " \
</div> \
<div class='bby-title'> \
" + (review.title) + " \
</div> \
<div class='bby-comment'> \
" + (review.comment) + " \
</div> \
</div>"));
        }
        return _b;
      })();
      sortOrders = [['rating.desc', 'Positive'], ['rating.asc', 'Negative'], ['submissionTime.desc', 'Recent']];
      sortLinks = (function() {
        _f = []; _h = sortOrders;
        for (_g = 0, _i = _h.length; _g < _i; _g++) {
          sortOrder = _h[_g];
          _f.push((function() {
            key = sortOrder[0];
            desc = sortOrder[1];
            return sort === key ? desc : ("<a href='#' onclick='" + (reviewsCallback(key)) + "; return false'>" + (desc) + "</a>");
          })());
        }
        return _f;
      })();
      return bby.updatePopupContent(elem, {
        header: "Show: " + sortLinks.join(' | '),
        body: reviews.join('')
      });
    };
    bby.loadReviews = function(apiKey, sku, elemId, sort) {
      var cacheKey, reviewsElem, sortOrderCallback;
      reviewsElem = $('#' + elemId);
      bby.showPopup(reviewsElem);
      sortOrderCallback = function(sort) {
        return loadReviewsStr(apiKey, sku, elemId, sort);
      };
      bby.cachedReviews = bby.cachedReviews || [];
      cacheKey = ("" + (sku) + "." + (sort));
      return bby.cachedReviews[cacheKey] ? displayReviews(reviewsElem, bby.cachedReviews[cacheKey], sort, sortOrderCallback) : callBBYOpen({
        elem: reviewsElem,
        queryPath: 'reviews',
        apiKey: apiKey,
        query: 'sku=' + sku,
        sort: sort,
        callback: function(results) {
          bby.cachedReviews[cacheKey] = results;
          return displayReviews(reviewsElem, results, sort, sortOrderCallback);
        }
      });
    };
    geolocate = function(successCallback, failureCallback) {
      var doFailure, doSuccess, geo, userLocation;
      doSuccess = function(lat, lon) {
        if (bby.geolocating) {
          bby.geolocating = false;
          return successCallback(lat, lon);
        }
      };
      doFailure = function() {
        if (bby.geolocating) {
          bby.geolocating = false;
          return failureCallback();
        }
      };
      userLocation = null;
      bby.geolocating = true;
      if (typeof navigator === "undefined" || navigator == undefined ? undefined : navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(function(position) {
          return doSuccess(position.coords.latitude, position.coords.longitude);
        }, function() {
          return doFailure();
        }, {
          enableHighAccuracy: false,
          timeout: 15 * 1000,
          maximumAge: 30 * 60 * 1000
        });
      } else if (typeof google === "undefined" || google == undefined ? undefined : google.gears) {
        geo = google.gears.factory.create('beta.geolocation');
        return geo.getCurrentPosition(function(position) {
          return doSuccess(position.latitude, position.longitude);
        }, function() {
          return doFailure();
        });
      } else {
        return doFailure();
      }
    };
    displayStores = function(elem, results) {
      var _b, _c, _d, _e, body, store, stores;
      stores = (function() {
        _b = []; _d = results.stores;
        for (_c = 0, _e = _d.length; _c < _e; _c++) {
          store = _d[_c];
          _b.push(("<div class='bby-store'> \
<div class='bby-distance'> \
" + (store.distance) + "&nbsp;mi \
</div> \
<div class='bby-title'> \
" + (store.name) + " \
</div> \
<div class='bby-address'> \
" + (store.address) + ", \
<div class='bby-city'> \
" + (store.city) + ", " + (store.region) + " \
</div> \
</div> \
<div class='bby-hours'> \
" + (store.hours) + " \
</div> \
</div>"));
        }
        return _b;
      })();
      if (stores.length > 0) {
        elem.find('.bby-zip-input').val((results.stores[0] == undefined ? undefined : results.stores[0].postalCode) || null);
        body = "These stores have the product in stock: " + stores.join('');
      } else {
        body = "No nearby stores have this product in stock.";
      }
      return bby.updatePopupContent(elem, {
        body: body
      });
    };
    storeSearch = function(apiKey, sku, storesElem, loc) {
      var cacheKey;
      bby.cachedStores = bby.cachedStores || [];
      cacheKey = ("" + (sku) + "." + (loc));
      return bby.cachedStores[cacheKey] ? displayStores(storesElem, bby.cachedStores[cacheKey]) : callBBYOpen({
        elem: storesElem,
        queryPath: ("stores(area(" + (loc) + ", 50))+products(sku=" + (sku) + ")"),
        apiKey: apiKey,
        callback: function(results) {
          bby.cachedStores[cacheKey] = results;
          return displayStores(storesElem, results);
        }
      });
    };
    bby.showStoreSearch = function(apiKey, sku, storesPopupId) {
      var doSearch, inputId, locateLinkId, storesElem, zipInput;
      storesElem = $('#' + storesPopupId);
      bby.showPopup(storesElem);
      inputId = 'zip-' + storesPopupId;
      locateLinkId = 'locate-' + storesPopupId;
      bby.updatePopupContent(storesElem, {
        header: (" \
Near ZIP: <input type='text' id='" + (inputId) + "' class='bby-zip-input'> \
<input type='submit' class='bby-zip-submit' value='Search'> \
<a href='#' id='" + (locateLinkId) + "' class='bby-locate'>Locate Me</a> \
<div class='bby-clr'>")
      });
      zipInput = $('#' + inputId);
      doSearch = function() {
        return zipInput.val() ? storeSearch(apiKey, sku, storesElem, zipInput.val()) : null;
      };
      storesElem.find('.bby-zip-input').change(doSearch);
      storesElem.find('.bby-zip-submit').click(doSearch);
      $('#' + locateLinkId).click(function() {
        displayLoading(storesElem, 'Determining your location');
        return geolocate(function(lat, lon) {
          return storeSearch(apiKey, sku, storesElem, ("" + (lat) + "," + (lon)));
        }, function() {
          bby.updatePopupContent(storesElem, {
            body: 'Cannot determine your current location. Your browser may not support geolocation. Please use the ZIP code search box.'
          });
          return zipInput.focus();
        });
      });
      return zipInput.focus();
    };
    bby.slide = function(el, show) {
      var height, visible;
      visible = el.is(":visible");
      if (show === visible) {
        return false;
      }
      height = el.data("originalHeight");
      if (!height) {
        height = el.show().height();
        el.data("originalHeight", height);
        if (!(visible)) {
          el.hide().css({
            height: 0
          });
        }
      }
      return show ? el.show().animate({
        height: height
      }, {
        duration: 300,
        complete: function() {
          return el.css('height', '');
        }
      }) : el.animate({
        height: 0
      }, {
        duration: 300,
        complete: function() {
          return el.hide();
        }
      });
    };
    return $(document).ready(function() {
      return bby.populateWidgets();
    });
  })(bbyJQuery);
})();
