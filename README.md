# YouTube Google Analytics & GTM Plugin

This is a plug-and-play tracking solution for tracking user interaction with YouTube videos in Google Analytics. It will detect if GTM, Universal Analytics, or Classic Analytics is installed on the page, in that order, and use the first syntax it matches unless configured otherwise. It include support for delivering hits directly to Universal or Classic Google Analytics, or for pushing Data Layer events to be used by Google Tag Manager.

Once installed, the plugin will fire events with the following settings:
- Event Category: Videos
- Event Action: *&lt;Action, e.g. Play, Pause&gt;*
- Event Label: *&lt;URL of the video&gt;*

## Installation

This plugin will play nicely with any other existing plugin that interfaces with the YouTube Iframe API, so long as it is loaded after any existing code. Otherwise, if another function overwrites the window.onYouTubeIframeAPIReady property, it will fail silently. If you're seeing strange errors like 'getVideoUrl' is not a function, there is another script causing a collision that you must remedy.

### Universal or Classic Google Analytics Installation:

The plugin is designed to be plug-and-play. By default, the plugin will try and detect if you have Google Tag Manager, Universal Analytics, or Classic Google Analytics, and use the appropriate syntax for the event. If you are **not** using Google Tag Manager to fire your Google Analytics code, store the plugin on your server and include the lunametrics-youtube-v7.gtm.js script file somewhere on the page.

    <script src="/somewhere-on-your-server/lunametrics-youtube-v7.gtm.js"></script>

###Google Tag Manager Installation

####Container Import (recommended)

1. Download the file 'luna-youtube-tracking.json' from this repository.
2. In Google Tag Manager, navigate to the **Admin** tab.
3. Under the **Container** column, select **Import Container**.
4. Click **Choose Container File** and select the 'luna-youtube-tracking.json' file you downloaded.
5. Select **Merge** from the radio selector beneath the Choose Container File button.
6. Select **Rename** from the radio selector that appears beneath the Merge selector.
7. Click Continue, then Confirm.
8. Navigate to the Tags interface - select the tag imported tag named GA - Event - YouTube Tracking.
9. Change the {{YOUR_GA_TRACKING_ID}} in the **Tracking ID** field to your Google Analytics Tracking ID (a.k.a. UA Number).

Once you publish your next container, YouTube tracking will begin working immediately.

**NOTE:** If you're using a custom GA cookie name, GA cookie domain, or GA function name, you'll need to change those variables as well.

####Manual Installation (not recommended)

Create a new Custom HTML tag and paste in the below:

    <script type="text/javascript" id="gtm-youtube-tracking">
      // script file contents go here
    </script>

