<?php
/*
Plugin Name: Daily Hukamnama Poster
Description: Automatically fetches the Daily Hukamnama from Dekho-Ji, retrieves the Punjabi header from SikhNet, and downloads the official SGPC PDF. It converts the PDF into clean, branded poster-style JPG images with a custom frame, logo, and footer branding, uploads optimized images to WordPress with auto-generated alt text, captions, and descriptions, and creates daily posts with yearly archive links. Includes manual run and cron scheduling support.
Version: 2.0
Author: Qikads
*/

add_action('init', 'dhp_setup_cron');

function dhp_setup_cron() {
    $enabled = get_option('dhp_cron_enabled', 1);
    if ($enabled && !wp_next_scheduled('dhp_post_hukamnama_event')) {
        wp_schedule_event(time(), 'daily', 'dhp_post_hukamnama_event');
    }
}

function dhp_fetch_gurmukhi_header() {
    $html = file_get_contents('https://www.sikhnet.com/hukam');
    if (!$html) return false;

    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    @$dom->loadHTML($html);
    $xpath = new DOMXPath($dom);

    // Find the specific <p> tag
    $node = $xpath->query('//p[contains(@class, "excerpt gurmukhi-text")]')->item(0);

    if ($node) {
        return trim($node->textContent);
    }

    return false;
}

add_action('dhp_post_hukamnama_event', 'dhp_create_daily_hukamnama_post');

