const fs = require('fs');
const Axios = require('axios');


fs.readFile('./video.mp4', (err, data) => {
  if (err) throw err;
  console.log('read file');

  urls = [];

  console.log('starting posts');

  const axios = Axios.create()
  delete axios.defaults.headers.put['Content-Type']

  const promises = urls.map((url, i) => {
    // TODO: Replace these to handle N urls and not only 2
    const start = i == 0 ? 0 : Math.ceil(data.length / 2);
    const end = i == 0 ? Math.ceil(data.length / 2) : data.length + 1;
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



