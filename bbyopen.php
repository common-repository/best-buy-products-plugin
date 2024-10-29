<?php
/*
Plugin Name: Best Buy Products
Plugin URI: https://bbyopen.com/developer-tools
Description: This is a WordPress widget that can be configured to display Best Buy items on your widget-enabled WordPress theme.
Version: 2.1.1
Author: BBYOpen
Author URI: https://bbyopen.com/developer
*/

class BBYOpen_Widget extends WP_Widget {
    
    function BBYOpen_Widget() {
        parent::WP_Widget(false, $name = 'Best Buy Products',
            array('description' => 'Allows you to display and sell Best Buy products on your blog. An affiliate account lets you make commission on the products you sell.'));
    }

    function widget($args, $instance) {
        extract($args);
        $title = apply_filters('widget_title', $instance['title']);
        $api_key       = esc_attr($instance['api_key'      ]);
        $pid           = esc_attr($instance['pid'          ]);
        $search        = esc_attr($instance['search'       ]);
        $search_type   = esc_attr($instance['search_type'  ]);
        $category      = esc_attr($instance['category'     ]);
        $category_name = esc_attr($instance['category_name']);
        $max_results   = esc_attr($instance['max_results'  ]);
        $sort          = esc_attr($instance['sort'         ]);

        $widget_url_base = site_url('/wp-content/plugins/best-buy-products-plugin/widget');
        $q = array();
        if(!$search_type)
          $search_type = "search";
        if($search)
          $q[] = "$search_type=$search";
        if($category)
          $q[] = "categoryPath.id=$category";
        $query = join('&', $q);
        
        $output = $before_widget.$before_title.$title.$after_title.
        "
            <script src='$widget_url_base/jquery.js' type='text/javascript'></script>
            <script type='text/javascript'>bbyJQuery = $; $.noConflict(true)</script>
            <script src='$widget_url_base/bbyopen-widget.js' type='text/javascript'></script>
            <style type='text/css'>
                /* Adjust widget CSS to better handle narrow layout: */
                .bby-header {
                    overflow: visible;
                }
                .bby-title {
                    display: block;
                    clear: left;
                }
            </style>
            <div class='bby-remixwidget'
                 bbyApiKey='$api_key'
                 bbyPID='$pid'
                 bbyQuery='$query'
                 bbyCount='$max_results'
                 bbySort='$sort'
                 style='width: 100%; margin: 0.5em 0; font-size: 80%'></div><a style='color:#999;font-size:11px;' href='http://wordpress.org/extend/plugins/best-buy-products-plugin/'>Get the Best Buy widget for your blog</a>
        "
        .$after_widget;
      
        echo $output;
    }

    function update($new_instance, $old_instance) {
        $instance = $old_instance;
        $instance['title'        ] = strip_tags($new_instance['title'        ]);
        $instance['api_key'      ] = strip_tags($new_instance['api_key'      ]);
        $instance['pid'          ] = strip_tags($new_instance['pid'          ]);
        $instance['search'       ] = strip_tags($new_instance['search'       ]);
        $instance['search_type'  ] = strip_tags($new_instance['search_type'  ]);
        $instance['category'     ] = strip_tags($new_instance['category'     ]);
        $instance['category_name'] = strip_tags($new_instance['category_name']);
        $instance['max_results'  ] = strip_tags($new_instance['max_results'  ]);
        $instance['sort'         ] = strip_tags($new_instance['sort'         ]);

        return $instance;
    }
    
    function text_field($key, $value, $title) {
        ?>
        <p>
            <label for="<?php echo $this->get_field_id($key); ?>">
                <?php _e($title); ?>
                <input class="widefat"
                       id="<?php echo $this->get_field_id($key); ?>"
                       name="<?php echo $this->get_field_name($key); ?>"
                       type="text"
                       value="<?php echo $value; ?>" />
            </label>
        </p>
        <?php
    }
    
