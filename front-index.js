const fs = require('fs');
const Axios = require('axios');


fs.readFile('./../media/video.mp4', (err, data) => {
  if (err) throw err;
  console.log('read file');

  urls = [];

  console.log('starting posts');

  const axios = Axios.create()
  delete axios.defaults.headers.put['Content-Type']

  const CHUNK = 5000000;
  const promises = urls.map((url, i) => {
    const start = i * CHUNK;
    let end;
    if (i < (urls.length - 1))
      end = (i + 1) * CHUNK;
    else
      end = data.length + 1;
    console.log(start);
    console.log(end);
    const blob = data.slice(start, end);

    return axios.request({
      method: 'put',
      url: url,
      data: blob,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
  });

  Promise.all(promises).then(resParts => {
    return resParts.map((part, index) => ({
      ETag: part.headers.etag,
      PartNumber: index + 1
    }))
  }).then(console.log).catch(console.log);
});



