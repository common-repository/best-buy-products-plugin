(function() {
  (function($) {
    var _a, categoryCache;
    if ((typeof (_a = window.bby.categoryChooser) !== "undefined" && _a !== null)) {
      return null;
    }
    categoryCache = {};
    bby.categoryChooser = function(catField, nameField, opts) {
      var clearSelectedCategory, container, containerId, expandCategory, isCategoryExpanded, loadCategories, populateCategory, searchAllLink, selectCategory, selectedName, toggleCategoryExpanded, toggleCategoryPopup;
      if (catField.data('categoryChooserPopulated')) {
        return null;
      }
      catField.data('categoryChooserPopulated', true);
      bby.categoryChooserIdSeq = bby.categoryChooserIdSeq || 0;
      containerId = ("categoryChooser-" + (bby.categoryChooserIdSeq++));
      catField.after((" \
<span class='bby-category-chooser'> \
<a href='#' id='" + (containerId) + "-selectedName' class='category-selected-name'></a> \
<div class='bby-popup-container categories' id='" + (containerId) + "'> \
<div class='bby-popup'> \
<div class='bby-popup-header'> \
<a href='" + "" + "' id='" + (containerId) + "-searchAllLink'>Search in all categories</a> \
</div> \
<div class='bby-popup-body categories-root' id='" + (containerId) + "-root'> \
<img src='images/loading.gif'> \
Loading categories... \
</div> \
</div> \
</div> \
</span>"));
      container = $(("#" + (containerId)));
      selectedName = $(("#" + (containerId) + "-selectedName"));
      searchAllLink = $(("#" + (containerId) + "-searchAllLink"));
      expandCategory = function(catElem, expand) {
        var _b, catId;
        if (expand) {
          catElem.addClass('expanded');
          bby.slide(catElem.find('>.children'), true);
          catId = (new RegExp(("" + (containerId) + "-(.*)"))).exec(catElem[0].id)[1];
          return !((typeof (_b = categoryCache[catId]) !== "undefined" && _b !== null)) ? loadCategories(("" + (containerId) + "-" + (catId) + "-children"), catId) : null;
        } else {
          catElem.removeClass('expanded');
          return bby.slide(catElem.find('>.children'), false);
        }
      };
      isCategoryExpanded = function(catElem) {
        return catElem.hasClass('expanded');
      };
      toggleCategoryExpanded = function(catElem) {
        return expandCategory(catElem, !isCategoryExpanded(catElem));
      };
      selectCategory = function(catElem, catId, catName) {
        $('.category.selected').removeClass('selected');
        catElem.addClass('selected');
        catField.val(catId);
        if (nameField) {
          nameField.val(catName);
        }
        return selectedName.text(catName);
      };
      clearSelectedCategory = function() {
        return selectCategory($(), null, 'All categories');
      };
      populateCategory = function(childrenElem, category) {
        var _b, _c, _d, _e, _f, _g, _h, _i, cat, children, newHeight, prevHeight, subCats;
        subCats = category.subCategories;
        prevHeight = childrenElem.height();
        children = (function() {
          _b = []; _d = subCats;
          for (_c = 0, _e = _d.length; _c < _e; _c++) {
            cat = _d[_c];
            _b.push(("<div class='category' id='" + (containerId) + "-" + (cat.id) + "'> \
<div class='disclosure'></div> \
<div class='name'>" + (cat.name) + "</div> \
<div class='children' id='" + (containerId) + "-" + (cat.id) + "-children'></div> \
</div>"));
          }
          return _b;
        })();
        childrenElem.html(children.join(''));
        subCats.length === 0 ? childrenElem.parent().addClass('empty') : null;
        newHeight = childrenElem.height();
        childrenElem.height(prevHeight);
        childrenElem.animate({
          height: newHeight
        }, {
          duration: 300,
          complete: function() {
            return childrenElem.css('height', '');
          }
        });
        _f = []; _h = subCats;
        for (_g = 0, _i = _h.length; _g < _i; _g++) {
          (function() {
            var catElem;
            var cat = _h[_g];
            return _f.push((function() {
              catElem = $(("#" + (containerId) + "-" + (cat.id)));
              catElem.find('>.disclosure').click(function() {
                return toggleCategoryExpanded(catElem);
              });
              catElem.find('>.name').click(function() {
                var _j, _k, _l, _m, c, path;
                path = (function() {
                  _j = []; _l = category.path.slice(1);
                  for (_k = 0, _m = _l.length; _k < _m; _k++) {
                    c = _l[_k];
                    _j.push(c.name);
                  }
                  return _j;
                })();
                path.push(cat.name);
                return selectCategory(catElem, cat.id, path.join(' \u2023 '));
              });
              return catElem.find('>.children').hide();
            })());
          })();
        }
        return _f;
      };
      loadCategories = function(listElemId, parentCatId) {
        var _b, apiKey, apiParams, listElem, parentCatElem, url;
        listElem = $('#' + listElemId);
        (typeof (_b = categoryCache[parentCatId]) !== "undefined" && _b !== null) ? populateCategory(listElem, categoryCache[parentCatId]) : null;
        parentCatElem = $(("#" + (containerId) + "-" + (parentCatId)));
        parentCatElem.addClass('loading');
        apiKey = '2yuv3ct5kfrcs4ruwyfrygkj';
        if (!(apiKey)) {

        } else {
          url = ("http://api.remix.bestbuy.com/v1/categories(id=" + (parentCatId || 'cat00000') + ")");
          apiParams = {
            apiKey: apiKey,
            format: 'json',
            show: 'all'
          };
          return $.ajax({
            url: url,
            data: apiParams,
            dataType: 'jsonp',
            success: function(results) {
              var result;
              if (results.error) {

              } else {
                result = results.categories[0];
                categoryCache[parentCatId] = result;
                return populateCategory(listElem, result);
              }
            },
            complete: function() {
              return parentCatElem.removeClass('loading');
            },
            jsonpCallback: 'jsonp' + Math.floor(Math.random() * 100000000),
            cache: true
          });
        }
      };
      toggleCategoryPopup = function() {
        return !(container.is(':visible')) ? bby.showPopup(container) : null;
      };
      container.hide();
      loadCategories(("" + (containerId) + "-root"));
      nameField ? selectedName.html(nameField.val()) : clearSelectedCategory();
      searchAllLink.click(clearSelectedCategory);
      selectedName.click(toggleCategoryPopup);
      return opts && opts.open ? toggleCategoryPopup() : null;
    };
    return (bby.categoryChooserStubClicked = function(linkElem) {
      $(linkElem).parents('.bby-category-chooser-parent').each(function(index, elem) {
        return bby.categoryChooser($(elem).find('.bby-category-id'), $(elem).find('.bby-category-name'), {
          open: true
        });
      });
      return $(linkElem).remove();
    });
  })(bbyJQuery);
})();
