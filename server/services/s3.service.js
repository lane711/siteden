const fs = require("fs");
const AWS = require("aws-sdk");
var appRoot = require("app-root-path");

// Enter copied or downloaded access id and secret here
const ID = process.env.AMAZONID;
const SECRET = process.env.AMAZONSECRET;
var zencoder = require("zencoder")(process.env.ZENCODERKEY);

// Enter the name of the bucket that you have created here
const BUCKET_NAME = "ocunite";

// Initializing S3 Interface
const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

module.exports = s3Service = {
  upload: function (fileName, filePath) {
    // read content from the file
    const fileContent = fs.readFileSync(filePath);

    // setting up s3 upload parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName, // file name you want to save as
      Body: fileContent,
      ACL: "public-read",
    };

    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
      if (err) {
        throw err;
      }
      console.log(`File uploaded successfully. ${data.Location}`);
      s3Service.encodeVideo(data.Location);
    });
  },

  encodeVideo: function (url) {
    //https://app.zencoder.com/request_builder
    zencoder.Job.create(
      {
        bucket: 'ocunite',
        input: url,
        size: "1280x720",
        audio_bitrate: 160,
        max_video_bitrate: 5000,
        h264_profile: "main",
        h264_level: "3.1",
        max_frame_rate: 30,
        outputs: [
          {
            bucket: 'ocunite-zencoder',
            public: true,
            thumbnails: {
              number: 3,
              public: false,
            },
          },
        ],
      },
      function (err, data) {
        if (err) {
          console.log(err);
          return;
        }

        console.log('zencoder-->', data);
      }
    );
  },
};
