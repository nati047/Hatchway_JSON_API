const express = require('express');
const app = express();
const { sortPosts, apiRequestAll } = require("./utilityFunctions.js")
const baseApiUrl = "https://api.hatchways.io/assessment/blog/posts?tag=";
// server side caching
const apiCache = require('apicache');
const cache = apiCache.middleware;

app.get("/api/ping", (req, res) => {
  res.status(200).json({ "success": true });
});

app.get("/api/posts", cache('5 minutes'), (req, res) => {
  const { tags, sortBy = "id", direction = "asc" } = req.query;
  const tagsList = tags ? tags.split(',') : [];

  const endpoints = tagsList.map((tag) => {   // create endpoint with each tag
    return baseApiUrl + tag;
  });

  const sortList = ['id', 'reads', 'likes', 'popularity'];

  if (!tags) {
    res.status(400).json({
      "error":"Tags parameter is required"
    });
    return;
  }

  if (sortBy && !sortList.includes(sortBy)) {
    res.status(400).json({
      "error":"sortBy parameter is invalid"
    });
    return;
  }

  if (direction && direction !== 'asc' && direction !== 'desc') {
    res.status(400).json({
      "error":"direction parameter is invalid"
    });
    return;
  }
  // make parallel api call with all tags
  apiRequestAll(endpoints)  
  .then( result => {
    const postsArray = Object.values(result);
    sortPosts(postsArray, direction, sortBy);
    res.status(200).json({ "posts":postsArray });
    return;
  })
  .catch( error => {
    res.status(500).json({
      "error":"server error"
    })
  });

});

module.exports = app;