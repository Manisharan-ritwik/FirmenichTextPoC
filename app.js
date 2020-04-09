var app = angular.module("ocrApp", []);

app.controller("ocrController", function($scope, $http){
	
	var apiKey = "AIzaSyDBMPY7gGcfyZtbSfT7g31u3vM63aqZfoo";
	
	var c = document.getElementById("uploadedPic");
  	var ctx = c.getContext("2d");
  	var img = new Image();

  	$scope.result = "Result will be displayed here";

  	$scope.getResult = function(){
  		$scope.vision_api_json = {
		      "requests":[
			{
			  "image":{
				"content" : $scope.imgBase64
			  },
			  "features":[
			    {
			      "type": "TEXT_DETECTION",
			      "maxResults": 1
			    }
			  ]
			}
		      ]
		};

  		$http({
			url : "https://vision.googleapis.com/v1/images:annotate?key="+apiKey,
			method : "POST",
			data : $scope.vision_api_json
		}).then(function(response){

			var detectedText = response.data.responses[0].fullTextAnnotation.text;

			detectedText = detectedText.split("FLAVOR")[0] + "FLAVOR";

			$scope.result = detectedText;

		});
  	}

	$scope.uploadPicture = function (ele) {
	  	img.src = URL.createObjectURL(ele.files[0]); 
	    	img.onload = function() {
			ctx.drawImage(img, 0, 0, img.width,    img.height,     // source rectangle
                   0, 0, c.width, c.height);
			//get base64 and set to result section
			var result = c.toDataURL();
			$scope.imgBase64 = result.replace('data:image/png;base64,','', result);
			//alert($scope.imgBase64);
			$scope.$apply();
			$scope.getResult();
		}
	}
})
