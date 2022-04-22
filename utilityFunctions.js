const axios = require('axios');

const sortPosts = (posts, direction, sortBy) => {
  posts.sort((prev, curr) => {
    return direction === 'asc' ? prev[sortBy] - curr[sortBy] : curr[sortBy] - prev[sortBy]; 
  }) 
};

const apiRequestAll = (endpoints) => {
  return new Promise((resolve, reject) => {
    // make parallel requests to API for all tags
    axios.all(endpoints.map(endpoint => {
      return axios.get(endpoint);
    }))
    .then((responses) => {
      const postsObject = {};

      responses.forEach(response => {
        response.data.posts.forEach((post) => {
          const { id } = post;
          if (!postsObject[id]) {   // create an object with id as a key to avoid duplication
            postsObject[id] = post;
          }
        });
      });
      resolve(postsObject);
    })
    .catch((error) => {
      reject(error);
    }); 

  })
};


module.exports = { sortPosts, apiRequestAll };