    function select_field($key, $value, $title, $options) {
        ?>
        <p>
            <label for="<?php echo $this->get_field_id($key); ?>">
                <?php _e($title); ?>
                <select id="<?php echo $this->get_field_id($key); ?>"
                        name="<?php echo $this->get_field_name($key); ?>" >
                <?php
                foreach($options as $option_value => $option_title) {
                    echo "<option value='$option_value'";
                    if($value == $option_value)
                        echo " selected='selected'";
                    echo ">";
                    echo $option_title;
                    echo "</option>";
                }
                ?>
                </select>
            </label>
        </p>
        <?php
    }

    function categories_field($key, $value, $name_key, $name_value, $title) {
        ?>
        <p>
            <label for="<?php echo $this->get_field_id($key); ?>" class="bby-category-chooser-parent">
                <?php _e($title); ?>
                <input id="<?php echo $this->get_field_id($key); ?>"
                       name="<?php echo $this->get_field_name($key); ?>"
                       type="hidden"
                       class="bby-category-id"
                       value="<?php echo $value; ?>" />
                <input id="<?php echo $this->get_field_id($name_key); ?>"
                       name="<?php echo $this->get_field_name($name_key); ?>"
                       type="hidden"
                       class="bby-category-name"
                       value="<?php echo $name_value; ?>" />
                
                <span class='bby-category-chooser'>
                  <a href='#' onclick='bby.categoryChooserStubClicked(this)'><?php echo $name_value; ?></a>
                </span>
            </label>
        </p>
        <?php
    }
    
    function form($instance) {
        $defaults = array('title' => 'Best Buy Products', 'max_results' => 3, 'category_name' => 'All categories');
        $instance = wp_parse_args((array) $instance, $defaults );
        
        $widget_url_base = site_url('/wp-content/plugins/best-buy-products-plugin/widget');
        echo("
          <script type='text/javascript'>oldDollar = $ || null</script>
          <script src='$widget_url_base/jquery.js' type='text/javascript'></script>
          <script type='text/javascript'>bbyJQuery = $; $.noConflict(true); $ = oldDollar</script>
          <script src='$widget_url_base/bbyopen-widget.js' type='text/javascript'></script>
          <script src='$widget_url_base/categories.js' type='text/javascript'></script>
          <link rel='stylesheet' type='text/css' href='$widget_url_base/categories.css'>
        ");
        
        $title         = esc_attr($instance['title'        ]);
        $api_key       = esc_attr($instance['api_key'      ]);
        $pid           = esc_attr($instance['pid'          ]);
        $search        = esc_attr($instance['search'       ]);
        $search_type   = esc_attr($instance['search_type'  ]);
        $category      = esc_attr($instance['category'     ]);
        $category_name = esc_attr($instance['category_name']);
        $max_results   = esc_attr($instance['max_results'  ]);
        $sort          = esc_attr($instance['sort'         ]);
        
        $this->text_field('title', $title, 'Title:');
        $this->text_field('search', $search, 'Search for:');
        $this->select_field(
            'search_type', $search_type, 'Search type:',
            array('search' => 'Full text', 'sku' => 'SKU'));
        $this->categories_field('category', $category, 'category_name', $category_name, 'In category:');
        $this->select_field(
            'max_results', $max_results, 'Max results:',
            array(1 => 'Single item', 2 => 2, 3 => 3, 4 => 4, 5 => 5, 6 => 6, 7 => 7, 8 => 8, 9 => 9, 10 => 10));
        $this->select_field(
            'sort', $sort, 'Sort by:',
            array(
                'salesRankMediumTerm.asc' => 'Most Popular',
                'startDate.desc' => 'Most Recent'));
        $this->text_field('api_key', $api_key, '<div style="float:right"><small><a href="https://remix.mashery.com/apps/register">What\'s this?</a></small></div>API Key (required):');
        $this->text_field('pid', $pid, '<div style="float:right"><small><a href="http://www.bestbuy.com/site/regularCat%3Apcmcat198500050002/regularCat%3Apcmcat198500050002/pcmcat198500050002.c?id=pcmcat198500050002">What\'s this?</a></small></div>Affiliate ID (optional):');
    }

}

add_action('widgets_init', 'widget_bbyopen_init');

function widget_bbyopen_init() {
    register_widget('BBYOpen_Widget');
}