function dhp_create_daily_hukamnama_post() {
    $post_title = 'Daily Hukamnama Sri Darbar Sahib – ' . date('F jS, Y');
    if (get_page_by_title($post_title, OBJECT, 'post')) return;

    $hukamnama = dhp_scrape_hukamnama();
    
    if (!$hukamnama) {
        update_option('dhp_last_status', 'Failed to fetch hukamnama text.');
        return;
    }

    $header=dhp_fetch_gurmukhi_header();
	
	if(!empty($header)){
		$header='<h2 class="gurbani">'.$header.'</h2>';
	}

    $jpg_paths = dhp_download_and_convert_pdf(); // Now it returns array
	if (!$jpg_paths) {
		update_option('dhp_last_status', 'Failed to fetch hukamnama images.');
		return;
	}
 
$image_html = '';
$page = 1;

foreach ($jpg_paths as $jpg_path) {

    $attachment_id = dhp_upload_image_to_wp($jpg_path);

    $alt_text = 'Daily Hukamnama Sahib Sri Darbar Sahib — ' . date('F j, Y') . ' (Page ' . $page . ')';

    $caption = 'Daily Hukamnama from Sri Darbar Sahib, Amritsar — ' . date('F j, Y') . ' (Page ' . $page . ')';

    $description = 'Read the Daily Hukamnama from Sri Darbar Sahib, Amritsar for ' . date('F j, Y') . 
    '. This is Page ' . $page . ' of the Daily Hukamnama. The Hukamnama is the divine message taken from Sri Guru Granth Sahib and shared daily with the Sangat around the world.';

    // Update Alt text
    update_post_meta($attachment_id, '_wp_attachment_image_alt', $alt_text);

    // Update caption + description
    wp_update_post(array(
        'ID' => $attachment_id,
        'post_excerpt' => $caption,
        'post_content' => $description
    ));

    $img = wp_get_attachment_image(
        $attachment_id,
        'full',
        false,
        array(
            'class' => 'hukamnama-image',
            'loading' => 'lazy',
            'alt' => $alt_text
        )
    );

    $image_html .= '[caption align="aligncenter" width="1275" class="hukamnama-page"]'
        . $img .
        ' ' . $caption .
        '[/caption]';

    $page++;
}

    $post_data = [
        'post_title'    => $post_title,
         'post_content' => '<div class="text-center">' . $header .'<p style="margin:0px;">'.$image_html.'</p>' .
                            '<hr><h2>Daily Hukamnama, Sri Harmandir Sahib Amritsar in Punjabi, Hindi, English - ' . date('F jS, Y') . '</h2>' .
                            $hukamnama .
                            '<p>
                                ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ !!<br>
                                ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹਿ !!
                            </p>' .
                            '<p>Source: <a href="https://sgpc.net/" target="_blank" style="color: #000;">SGPC</a></p>' .
                            '<hr><h3>Hukamnama Archives</h3>
                            <ul style="list-style:none">' .
                            wp_get_archives( array(
                                'type' => 'yearly',
                                'limit' => 1,
                                'echo' => 0
                            ) ) .
                            '</ul><hr></div>',
        'post_status'   => 'publish',
        'post_author'   => 8,
       "post_category" => [1, 9],
        "tags_input" => [
                "daily hukamnama",
                "daily hukamnama darbar sahib",
                "daily hukamnama darbar sahib amritsar",
                "daily hukamnama golden temple",
                "daily hukamnama harmandir sahib",
                "daily hukamnama sahib darbar sahib",
                "daily hukamnama sahib",
            	"daily hukamnama sri darbar sahib",
            	"daily hukamnama sri darbar sahib amritsar",
            	"daily hukamnama sri harmandir sahib",
            	"get daily hukamnama on whatsapp",
            	"daily hukamnama pdf",
            	"today hukamnama darbar sahib pdf",
            	"daily hukamnama app",
            	"daily hukamnama katha from manji sahib",
            	"hukamnama darbar sahib today",
            	"hukamnama sahib",
            	"hukamnama",
            	"mukhwak golden temple today",
            	"personal hukamnama",
            	"hukamnama darbar sahib",
            	"hukamnama sahib today darbar sahib",
            	"aaj da hukamnama",
            	"ajj da hukamnama",
            	"mukhwak darbar sahib amritsar",
            	"today hukamnama picture",
            	"hukamnama personal",
            	"hukamnama sahib personal",
            	"hukamnama sahib sri darbar sahib today",
            	"hukamnama sahib today",
        		"hukamnama sahib pdf",
        		"hukamnama darbar sahib today pdf",
				"today's hukamnama pdf",
				"today hukamnama darbar sahib sgpc pdf",
				"hukamnama sri darbar sahib amritsar today",
        		"hukamnama today",
                "today hukamnama darbar sahib",
        		"today hukamnama darbar sahib pdf in english",
        		"today hukamnama darbar sahib pdf in hindi",
        		"darbar sahib hukamnama today pdf",
        		"hukamnama from harmandir sahib",
        		"mukhwak darbar sahib amritsar today",
        		"today hukamnama darbar sahib pdf",
        		"hukamnama sahib pdf",
        		"hukamnama darbar sahib today pdf",
        		"daily hukamnama darbar sahib pdf",
           ],
    ];

    $post_id = wp_insert_post($post_data);
    if ($post_id && $attachment_id) {
        //set_post_thumbnail($post_id, $attachment_id);
    }

    update_option('dhp_last_status', 'Hukamnama posted on ' . date('Y-m-d H:i:s'));
}

// Scrape Hukamnama content with Gurmukhi and Translation
function dhp_scrape_hukamnama() {
    $html = file_get_contents('https://www.dekho-ji.com/hukamnama?t=today');
    if (!$html) return false;

    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    @$dom->loadHTML($html);
    $xpath = new DOMXPath($dom);

    // Fetch the entire <section id="bani1txt">
    $section = $xpath->query('//section[@id="bani1txt"]')->item(0);

    if (!$section) return false;

    // Get inner HTML of the section
    $innerHTML = '';
    foreach ($section->childNodes as $child) {
        $innerHTML .= $dom->saveHTML($child);
    }

    return '<div class="hukamnama-full">' . $innerHTML . '</div>';
}