In the space between the **&lt;script&gt;** and **&lt;/script&gt;** tags, paste in the contents of the lunametrics-youtube.gtm.js script, found [here](https://raw.githubusercontent.com/lunametrics/youtube-google-analytics/master/lunametrics-youtube.gtm.js). Set the Firing Trigger to 'All Pages'. If you'd prefer to fire the tag only when a YouTube video is detected, create the following variable:

* Variable Name: YouTube Video Present
    - Variable Type: Custom JavaScript Variables
    - Variable Value: 

            function() {

              var iframes = document.getElementsByTagName('iframe');
              var embeds = document.getElementsByTagName('embed');
              var i;

              function isYouTubeVideo(potentialYouTubeVideo) {

                var potentialYouTubeVideoSrc = potentialYouTubeVideo.src || '';

                if( potentialYouTubeVideoSrc.indexOf( 'youtube.com/embed/' ) > -1 || 
                    potentialYouTubeVideoSrc.indexOf( 'youtube.com/v/' ) > -1 ) {

                  return true;

                }

              }

              for(i = iframes.length - 1; i > -1; i--) {
              
                var _iframe = iframes[i];
                var test = isYouTubeVideo(_iframe);

                if(test) {
                  return true;
                }

              }

              for(i = embeds.length - 1; i > -1; i--) {

                var _embed = embeds[i];
                var test = isYouTubeVideo(_embed);

                if(test) {
                  return true;
                }

              }

              return false;

            }

    - Returns 'true' if a video is detected, otherwise returns 'false'

Create the following Trigger:

* Trigger Name: YouTube Video Detected
    - Trigger Event: Page View
    - Trigger Type: Window Loaded
    - Fire On: Some Pageviews
        - YouTube Video Present equals true

Use the YouTube Video Detected Trigger to fire the YouTube Google Analytics script.

**Don't forget, you need to add a Google Analytics Event tag that acts upon the pushes to the Data Layer the plugin executes.** Follow the steps in the [Google Tag Manager Configuration](#google-tag-manager-configuration) section for help on getting this set up.

## Configuration

### Default Configuration
By default, the script will attempt to fire events when users Play, Pause, Watch to End, and watch 10%, 25%, 50%, 75%, and 90% of each video on the page it is loaded into. These defaults can be adjusted by modifying the object passed as the third argument to the script, at the bottom.

### Player Interaction Events
By default, the script will fire events when users interact with the player by:

- Playing
- Pausing
- Watching to the end

To change which events are fired, edit the events property of the configuration at the end of the script. For example, if you'd like to fire Buffering events:

    ( function( document, window, config ) {
    
       // ... the tracking code

    } )( document, window, {
      'events': {
        'Play': true,
        'Pause': true,
        'Watch to End': true,
        'Buffering': true,
        'Unstarted': false,
        'Cued': false
      }
    } );

The available events are **Play, Pause, Watch to End, Buffering, Unstarted, and Cueing**.

### Percentage Viewed Events

By default, the script will track 10%, 25%, 50%, 75%, and 90% view completion. You can adjust this by changing the percentageTracking.each and percentageTracking.every values.

####percentageTracking.each
For each number in the array passed to this configuration, a percentage viewed event will fire.

    ( function( document, window, config ) {
    
       // ... the tracking code

    } )( document, window, {
      'percentageTracking': {
        'every': 25  // Tracks every 25% viewed
      }
    } );

####percentageTracking.every
For every n%, where n is the value of percentageTracking.every, a percentage viewed event will fire.

    ( function( document, window, config ) {
    
       // ... the tracking code

    } )( document, window, {
      'percentageTracking': {
        'each': [10, 90]  // Tracks when 10% of the video and 90% of the video has been viewed
      }
    } );

**NOTE**: Google Analytics has a 500 hit per-session limitation, as well as a 20 hit window that replenishes at 2 hits per second. For that reason, it is HIGHLY INADVISABLE to track every 1% of video viewed.

### Forcing Universal or Classic Analytics Instead of GTM

By default, the plugin will try and fire Data Layer events, then fallback to Univeral Analytics events, then fallback to Classic Analytics events. If you want to force the script to use a particular syntax for your events, you can set the 'forceSyntax' property of the configuration object to an integer:
    
    ( function( document, window, config ) {
    
       // ... the tracking code

    } )( document, window, {
      'forceSyntax': 1
    } );

Setting this value to 0 will force the script to use Google Tag Manager events, setting it 1 will force it to use Universal Google Analytics events, and setting it to 2 will force it to use Classic Google Analytics events.

### Using A Custom Data Layer Name (GTM Only)
If you're using a name for your dataLayer object other than 'dataLayer', you must configure the script to push the data into the correct place. Otherwise, it will try Universal Analytics directly, then Classic Analytics, and then fail silently.

    ( function( document, window, config ) {
    
       // ... the tracking code

    } )( document, window, {
      'dataLayerName': 'customDataLayerName'
    } );

## Google Tag Manager Configuration

Once you've added the script to your container (see [Google Tag Manager Installation](#google-tag-manager-installation)), you must configure Google Tag Manager.

Create the following Variables:

* Variable Name: Video URL
    - Variable Type: Data Layer Variable
    - Data Layer Variable Name: attributes.videoUrl
    - This will be the URL of the video on YouTube

* Variable Name: Video Action
    - Variable Type: Data Layer Variable
    - Data Layer Variable Name: attributes.videoAction
    - This will be the action the user has taken, e.g. Play, Pause, or Watch to End

Create the following Trigger:

* Trigger Name: Event - YouTube Tracking
    - Trigger Type: Custom Event
    - Event Name: youTubeTrack

Create your Google Analytics Event tag

* Tag Name: GA - Event - YouTube Tracking
    - Tag Type: Google Analytics
    - Choose a Tag Type: Universal Analytics (or Classic Analytics, if you are still using that)
    - Tracking ID: *&lt;Enter in your Google Analytics tracking ID&gt;*
    - Track Type: Event
    - Category: Videos
    - Action: {{Video Action}}
    - Label: {{Video URL}}
    - Fire On: More
        - Choose from existing Triggers: Event - YouTube Tracking

## License

Licensed under the Creative Commons 4.0 International Public License. Refer to the LICENSE.MD file in the repository for the complete text of the license.

## Acknowledgements

Created by the honest folks at [LunaMetrics](http://www.lunametrics.com/), a digital marketing & Google Analytics consultancy. For questions, please drop us a line here or [on our blog](http://www.lunametrics.com/blog/2015/05/11/updated-youtube-tracking-google-analytics-gtm/).

Written by [Sayf Sharif](https://twitter.com/sayfsharif) and updated by [Dan Wilkerson](https://twitter.com/notdanwilkerson).
