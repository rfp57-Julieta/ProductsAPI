import http from 'k6/http';
// import { sleep } from 'k6';
import { check, sleep } from 'k6';

export let options = {
  vus: 1000,   // simulate how many virtual users
  duration: '10s',   // how long you want it to run
};

//const getAllProductUrl = 'http://localhost:3000/products';
const getOneProductUrl = `http://localhost:3000/products/${Math.floor(Math.random()*(1000000 - 1 + 1)) + 1}`;
//const getStylesUrl = `http://localhost:3000/products/${Math.floor(Math.random()*(10000 - 1 + 1)) + 1}/styles`;
//const getStylesUrl = `http://localhost:3000/products/7641/styles`;
// const getRelatedUrl = `http://localhost:3000/products/${Math.floor(Math.random()*(10000 - 1 + 1)) + 1}/related`;
// const getRelatedUrl = `http://localhost:3000/products/1/related`;

export default function () {
  let res = http.get(getOneProductUrl);
  sleep(1);
  check(res, {
    'is status 200': (r) => r.status === 200,
    'transaction time < 200 ms': r => r.timings.duration < 200,
    'transaction time < 500 ms': r => r.timings.duration < 500,
    'transaction time < 1000 ms': r => r.timings.duration < 1000,
    'transaction time < 2000 ms': r => r.timings.duration < 2000,
  });
}


// 'body contains text': (r) => r.body.includes('id'),
// 'body contains text': (r) => r.body.includes('name'),
// 'body contains text': (r) => r.body.includes('slogan'),
// 'body contains text': (r) => r.body.includes('description'),
// 'body contains text': (r) => r.body.includes('category'),
// 'body contains text': (r) => r.body.includes('default_price'),
// 'body contains text': (r) => r.body.includes('features'),
// 'body contains text': (r) => r.body.includes('feature'),
// 'body contains text': (r) => r.body.includes('value'),