function dhp_download_and_convert_pdf() {

    @set_time_limit(300);

    $date = date('F-jS-Y:h:i:s');
    $upload_dir = wp_upload_dir();
    $pdf_url = 'https://hs.sgpc.net/hukamnamapdf.php';
    $pdf_path = $upload_dir['path'] . '/hukamnama.pdf';

    file_put_contents($pdf_path, file_get_contents($pdf_url));

    if (!extension_loaded('imagick')) { return false; }

    try {

        $image_paths = [];

        // Get total pages safely
        $ping = new Imagick();
        $ping->pingImage($pdf_path);
        $total_pages = $ping->getNumberImages();
        $ping->clear();
        $ping->destroy();

        for ($i = 0; $i < $total_pages; $i++) {

            $imagick = new Imagick();

            // Load ONLY one page
            $imagick->setResolution(150, 150);
            $imagick->readImage($pdf_path . "[$i]");

            $page = $imagick->getImage();

            // STEP 1: Clean background
            $page->setImageColorspace(Imagick::COLORSPACE_RGB);
            $page->transparentPaintImage('rgb(255,255,255)', 0, 52000, false);
            $page->setImageBackgroundColor('white');
            $page = $page->mergeImageLayers(Imagick::LAYERMETHOD_FLATTEN);
            $page->contrastImage(1);
            $page->normalizeImage();

            // STEP 2: Create padded canvas (for frame space)
            $width  = $page->getImageWidth();
            $height = $page->getImageHeight();

            $canvas = new Imagick();
            $canvas->newImage($width + 300, $height + 300, 'white');
            $canvas->setImageFormat('png');

            $canvas->compositeImage($page, Imagick::COMPOSITE_OVER, 150, 130);

            // STEP 3: ADD FRAME
            $frame_path = plugin_dir_path(__FILE__) . 'assets/frame.png';
            if (file_exists($frame_path)) {
                $frame = new Imagick($frame_path);
                $frame->resizeImage(
                    $canvas->getImageWidth(),
                    $canvas->getImageHeight(),
                    Imagick::FILTER_LANCZOS,
                    1
                );
                $canvas->compositeImage($frame, Imagick::COMPOSITE_OVER, 0, 0);
                $frame->clear();
                $frame->destroy();
            }

            // STEP 4: ADD LOGO
            $logo_path = plugin_dir_path(__FILE__) . 'assets/Logo.png';
            if (file_exists($logo_path)) {
                $logo = new Imagick($logo_path);
                $logo->resizeImage(200, 200, Imagick::FILTER_LANCZOS, 1);

                $x = $canvas->getImageWidth() - 240;
                $y = 50;

                $canvas->compositeImage($logo, Imagick::COMPOSITE_OVER, $x, $y);
                $logo->clear();
                $logo->destroy();
            }

            // STEP 5: ADD DATE ONLY on first page

            if ($i == 0) {

                $draw = new ImagickDraw();
                $draw->setTextAlignment(Imagick::ALIGN_CENTER);
                $draw->setFillColor('#000');
                $draw->setFontSize(26);

                $date_line = date('F jS, Y') . " - " . date('l');

                $x = $canvas->getImageWidth() / 2;
                $y = 150;

                $canvas->annotateImage($draw, $x, $y, 0, $date_line);
            }


            

            // STEP 6: ADD FOOTER TEXT
            $draw = new ImagickDraw();
            $draw->setFontSize(36);
            $draw->setFillColor('#b8962e');
            $draw->setTextAlignment(Imagick::ALIGN_CENTER);

            $footer_text = "www.nitnempathapp.com";

            $x = $canvas->getImageWidth() / 2;
            $y = $canvas->getImageHeight() - 100;

            $canvas->annotateImage($draw, $x, $y, 0, $footer_text);

            // STEP 7: Save final images
            $canvas->setImageFormat('jpeg');
            $canvas->setImageCompressionQuality(90);

            $jpg_name = $date . "-hukamnama-page-" . ($i + 1) . ".jpg";
            $jpg_path = $upload_dir['path'] . '/' . $jpg_name;

            $canvas->writeImage($jpg_path);
            $image_paths[] = $jpg_path;

            // ✅ IMPORTANT CLEANUP (prevents timeout)
            $canvas->clear();
            $canvas->destroy();
            $page->clear();
            $page->destroy();
            $imagick->clear();
            $imagick->destroy();
        }

        return $image_paths;

    } catch (Exception $e) {
        error_log('Hukamnama Error: ' . $e->getMessage());
        return false;
    }
}

