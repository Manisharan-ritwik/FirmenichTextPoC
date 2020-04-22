(function() {
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  var width = 320;    // We will scale the photo width to this
  var height = 0;     // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  var streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;
  var flipBtn = null;

  var defaultsOpts = null;

  let shouldFaceUser = true;

  let stream = null;

  function FlipCamera()
  {
      if( stream == null ) return
      // we need to flip, stop everything
      stream.getTracks().forEach(t => {
        t.stop();
      });
      // toggle / flip
      shouldFaceUser = !shouldFaceUser;
      PlayCamera();
  }


  function CheckFlipSupport()
  {
      // check whether we can use facingMode
    let supports = navigator.mediaDevices.getSupportedConstraints();
    if(supports['facingMode'] == true ) {
      flipBtn.disabled = false;
    }
  }

  function PlayCamera()
  {
    defaultsOpts.video = { facingMode: shouldFaceUser ? 'user' : 'environment' }
      navigator.mediaDevices.getUserMedia(defaultsOpts)
    .then(function(_stream) {
      stream = _stream;
      video.srcObject = stream;
      video.play();
    })
    .catch(function(err) {
      console.log("An error occurred: " + err);
    });
  }

  function startup() {

    defaultsOpts = { audio: false, video: true }


    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    startbutton = document.getElementById('startbutton');
    flipBtn  = document.querySelector('#flip-btn');

    CheckFlipSupport();


    PlayCamera();
    

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);
      
        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.
      
        if (isNaN(height)) {
          height = width / (4/3);
        }
      
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);

    startbutton.addEventListener('click', function(ev){
      takepicture();
      ev.preventDefault();
    }, false);

    flipBtn.addEventListener('click', function(ev){
      FlipCamera();
      ev.preventDefault();
    }, false);
    
    clearphoto();
  }


  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  }
  
  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
    
      var data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);

      data = data.replace('data:image/png;base64,','');


            // Post a user
      var url = "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAWd1Ts-xqQMrvZDT62VXkXw0PgJlfSF-c";

      var data = {
        "requests": [
          {
            "image": {
              "content": data
            },
            "features": [
              {
                "type": "TEXT_DETECTION",
                "maxResults": 1
              }
            ]
          }
        ]
      };
      var json = JSON.stringify(data);

      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
      xhr.onload = function () {

        var response = JSON.parse(xhr.responseText);

        var result = response.responses[0].fullTextAnnotation.text;// "882134 TFS1287 TEA FLEXAROME FLAVOR LOTNO: 1003620774 -86010478 FP> 100 C UNO: EXP DATE 180 Lot: HO17"

      result = result.split("FLAVOR")[0]+"FLAVOR";
      result = result.replace(/\s/g,'');
      result = result.toLowerCase();
      result = result.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
      result = "http://ritwiksoftware.com/clients/firmenich_dev/"+result;



      document.getElementById("resultdisplay").innerHTML = result;
      document.getElementById("resulturl").href = result;

      }
      xhr.send(json); 




    } else {
      clearphoto();
    }




  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener('load', startup, false);
})();
