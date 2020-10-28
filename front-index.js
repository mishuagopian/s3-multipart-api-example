const fs = require('fs');
const Axios = require('axios');

fs.readFile('./../../Downloads/Archive2.zip', (err, data) => {
  if (err) throw err;
  console.log('read file');
  console.log('starting posts');

  const axios = Axios.create()
  delete axios.defaults.headers.put['Content-Type']

  const CHUNK = 100000000;
  const parts = Math.ceil(data.length/CHUNK)

  console.log(`CHUNK: ${CHUNK}`);
  console.log(`Parts: ${parts}`);

  console.log(new Date());

  axios.request({
    method: 'put',
    url: `https://REPLACE_ME/stage/multipartUploadPostUrls?parts=${parts}&filename=mishu.mp4`
  }).then(res => {
    console.log(res.data);

    const promises = res.data.urls.map((url, i) => {
      const start = i * CHUNK;
      let end;
      if (i < (res.data.urls.length - 1))
        end = (i + 1) * CHUNK;
      else
        end = data.length + 1;

      console.log(`start ${start} - end ${end}`)
      const blob = data.slice(start, end);

      return axios.request({
        method: 'put',
        url: url,
        data: blob,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
    });

    return Promise.all(promises)
      .then(resParts =>
        resParts.map((part, index) => ({ ETag: part.headers.etag, PartNumber: index + 1 })))
      .then(console.log)
      .then(() => console.log(new Date()))
      .catch(console.log);
  }).catch(console.log);
});