function dhp_upload_image_to_wp($file_path) {
    if (!file_exists($file_path)) return false;

    $filetype = wp_check_filetype(basename($file_path), null);
    $upload_dir = wp_upload_dir();

    $attachment = [
        'guid'           => $upload_dir['url'] . '/' . date('F-jS-Y').basename($file_path),
        'post_mime_type' => $filetype['type'],
        'post_title'     => date('F-jS-Y').preg_replace('/\.[^.]+$/', '', basename($file_path)),
        'post_content'   => 'Read the Daily Hukamnama from Sri Darbar Sahib, Amritsar for ' . date('F j, Y') . '. The Daily Hukamnama is the divine message taken from Sri Guru Granth Sahib and shared daily with the Sangat around the world. It provides spiritual guidance and inspiration for living a truthful and humble life according to the teachings of the Sikh Gurus.',
        'post_excerpt' => 'Daily Hukamnama from Sri Darbar Sahib, Amritsar — ' . date('F j, Y'),
        'post_status'    => 'inherit'
    ];

    $attach_id = wp_insert_attachment($attachment, $file_path);

    // Set Alt Text
    update_post_meta(
        $attach_id,
        '_wp_attachment_image_alt',
        'Daily Hukamnama Sahib Sri Darbar Sahib — ' . date('F j, Y')
    );

    require_once(ABSPATH . 'wp-admin/includes/image.php');
    $attach_data = wp_generate_attachment_metadata($attach_id, $file_path);
    wp_update_attachment_metadata($attach_id, $attach_data);

    return $attach_id;
}

/*
add_action('wp_head', 'dhp_add_meta_description');

function dhp_add_meta_description() {
    if (is_single()) {
        global $post;

        $date = get_the_date('F j, Y', $post->ID);

        $meta_description = "Read the Daily Hukamnama from Sri Darbar Sahib – {$date} in Punjabi, Hindi and English.";

        echo '<meta name="description" content="' . esc_attr($meta_description) . '">' . "\n";
    }
}
*/

add_action('admin_menu', 'dhp_add_admin_page');

function dhp_add_admin_page() {
    add_menu_page(
        'Daily Hukamnama',
        'Hukamnama Poster',
        'manage_options',
        'daily-hukamnama',
        'dhp_admin_page_html',
        'dashicons-admin-post',
        20
    );
}

function dhp_admin_page_html() {
    if (isset($_POST['dhp_run_now']) && current_user_can('manage_options')) {
        dhp_create_daily_hukamnama_post();
        echo '<div class="notice notice-success"><p>Hukamnama post created successfully.</p></div>';
    }

    if (isset($_POST['dhp_toggle_cron']) && current_user_can('manage_options')) {
        $new_status = $_POST['cron_status'] == '1' ? 1 : 0;
        update_option('dhp_cron_enabled', $new_status);
        wp_clear_scheduled_hook('dhp_post_hukamnama_event');
        if ($new_status) {
            wp_schedule_event(time(), 'daily', 'dhp_post_hukamnama_event');
        }
        echo '<div class="notice notice-success"><p> Cron status updated.</p></div>';
    }

    $cron_enabled = get_option('dhp_cron_enabled', 1);
    $last_status = get_option('dhp_last_status', 'No log yet.');

    ?>
    <div class="wrap">
        <h1>Daily Hukamnama Poster</h1>

        <form method="post">
            <h2>Manual Post</h2>
            <p><input type="submit" name="dhp_run_now" class="button button-primary" value="Run Now" /></p>
        </form>

        <form method="post" style="margin-top: 30px;">
            <h2>Cron Settings</h2>
            <label>
                <input type="radio" name="cron_status" value="1" <?= $cron_enabled ? 'checked' : '' ?>> Enable Daily Cron
            </label><br>
            <label>
                <input type="radio" name="cron_status" value="0" <?= !$cron_enabled ? 'checked' : '' ?>> Disable Cron
            </label><br>
            <p><input type="submit" name="dhp_toggle_cron" class="button" value="Save Settings"></p>
        </form>

        <div style="margin-top: 30px;">
            <h2>Log</h2>
            <p><strong>Last status:</strong> <?= esc_html($last_status); ?></p>
        </div>
    </div>
    <?php
}
