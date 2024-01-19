import React, { Component } from 'react';
import './videojs.css';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-eme';
import 'videojs-contrib-quality-levels';
import 'videojs-contrib-eme';
import 'videojs-hls-quality-selector';

class VideoJSPlayerComponent extends Component {
  player;
  videoNode;

  videoJsOptions = {
    autoplay: true,
    muted: true,
    height: 400,
    width: 600,
    controls: true,
    sources: [
      {
        src: this.isRequestFromSafari() ? "https://dhe2cd88f2ghy.cloudfront.net/transcoded/fgf9n8CGeJE/video.m3u8" : "https://dhe2cd88f2ghy.cloudfront.net/transcoded/fgf9n8CGeJE/video.mpd",
        type: this.isRequestFromSafari() ? "application/x-mpegURL" : "application/dash+xml",
      }
    ],
  };

  componentDidMount() {
    this.player = videojs(this.videoNode, this.videoJsOptions, () => {
      if (this.player) {
        console.log('onPlayerReady');
        this.player.hlsQualitySelector();

 
        
  
        // Add DRM handling for Widevine
        this.player.eme({
          keySystems: {
            'com.widevine.alpha': {
              getLicense: (emeOptions, keyMessage, callback) => {
                const headers = { "Content-type": "application/octet-stream" };
                const body = keyMessage;
  
                console.log('Widevine License Request:', emeOptions, keyMessage);
  
                videojs.xhr({
                  url: "https://app.tpstreams.com/api/v1/352dct/assets/fgf9n8CGeJE/drm_license/?access_token=02fcc48b-7fd6-4b59-a846-43be635aaa06",
                  method: "POST",
                  body: body,
                  responseType: "arraybuffer",
                  headers: headers,
                }, (err, response, responseBody) => {
                  console.log('Widevine License Response:', err, response, responseBody);
  
                  if (err) {
                    callback(err);
                    return;
                  }
  
                  if (response.statusCode >= 400 && response.statusCode <= 599) {
                    callback({});
                    return;
                  }
  
                  callback(null, responseBody);
                });
              },
            },

            // Add DRM handling for FairPlay
            'com.apple.fps.1_0': {
              certificateUri: "https://static.testpress.in/static/fairplay.cer",
              getContentId: (emeOptions, initData) => {
                return new TextDecoder("utf-16").decode(initData.slice(16));
              },
              getLicense: (emeOptions, contentId, keyMessage, callback) => {
                const headers = { "Content-type": "application/json" };
                const body = JSON.stringify({ spc: this.base64EncodeUint8Array(keyMessage) });
  
                console.log('FairPlay License Request:', emeOptions, contentId, keyMessage);
  
                videojs.xhr({
                  url: "https://app.tpstreams.com/api/v1/352dct/assets/fgf9n8CGeJE/drm_license/?access_token=02fcc48b-7fd6-4b59-a846-43be635aaa06&drm_type=fairplay",
                  method: "POST",
                  body: body,
                  responseType: "arraybuffer",
                  headers: headers,
                }, (err, response, responseBody) => {
                  console.log('FairPlay License Response:', err, response, responseBody);
  
                  if (err) {
                    callback(err);
                    return;
                  }
  
                  if (response.statusCode >= 400 && response.statusCode <= 599) {
                    callback({});
                    return;
                  }
  
                  callback(null, responseBody);
                });
              },
            },
          },
        });
      }
    });
  }
  




  base64EncodeUint8Array = (input) => {
    return btoa(String.fromCharCode.apply(null, input));
  };

  isRequestFromSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  render() {
    return (
      <div className="customVideoPlayer">
        <div className="playerWrapper" data-vjs-player>
          <video id='video' ref={node => (this.videoNode = node)} className="video-js" />
        </div>
      </div>
    );
}
}

export default VideoJSPlayerComponent;