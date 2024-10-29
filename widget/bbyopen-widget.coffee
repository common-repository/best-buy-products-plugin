(($) ->
    # Determine URL of this script's directory, so that we can load resources
    scripts = document.getElementsByTagName('script')
    scriptLoc = scripts[scripts.length - 1].src
    if /^\./.exec(scriptLoc)
        scriptLoc = /(.*\/)[^\/]*/.exec(document.location)[1] + scriptLoc
    widgetBaseUrl = /(.*\/widget)\//.exec(scriptLoc)[1]

    displayProducts = (elem, prods, count) ->
        if prods.error
            displayError(elem, prods.error.message || 'Unknown error.')
            return
        
        categories = ->
            for cat in prod.categoryPath.slice(1) # first elem is always "Best Buy", which isn't very informative
                "<div class='bby-category'>#{cat.name}</div>"

        rating = ->
            rating = parseFloat(prod.customerReviewAverage)
            reviewCount = parseInt(prod.customerReviewCount)
            if rating? && reviewCount? && reviewCount > 0
                width = Math.floor(rating * 20)
                "<div class='bby-stars'><div class='bby-stars-fill' style='width: #{width}%'></div></div>
                 (#{reviewCount}&nbsp;review#{if (reviewCount > 1) then 's' else ''})"
            else
                ''

        document.bbyProdId = 0
        prodElems = for prod in prods.products[0..count-1]
            prodId = 'prod' + new Date().getTime() + '-' + document.bbyProdId++
            lessId = "bby-less-#{prodId}"
            moreId = "bby-more-#{prodId}"
            lessElem = 'bbyJQuery("#' + lessId + '")'
            moreElem = 'bbyJQuery("#' + moreId + '")'
            
            "<div class='bby-product jeff'>
                <a href='#{prod.cjAffiliateUrl || prod.url}' class='bby-thumbnail'><img src='#{prod.thumbnailImage}'/></a>
                <div class='bby-header'>
                    <div class='bby-buy-box'>
                        <div class='bby-price'>$#{prod.salePrice}</div>
                        <a href='#{prod.cjAffiliateAddToCartUrl || prod.addToCartUrl}' class='bby-add-to-cart'>
                            <img src='#{widgetBaseUrl}/images/btn_add_to_cart.gif'>
                        </a>
                    </div>
                    <a href='#{prod.cjAffiliateUrl || prod.url}' class='bby-title'>#{prod.name}</a>
                    <div class='bby-rating'>
                        #{rating()}
                    </div>
                </div>
                <div class='bby-details'>
                    <div class='bby-more-detail' id='#{moreId}'>
                        <div class='bby-categories'>
                            #{categories().join('&gt;')}
                        </div>
                        <div class='bby-description'>
                            #{prod.longDescriptionHtml || ''}
                        </div>
                        <div class='bby-availability'>
                            <div class='bby-availability-item'>#{prod.onlineAvailabilityText}</div>
                            <div class='bby-availability-item'>#{prod.inStoreAvailabilityText}</div>
                        </div>
                        <div class='bby-disclosure-button bby-less' onclick='document.bbySlide(#{lessElem}, true); document.bbySlide(#{moreElem}, false)'></div>
                    </div>
                    <div class='bby-less-detail' id='#{lessId}'>
                        <div class='bby-disclosure-button bby-more' onclick='document.bbySlide(#{lessElem}, false); document.bbySlide(#{moreElem}, true)'></div>
                        <div class='bby-description'>
                            #{prod.shortDescriptionHtml || ''}
                        </div>
                    </div>
                </div>
            </div>"
        
        if prodElems.length
            elem.innerHTML = prodElems.join("<div class='bby-product-divider'></div>") + "<div style='clear:both'></div>"
            if prodElems.length == 1
                $(elem).find('.bby-more-detail').show()
                $(elem).find('.bby-less-detail').hide()
        else
            elem.innerHTML = "<div class='bby-product'><div class='bby-title'>No products found.</div></div>"
    
    displayError = (elem, message) ->
        elem.innerHTML = "<div class='bby-error'>Unable to load BBY widget:<br/><b>#{message}</b></div>"
    
    document.bbyPopulateWidgets = ->
        # Add our custom css at the top of the document <head>, so that page css can override it.
        # Some browsers don't refresh css, so use a param to foil prolonged caching.
        cssVersion = new Date().getTime()
        unless /^file:/.exec(widgetBaseUrl) 
            cssVersion /= 10*60*1000 # For remote requests, force load only every 10 min
        $("head").prepend("<link rel='stylesheet' type='text/css' href='#{widgetBaseUrl}/widget.css?#{cssVersion}'></link>")
    
        widgets = $('.bby-widget')
        for widget in widgets
            apiKey = widget.getAttribute('bbyApiKey')
            query  = widget.getAttribute('bbyQuery')
            sort   = widget.getAttribute('bbySort') || 'salesRankMediumTerm.asc'
            count  = parseInt(widget.getAttribute('bbyCount')) || 3
            pid    = widget.getAttribute('bbyPID')
            
            unless apiKey
                displayError widget, "Missing bbyApiKey parameter. (<a href='http://remix.mashery.com/member/register'>Get an API key</a>)"
            else
                widget.innerHTML = "<div class='bby-loading'><img src='#{widgetBaseUrl}/images/loading.gif' width='16' height='16'>Loading...</div>"
                url = "http://api.remix.bestbuy.com/v1/products"
                url += "(#query)" if query
                params = { apiKey: apiKey, format: 'json', sort: sort, show: 'all'}
                params.PID = pid if pid
                $.ajax(
                    url:      url
                    data:     params
                    dataType: 'jsonp'
                    success:  (results) -> displayProducts(widget, results, count)
                )
    
    # Fixes JQuery jumpy animation issues
    # Adapted from http://blog.pengoworks.com/index.cfm/2009/4/21/Fixing-jQuerys-slideDown-effect-ie-Jumpy-Animation
    document.bbySlide = (el, show) ->
        visible = el.is(":visible")
        return false if show == visible

        height = el.data("originalHeight")
        if !height
            # get & remember original height
            height = el.show().height()
            el.data "originalHeight", height
            el.hide().css({height: 0}) unless visible

        if show
            el.show().animate({height: height}, {duration: 300})
        else
            el.animate({height: 0}, {duration: 300, complete: () -> el.hide()})

    $(document).ready ->
        unless document.bbyWidgetLoaded
            document.bbyWidgetLoaded = true
            document.bbyPopulateWidgets()

)(bbyJQuery)
